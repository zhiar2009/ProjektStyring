"use client"

import type { LucideIcon } from "lucide-react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function NavMain({
  items,
  onOversigtClick,
  onKontaktBibliotekClick,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
  onOversigtClick?: () => void
  onKontaktBibliotekClick?: () => void
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            {item.title === "Oversigt" ? (
              <button onClick={onOversigtClick}>
                <item.icon />
                <span>{item.title}</span>
              </button>
            ) : item.title === "Kontakt Bibliotek" ? (
              <button onClick={onKontaktBibliotekClick}>
                <item.icon />
                <span>{item.title}</span>
              </button>
            ) : (
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
