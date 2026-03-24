import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const spaces = await prisma.space.findMany({
    where: { published: true },
    orderBy: { name: "asc" },
  });

  if (spaces.length === 1) {
    redirect(`/${spaces[0].slug}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Koter Tutorials
          </h1>
          <p className="text-muted-foreground">
            Escolha um espaco de documentacao para comecar.
          </p>
        </div>

        {spaces.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <BookOpen className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum espaco publicado ainda.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {spaces.map((space) => (
              <Link
                key={space.id}
                href={`/${space.slug}`}
                className="group flex flex-col gap-3 rounded-lg border p-5 transition-colors hover:border-foreground/20 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {space.logoUrl ? (
                    <img
                      src={space.logoUrl}
                      alt={space.name}
                      className="size-8 rounded"
                    />
                  ) : (
                    <div
                      className="flex size-8 items-center justify-center rounded text-white text-sm font-bold"
                      style={{ backgroundColor: space.accentColor }}
                    >
                      {space.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 className="font-semibold group-hover:text-foreground transition-colors">
                    {space.name}
                  </h2>
                </div>
                {space.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {space.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
