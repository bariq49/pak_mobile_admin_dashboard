
import {
  DashBoard,
  Graph,
  Cart,
  ClipBoard,
  Flag,
} from "@/components/svg";


export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu? : MenuItemProps[]
  nested?: MenuItemProps[]
  onClick: () => void;

  
}

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: DashBoard,
      child: [
        {
          title: "Analytics",
          href: "/dashboard",
          icon: Graph,
        },
      ],
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: DashBoard,
        child: [
          {
            title: "Analytics",
            href: "/dashboard",
            icon: Graph,
          },
        ],
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "GENERAL",
      },
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: DashBoard,
      },
      {
        title: "Categories",
        icon: ClipBoard,
        child: [
          {
            title: "List",
            href: "/categories",
          },
          {
            title: "Tree",
            href: "/categories/tree",
          },
          {
            title: "Create",
            href: "/categories/create",
          }
        ]
      },
      {
        title: "Products",
        icon: Cart,
        child: [
          {
            title: "List",
            href: "/products",
          },
          {
            title: "Edit",
            href: "/products/edit",
          },
          {
            title: "Create",
            href: "/products/create",
          }
        ]
      },
      {
        title: "Deals",
        icon: Flag,
        child: [
          {
            title: "List",
            href: "/deals",
          },
          {
            title: "Edit",
            href: "/deals/edit",
          },
          {
            title: "Create",
            href: "/deals/create",
          }
        ]
      },
    ],
  },
};


export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]
