import { Settings } from "@/lib/advanced-options";
import { Github, SettingsIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ThemeToggle } from "./theme-toggle";
import { Field, FieldGroup, FieldLabel } from "./ui/field";

type SettingsMenuProps = {
  settings: Settings;
  setSettings: (settings: Settings) => void;
};

export function SettingsMenu({ settings, setSettings }: SettingsMenuProps) {
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
      </DialogContent>
    </Dialog>
  );
}
