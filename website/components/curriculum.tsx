"use client";
import { CurriculumTable } from "@/components/curriculum-table";
import { Button } from "@/components/ui/button";
import {
  AdvancedOptions,
  defaultAdvancedOptions,
} from "@/lib/advanced-options";
import { CurriculumDay } from "@/lib/curriculum-day";
import { Edit2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import InfoDialog from "./info-dialog";
import ThemeToggle from "./theme-toggle";

export default function Curriculum() {
  const [advancedOptions, setAdvancedOptions] =
    useLocalStorage<AdvancedOptions>("advancedOptions", defaultAdvancedOptions);

  const [, setForceOptionsChange] = useLocalStorage<boolean>(
    "forceOptionsChange",
    false,
  );

  const [curriculum] = useLocalStorage<CurriculumDay[]>("curriculum", [
    [],
    [],
    [],
    [],
    [],
  ]);

  function toggleCollapsed(day: string) {
    setAdvancedOptions((prev) => ({
      ...prev,
      collapsedDays: !prev.collapsedDays.includes(day)
        ? [...prev.collapsedDays, day]
        : prev.collapsedDays.filter((d) => d !== day),
    }));
  }

  useEffect(() => {
    if (advancedOptions === null) {
      setAdvancedOptions({
        collapsedDays: [],
      });
      return;
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
            <h1 className="text-xl font-semibold text-foreground xl:text-3xl">
              Raspored
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild className="max-sm:size-9">
              <Link
                href="/"
                onClick={() => {
                  setForceOptionsChange(true);
                }}
              >
                <Edit2 />
                <span className="hidden sm:inline">Promeni Opcije</span>
              </Link>
            </Button>

            <InfoDialog />

            <ThemeToggle />
          </div>
        </header>

        <CurriculumTable
          advancedOptions={advancedOptions}
          toggleCollapsed={toggleCollapsed}
          curriculum={curriculum}
        />
      </div>
    </main>
  );
}
