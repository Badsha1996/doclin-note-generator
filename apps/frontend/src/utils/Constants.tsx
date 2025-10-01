import type { NavbarMenuData } from "@/types/constants";

export const NAVBAR_MENU: NavbarMenuData[] = [
  { title: "Home", href: "/" },
  {
    title: "Product",
    href: "/product",
    children: [
      {
        title: "Generate Question Papers",
        href: "/config",
      },
    ],
  },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];
