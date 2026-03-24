import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SpaceNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">Pagina nao encontrada</h2>
      <p className="max-w-md text-muted-foreground">
        A pagina que voce esta procurando nao existe ou foi removida.
      </p>
      <Button variant="outline" render={<Link href="/" />}>
        Voltar ao inicio
      </Button>
    </div>
  );
}
