"use client";

import { PresetSelectorDialog } from "@/components/preset-selector-dialog";
import { AdvancedOptions } from "@/lib/advanced-options";
import { CurriculumDay } from "@/lib/curriculum-day";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [presetDialogOpen, setPresetDialogOpen] = useState(true);

  const [, setCurriculum] = useLocalStorage<CurriculumDay[] | null>(
    "curriculum",
    null,
  );

  function handleSelectPreset(curriculum: CurriculumDay[]) {
    setCurriculum(curriculum);
    handleContinue();
  }

  const [, setSavedAdvancedOptions] = useLocalStorage<AdvancedOptions | null>(
    "advancedOptions",
    null,
  );
  const [forceOptionsChange, setForceOptionsChange] = useLocalStorage<boolean>(
    "forceOptionsChange",
    false,
  );

  useEffect(() => {
    if (!forceOptionsChange) {
      router.push("/raspored");
      return;
    }

    setIsLoading(false);
  }, [router, forceOptionsChange]);

  const handleContinue = () => {
    setSavedAdvancedOptions({
      collapsedDays: [],
    });
    setForceOptionsChange(false);
    router.push("/raspored");
  };

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      {isLoading && (
        <Loader2 className="absolute top-1/2 left-1/2 z-10 size-8 -translate-1/2 animate-spin text-muted-foreground" />
      )}

      {!isLoading && (
        <PresetSelectorDialog
          open={presetDialogOpen}
          setOpen={setPresetDialogOpen}
          onSelect={handleSelectPreset}
        />
      )}
    </main>
  );
}
