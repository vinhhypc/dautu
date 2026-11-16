import { cn } from "@/lib/cn";
import type { FooterContent, FooterGroup as FooterGroupData, FooterLink as FooterLinkData } from "@/types/content";

import { Container } from "../ui/container";
import { Icon } from "../ui/icon";
import { RouteLink } from "../ui/route-link";
import { IconLink } from "../ui/icon-button";

const linkClasses =
  "rounded-4 transition-colors duration-200 hover:text-brand-primary focus-visible:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary motion-reduce:transition-none";

function FooterLink({ label, href, className }: FooterLinkData & { className?: string }) {
  if (!href) return <span className={className}>{label}</span>;
  return (
    <RouteLink href={href} className={cn(linkClasses, className)}>
      {label}
    </RouteLink>
  );
}

function FooterGroupLinks({ links, className }: { links: FooterGroupData["links"]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-12 text-text-secondary", className)}>
      {links.map((link) => (
        <li key={link.label}>
          <FooterLink {...link} />
        </li>
      ))}
    </ul>
  );
}

function FooterGroupColumn({ title, links }: FooterGroupData) {
  return (
    <>
      <details name="footer-groups" className="footer-group group lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-12 py-14 font-medium text-text-primary [&::-webkit-details-marker]:hidden">
          <h2 className="min-w-0 flex-1">{title}</h2>
          <Icon
            name="chevron-down"
            className="transition-transform duration-300 ease-standard group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <FooterGroupLinks links={links} className="pb-16" />
      </details>
      <div className="hidden min-w-0 flex-col gap-12 lg:flex">
        <h2 className="font-medium text-text-primary">{title}</h2>
        <FooterGroupLinks links={links} />
      </div>
    </>
  );
}

export function Footer({ navLabel, groups, contact, copyright, legalLabel, legalLinks, slogan }: FooterContent) {
  return (
    <footer className="border-t border-border-subtle bg-background-canvas text-normal-l lg:text-normal-lg">
      <Container className="flex flex-col gap-48 pt-32 pb-64 lg:gap-64 lg:py-32">
        <div className="flex flex-col gap-32 lg:grid lg:grid-cols-4 lg:gap-40">
          <div className="flex min-w-0 flex-col gap-24 lg:gap-16">
            <div className="flex flex-col gap-12 lg:gap-16">
              <h2 className="font-medium text-text-primary">{contact.title}</h2>
              <ul className="flex gap-8">
                {contact.socials.map((social) => (
                  <li key={social.icon}>
                    <IconLink
                      href={social.href}
                      icon={social.icon}
                      label={social.label}
                      size="responsive"
                      external
                      className="lg:size-54"
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-8 font-medium text-text-primary">
              <FooterLink {...contact.hotline} />
              <FooterLink {...contact.email} />
              {contact.page && <FooterLink {...contact.page} />}
            </div>
          </div>

          <nav aria-label={navLabel} className="flex flex-col lg:col-span-3 lg:grid lg:auto-cols-fr lg:grid-flow-col lg:gap-40">
            {groups.map((group) => (
              <FooterGroupColumn key={group.title} {...group} />
            ))}
          </nav>
        </div>

        <div className="flex flex-col border-t border-border-subtle pt-24 text-text-tertiary lg:flex-row lg:items-center lg:gap-24">
          <p>{copyright}</p>
          {legalLinks.length > 0 && (
            <nav aria-label={legalLabel}>
              <ul className="flex gap-4">
                {legalLinks.map((link) => (
                  <li key={link.label} className="not-first:before:mr-4 not-first:before:content-['·']">
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <p className="lg:ml-auto">{slogan}</p>
        </div>
      </Container>
    </footer>
  );
}
