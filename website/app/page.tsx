"use client";

import Curriculum from "@/components/curriculum";
import { curriculumLastUpdate } from "@/lib/global-curriculum";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

export default function Page() {
  const [loading, setLoading] = useState(true);

  const [curriculum, setCurriculum] = useLocalStorage("curriculum", null);
  const [lastUpdateTimeMs, setLastUpdate] = useLocalStorage<number | null>(
    "curriculum-last-update",
    null,
  );

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

  return (
    <>
      {loading && (
        <div className="h-screen">
          <Loader2 className="absolute top-1/2 left-1/2 z-10 size-8 -translate-1/2 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && <Curriculum />}
    </>
  );
}
