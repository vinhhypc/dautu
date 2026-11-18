import type { MetadataRoute } from "next";
import type { StaticImageData } from "next/image";

export type ButtonVariant = "primary" | "secondary" | "neutral" | "ghost" | "link" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "responsive";

export type SocialIconName = "facebook" | "youtube" | "linkedin" | "tiktok";
export type IconName =
  | "arrow-right"
  | "arrow-right-up"
  | "external-link"
  | "check"
  | "chevron-down"
  | "menu"
  | "more"
  | "close"
  | "shield"
  | "chart"
  | "send"
  | SocialIconName;

export type IconButtonVariant = "neutral" | "plain";
export type IconButtonSize = "xs" | "md" | "lg" | "responsive";

export type LinkItem = {
  label: string;
  href: string;
};

export type CtaLink = LinkItem & {
  variant?: ButtonVariant;
  trailingIcon?: IconName;
};

export type NavMenuLink = {
  label: string;
  description?: string;
  href?: string;
  children?: NavMenuLink[];
};

export type NavMenuGroup = {
  title?: string;
  href?: string;
  links: NavMenuLink[];
};

export type NavMenuIllustration = "growth-columns" | "coin-stack" | "target" | "safe" | "qr-dstock";

export type NavMenu = {
  groups: NavMenuGroup[];
  feature?: {
    title: string;
    description: string;
    cta: LinkItem;
    illustration: NavMenuIllustration;
  };
};

export type NavItem = {
  label: string;
  href?: string;
  hasMenu?: boolean;
  menu?: NavMenu;
};

export type ImageAsset = {
  src: StaticImageData;
  alt: string;
};

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: { url: string; alt: string; width: number; height: number };
  noIndex?: boolean;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
  lastModified?: string;
};

export type HeroContent = {
  eyebrow?: string;
  title: string;
  description: string;
  ctas: CtaLink[];
  image?: ImageAsset;
};

export type SectionMeta = {
  label: string;
  aside?: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  tag?: string;
  link?: CtaLink;
};

export type FeatureGridContent = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  items: FeatureItem[];
};

export type StatItem = {
  value: string;
  label: string;
};

export type StatsContent = {
  id: string;
  title: string;
  items: StatItem[];
};

export type ContentSplitContent = {
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  image: ImageAsset;
  imagePosition?: "start" | "end";
};

export type TimelineItem = {
  period: string;
  title: string;
  description: string;
};

