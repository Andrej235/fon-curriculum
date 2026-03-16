"use client";

import Curriculum from "@/components/curriculum";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function Page() {
  // todo: verify that the curriculum isn't outdated, keep track of last update or creation time
  // and compare to a hardcoded value that should be changed every time the curriculum changes
  const [loading] = useState(false); // set default to true

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
