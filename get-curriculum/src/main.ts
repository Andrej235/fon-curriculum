import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const url: string = `https://oas.fon.bg.ac.rs/wp-content/uploads/2025/11/PrvaGodinaZimski25-26.pdf`;
const days = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak"];

const pdfData = await extractPdfText(url);

const curriculum: {
  [key in string]?: {
    subject: string;
    type: string;
    groups: string[];
    time: string;
    location: string;
  }[];
} = {};

const pages = pdfData.split("\n").map((page) => page.replace(/^\d* */, "")); // Map gets rid of page numbers
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
    /(.+?)   ([P,V])   (A\d+(?:,\s*A\d+)*)   (\d\d?:\d\d? ?- ?\d\d?:\d\d?)   (.+?)(?:(?<=\S) {2}(?=\S))/g;
  const matches = dayText
    .matchAll(regex)
    .map(([, subject, type, groups, time, location]) => ({
      subject: subject.replace(/\s+/g, " ").trim(),
      type,
      groups: groups.split(",").map((g) => g.trim()),
      time,
      location,
    }))
    .toArray();

  curriculum[dayName] = matches;
}

fs.writeFileSync("output.json", JSON.stringify(curriculum));

async function extractPdfText(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    .promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((i: any) => i.str).join(" ") + "\n";
  }

  return fullText;
}
