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

export default function Home() {
  const curriculumTimes = Array.from(
    new Set(
      Object.keys(curriculum).flatMap((x) => curriculum[x].map((x) => x.time)),
    ),
  );

  return (
    <Table>
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
            curriculum[day].filter((x) => x.time == time),
          );

          const max = Math.max(...classes.map((x) => x.length));

          return Array.from({ length: max }).map((_, i) => (
            <TableRow key={`${i}-${time}`}>
              <TableCell>{time}</TableCell>

              {classes.map(
                (x) =>
                  x[i] && (
                    <TableCell
                      key={`${i}-${x[i].groups}-${x[i].location}-${x[i].subject}`}
                    >
                      {x[i].subject}
                    </TableCell>
                  ),
              )}
            </TableRow>
          ));
        })}
      </TableBody>
    </Table>
  );
}