export type TimelineContent = {
  id: string;
  title: string;
  description?: string;
  items: TimelineItem[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqContent = {
  id: string;
  meta: SectionMeta;
  title: string;
  highlight: string;
  description: string;
  columns: { index: string; question: string };
  items: FaqItem[];
  support: {
    label: string;
    title: string;
    cta: LinkItem;
  };
};

export type CtaBannerContent = {
  id: string;
  title: string;
  description: string;
  cta: CtaLink;
};

export type PageContent = {
  seo: PageSeo;
  breadcrumb?: LinkItem[];
};

export type FooterLink = {
  label: string;
  href?: string;
};

export type FooterGroup = {
  title: string;
  links: FooterLink[];
};

export type SocialLink = LinkItem & {
  icon: SocialIconName;
};

export type HeaderContent = {
  logoSrc: string;
  logoOnLightSrc: string;
  logoAlt: string;
  homeLabel: string;
  navLabel: string;
  menuOpenLabel: string;
  menuCloseLabel: string;
  nav: NavItem[];
  navMoreLabel: string;
  navOverflowFrom: number;
  navOverflowFromCompact: number;
  scrollActions: HeaderScrollAction[];
  secondaryAction: LinkItem;
  primaryAction: LinkItem;
  primaryActionHrefs: HeaderPathHref[];
  overlayPaths: string[];
  homeHref: string;
};

export type HeaderPathHref = {
  path: string;
  href: string;
};

export type HeaderScrollAction = {
  path: string;
  action: CtaLink;
  afterId: string;
};

export type FooterContent = {
  navLabel: string;
  groups: FooterGroup[];
  contact: {
    title: string;
    socials: SocialLink[];
    hotline: LinkItem;
    email: LinkItem;
    page?: LinkItem;
  };
  copyright: string;
  legalLabel: string;
  legalLinks: FooterLink[];
  slogan: string;
};

export type OrganizationInfo = {
  legalName: string;
  logoPath: string;
  email?: string;
  telephone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressCountry: string;
  };
  sameAs: string[];
};

export type SiteContent = {
  name: string;
  url: string;
  locale: string;
  language: string;
  description: string;
  keywords: string[];
  defaultOgImage: NonNullable<PageSeo["image"]>;
  iconPath: string;
  skipLinkLabel: string;
  organization: OrganizationInfo;
  header: HeaderContent;
  footer: FooterContent;
};

export type HeroSlideTone = "light" | "dark";
export type HeroSlideAccent = "brand" | "positive";

export type HeroSlide = {
  id: string;
  image: ImageAsset;
  tone: HeroSlideTone;
  eyebrow?: string;
  title?: string;
  titleAccent?: HeroSlideAccent;
  description?: string;
  note?: string;
  ctas?: CtaLink[];
};

export type HeroCarouselContent = {
  id: string;
  title: string;
  slides: HeroSlide[];
  labels: {
    carousel: string;
    slide: string;
    slidePosition: string;
    goToSlide: string;
  };
};

export type QuickToolItem = {
  label: string;
  href: string;
  icon: ImageAsset;
};

export type QuickToolsContent = {
  id: string;
  title: string;
  items: QuickToolItem[];
};

export type HomePageContent = PageContent & {
  hero: HeroCarouselContent;
  quickTools: QuickToolsContent;
};

export type RichInline =
  | { type: "text"; value: string }
  | { type: "strong" | "em"; children: RichInline[] }
  | { type: "link"; href: string; children: RichInline[] }
  | { type: "break" };

export type RichAlign = "center" | "right";

export type RichTableCell = {
  header: boolean;
  colSpan?: number;
  rowSpan?: number;
  children: RichBlock[];
};

export type RichBlock =
  | { type: "heading"; level: 2 | 3 | 4; id?: string; align?: RichAlign; children: RichInline[] }
  | { type: "paragraph"; align?: RichAlign; children: RichInline[] }
  | { type: "list"; ordered: boolean; start?: number; items: RichBlock[][] }
  | { type: "table"; rows: RichTableCell[][] }
  | { type: "image"; src: string; alt: string; width?: number; height?: number; scale?: number; align?: RichAlign; href?: string }
  | { type: "video"; src: string; title: string }
  | { type: "embed"; src: string; title: string; height?: number; wide?: boolean; chart?: string }
  | { type: "disclosure"; id?: string; title: RichInline[]; children: RichBlock[] }
  | { type: "pdf"; src: string; title: string }
  | { type: "rule" };

export type RichTextLabels = {
  openPdf: string;
  embedLoading: string;
  openEmbed: string;
};

export type ArchiveListItem = {
  title: string;
  href: string;
  date: string;
};

export type PostSummary = {
  title: string;
  href: string;
  date: string;
  image?: WpImage;
  excerpt?: string;
  category?: LinkItem;
};

export type PostArticleLabels = {
  published: string;
  categories: string;
  relatedTitle: string;
  subscribeTitle: string;
  tocTitle: string;
  shareTitle: string;
};

export type ShareLink = {
  icon: SocialIconName;
  label: string;
  href: string;
};

export type SearchFormContent = {
  action: string;
  label: string;
  placeholder: string;
  submitLabel: string;
  query?: string;
};

export type HubspotFormConfig = {
  portalId: string;
  formId: string;
  region: string;
};

export type PaginationContent = {
  label: string;
  previous?: LinkItem;
  next?: LinkItem;
  pages: (LinkItem & { current: boolean })[];
};

export type DateFieldLabels = {
  placeholder: string;
  previous: string;
  next: string;
  clear: string;
};

export type ArchiveFilterContent = {
  action: string;
  label: string;
  locale: string;
  dateLabels: DateFieldLabels;
  initialMonth?: string;
  fromLabel: string;
  toLabel: string;
  queryLabel: string;
  submitLabel: string;
  resetLabel: string;
  from?: string;
  to?: string;
  query?: string;
};

export type BreadcrumbItem = LinkItem;

export type SideNavSection = {
  title: string;
  groups: { title?: string; href?: string; links: (LinkItem & { current: boolean; children?: (LinkItem & { current: boolean })[] })[] }[];
};

export type DocumentPageLabels = {
  breadcrumb: string;
  sideNav: string;
};

export type FaqGroupItem = {
  id: string;
  question: string;
  answer: RichBlock[];
};

export type VideoItem = {
  title: string;
  src: string;
};

export type VideoGridContent = {
  id: string;
  title: string;
  description?: string;
  items: VideoItem[];
};

export type FigureItem = {
  image: ImageAsset;
  caption: string;
};

export type FigureSectionContent = {
  id: string;
  title: string;
  description: string;
  figures: FigureItem[];
  cta?: CtaLink;
};

export type ContactDetailItem = {
  label: string;
  value: string;
  href?: string;
};

export type ContactDetailsContent = {
  id: string;
  title: string;
  description: string;
  items: ContactDetailItem[];
  cta?: CtaLink;
};

export type WpImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type WpCardFace = {
  title?: string;
  body: RichBlock[];
  image?: WpImage;
  link?: LinkItem;
  icon?: IconName;
};

export type WpPanel = {
  title: string;
  body: RichBlock[];
};

export type WpSlide = {
  title?: string;
  body?: RichBlock[];
  image?: WpImage;
  link?: LinkItem;
};

export type WpTestimonial = {
  name: string;
  role?: string;
  body: string;
  image?: WpImage;
};

export type WpPostCard = {
  title: string;
  href: string;
  image?: WpImage;
  excerpt?: string;
};

export type WpAlign = "left" | "center" | "right";
export type WpTone = "brand" | "accent" | "purple" | "green" | "muted" | "inverse";

export type WpColumn = {
  span: number;
  widgets: WpWidget[];
  align?: WpAlign;
  tone?: WpTone;
  outline?: WpTone;
  elevated?: boolean;
  background?: WpImage;
};

/* align/tone/width giữ lại từ CSS Elementor (căn lề, chữ màu thương hiệu, độ rộng ảnh theo tỉ lệ 0–1). */
export type WpWidgetStyle = {
  align?: WpAlign;
  tone?: "brand" | "purple" | "green";
  width?: number;
  surface?: WpTone;
  outline?: WpTone;
  elevated?: boolean;
  narrow?: boolean;
};

export type WpWidget = (
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string; href?: string; hidden?: boolean; size?: "display" | "small" }
  | { type: "richText"; blocks: RichBlock[]; lead?: boolean }
  | { type: "image"; image: WpImage; href?: string }
  | { type: "button"; link: LinkItem }
  | { type: "card"; card: WpCardFace }
  | { type: "flipCard"; front: WpCardFace; back: WpCardFace }
  | { type: "iconList"; items: { text: string; href?: string }[]; marker: "check" | "dot" }
  | { type: "divider" }
  | { type: "faq"; items: WpPanel[] }
  | { type: "tabs"; items: WpPanel[] }
  | { type: "slides"; items: WpSlide[] }
  | { type: "gallery"; images: (WpImage & { caption?: string })[] }
  | { type: "testimonials"; items: WpTestimonial[] }
  | { type: "video"; src: string; title: string }
  | { type: "hubspotForm"; portalId: string; formId: string; region: string }
  | { type: "posts"; items: WpPostCard[] }
  | { type: "columns"; columns: WpColumn[] }
) &
  WpWidgetStyle;

export type WpSection = {
  id: string;
  widgets: WpWidget[];
  background?: WpImage;
  tone?: WpTone;
  outline?: WpTone;
  tall?: boolean;
  spacing?: "tight" | "default" | "loose";
  backgroundPosition?: "left" | "center" | "right" | "top" | "bottom";
  backgroundFit?: "cover" | "contain";
};

export type WpSectionLabels = RichTextLabels & {
  formLoading: string;
  formError: string;
  flipHint: string;
};
