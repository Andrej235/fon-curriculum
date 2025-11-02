type Curriculum = {
  day: string;
  classes: {
    subject: string;
    type: string;
    groups: string[];
    time: string;
    location: string;
  }[];
}[];

/**
 * Same behavior as before but:
 * - Treats multiple classes that differ only by location (same subject,type,time,groups)
 *   on the same excluded day as a single missed lecture.
 * - When choosing a replacement, includes all identical-time/location-variants
 *   (same subject/type/time/groups) on the chosen replacement day.
 */
export function compensateCurriculum(
  curriculum: Curriculum,
  group: string,
  excludedDays: string[],
): Curriculum | null {
  const excludedSet = new Set(excludedDays);

  // --- helpers for time conflict detection (same as before) ---
  function parseRange(t: string): [number, number] | null {
    const m = t.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const [, sh, sm, eh, em] = m;
    const start = Number(sh) * 60 + Number(sm);
    const end = Number(eh) * 60 + Number(em);
    return [start, end];
  }
  function timesConflict(a: string, b: string): boolean {
    const ra = parseRange(a);
    const rb = parseRange(b);
    if (ra && rb) {
      return ra[0] < rb[1] && rb[0] < ra[1];
    }
    return a.trim() === b.trim();
  }

  // --- signature helpers (ignore location) ---
  function normalizeGroups(gs: string[]) {
    return [...gs].slice().sort().join("|");
  }
  function signatureIgnoringLocation(c: {
    subject: string;
    type: string;
    groups: string[];
    time: string;
  }) {
    return `${c.subject}|||${c.type}|||${c.time}|||${normalizeGroups(c.groups)}`;
  }

  // Build a list of unique missed lectures (deduplicated per excluded day by signatureIgnoringLocation)
  type MissedUnique = {
    missedDay: string;
    subject: string;
    type: string;
    time: string;
    groupsSignature: string;
  };
  const missedUnique: MissedUnique[] = [];

  // Also build remainingByDay with original classes that include the group (non-excluded days only)
  const remainingByDay = new Map<
    string,
    (typeof curriculum)[number]["classes"]
  >();

  for (const dayObj of curriculum) {
    const day = dayObj.day;
    // collect original classes that include the group for non-excluded days
    if (!excludedSet.has(day)) {
      const clones = dayObj.classes
        .filter((c) => c.groups.includes(group))
        .map((c) => ({ ...c, groups: [...c.groups] })); // shallow clone
      if (clones.length) remainingByDay.set(day, clones);
    }

    // for excluded days, collect unique signatures (dedupe by signatureIgnoringLocation)
    if (excludedSet.has(day)) {
      const seen = new Set<string>();
      for (const c of dayObj.classes) {
        if (!c.groups.includes(group)) continue; // only classes that included the group originally are "missed"
        const sig = signatureIgnoringLocation(c);
        if (seen.has(sig)) continue; // dedupe multiple locations
        seen.add(sig);
        missedUnique.push({
          missedDay: day,
          subject: c.subject,
          type: c.type,
          time: c.time,
          groupsSignature: normalizeGroups(c.groups),
        });
      }
    }
  }

  // --- Candidate grouping on non-excluded days: group by signatureIgnoringLocation so duplicates (different locations) are kept together ---
  type CandidateClass = {
    id: string; // unique id per class instance (day@index)
    day: string;
    cls: {
      subject: string;
      type: string;
      groups: string[];
      time: string;
      location: string;
    };
  };

  // Map: day -> signatureIgnoringLocation -> CandidateClass[]
  const candidatesByDayAndSig = new Map<
    string,
    Map<string, CandidateClass[]>
  >();

  for (let d = 0; d < curriculum.length; d++) {
    const dayObj = curriculum[d];
    const day = dayObj.day;
    if (excludedSet.has(day)) continue;
    for (let i = 0; i < dayObj.classes.length; i++) {
      const cls = dayObj.classes[i];
      if (cls.groups.includes(group)) continue; // skip classes that already include the group
      const sig = signatureIgnoringLocation(cls);
      if (!candidatesByDayAndSig.has(day)) {
        candidatesByDayAndSig.set(day, new Map());
      }
      const dayMap = candidatesByDayAndSig.get(day)!;
      if (!dayMap.has(sig)) dayMap.set(sig, []);
      dayMap.get(sig)!.push({
        id: `${day}@@${i}`,
        day,
        cls,
      });
    }
  }

  // track used candidate signatures on a given day (so we don't reuse the same group twice)
  const usedCandidateSigOnDay = new Map<string, Set<string>>(); // day -> set(sig)

  // For each missed unique lecture, find a candidate group (subject & type match) on some non-excluded day
  for (const miss of missedUnique) {
    let chosenDay: string | null = null;
    let chosenSig: string | null = null;
    let chosenGroupCandidates: CandidateClass[] | null = null;

    // simple selection strategy: iterate through non-excluded days and their candidate signature groups
    for (const [day, sigMap] of candidatesByDayAndSig.entries()) {
      // skip if we've already used a candidate group with this signature on this day
      for (const [sig, candArr] of sigMap.entries()) {
        // quick signature parse to check subject & type match
        // sig format: `${subject}|||${type}|||${time}|||${groupsNormalized}`
        const parts = sig.split("|||");
        const subj = parts[0];
        const typ = parts[1];
        const time = parts[2];
        // groupsNormalized = parts[3]; // not needed for matching; we only require subject & type match
        if (subj !== miss.subject) continue;
        if (typ !== miss.type) continue;

        // check if this signature on this day was already used
        const usedSet = usedCandidateSigOnDay.get(day);
        if (usedSet && usedSet.has(sig)) continue;

        // time conflict check: ensure the candidate group's time doesn't conflict with existing classes selected for that day
        const existing = remainingByDay.get(day) ?? [];
        let conflict = false;
        for (const ex of existing) {
          if (timesConflict(ex.time, time)) {
            conflict = true;
            break;
          }
        }
        if (conflict) continue;

        // Candidate group OK -> choose it
        chosenDay = day;
        chosenSig = sig;
        chosenGroupCandidates = candArr;
        break;
      }
      if (chosenDay) break;
    }

    if (!chosenDay || !chosenSig || !chosenGroupCandidates) {
      // cannot find replacement for this missed unique lecture -> fail
      return null;
    }

    // mark as used for that day
    if (!usedCandidateSigOnDay.has(chosenDay))
      usedCandidateSigOnDay.set(chosenDay, new Set());
    usedCandidateSigOnDay.get(chosenDay)!.add(chosenSig);

    // include all candidate classes in chosenGroupCandidates into remainingByDay for chosenDay,
    // and append the requested group to their groups array
    const clones = chosenGroupCandidates.map((cc) => ({
      subject: cc.cls.subject,
      type: cc.cls.type,
      groups: [...cc.cls.groups],
      time: cc.cls.time,
      location: cc.cls.location,
    }));
    if (!remainingByDay.has(chosenDay)) remainingByDay.set(chosenDay, []);
    // push all clones
    remainingByDay.get(chosenDay)!.push(...clones);

    // After choosing a sig group for that day we should not select the same sig group again,
    // which is enforced by usedCandidateSigOnDay above.
  }

  // Build final curriculum: iterate original curriculum order but only non-excluded days and the classes we assembled in remainingByDay
  const result: Curriculum = [];
  for (const dayObj of curriculum) {
    if (excludedSet.has(dayObj.day)) continue;
    const classesForDay = remainingByDay.get(dayObj.day) ?? [];
    if (classesForDay.length > 0) {
      // attempt to preserve original day's ordering where possible:
      const originalDayClasses = dayObj.classes;
      const sig = (c: (typeof classesForDay)[number]) =>
        `${c.subject}|||${c.type}|||${c.time}|||${c.location}`;

      const originalIndex = new Map<string, number>();
      for (let i = 0; i < originalDayClasses.length; i++) {
        originalIndex.set(
          `${originalDayClasses[i].subject}|||${originalDayClasses[i].type}|||${originalDayClasses[i].time}|||${originalDayClasses[i].location}`,
          i,
        );
      }

      classesForDay.sort((a, b) => {
        const ia = originalIndex.has(sig(a))
          ? originalIndex.get(sig(a))!
          : 1_000_000 + a.location.length;
        const ib = originalIndex.has(sig(b))
          ? originalIndex.get(sig(b))!
          : 1_000_000 + b.location.length;
        return ia - ib;
      });

      result.push({ day: dayObj.day, classes: classesForDay });
    }
  }

  return result;
}
