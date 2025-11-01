import { UnwrappedCurriculum } from "./curriculum-type";

/**
 * Return a new curriculum filtered to the provided group, compensating
 * for missed classes on excludedDays by selecting equivalent classes
 * (same subject & type) from non-excluded days. If impossible, returns null.
 */
export function compensateCurriculum(
  curriculum: UnwrappedCurriculum,
  group: string,
  excludedDays: string[],
): UnwrappedCurriculum | null {
  const excludedSet = new Set(excludedDays);
  function timesConflict(a: string, b: string): boolean {
    return a.trim() === b.trim();
  }

  // Collect all classes that originally include the group
  type ClassWithMeta = {
    day: string;
    cls: {
      subject: string;
      type: string;
      groups: string[];
      time: string;
      location: string;
    };
    originalIndex: number; // index in that day's classes array (for uniqueness)
  };
  const groupClasses: ClassWithMeta[] = [];
  for (let d = 0; d < curriculum.length; d++) {
    const dayObj = curriculum[d];
    for (let i = 0; i < dayObj.classes.length; i++) {
      const cls = dayObj.classes[i];
      if (cls.groups.includes(group)) {
        groupClasses.push({ day: dayObj.day, cls, originalIndex: i });
      }
    }
  }

  // Missed classes: those on excluded days
  const missed = groupClasses.filter((g) => excludedSet.has(g.day));
  // Remaining (kept) classes: those on non-excluded days
  const remainingByDay = new Map<string, (typeof groupClasses)[0]["cls"][]>();
  for (const g of groupClasses) {
    if (!excludedSet.has(g.day)) {
      if (!remainingByDay.has(g.day)) remainingByDay.set(g.day, []);
      remainingByDay.get(g.day)!.push({ ...g.cls }); // shallow clone
    }
  }

  // Candidate pool: classes on non-excluded days that do NOT include the group
  type CandidateMeta = {
    day: string;
    cls: {
      subject: string;
      type: string;
      groups: string[];
      time: string;
      location: string;
    };
    id: string; // unique id to avoid reuse
  };
  const candidates: CandidateMeta[] = [];
  for (let d = 0; d < curriculum.length; d++) {
    const dayObj = curriculum[d];
    if (excludedSet.has(dayObj.day)) continue;
    for (let i = 0; i < dayObj.classes.length; i++) {
      const cls = dayObj.classes[i];
      if (!cls.groups.includes(group)) {
        candidates.push({
          day: dayObj.day,
          cls,
          id: `${dayObj.day}@@${i}`,
        });
      }
    }
  }

  const usedCandidateIds = new Set<string>();

  // For each missed class, find a candidate with same subject & type,
  // on a non-excluded day, that doesn't conflict time-wise with already chosen classes that day.
  for (const miss of missed) {
    const neededSubj = miss.cls.subject;
    const neededType = miss.cls.type;

    let chosen: CandidateMeta | null = null;
    for (const cand of candidates) {
      if (usedCandidateIds.has(cand.id)) continue;
      if (cand.cls.subject !== neededSubj) continue;
      if (cand.cls.type !== neededType) continue;

      // check time conflicts with existing classes on cand.day (those already kept + chosen replacements)
      const existing = remainingByDay.get(cand.day) ?? [];
      let conflict = false;
      for (const ex of existing) {
        if (timesConflict(ex.time, cand.cls.time)) {
          conflict = true;
          break;
        }
      }
      if (conflict) continue;

      // ok choose
      chosen = cand;
      break;
    }

    if (!chosen) {
      // cannot find replacement for this missed class -> fail
      return null;
    }

    // mark used and append to remainingByDay (and inject the group into the groups array)
    usedCandidateIds.add(chosen.id);
    const clone = { ...chosen.cls, groups: [...chosen.cls.groups] };
    if (!remainingByDay.has(chosen.day)) remainingByDay.set(chosen.day, []);
    remainingByDay.get(chosen.day)!.push(clone);
  }

  // Build final curriculum: keep only non-excluded days and only classes relevant to group (original group classes kept + chosen replacements)
  const result: UnwrappedCurriculum = [];
  for (const dayObj of curriculum) {
    if (excludedSet.has(dayObj.day)) continue;
    const classesForDay = remainingByDay.get(dayObj.day) ?? [];
    if (classesForDay.length > 0) {
      // We may want to keep a stable order. We'll keep original order of classes on that day where possible,
      // and append any chosen replacements that weren't originally for the group.
      // Simpler: sort by original day classes order (best-effort) using original day's list as reference.
      const originalDayClasses = dayObj.classes;
      // Map by a signature (subject|type|time|location) to preserve original order where possible
      const sig = (c: (typeof classesForDay)[number]) =>
        `${c.subject}|||${c.type}|||${c.time}|||${c.location}`;
      const originalIndex = new Map<string, number>();
      for (let i = 0; i < originalDayClasses.length; i++) {
        originalIndex.set(sig(originalDayClasses[i]), i);
      }
      classesForDay.sort((a, b) => {
        const ia = originalIndex.has(sig(a))
          ? originalIndex.get(sig(a))!
          : 1_000_000 + a.time.length;
        const ib = originalIndex.has(sig(b))
          ? originalIndex.get(sig(b))!
          : 1_000_000 + b.time.length;
        return ia - ib;
      });

      result.push({ day: dayObj.day, classes: classesForDay });
    }
  }

  return result;
}
