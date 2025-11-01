import { CurriculumDay } from "./curriculum-day";

export type Curriculum = {
  [Key in string]: CurriculumDay;
};

export type UnwrappedCurriculum = {
  day: string;
  classes: CurriculumDay;
}[];
