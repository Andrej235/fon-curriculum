import fs from "fs";
import { extractPdfText } from "./pdf-text";
import { processCurriculum } from "./process-curriculum";

export type Curriculum = {
  [key in string]?: {
    subject: string;
    type: string;
    groups: string[];
    time: string;
    location: string;
  }[];
};

const outputRaw = process.argv.includes("raw");

async function processUrl(url: string, yearIdx: number): Promise<Curriculum> {
  const pdfData = await extractPdfText(url);

  if (outputRaw) fs.writeFileSync(`year-${yearIdx + 1}.raw`, pdfData);
  return processCurriculum(pdfData);
}

const url: string[] = [
  "https://oas.fon.bg.ac.rs/wp-content/uploads/2026/03/Letnji-2025-26-1-21032026.pdf",
  "https://oas.fon.bg.ac.rs/wp-content/uploads/2026/03/Letnji-2025-26-2-21032026.pdf",
];

const mergedCurriculum: Curriculum = {};

const curriculums = await Promise.all(url.map(processUrl));

for (const c of curriculums) {
  for (const day in c) {
    if (!mergedCurriculum[day]) mergedCurriculum[day] = [];
    mergedCurriculum[day]!.push(...c[day]!);
  }
}

fs.writeFileSync("output.json", JSON.stringify(mergedCurriculum));
