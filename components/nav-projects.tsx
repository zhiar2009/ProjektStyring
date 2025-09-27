"use client"

import { ChevronRight, Folder, MoreHorizontal, Trash2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Project {
  id: string
  name: string
  type: string
  status: string
  progress: number
  projectNumber?: string
}

interface NavProjectsProps {
  projects: Project[]
  selectedProject: string | null
  onProjectSelect: (projectId: string | null) => void
  onProjectDelete?: (projectId: string) => void
  selectedProjects?: string[]
  onProjectSelectionChange?: (projectIds: string[]) => void
  batchMode?: boolean
  onToggleBatchMode?: () => void
  onBatchDelete?: () => void
}

export function NavProjects({
  projects,
  selectedProject,
  onProjectSelect,
  onProjectDelete,
  selectedProjects = [],
  onProjectSelectionChange = () => {},
  batchMode = false,
  onToggleBatchMode = () => {},
  onBatchDelete = () => {},
}: NavProjectsProps) {
  const handleProjectCheck = (projectId: string, checked: boolean) => {
    if (checked) {
      onProjectSelectionChange([...selectedProjects, projectId])
    } else {
      onProjectSelectionChange(selectedProjects.filter((id) => id !== projectId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onProjectSelectionChange(projects.map((p) => p.id))
    } else {
      onProjectSelectionChange([])
    }
  }

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between">
        <SidebarGroupLabel>Projekter</SidebarGroupLabel>
        <div className="flex items-center gap-1">
          {batchMode && selectedProjects.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBatchDelete}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              title={`Slet ${selectedProjects.length} projekter`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleBatchMode}
            className="h-6 w-6 p-0"
            title={batchMode ? "Afslut batch sletning" : "Batch sletning"}
          >
            {batchMode ? "✕" : "☐"}
          </Button>
        </div>
      </div>
      <SidebarMenu>
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <Folder />
              <span>Alle Projekter</span>
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {batchMode && projects.length > 0 && (
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                <Checkbox checked={selectedProjects.length === projects.length} onCheckedChange={handleSelectAll} />
                <span>Vælg alle ({projects.length})</span>
              </div>
            )}
            <SidebarMenuSub>
              {projects.map((project) => (
                <SidebarMenuSubItem key={project.id}>
                  <div className="flex items-center w-full group">
                    {batchMode && (
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={(checked) => handleProjectCheck(project.id, checked as boolean)}
                        className="mr-2"
                      />
                    )}
                    <SidebarMenuSubButton
                      onClick={() => !batchMode && onProjectSelect(project.id)}
                      isActive={selectedProject === project.id && !batchMode}
                      className="flex-1"
                    >
                      <span>
                        {project.type === "station" ? "🏭" : "🔌"} {project.name}
                        {project.projectNumber && (
                          <span className="text-xs text-muted-foreground ml-1">({project.projectNumber})</span>
                        )}
                      </span>
                    </SidebarMenuSubButton>
                    {onProjectDelete && !batchMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onProjectDelete(project.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Slet projekt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
