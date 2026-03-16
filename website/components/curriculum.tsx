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
import { defaultCurriculum, type Curriculum } from "@/lib/curriculum-type";
import { days } from "@/lib/day";
import { formatClassType } from "@/lib/format-class-type";
import { formatGroupNames } from "@/lib/format-group-names";
import { cn } from "@/lib/utils";
import { ChevronDown, TableIcon, Loader2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import InfoDialog from "./info-dialog";
import ThemeToggle from "./theme-toggle";
import { curriculumLastUpdate } from "@/lib/global-curriculum";
import { toast } from "sonner";

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
      console.log(lastUpdateTimeMs);

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
              </TableRow>
            </TableHeader>

            <TableBody>
              {(curriculum ?? defaultCurriculum).map((daySchedule, i) => {
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

                          <p
                            className={cn(
                              daySchedule.length === 0 &&
                                "text-muted-foreground",
                            )}
                          >
                            {dayName}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>

                    {!advancedOptions.collapsedDays.includes(dayName) &&
                      daySchedule.length === 0 && (
                        <TableRow className="w-full min-w-full">
                          <TableCell
                            colSpan={5}
                            className="py-3 text-center text-sm text-muted-foreground italic"
                          >
                            Nema predavanja
                          </TableCell>
                        </TableRow>
                      )}

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
    </main>
  );
}
