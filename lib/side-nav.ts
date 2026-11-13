import type { NavItem, NavMenuLink, SideNavSection } from "@/types/content";

import { normalizePath } from "./path";

function samePath(href: string | undefined, path: string): boolean {
  return Boolean(href?.startsWith("/")) && normalizePath(href as string) === path;
}

function containsPath(links: NavMenuLink[], path: string): boolean {
  return links.some((link) => samePath(link.href, path) || containsPath(link.children ?? [], path));
}

/* Điều hướng phụ lấy từ menu header: trang thuộc mục nào thì hiện các link cùng mục đó. */
export function findSideNav(nav: NavItem[], path: string): SideNavSection | undefined {
  const target = normalizePath(path);
  const item = nav.find(
    (entry) => entry.menu?.groups.some((group) => samePath(group.href, target) || containsPath(group.links, target)),
  );
  if (!item?.menu) return undefined;
  return {
    title: item.label,
    groups: item.menu.groups.map((group) => ({
      title: group.title,
      href: group.href,
      links: group.links.flatMap((link) =>
        link.href
          ? [
              {
                label: link.label,
                href: link.href,
                current: samePath(link.href, target),
                children: link.children?.flatMap((child) =>
                  child.href ? [{ label: child.label, href: child.href, current: samePath(child.href, target) }] : [],
                ),
              },
            ]
          : [],
      ),
    })),
  };
}
