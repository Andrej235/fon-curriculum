"use client";
import { CurriculumTable } from "@/components/curriculum-table";
import { Button } from "@/components/ui/button";
import { BasicOptions } from "@/lib/basic-options";
import Link from "next/link";
import { useLocalStorage } from "usehooks-ts";

export default function Curriculum() {
  const [options] = useLocalStorage<BasicOptions | null>("basicOptions", null);

  const group = options?.group ?? null;
  const excludedClasses = options?.excludedClasses ?? [];

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            {group && (
              <h1 className="text-3xl font-semibold text-foreground">
                Raspored - Grupa A{group}
              </h1>
            )}
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Promeni Opcije</Link>
          </Button>
        </div>
        {group && (
          <CurriculumTable
            selectedGroup={group}
            excludedClasses={excludedClasses}
          />
        )}
      </div>
    </main>
  );
}
