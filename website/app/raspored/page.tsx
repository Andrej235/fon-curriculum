"use client";

import Curriculum from "@/components/curriculum";
import { BasicOptions } from "@/lib/basic-options";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [options] = useLocalStorage<BasicOptions | null>("basicOptions", null);
  const router = useRouter();

  useEffect(() => {
    if (!options) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [options, router]);

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
