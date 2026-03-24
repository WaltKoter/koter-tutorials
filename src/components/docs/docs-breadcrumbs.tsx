import Link from "next/link";
import type { FlatPage } from "@/lib/tree";
import { getPagePath } from "@/lib/tree";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DocsBreadcrumbsProps {
  spaceName: string;
  spaceSlug: string;
  breadcrumbs: FlatPage[];
}

export function DocsBreadcrumbs({
  spaceName,
  spaceSlug,
  breadcrumbs,
}: DocsBreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href={`/${spaceSlug}`} />}>
            {spaceName}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const path = getPagePath(crumb.id, breadcrumbs);

          return (
            <span key={crumb.id} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={
                      <Link href={`/${spaceSlug}/${path.join("/")}`} />
                    }
                  >
                    {crumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
