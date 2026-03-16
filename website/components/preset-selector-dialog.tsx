"use client";
import { curriculum } from "@/lib/curriculum";
import { CurriculumDay } from "@/lib/curriculum-day";
import { days } from "@/lib/day";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./ui/field";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

const groups = Array.from(
  new Set(days.flatMap((day) => curriculum[day].flatMap((c) => c.groups))),
);

const yearNames = ["A", "B", "C", "D"];
const romanNumerals = ["I", "II", "III", "IV"];

const groupsByYear = yearNames.map((prefix) => ({
  prefix,
  groups: groups
    .filter((g) => g.startsWith(prefix))
    .flatMap((g) => g.slice(1))
    .sort((x, y) => +x - +y),
}));

type PresetSelectorProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect: (curriculum: CurriculumDay[]) => void;
};

export function PresetSelectorDialog({
  open,
  setOpen,
  onSelect,
}: PresetSelectorProps) {
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const groupClasses = useMemo(() => {
    if (!selectedGroup) return [];

    return days.flatMap((day) =>
      curriculum[day].filter((x) =>
        x.groups.includes(yearNames[selectedYear] + selectedGroup),
      ),
    );
  }, [selectedGroup, selectedYear]);

  const groupSubjects = useMemo(() => {
    const subjects = new Set<string>();

    groupClasses.forEach((c) => subjects.add(c.subject));
    return Array.from(subjects).sort();
  }, [groupClasses]);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    setSelectedGroup(groupsByYear[selectedYear].groups[0] ?? null);
  }, [selectedYear]);

  useEffect(() => {
    setSelectedSubjects([]);
  }, [groupSubjects]);

  function handleContinue() {
    if (!selectedGroup) return;

    const selectedGroupName = yearNames[selectedYear] + selectedGroup;

    const filtered = days.map((day) =>
      curriculum[day].filter(
        (c) =>
          c.groups.includes(selectedGroupName) &&
          selectedSubjects.includes(c.subject),
      ),
    );

    onSelect(filtered);
    console.log(filtered);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Napravi raspored po svojoj grupi i predmetima
          </DialogTitle>
          <DialogDescription>
            Ili nastavi sa praznim rasporedom
          </DialogDescription>
        </DialogHeader>

        <FieldSet className="mb-4">
          <FieldLegend>Odaberi godinu i grupu</FieldLegend>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="godina">Godina</FieldLabel>
              <ToggleGroup
                type="single"
                id="godina"
                onValueChange={(value) => setSelectedYear(parseInt(value))}
                value={selectedYear?.toString() ?? "0"}
                variant="outline"
              >
                {romanNumerals.map((name, i) => (
                  <ToggleGroupItem key={i} value={i.toString()}>
                    {name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="grupa">Grupa</FieldLabel>
              <ToggleGroup
                type="single"
                spacing={2}
                variant={"outline"}
                className="flex flex-wrap"
                id="grupa"
                onValueChange={(value) => setSelectedGroup(value)}
                value={selectedGroup ?? "1"}
              >
                {groupsByYear[selectedYear].groups.map((g) => (
                  <ToggleGroupItem key={g} value={g}>
                    {yearNames[selectedYear]}
                    {g}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-2 gap-4">
            {groupSubjects.map((subject) => (
              <Field orientation="horizontal" key={subject}>
                <Checkbox
                  id={subject}
                  checked={selectedSubjects.includes(subject)}
                  onCheckedChange={(x) =>
                    setSelectedSubjects((prev) =>
                      x
                        ? [...prev, subject]
                        : prev.filter((s) => s !== subject),
                    )
                  }
                />

                <FieldLabel htmlFor={subject} className="font-normal">
                  {subject}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>

        <DialogFooter className="justify-end gap-2">
          <DialogClose asChild>
            <Button
              onClick={() => onSelect([[], [], [], [], []])}
              variant="outline"
            >
              Prazan raspored
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button disabled={!selectedGroup} onClick={handleContinue}>
              Napravi
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
