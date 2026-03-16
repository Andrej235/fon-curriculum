"use client";
import { PresetSelectorDialog } from "@/components/preset-selector-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdvancedOptions,
  defaultAdvancedOptions,
} from "@/lib/advanced-options";
import { CurriculumDay } from "@/lib/curriculum-day";
import { days } from "@/lib/day";
import { formatClassType } from "@/lib/format-class-type";
import { formatGroupNames } from "@/lib/format-group-names";
import { ChevronDown, TableIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import InfoDialog from "./info-dialog";
import ThemeToggle from "./theme-toggle";

export default function Curriculum() {
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [advancedOptions, setAdvancedOptions] =
    useLocalStorage<AdvancedOptions>("advancedOptions", defaultAdvancedOptions);

  const [curriculum, setCurriculum] = useLocalStorage<CurriculumDay[]>(
    "curriculum",
    [[], [], [], [], []],
  );

  function toggleCollapsed(day: string) {
    setAdvancedOptions((prev) => ({
      ...prev,
      collapsedDays: !prev.collapsedDays.includes(day)
        ? [...prev.collapsedDays, day]
        : prev.collapsedDays.filter((d) => d !== day),
    }));
  }

  function handleSelectPreset(curriculum: CurriculumDay[]) {
    setCurriculum(curriculum);
  }

  return (
    <main className="min-h-screen bg-background px-2 py-6 sm:px-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex flex-col items-center justify-center gap-2 sm:mb-8 sm:flex-row sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground xl:text-3xl">
              Raspored
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="max-sm:size-9"
              onClick={() => setPresetDialogOpen(true)}
            >
              <TableIcon />
              <span className="hidden sm:inline">Preset</span>
            </Button>

            <InfoDialog />

            <ThemeToggle />
          </div>
        </header>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32 font-semibold">Vreme</TableHead>
                <TableHead className="w-40 font-semibold max-sm:hidden">
                  Tip
                </TableHead>
                <TableHead className="font-semibold">Predmet</TableHead>
                <TableHead className="w-48 font-semibold">Grupe</TableHead>
                <TableHead className="w-48 font-semibold">Lokacija</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {curriculum.map((daySchedule, i) => {
                const dayName = days[i];

                return (
                  <Fragment key={dayName}>
                    <TableRow
                      key={dayName}
                      className="w-full min-w-full bg-muted/50 py-3"
                      onClick={() => toggleCollapsed(dayName)}
                    >
                      <TableCell
                        colSpan={5}
                        className="font-semibold text-foreground"
                      >
                        <div className="flex items-center">
                          <Button size="icon" variant="ghost">
                            <ChevronDown
                              className={
                                advancedOptions.collapsedDays.includes(dayName)
                                  ? "rotate-180"
                                  : ""
                              }
                            />
                          </Button>

                          <p>{dayName}</p>
                        </div>
                      </TableCell>
                    </TableRow>

                    {!advancedOptions.collapsedDays.includes(dayName) &&
                      daySchedule.map((classSession, index) => (
                        <TableRow
                          key={`${dayName}-${index}`}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {classSession.time}
                          </TableCell>

                          <TableCell className="max-sm:hidden">
                            <span className="text-muted-foreground">
                              {formatClassType(classSession.type)}
                            </span>
                          </TableCell>

                          <TableCell className="font-medium text-foreground">
                            <span className="max-sm:hidden">
                              {classSession.subject}
                            </span>
                            <span className="sm:hidden">
                              {classSession.subject.length > 30
                                ? `${classSession.subject
                                    .split(" ")
                                    .map((x) =>
                                      x.length > 1 ? x[0].toUpperCase() : x,
                                    )
                                    .join("")}`
                                : classSession.subject}
                            </span>{" "}
                            <span className="sm:hidden">
                              ({classSession.type})
                            </span>
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {formatGroupNames(classSession.groups)}
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {classSession.location}
                          </TableCell>
                        </TableRow>
                      ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <PresetSelectorDialog
        open={presetDialogOpen}
        setOpen={setPresetDialogOpen}
        onSelect={handleSelectPreset}
      />
    </main>
  );
}
