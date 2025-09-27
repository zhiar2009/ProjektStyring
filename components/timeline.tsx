"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: "project" | "task" | "contact" | "note" | "milestone"
  status?: "completed" | "in-progress" | "pending"
  icon?: React.ReactNode
  metadata?: {
    projectName?: string
    contactName?: string
    taskGroup?: string
  }
}

interface TimelineProps {
  events: TimelineEvent[]
  title?: string
  showFilters?: boolean
}

const getEventIcon = (type: string, status?: string) => {
  switch (type) {
    case "project":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2V20Z" />
        </svg>
      )
    case "task":
      if (status === "completed") {
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        )
      }
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,11 12,14 22,4" />
          <path d="m21,3-1.5,1.5L7.5,16.5 3,12l1.5-1.5L7.5,13.5 19.5,1.5Z" />
        </svg>
      )
    case "contact":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case "note":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      )
    case "milestone":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 .6 1.4l1.4 1.4a2 2 0 0 0 1.4.6H9a2 2 0 0 0 1.4-.6l1.4-1.4a2 2 0 0 0 .6-1.4V8a2 2 0 0 0-2-2z" />
          <path d="M12 6v6" />
          <path d="M12 18v-2" />
        </svg>
      )
    default:
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      )
  }
}

const getEventColor = (type: string, status?: string) => {
  if (status === "completed") return "text-green-600 bg-green-100 border-green-200"
  if (status === "in-progress") return "text-blue-600 bg-blue-100 border-blue-200"
  if (status === "pending") return "text-yellow-600 bg-yellow-100 border-yellow-200"

  switch (type) {
    case "project":
      return "text-purple-600 bg-purple-100 border-purple-200"
    case "task":
      return "text-blue-600 bg-blue-100 border-blue-200"
    case "contact":
      return "text-indigo-600 bg-indigo-100 border-indigo-200"
    case "note":
      return "text-gray-600 bg-gray-100 border-gray-200"
    case "milestone":
      return "text-orange-600 bg-orange-100 border-orange-200"
    default:
      return "text-gray-600 bg-gray-100 border-gray-200"
  }
}

const getStatusBadge = (status?: string) => {
  if (!status) return null

  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 text-xs">Færdig</Badge>
    case "in-progress":
      return <Badge className="bg-blue-100 text-blue-800 text-xs">I gang</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Afventer</Badge>
    default:
      return null
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "I dag"
  if (diffDays === 1) return "I går"
  if (diffDays < 7) return `${diffDays} dage siden`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} uger siden`

  return date.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export function Timeline({ events, title = "Projekt Tidslinje", showFilters = false }: TimelineProps) {
  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {showFilters && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {events.length} begivenheder
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start space-x-4">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${getEventColor(event.type, event.status)}`}
                >
                  {event.icon || getEventIcon(event.type, event.status)}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground truncate">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{event.description}</p>

                      {/* Metadata */}
                      {event.metadata && (
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {event.metadata.projectName && (
                            <Badge variant="secondary" className="text-xs">
                              📁 {event.metadata.projectName}
                            </Badge>
                          )}
                          {event.metadata.contactName && (
                            <Badge variant="secondary" className="text-xs">
                              👤 {event.metadata.contactName}
                            </Badge>
                          )}
                          {event.metadata.taskGroup && (
                            <Badge variant="secondary" className="text-xs">
                              📋 {event.metadata.taskGroup}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end ml-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(event.date)}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(event.date).toLocaleTimeString("da-DK", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">
                  <svg
                    className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">Ingen begivenheder endnu</h3>
                <p className="text-sm text-muted-foreground">
                  Begivenheder vil blive vist her efterhånden som projektet udvikler sig.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to create timeline events from project data
export function createTimelineEvents(projects: any[], contacts: any[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  projects.forEach((project) => {
    // Add project creation event
    events.push({
      id: `project-${project.id}`,
      title: `Projekt oprettet: ${project.name}`,
      description: `Nyt ${project.type === "station" ? "station" : "kabel"} projekt blev oprettet og er nu aktivt.`,
      date: new Date().toISOString(), // In real app, this would be project.createdAt
      type: "project",
      status: project.status === "active" ? "in-progress" : project.status,
      metadata: {
        projectName: project.name,
      },
    })

    // Add completed tasks as events
    project.tasks?.forEach((task: any) => {
      if (task.status === "completed") {
        events.push({
          id: `task-${task.id}`,
          title: `Opgave afsluttet: ${task.title}`,
          description: `Opgaven "${task.title}" i gruppen "${task.group}" blev markeret som færdig.`,
          date: task.completedAt || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: "task",
          status: "completed",
          metadata: {
            projectName: project.name,
            taskGroup: task.group,
          },
        })
      }
    })

    // Add milestone events for project progress
    const progress = project.tasks
      ? Math.round((project.tasks.filter((t: any) => t.status === "completed").length / project.tasks.length) * 100)
      : 0

    if (progress >= 25 && progress < 50) {
      events.push({
        id: `milestone-25-${project.id}`,
        title: `Milepæl: 25% færdig`,
        description: `Projektet "${project.name}" har nået 25% færdiggørelse.`,
        date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: "milestone",
        metadata: {
          projectName: project.name,
        },
      })
    }

    if (progress >= 50 && progress < 75) {
      events.push({
        id: `milestone-50-${project.id}`,
        title: `Milepæl: 50% færdig`,
        description: `Projektet "${project.name}" er nu halvvejs færdigt!`,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: "milestone",
        metadata: {
          projectName: project.name,
        },
      })
    }

    if (progress >= 75) {
      events.push({
        id: `milestone-75-${project.id}`,
        title: `Milepæl: 75% færdig`,
        description: `Projektet "${project.name}" nærmer sig afslutning med 75% færdiggørelse.`,
        date: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: "milestone",
        metadata: {
          projectName: project.name,
        },
      })
    }
  })

  // Add contact events
  contacts.forEach((contact) => {
    events.push({
      id: `contact-${contact.id}`,
      title: `Kontakt tilføjet: ${contact.name}`,
      description: `${contact.name} (${contact.role}) fra ${contact.company} blev tilføjet til kontaktbiblioteket.`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: "contact",
      metadata: {
        contactName: contact.name,
      },
    })
  })

  return events
}
