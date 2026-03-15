"use client";

import Curriculum from "@/components/curriculum";
import { BasicOptions } from "@/lib/basic-options";
import { curriculum } from "@/lib/curriculum";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useLocalStorage<BasicOptions | null>(
    "basicOptions",
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (!options) {
      router.push("/");
      return;
    }

    const allClasses = Array.from(
      new Set(
        Object.keys(curriculum)
          .flatMap((day) => curriculum[day])
          .filter((x) => x.groups.includes(`A${options.group}`))
          .map((x) => x.subject),
      ),
    ).sort();

    if (options.excludedClasses.some((e) => !allClasses.includes(e))) {
      setOptions(null);
      router.push("/");
      toast.info(
        "Vaše prethodne opcije su nevažeće zbog promjena u rasporedu. Molimo vas da ih ponovo postavite.",
      );
      return;
    }

    setLoading(false);
  }, [options, setOptions, router]);

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
