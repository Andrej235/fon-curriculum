"use client";
import { CurriculumTable } from "@/components/curriculum-table";
import { Button } from "@/components/ui/button";
import { AdvancedOptions } from "@/lib/advanced-options";
import { BasicOptions } from "@/lib/basic-options";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import InfoDialog from "./info-dialog";
import ThemeToggle from "./theme-toggle";

export default function Curriculum() {
  const [options] = useLocalStorage<BasicOptions | null>("basicOptions", null);
  const [advancedOptions, setAdvancedOptions] =
    useLocalStorage<AdvancedOptions>("advancedOptions", null!);

  const group = options?.group ?? null;
  const excludedClasses = options?.excludedClasses ?? [];

  function toggleCollapsed(day: string) {
    setAdvancedOptions((prev) => ({
      ...prev,
      collapsedDays: !prev.collapsedDays.includes(day)
        ? [...prev.collapsedDays, day]
        : prev.collapsedDays.filter((d) => d !== day),
    }));
  }

  function toggleExcludedDay(day: string) {
    setAdvancedOptions((prev) => {
      const alreadyExcluded = prev.excludedDays.includes(day);

      return {
        ...prev,
        collapsedDays: !alreadyExcluded
          ? [...prev.collapsedDays, day]
          : prev.collapsedDays.filter((d) => d !== day),
        excludedDays: !alreadyExcluded
          ? [...prev.excludedDays, day]
          : prev.excludedDays.filter((d) => d !== day),
      };
    });
  }

  useEffect(() => {
    if (advancedOptions === null) {
      setAdvancedOptions({
        excludedDays: [],
        collapsedDays: [],
      });
      return;
    }

    if (!advancedOptions?.excludedDays) {
      advancedOptions.excludedDays = [];
      setAdvancedOptions({ ...advancedOptions });
    }

    if (!advancedOptions?.collapsedDays) {
      advancedOptions.collapsedDays = [];
      setAdvancedOptions({ ...advancedOptions });
    }
  }, [advancedOptions, setAdvancedOptions]);

  return (
    <main className="min-h-screen bg-background px-2 py-6 sm:px-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex flex-col items-center justify-center gap-2 sm:mb-8 sm:flex-row sm:justify-between">
          <div>
            {group && (
              <h1 className="text-xl font-semibold text-foreground xl:text-3xl">
                Raspored - Grupa A{group}
              </h1>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild className="max-sm:size-9">
              <Link href="/">
                <Edit2 />
                <span className="hidden sm:inline">Promeni Opcije</span>
              </Link>
            </Button>

            <InfoDialog />

            <ThemeToggle />
          </div>
        </header>

        {group && (
          <CurriculumTable
            selectedGroup={group}
            excludedClasses={excludedClasses}
            advancedOptions={advancedOptions}
            toggleCollapsed={toggleCollapsed}
            toggleExcludedDay={toggleExcludedDay}
          />
        )}

        <footer className="mt-4 flex items-center justify-end gap-2 sm:mt-8">
          {(advancedOptions.collapsedDays.length > 0 ||
            advancedOptions.excludedDays.length > 0) && (
            <Button
              variant="outline"
              className="max-sm:size-9"
              onClick={() =>
                setAdvancedOptions({
                  excludedDays: [],
                  collapsedDays: [],
                })
              }
            >
              <Trash2 />
              <span className="hidden sm:inline">Resetuj</span>
            </Button>
          )}
        </footer>
      </div>
    </main>
  );
}
