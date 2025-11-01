"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdvancedOptions } from "@/lib/advanced-options";
import { compensateCurriculum } from "@/lib/compensate-curriculum";
import { curriculum } from "@/lib/curriculum";
import { days } from "@/lib/day";
import { cn } from "@/lib/utils";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { Fragment, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

type CurriculumTableProps = {
  selectedGroup: number;
  excludedClasses: string[];
  advancedOptions: AdvancedOptions;
  toggleCollapsed: (day: string) => void;
  toggleExcludedDay: (day: string) => void;
};

export function CurriculumTable({
  selectedGroup: selectedGroupId,
  excludedClasses,
  advancedOptions,
  toggleCollapsed,
  toggleExcludedDay,
}: CurriculumTableProps) {
  const selectedGroup = `A${selectedGroupId}`;

  const preProcessedCurriculum = useMemo(
    () =>
      Object.keys(curriculum).map((day) => ({
        day,
        classes: curriculum[day].filter(
          (cls) => !excludedClasses.includes(cls.subject),
        ),
      })),
    [excludedClasses],
  );

  const preProcessedGroupCurriculum = useMemo(
    () =>
      Object.keys(curriculum).map((day) => ({
        day,
        classes: curriculum[day].filter(
          (cls) =>
            !excludedClasses.includes(cls.subject) &&
            cls.groups.includes(selectedGroup),
        ),
      })),
    [excludedClasses, selectedGroup],
  );

  const scheduleData = useMemo(() => {
    const newSchedule = compensateCurriculum(
      preProcessedCurriculum,
      selectedGroup,
      advancedOptions.excludedDays,
    );

    if (!newSchedule) {
      toast.error("Nije moguće napraviti raspored");
    }

    return newSchedule;
  }, [selectedGroup, preProcessedCurriculum, advancedOptions.excludedDays]);

  function formatGroups(groupNames: string[]): string {
    const groups = groupNames.map((name) => name.replace("A", ""));
    if (groups.length === 1) return `Grupa ${groups[0]}`;
    return `Grupe ${formatNumberArray(groups.map(Number))}`;

    function formatNumberArray(nums: number[]): string {
      if (nums.length <= 4) {
        return nums.join(", ");
      }

      const ranges: string[] = [];
      let start = nums[0];
      let prev = nums[0];

      for (let i = 1; i <= nums.length; i++) {
        const curr = nums[i];

        // If break in sequence, push a range
        if (curr !== prev + 1) {
          if (start === prev) {
            ranges.push(`${start}`);
          } else {
            ranges.push(`${start}-${prev}`);
          }
          start = curr;
        }

        prev = curr;
      }

      return ranges.join(", ");
    }
  }

  function formatClassType(type: string): string {
    switch (type) {
      case "P":
        return "Predavanje";
      case "V":
        return "Vežbe";
      case "L":
        return "Laboratorijske Vežbe";
      default:
        return type;
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-32 font-semibold">Vreme</TableHead>
            <TableHead className="w-40 font-semibold max-sm:hidden">
              Tip
            </TableHead>
            <TableHead className="font-semibold">Predmet</TableHead>
            <TableHead className="w-48 font-semibold">Grupe</TableHead>
            <TableHead className="w-48 font-semibold">Lokacija</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {days.map((day) => {
            const processedDaySchedule = scheduleData?.filter(
              (schedule) => schedule.day === day,
            )[0];
            const excluded = !processedDaySchedule;

            const daySchedule =
              processedDaySchedule ??
              preProcessedGroupCurriculum.filter(
                (schedule) => schedule.day === day,
              )[0];

            return (
              <Fragment key={daySchedule.day}>
                {daySchedule.classes.length > 0 && (
                  <>
                    <TableRow
                      key={daySchedule.day}
                      className="w-full min-w-full bg-muted/50 py-3"
                      onClick={() => toggleCollapsed(daySchedule.day)}
                    >
                      <TableCell
                        colSpan={5}
                        className="font-semibold text-foreground"
                      >
                        <div className="flex items-center">
                          <Button size="icon" variant="ghost">
                            <ChevronDown
                              className={
                                advancedOptions.collapsedDays.includes(
                                  daySchedule.day,
                                )
                                  ? "rotate-180"
                                  : ""
                              }
                            />
                          </Button>

                          <p
                            className={cn(excluded && "text-muted-foreground")}
                          >
                            {daySchedule.day}
                            {excluded && <span> (isključen)</span>}
                          </p>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExcludedDay(daySchedule.day);
                            }}
                            className="mr-4 ml-auto"
                          >
                            {advancedOptions.excludedDays.includes(
                              daySchedule.day,
                            ) ? (
                              <Eye />
                            ) : (
                              <EyeOff />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {!advancedOptions.collapsedDays.includes(daySchedule.day) &&
                      daySchedule.classes.map((classSession, index) => (
                        <TableRow
                          key={`${daySchedule.day}-${index}`}
                          className={cn(
                            "hover:bg-muted/30",
                            excluded && "opacity-50",
                          )}
                        >
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {classSession.time}
                          </TableCell>

                          <TableCell className="max-sm:hidden">
                            <span className="text-muted-foreground">
                              {formatClassType(classSession.type)}
                            </span>
                          </TableCell>

                          <TableCell className="font-medium text-foreground">
                            <span className="max-sm:hidden">
                              {classSession.subject}
                            </span>
                            <span className="sm:hidden">
                              {classSession.subject.length > 30
                                ? `${classSession.subject
                                    .split(" ")
                                    .map((x) =>
                                      x.length > 1 ? x[0].toUpperCase() : x,
                                    )
                                    .join("")}`
                                : classSession.subject}
                            </span>{" "}
                            <span className="sm:hidden">
                              ({classSession.type})
                            </span>
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {formatGroups(classSession.groups)}
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {classSession.location}
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
