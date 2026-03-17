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
import { defaultCurriculum, type Curriculum } from "@/lib/curriculum-type";
import { Day, days } from "@/lib/day";
import { formatClassType } from "@/lib/format-class-type";
import { formatGroupNames } from "@/lib/format-group-names";
import {
  curriculumLastUpdate,
  globalCurriculum,
} from "@/lib/global-curriculum";
import { timeTable } from "@/lib/time-table";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronDown,
  Copy,
  EllipsisVertical,
  Loader2,
  Plus,
  TableIcon,
  Trash2,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import InfoDialog from "./info-dialog";
import ThemeToggle from "./theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Curriculum() {
  const [loading, setLoading] = useState(true);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);

  const [curriculum, setCurriculum] = useLocalStorage<Curriculum | null>(
    "curriculum",
    null,
  );
  const [lastUpdateTimeMs, setLastUpdate] = useLocalStorage<number | null>(
    "curriculum-last-update",
    null,
  );
  const [advancedOptions, setAdvancedOptions] =
    useLocalStorage<AdvancedOptions>("advancedOptions", defaultAdvancedOptions);

  const [addingClassesToDay, setAddingClassesToDay] = useState<Day | null>(
    null,
  );

  const [promptForAddingClassesData, setPromptForAddingClassesData] = useState<{
    day: Day;
    time: string;
  } | null>(null);
  const availableClassesForAdding = useMemo(() => {
    if (!promptForAddingClassesData) return [];

    const { day, time } = promptForAddingClassesData;

    const classesAtTime = globalCurriculum[day].filter(
      (classSession) => classSession.time === time,
    );

    return classesAtTime.map((classSession) => ({
      ...classSession,
      alreadyInCurriculum:
        curriculum?.some((daySchedule) =>
          daySchedule.some(
            (x) =>
              x.subject === classSession.subject &&
              x.type === classSession.type,
          ),
        ) ?? false,
    }));
  }, [promptForAddingClassesData, curriculum]);

  useEffect(() => {
    if (!curriculum && lastUpdateTimeMs) {
      // corrupted state, just clean it up
      setLastUpdate(null);
    }

    if (curriculum && !lastUpdateTimeMs) {
      // corrupted state, assume curriculum is up to date but warn the user that it might be outdated
      toast.warning(
        "Podaci o rasporedu izgledaju oštećeno, molimo vas da proverite da li je raspored ažuran. Ako nije ili nastavite da vidite ovu poruku, molimo vas da resetujete podatke o rasporedu.",
      );
      setLastUpdate(new Date().getTime());
    }

    if (curriculum && lastUpdateTimeMs) {
      if (lastUpdateTimeMs < curriculumLastUpdate.getTime()) {
        toast.info(
          "Podaci o rasporedu su zastareli, molimo vas da ih ponovo kreirate.",
        );
        setCurriculum(null);
        setLastUpdate(null);
      }
    }

    setLoading(false);
  }, [curriculum, lastUpdateTimeMs, setLastUpdate, setCurriculum]);

  useEffect(() => {
    if (!!curriculum) return;

    setPresetDialogOpen(true);
  }, [curriculum]);

  function toggleCollapsed(day: string) {
    setAdvancedOptions((prev) => ({
      ...prev,
      collapsedDays: !prev.collapsedDays.includes(day)
        ? [...prev.collapsedDays, day]
        : prev.collapsedDays.filter((d) => d !== day),
    }));
  }

  function handleSelectPreset(curriculum: Curriculum) {
    setCurriculum(curriculum);
    setLastUpdate(new Date().getTime());
  }

  function submitAddingClass(classSession: CurriculumDay[number]) {
    if (!promptForAddingClassesData) return;

    const { day, time } = promptForAddingClassesData;

    setCurriculum((prev) => {
      if (!prev) return prev;

      const newCurriculum = [...prev];

      const daySchedule = newCurriculum[days.indexOf(day)];
      const newDaySchedule = [...daySchedule];
      const classIndex = newDaySchedule.findIndex((c) => c?.time === time);

      if (classIndex === -1) {
        // add
        let closest = 0;
        const timeIdx = timeTable.indexOf(time);

        for (let i = 0; i < newDaySchedule.length; i++) {
          if (timeTable.indexOf(newDaySchedule[i]!.time) > timeIdx) break;

          closest = i + 1;
        }

        newCurriculum[days.indexOf(day)] = [
          ...newDaySchedule.slice(0, closest),
          classSession,
          ...newDaySchedule.slice(closest),
        ];
      } else {
        // replace
        newDaySchedule[classIndex] = classSession;
        newCurriculum[days.indexOf(day)] = newDaySchedule;
      }

      return newCurriculum;
    });

    setPromptForAddingClassesData(null);
  }

  function handleRemoveClass(day: Day, classSession: CurriculumDay[number]) {
    setCurriculum((prev) => {
      if (!prev) return prev;

      return prev.map((daySchedule, i) => {
        if (days[i] !== day) return daySchedule;

        return daySchedule.filter(
          (c) =>
            c.subject !== classSession.subject ||
            c.type !== classSession.type ||
            c.location !== classSession.location,
        );
      });
    });
  }

  if (loading) {
    return (
      <div className="h-screen">
        <Loader2 className="absolute top-1/2 left-1/2 z-10 size-8 -translate-1/2 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-2 py-6 sm:px-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32 pl-3 font-semibold">Vreme</TableHead>
                <TableHead className="w-40 font-semibold max-sm:hidden">
                  Tip
                </TableHead>
                <TableHead className="font-semibold">Predmet</TableHead>
                <TableHead className="w-48 font-semibold">Grupe</TableHead>
                <TableHead className="w-48 font-semibold">Lokacija</TableHead>
                {/* for the actions button */}
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {(curriculum ?? defaultCurriculum).map((daySchedule, i) => {
                const dayName = days[i];

                return (
                  <Fragment key={dayName}>
                    <TableRow
                      key={dayName}
                      className={cn(
                        "w-full min-w-full bg-muted/50 py-3",
                        addingClassesToDay &&
                          addingClassesToDay !== dayName &&
                          "opacity-50",
                      )}
                      onClick={() => toggleCollapsed(dayName)}
                    >
                      <TableCell
                        colSpan={6}
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

                          <p
                            className={cn(
                              daySchedule.length === 0 &&
                                "text-muted-foreground",
                            )}
                          >
                            {dayName}
                          </p>

                          <div className="ml-auto">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddingClassesToDay(
                                  addingClassesToDay === dayName
                                    ? null
                                    : dayName,
                                );
                              }}
                            >
                              <Plus />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>

                    {!advancedOptions.collapsedDays.includes(dayName) &&
                      daySchedule.length === 0 &&
                      addingClassesToDay !== dayName && (
                        <TableRow className="w-full min-w-full">
                          <TableCell
                            colSpan={6}
                            className="py-3 text-center text-sm text-muted-foreground italic"
                          >
                            Nema predavanja
                          </TableCell>
                        </TableRow>
                      )}

                    {!advancedOptions.collapsedDays.includes(dayName) &&
                      (addingClassesToDay === dayName
                        ? addPaddingClasses(daySchedule)
                        : daySchedule
                      ).map((classSession, index) => {
                        if (!classSession) {
                          return (
                            <TableRow
                              key={`${dayName}-empty-${index}`}
                              className="relative hover:bg-muted/30"
                            >
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                {timeTable[index]}
                              </TableCell>

                              <TableCell colSpan={4} />

                              <td className="absolute inset-0">
                                <button
                                  className="absolute inset-0 grid place-items-center"
                                  onClick={() =>
                                    setPromptForAddingClassesData({
                                      day: dayName,
                                      time: timeTable[index],
                                    })
                                  }
                                >
                                  <Plus className="size-4" />
                                </button>
                              </td>
                            </TableRow>
                          );
                        }

                        return (
                          <TableRow
                            key={`${dayName}-${index}`}
                            className={cn(
                              "hover:bg-muted/30",
                              addingClassesToDay &&
                                addingClassesToDay !== dayName &&
                                "opacity-50",
                            )}
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

                            <TableCell className="w-max">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <EllipsisVertical />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setPromptForAddingClassesData({
                                        day: dayName,
                                        time: classSession.time,
                                      })
                                    }
                                  >
                                    <ArrowUpDown className="ml-2" />
                                    <span>Zameni</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                      handleRemoveClass(dayName, classSession)
                                    }
                                  >
                                    <Trash2 className="ml-2" />
                                    <span>Obriši</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            className="max-sm:size-9"
            onClick={() => setPresetDialogOpen(true)}
          >
            <TableIcon />
            <span className="hidden sm:inline">Nov raspored</span>
          </Button>

          <InfoDialog />

          <ThemeToggle />
        </div>
      </div>

      <PresetSelectorDialog
        open={presetDialogOpen}
        setOpen={setPresetDialogOpen}
        onSelect={handleSelectPreset}
      />

      <Dialog
        open={!!promptForAddingClassesData}
        onOpenChange={() => setPromptForAddingClassesData(null)}
      >
        <DialogContent className="md:min-w-max">
          <DialogHeader>
            <DialogTitle>Dodaj predavanje</DialogTitle>
            <DialogDescription>
              <span>
                Izaberite predavanje koje želite da dodate u{" "}
                {promptForAddingClassesData?.day},{" "}
                {promptForAddingClassesData?.time}
              </span>

              <br />

              <span>
                Predavanja oznacena znakom{" "}
                <Copy className="mx-0.25 inline size-4 text-orange-400" /> vec
                postoje u rasporedu
              </span>
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 pl-3 font-semibold">Tip</TableHead>
                <TableHead className="font-semibold">Predmet</TableHead>
                <TableHead className="w-40 font-semibold">Grupe</TableHead>
                <TableHead className="w-40 font-semibold">Lokacija</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {availableClassesForAdding.map((c) => (
                <TableRow
                  key={`${c.subject}-${c.type}-${c.location}`}
                  onClick={() => submitAddingClass(c)}
                >
                  <TableCell className="flex items-center gap-2">
                    {c.alreadyInCurriculum && (
                      <Copy className="size-4 text-orange-400" />
                    )}
                    {formatClassType(c.type)}
                  </TableCell>
                  <TableCell>{c.subject}</TableCell>
                  <TableCell>{formatGroupNames(c.groups)}</TableCell>
                  <TableCell>{c.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function addPaddingClasses(
  daySchedule: CurriculumDay,
): (CurriculumDay[number] | null)[] {
  const paddedSchedule: (CurriculumDay[number] | null)[] = [];

  timeTable.forEach((time) => {
    const classAtTime = daySchedule.find(
      (classSession) => classSession.time === time,
    );
    paddedSchedule.push(classAtTime ?? null);
  });

  return paddedSchedule;
}
