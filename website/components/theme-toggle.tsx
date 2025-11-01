import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function ThemeToggle() {
  const { resolvedTheme: theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      {theme === "dark" && <Sun />}
      {theme === "light" && <Moon />}
    </Button>
  );
}
