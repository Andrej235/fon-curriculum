import { Bot, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Field, FieldLabel } from "./ui/field";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="theme">Tema: </FieldLabel>

      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger id="theme" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              System
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}
