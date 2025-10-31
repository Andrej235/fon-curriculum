"use client";
import { CurriculumTable } from "@/components/curriculum-table";
import { Button } from "@/components/ui/button";
import { BasicOptions } from "@/lib/basic-options";
import { Edit2 } from "lucide-react";
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
              <h1 className="text-xl font-semibold text-foreground xl:text-3xl">
                Raspored - Grupa A{group}
              </h1>
            )}
          </div>
          <Button variant="outline" asChild className="max-sm:size-9">
            <Link href="/">
              <Edit2 className="sm:hidden" />
              <span className="hidden sm:inline">Promeni Opcije</span>
            </Link>
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
