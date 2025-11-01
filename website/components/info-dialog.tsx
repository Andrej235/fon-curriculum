import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function InfoDialog() {
  return (
    <Dialog>
      <Button variant="outline" asChild className="max-sm:size-9">
        <DialogTrigger>
          <Info />
          <span className="hidden sm:inline">Info</span>
        </DialogTrigger>
      </Button>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Info i uputsvo</DialogTitle>
          <DialogDescription>
            Kratko objašnjenje kako se koristi sajt
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h2>1. Izaberi opcije</h2>
            <p className="text-sm text-muted-foreground">
              Izaberi svoju grupu i predmete koje ne pohaš. Na primer ako si
              imao izbor između engleskog i francuskog i izabrao si engleski
              čekiraj kutiju pored francuskog (jer na njega nećeš ići)
            </p>
          </div>

          <div className="space-y-2">
            <h2>2. Pogledaj raspored</h2>
            <p className="text-sm text-muted-foreground">
              Nakon izbora opcija, sajt će te odvesti na stranicu sa rasporedom.
              Klikom na ime nekog dana možeš da sakriješ taj dan privremeno da
              ne zauzima mesto na ekranu
            </p>
          </div>

          <div className="space-y-2">
            <h2>3. Isključivanje dana</h2>
            <p className="text-sm text-muted-foreground">
              Ako određeni dan ne možeš ili ne želiš da dolaziš na faks klikni
              ikonicu oka pored njega i sajt će pokušati da nadoknadi sva
              predavanja tako što će ih ubaciti u druge dane sa drugim grupama
            </p>
          </div>

          <p>
            Projekat je open source na GitHub-u. Ako želiš da doprineseš ili
            imaš neku ideju, slobodno otvori issue ili pošalji pull request
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/Andrej235/fon-curriculum"
              target="_blank"
              rel="noreferrer"
            >
              Otvori repo na github-u
            </a>
          </Button>

          <DialogClose asChild>
            <Button>Zatvori</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
