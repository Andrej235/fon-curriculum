"use client";

import InfoDialog from "@/components/info-dialog";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AdvancedOptions } from "@/lib/advanced-options";
import { BasicOptions } from "@/lib/basic-options";
import { curriculum } from "@/lib/curriculum";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function Home() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [excludedClasses, setExcludedClasses] = useState<string[]>([]);

  const [savedOptions, setSavedOptions] = useLocalStorage<BasicOptions | null>(
    "basicOptions",
    null,
  );
  const [, setSavedAdvancedOptions] = useLocalStorage<AdvancedOptions | null>(
    "advancedOptions",
    null,
  );

  useEffect(() => {
    if (!savedOptions) return;

    setSelectedGroup(savedOptions.group);
    setExcludedClasses(savedOptions.excludedClasses);
  }, [savedOptions]);

  const handleClassToggle = (className: string) => {
    setExcludedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className],
    );
  };

  const handleContinue = () => {
    if (selectedGroup === null) return;

    const options: BasicOptions = {
      group: selectedGroup,
      excludedClasses,
    };

    setSavedOptions(options);
    setSavedAdvancedOptions({
      collapsedDays: [],
      excludedDays: [],
    });
    router.push("/raspored");
  };

  const allClasses = useMemo(
    () =>
      Array.from(
        new Set(
          Object.keys(curriculum)
            .flatMap((day) => curriculum[day])
            .filter((x) => x.groups.includes(`A${selectedGroup}`))
            .map((x) => x.subject),
        ),
      ).sort(),
    [selectedGroup],
  );

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:items-center sm:justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-xl font-semibold text-foreground lg:text-3xl">
              Napravi Svoj Raspored
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Izaberi svoju grupu i predmete koje ne želiš da pohađaš
            </p>
          </div>

          <div className="flex gap-2">
            <InfoDialog />
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Izaberi Svoju Grupu
            </h2>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
              {Array.from({ length: 18 }, (_, i) => i + 1).map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`rounded-md border py-2 text-sm font-medium transition-colors sm:px-4 ${
                    selectedGroup === group
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Isključi Predmete
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Izaberi predmete koje ne želiš da pohađaš
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {allClasses.map((className) => (
                <div key={className} className="flex items-center space-x-2">
                  <Checkbox
                    id={className}
                    checked={excludedClasses.includes(className)}
                    onCheckedChange={() => handleClassToggle(className)}
                  />
                  <Label
                    htmlFor={className}
                    className="cursor-pointer text-sm font-normal text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {className}
                  </Label>
                </div>
              ))}

              {allClasses.length === 0 && (
                <p className="min-w-full text-sm text-muted-foreground">
                  Prvo izaberi grupu da vidiš dostupne predmete.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={selectedGroup === null}
              size="lg"
            >
              Napravi Raspored
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
