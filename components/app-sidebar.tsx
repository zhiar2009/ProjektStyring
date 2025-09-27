"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Calendar, Command, MessageCircleQuestion, Search, Settings2, Trash2, Users, X } from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
/* FIXED: Removed NavWorkspaces (Daily Journal etc.) */
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const ChartIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
)

// This is sample data.
const data = {
  teams: [
    {
      name: "PLCH NET",
      logo: Command,
      plan: "Enterprise",
    },
  ],
  navMain: [
    /* FIXED: Removed Search menu item */
    {
      title: "Oversigt",
      url: "#",
      icon: ChartIcon,
    },
    {
      title: "Kontakt Bibliotek",
      url: "#",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  workspaces: [],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  projects: any[]
  selectedProject: string | null
  onProjectSelect: (projectId: string | null) => void
  onProjectDelete?: (projectId: string) => void // Added delete callback prop
  selectedProjects?: string[]
  onProjectSelectionChange?: (projectIds: string[]) => void
  batchMode?: boolean
  onToggleBatchMode?: () => void
  onBatchDelete?: () => void
  onOversigtClick?: () => void
  onKontaktBibliotekClick?: () => void
  contacts?: any[] // Added contacts prop for search
}

export function AppSidebar({
  projects,
  selectedProject,
  onProjectSelect,
  onProjectDelete, // Added delete callback
  selectedProjects = [],
  onProjectSelectionChange = () => {},
  batchMode = false,
  onToggleBatchMode = () => {},
  onBatchDelete = () => {},
  onOversigtClick,
  onKontaktBibliotekClick,
  contacts = [], // Added contacts with default empty array
  ...props
}: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { projects: [], tasks: [], contacts: [] }

    const query = searchQuery.toLowerCase()
    const results = { projects: [], tasks: [], contacts: [] }

    // Search projects
    results.projects = projects.filter(
      (project) => project.name.toLowerCase().includes(query) || project.type.toLowerCase().includes(query),
    )

    // Search tasks within projects
    projects.forEach((project) => {
      const matchingTasks =
        project.tasks?.filter(
          (task) => task.title.toLowerCase().includes(query) || task.group.toLowerCase().includes(query),
        ) || []

      matchingTasks.forEach((task) => {
        results.tasks.push({
          ...task,
          projectName: project.name,
          projectId: project.id,
        })
      })
    })

    // Search contacts
    results.contacts = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.position?.toLowerCase().includes(query),
    )

    return results
  }, [searchQuery, projects, contacts])

  const handleSearchFocus = () => {
    setIsSearchActive(true)
  }

  const handleSearchClear = () => {
    setSearchQuery("")
    setIsSearchActive(false)
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <div className="px-2 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søg i projekter, opgaver, kontakter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              className="pl-8 pr-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchClear}
                className="absolute right-1 top-1 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* FIXED: NavMain always visible during search */}
        <NavMain
          items={data.navMain}
          onOversigtClick={onOversigtClick}
          onKontaktBibliotekClick={onKontaktBibliotekClick}
        />
      </SidebarHeader>
      <SidebarContent>
        {isSearchActive && searchQuery ? (
          <div className="px-2 space-y-4">
            {/* Search Results */}
            {searchResults.projects.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Projekter</h4>
                <div className="space-y-1">
                  {searchResults.projects.map((project) => (
                    <Button
                      key={project.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onProjectSelect(project.id)
                        setIsSearchActive(false)
                        setSearchQuery("")
                      }}
                      className="w-full justify-start text-left h-auto p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{project.type === "station" ? "🏭" : "🔌"}</span>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-muted-foreground">{project.progress}% færdig</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {searchResults.tasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Opgaver</h4>
                <div className="space-y-1">
                  {searchResults.tasks.slice(0, 5).map((task) => (
                    <Button
                      key={`${task.projectId}-${task.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onProjectSelect(task.projectId)
                        setIsSearchActive(false)
                        setSearchQuery("")
                      }}
                      className="w-full justify-start text-left h-auto p-2"
                    >
                      <div>
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.projectName} • {task.group}
                        </div>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "default"
                              : task.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs mt-1"
                        >
                          {task.status === "completed"
                            ? "Færdig"
                            : task.status === "in-progress"
                              ? "I gang"
                              : "Afventer"}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                  {searchResults.tasks.length > 5 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{searchResults.tasks.length - 5} flere opgaver
                    </div>
                  )}
                </div>
              </div>
            )}

            {searchResults.contacts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Kontakter</h4>
                <div className="space-y-1">
                  {searchResults.contacts.slice(0, 3).map((contact) => (
                    <Button
                      key={contact.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onKontaktBibliotekClick?.()
                        setIsSearchActive(false)
                        setSearchQuery("")
                      }}
                      className="w-full justify-start text-left h-auto p-2"
                    >
                      <div>
                        <div className="font-medium text-sm">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {contact.company && `${contact.company} • `}
                          {contact.email}
                        </div>
                      </div>
                    </Button>
                  ))}
                  {searchResults.contacts.length > 3 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{searchResults.contacts.length - 3} flere kontakter
                    </div>
                  )}
                </div>
              </div>
            )}

            {searchResults.projects.length === 0 &&
              searchResults.tasks.length === 0 &&
              searchResults.contacts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Ingen resultater fundet</p>
                  <p className="text-xs">Prøv et andet søgeord</p>
                </div>
              )}
          </div>
        ) : (
          <>
            <NavProjects
              projects={projects}
              selectedProject={selectedProject}
              onProjectSelect={onProjectSelect}
              onProjectDelete={onProjectDelete} // Pass delete callback to NavProjects
              selectedProjects={selectedProjects}
              onProjectSelectionChange={onProjectSelectionChange}
              batchMode={batchMode}
              onToggleBatchMode={onToggleBatchMode}
              onBatchDelete={onBatchDelete}
            />
            {/* FIXED: Removed Workspaces -> Personal Life Management -> Daily Journal & Reflection */}
            <NavSecondary items={data.navSecondary} className="mt-auto" />
          </>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
