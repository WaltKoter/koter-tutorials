import { redirect } from "next/navigation";

export default async function SpacePage({
  params,
}: {
  params: Promise<{ spaceSlug: string }>;
}) {
  const { spaceSlug } = await params;
  redirect(`/admin/spaces/${spaceSlug}/settings`);
}
