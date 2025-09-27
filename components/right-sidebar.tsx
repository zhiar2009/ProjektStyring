"use client"

import { cn } from "@/lib/utils"

import * as React from "react"
import { Calendar, Clock, Users, FileText, Bell } from "lucide-react"
import { format, isToday, isTomorrow, isThisWeek } from "date-fns"
import { da } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

interface Task {
  id: string
  title: string
  dueDate?: Date | string
  status: "mangler" | "i-gang" | "færdig"
  project: string
}

interface RightSidebarProps {
  tasks?: Task[]
  selectedDate?: Date
  onDateSelect?: (date: Date | undefined) => void
  onNewContact?: () => void
  onNewProject?: () => void
  onNewTask?: () => void
}

export function RightSidebar({
  tasks = [],
  selectedDate,
  onDateSelect,
  onNewContact,
  onNewProject,
  onNewTask,
}: RightSidebarProps) {
  const [date, setDate] = React.useState<Date | undefined>(selectedDate)

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    onDateSelect?.(newDate)
  }

  const getTasksForDate = (targetDate: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = typeof task.dueDate === "string" ? new Date(task.dueDate) : task.dueDate
      return format(taskDate, "yyyy-MM-dd") === format(targetDate, "yyyy-MM-dd")
    })
  }

  const upcomingTasks = tasks
    .filter((task) => task.dueDate && task.status !== "færdig")
    .sort((a, b) => {
      const dateA = typeof a.dueDate === "string" ? new Date(a.dueDate) : a.dueDate
      const dateB = typeof b.dueDate === "string" ? new Date(b.dueDate) : b.dueDate
      return (dateA?.getTime() || 0) - (dateB?.getTime() || 0)
    })
    .slice(0, 5)

  const getDateLabel = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isToday(dateObj)) return "I dag"
    if (isTomorrow(dateObj)) return "I morgen"
    if (isThisWeek(dateObj)) return format(dateObj, "EEEE", { locale: da })
    return format(dateObj, "d. MMM", { locale: da })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mangler":
        return "bg-red-100 text-red-800"
      case "i-gang":
        return "bg-yellow-100 text-yellow-800"
      case "færdig":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Sidebar side="right" className="w-80 border-l" collapsible="none">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Oversigt</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Kalender
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Card>
              <CardContent className="p-3">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border-0"
                />
              </CardContent>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Kommende Opgaver
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-64">
              <div className="space-y-2 p-2">
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Ingen kommende opgaver</p>
                ) : (
                  upcomingTasks.map((task) => (
                    <Card key={task.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
                          <Badge variant="secondary" className={cn("text-xs", getStatusColor(task.status))}>
                            {task.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{task.project}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span>{getDateLabel(task.dueDate)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        {date && (
          <>
            <Separator className="mx-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {format(date, "d. MMMM yyyy", { locale: da })}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 p-2">
                  {getTasksForDate(date).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Ingen opgaver denne dag</p>
                  ) : (
                    getTasksForDate(date).map((task) => (
                      <Card key={task.id} className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium">{task.title}</h4>
                            <Badge variant="secondary" className={cn("text-xs", getStatusColor(task.status))}>
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{task.project}</p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <Separator className="mx-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Hurtige Handlinger
          </SidebarGroupLabel>
          <SidebarGroupContent className="p-2">
            <div className="space-y-2">
              <button
                onClick={onNewContact}
                className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium cursor-pointer rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Ny Kontakt</span>
              </button>
              <button
                onClick={onNewProject}
                className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium cursor-pointer rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Nyt Projekt</span>
              </button>
              <button
                onClick={onNewTask}
                className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium cursor-pointer rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Clock className="mr-2 h-4 w-4" />
                <span>Ny Opgave</span>
              </button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
