"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { curriculum } from "@/lib/curriculum";
import { days } from "@/lib/day";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<string>("A1");
  const [hoveringOverColumn, setHoveringOverColumn] = useState<number | null>(
    null,
  );

  const curriculumTimes = useMemo(
    () =>
      Array.from(
        new Set(
          Object.keys(curriculum).flatMap((x) =>
            curriculum[x].map((x) => x.time),
          ),
        ),
      ),
    [],
  );

  return (
    <div className="flex flex-col">
      <header className="py-8">
        <div className="flex justify-center">
          <Select
            onValueChange={(value) => setSelectedGroup(value)}
            value={selectedGroup}
          >
            <SelectTrigger>
              <SelectValue placeholder="Izaberi grupu" />
            </SelectTrigger>

            <SelectContent>
              {Array.from({ length: 18 }).map((_, i) => {
                const group = `A${i + 1}`;

                return (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Table className="overflow-auto select-none">
        <TableHeader>
          <TableRow>
            <TableHead
              className={cn(
                "text-center transition-colors",
                hoveringOverColumn === 0 && "bg-muted/40",
              )}
              onMouseOver={() => setHoveringOverColumn(0)}
              onMouseLeave={() => setHoveringOverColumn(null)}
            >
              Vreme
            </TableHead>
            {days.map((day, index) => (
              <TableHead
                className={cn(
                  "text-center transition-colors",
                  hoveringOverColumn === index + 1 && "bg-muted/40",
                )}
                key={day}
                onMouseEnter={() => setHoveringOverColumn(index + 1)}
                onMouseLeave={() => setHoveringOverColumn(null)}
              >
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {curriculumTimes.map((time) => {
            const classes = Object.keys(curriculum).map((day) =>
              curriculum[day].filter(
                (x) => x.time == time && x.groups.includes(selectedGroup),
              ),
            );

            const max = Math.max(...classes.map((x) => x.length));

            return Array.from({ length: max }).map((_, i) => (
              <TableRow key={`${i}-${time}`}>
                <TableCell
                  className={cn(
                    "text-center transition-colors",
                    hoveringOverColumn === 0 && "bg-muted/40",
                  )}
                  onMouseEnter={() => setHoveringOverColumn(0)}
                  onMouseLeave={() => setHoveringOverColumn(null)}
                >
                  {time}
                </TableCell>

                {classes.map((x, j) => (
                  <TableCell
                    key={
                      !x[i]
                        ? `${i}-${j}-empty`
                        : `${i}-${x[i].groups}-${x[i].location}-${x[i].subject}`
                    }
                    className={cn(
                      "h-32 max-w-max text-center transition-colors",
                      hoveringOverColumn === j + 1 && "bg-muted/40",
                    )}
                    onMouseEnter={() => setHoveringOverColumn(j + 1)}
                    onMouseLeave={() => setHoveringOverColumn(null)}
                  >
                    {x[i] && (
                      <div className="px-6">
                        <h3 className="text-center text-sm">{x[i].subject}</h3>
                        <div className="flex justify-between">
                          <p className="mt-2 text-end text-xs text-muted-foreground">
                            {x[i].type}
                          </p>

                          <p className="mt-2 text-end text-xs text-muted-foreground">
                            {x[i].location}
                          </p>
                        </div>
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </div>
  );
}
