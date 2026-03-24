import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { FileText } from "lucide-react";

export default async function SpacePage({
  params,
}: {
  params: Promise<{ spaceSlug: string }>;
}) {
  const { spaceSlug } = await params;

  const space = await prisma.space.findUnique({
    where: { slug: spaceSlug, published: true },
  });

  if (!space) {
    return null;
  }

  const firstPage = await prisma.page.findFirst({
    where: {
      spaceId: space.id,
      status: "PUBLISHED",
      parentId: null,
    },
    orderBy: { order: "asc" },
    select: { slug: true },
  });

  if (firstPage) {
    redirect(`/${spaceSlug}/${firstPage.slug}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-4">
        <FileText className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">Nenhum conteudo ainda</h2>
      <p className="max-w-md text-muted-foreground">
        Este espaco ainda nao possui paginas publicadas. Volte mais tarde.
      </p>
    </div>
  );
}
