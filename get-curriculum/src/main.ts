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

const url: string = `https://oas.fon.bg.ac.rs/wp-content/uploads/2026/03/Letnji-2025-26-1-21032026.pdf`;
const pdfData = await extractPdfText(url);

if (outputRaw) fs.writeFileSync("raw.txt", pdfData);

const curriculum = processCurriculum(pdfData);

fs.writeFileSync("output.json", JSON.stringify(curriculum));
