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
import { useMemo, useState } from "react";

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<string>("A1");

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

      <Table className="*:w-[max(80vw,80vh)] min-w-0">
        <TableHeader>
          <TableRow>
            <TableHead>Vreme</TableHead>
            {days.map((day) => (
              <TableHead key={day}>{day}</TableHead>
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
                <TableCell>{time}</TableCell>

                {classes.map((x, j) => (
                  <TableCell
                    key={
                      !x[i]
                        ? `${i}-${j}-empty`
                        : `${i}-${x[i].groups}-${x[i].location}-${x[i].subject}`
                    }
                    className="h-32 max-w-max"
                  >
                    {x[i] && (
                      <div className="px-6">
                        <h3 className="text-center text-sm">{x[i].subject}</h3>

                        <p className="mt-2 text-end text-xs text-muted-foreground">
                          {x[i].location}
                        </p>
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
