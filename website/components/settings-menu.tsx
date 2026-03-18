import { defaultSettings, Settings } from "@/lib/settings";
import { Github, Scissors, SettingsIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "./ui/field";
import { Input } from "./ui/input";
import { Toggle } from "./ui/toggle";
import { useTheme } from "next-themes";

type SettingsMenuProps = {
  settings: Settings;
  setSettings: (settings: Settings) => void;
};

export function SettingsMenu({ settings, setSettings }: SettingsMenuProps) {
  const { setTheme } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Ovde možete da podesite različite opcije koje će uticati na to kako
            se raspored prikazuje
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="gap-4">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="truncate-long-names">
              Skraćivanje dugih naziva:{" "}
            </FieldLabel>

            <Toggle
              id="truncate-long-names"
              className="max-sm:hover:bg-transparent max-sm:hover:data-[state=on]:bg-accent"
              defaultPressed={settings.truncateLongNames}
              onPressedChange={(pressed) =>
                setSettings({
                  ...settings,
                  truncateLongNames: pressed,
                })
              }
              variant="outline"
            >
              <Scissors />
              Skraćuj
            </Toggle>
          </Field>

          <Field orientation="horizontal">
            <FieldLabel htmlFor="turn-long-names-into-initials-after">
              Napravi skraćenice nakon:{" "}
            </FieldLabel>

            <Input
              id="turn-long-names-into-initials-after"
              type="number"
              value={settings.turnLongNamesIntoInitialsAfter}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  turnLongNamesIntoInitialsAfter: parseInt(e.target.value, 10),
                })
              }
              className="w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </Field>

          <ThemeToggle />

          <Field orientation="horizontal">
            <FieldLabel htmlFor="source-code">Source Code: </FieldLabel>

            <Button variant="outline" asChild>
              <a
                href="https://github.com/Andrej235/fon-curriculum"
                target="_blank"
                rel="noreferrer"
              >
                <span>Github</span>
                <Github />
              </a>
            </Button>
          </Field>
        </FieldGroup>

        <FieldSeparator />

        <FieldGroup>
          <Button
            variant="destructive"
            onClick={() => {
              setTheme("system");
              setSettings({ ...defaultSettings });
            }}
          >
            <span>Resetuj podešavanja</span>
          </Button>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
