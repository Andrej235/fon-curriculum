import { Curriculum } from "./main";

const days = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak"];

export function processCurriculum(pdfText: string): Curriculum {
  const curriculum: Curriculum = {};

  const pages = pdfText.split("\n").map((page) => page.replace(/^\d* */, "")); // Map gets rid of page numbers
  const text = pages.join("  ") + "|";

  const dayIndices = days
    .map((day) => text.indexOf(day))
    .filter((index) => index !== -1);

  for (let i = 0; i < dayIndices.length; i++) {
    const start = dayIndices[i];
    const end = dayIndices[i + 1] ?? text.length;

    let dayText = text.slice(start, end).trim() + "  |";
    const dayName = days.find((day) => dayText.startsWith(day));
    if (!dayName) continue;

    dayText = dayText.slice(dayName.length).trim();

    const regex =
      /(.+?)   (P|V)   ([A-D]\d+(?:,\s*[A-D]\d+)*) {1,3}(\d\d?:\d\d? {0,2}- {0,2}\d\d?:\d\d?) {1,3}(\d+|\p{L}+(?: \d)?)(?:(?<=\S) {1,2}(?=\S))/gu;
    const rawDayClasses = dayText
      .matchAll(regex)
      .map(([, subject, type, groups, time, location]) => ({
        subject: subject
          .replace(/\(.+\)/g, "")
          .replace(/\s+/g, " ")
          .trim(),
        type,
        groups: groups
          .split(",")
          .map((g) => g.trim())
          .filter((g) => g.startsWith("A")),
        time: time.replace(/\s*-\s*/, "-").trim(),
        location,
      }))
      .toArray();

    const mergedClasses = new Map<
      string,
      (typeof rawDayClasses)[number] & { locations: Set<string> }
    >();

    for (const classInfo of rawDayClasses) {
      const key = [
        classInfo.subject,
        classInfo.type,
        classInfo.groups.join(","),
        classInfo.time,
      ].join("|");

      if (!mergedClasses.has(key)) {
        mergedClasses.set(key, {
          ...classInfo,
          locations: new Set([classInfo.location]),
        });
        continue;
      }

      mergedClasses.get(key)?.locations.add(classInfo.location);
    }

    const dayClasses = [...mergedClasses.values()].map(
      ({ locations, ...classInfo }) => ({
        ...classInfo,
        location: [...locations].join(" / "),
      }),
    );

    curriculum[dayName] = dayClasses;
  }

  for (const day of days) {
    if (!curriculum[day]) curriculum[day] = [];
  }

  return curriculum;
}
