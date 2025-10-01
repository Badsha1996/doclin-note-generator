export interface NavbarMenuData {
  title: string;
  href: string;
  desc?: string;
  enabled?: boolean;
  children?: {
    title: string;
    href: string;
    desc?: string;
  }[];
}
