"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { GanttChart } from "@/components/gantt-chart"
import { Timeline, createTimelineEvents } from "@/components/timeline"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { CSVImport } from "@/components/csv-import"

const Icons = {
  Calendar: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Plus: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Filter: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  ),
  Download: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Upload: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  MoreHorizontal: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
  Edit: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash2: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 0 2-2h4a2 2 0 0 0 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y1="17" />
    </svg>
  ),
  Users: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Clock: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
  BarChart3: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  ),
  FileText: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),
  Note: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),
  Link: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
}

const MynaIcons = {
  Chart: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  CheckSquare: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,11 12,14 22,4" />
      <path d="m21,3-1.5,1.5L7.5,16.5 3,12l1.5-1.5L7.5,13.5 19.5,1.5Z" />
    </svg>
  ),
  Folder: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2V20Z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Users: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
}

export default function Page() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [activeView, setActiveView] = useState("oversigt")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [newTaskDialog, setNewTaskDialog] = useState(false)
  const [newProjectDialog, setNewProjectDialog] = useState(false)
  const [newContactDialog, setNewContactDialog] = useState(false)
  const [editContactDialog, setEditContactDialog] = useState(false)
  const [taskNoteDialog, setTaskNoteDialog] = useState(false)
  const [contactLibraryDialog, setContactLibraryDialog] = useState(false)
  const [selectContactDialog, setSelectContactDialog] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [csvImportDialog, setCsvImportDialog] = useState(false) // Added csvImportDialog state
  const [csvOpen, setCsvOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { toast } = useToast()
  const [deleteProjectDialog, setDeleteProjectDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  const [batchMode, setBatchMode] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [batchDeleteDialog, setBatchDeleteDialog] = useState(false)

  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    position: "",
    email: "",
    phone: "",
    company: "",
  })

  const [projectForm, setProjectForm] = useState({
    name: "",
    type: "station",
    description: "",
    projectNumber: "", // Added projectNumber field
  })

  const [taskForm, setTaskForm] = useState({
    title: "",
    group: "",
    dueDate: "",
    priority: "medium",
  })

  const [noteForm, setNoteForm] = useState({
    text: "",
    linkedContactId: "",
  })

  const stationTasks = [
    { group: "Ny Station", task: "Kontakter" },
    { group: "Ny Station", task: "Tilmelding" },
    { group: "Ny Station", task: "Aftal placering af station" },
    { group: "Projektering", task: "Opret projekt i Dynamics" },
    { group: "Projektering", task: "Lav slutdato" },
    { group: "Projektering", task: "Lav timebudget" },
    { group: "Projektering", task: "Lav udgiftsbudget" },
    { group: "Projektering", task: "Tegninger til TD (station/trace/KSK)" },
    { group: "Projektering", task: "Arbejdsmappe (diagrammer/PSI/arbejdsbeskrivelse)" },
    { group: "Bestilling", task: "Bestilling af materialer (KSK excel/varebehov)" },
    { group: "Bestilling", task: "Entrepriseportal – udbud + godkendelse" },
    { group: "Bestilling", task: "Indkøb af station (trafo, koblingsanlæg, stationhus)" },
    { group: "On site", task: "Afsætning af plads/areal" },
    { group: "On site", task: "Opstartsmøde med entreprenør" },
    { group: "On site", task: "Kortskitse + fundament til chauffør" },
    { group: "On site", task: "Booking montører/generator/afhentning" },
    { group: "Afslutning", task: "Tinglysning (rids/deklaration)" },
    { group: "Afslutning", task: "Overførsel til doconote" },
    { group: "Afslutning", task: "Oprydning/idrift (retur, målinger, dokumentation)" },
    { group: "Afslutning", task: "Fakturering + luk projekt" },
  ]

  const cableTasks = [
    { group: "Kabel – Plan", task: "Kontakter & interessenter" },
    { group: "Kabel – Plan", task: "Planlægning & Projektering (trace, KSK, tilladelser)" },
    { group: "Kabel – Indkøb", task: "Bestilling af materialer (kabler, muffe, rør)" },
    { group: "Kabel – Udførsel", task: "Gravearbejde & rørlægning" },
    { group: "Kabel – Udførsel", task: "Kabeltræk & terminering" },
    { group: "Kabel – Test", task: "Måling & test (Max/min/PD)" },
    { group: "Kabel – Dokumentation", task: "As-built, fotos, Doconote" },
    { group: "Kabel – Afslutning", task: "Oprydning & økonomi (fakturering)" },
  ]

  const [projectContacts, setProjectContacts] = useState<{ [projectId: string]: string[] }>({
    "1": ["1", "3"], // Hovedstation has Lars and Peter
    "2": ["2"], // Fiber Kabel has Maria
  })

  // FIXED: Persist projects to localStorage
  const [projects, setProjects] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("projects")
        if (saved) return JSON.JSON.parse(saved)
      } catch (e) {}
    }
    return [
      ]
  })

  
// Supabase helpers
useEffect(() => {
  let mounted = true
  ;(async () => {
    const { data } = await supabase.auth.getUser()
    if (mounted) {
      setUser(data.user)
      setAuthLoading(false)
      if (data.user) {
        await loadProjectsFromDb()
      }
    }
  })()
  const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
    setUser(session?.user ?? null)
    if (session?.user) {
      await loadProjectsFromDb()
    } else {
      setProjects([])
    }
  })
  return () => { mounted = false; sub.subscription.unsubscribe() }
}, [])

const loadProjectsFromDb = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Load projects error', error)
    return
  }
  // Map DB rows to app projects
  const mapped = (data || []).map((row: any) => {
    const d = row.data || {}
    return {
      id: row.id,
      name: row.name ?? d.name ?? 'Uden navn',
      type: row.type ?? d.type ?? 'cable',
      status: row.status ?? d.status ?? 'active',
      progress: row.progress ?? d.progress ?? 0,
      projectNumber: row.project_number ?? d.projectNumber,
      tasks: d.tasks ?? [],
    }
  })
  setProjects(mapped)
}

const upsertProjectsToDb = async (payload: { create: any[]; update: any[] }) => {
  if (!user) return { error: 'not-authenticated' }
  const rows = [...payload.create, ...payload.update].map((p) => ({
    user_id: user.id,
    project_number: p.projectNumber,
    name: p.name || p.projectNumber || 'Uden navn',
    type: p.type || 'cable',
    status: 'active',
    progress: 0,
    data: p, // keep the full record for app
  }))
  if (rows.length === 0) return { data: [], error: null }
  const { data, error } = await supabase.from('projects').upsert(rows).select('*')
  if (error) {
    console.error('Upsert error', error)
    return { data: null, error }
  }
  await loadProjectsFromDb()
  return { data, error: null }
}

const signInWithEmail = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } })
  return { error }
}
const signOut = async () => {
  await supabase.auth.signOut()
}

  const [contacts, setContacts] = useState([
    {
      id: "1",
      name: "Lars Nielsen",
      role: "Projektleder",
      position: "Team Lead",
      email: "lars@company.dk",
      phone: "+45 12 34 56 78",
      company: "PLCH NET",
    },
    {
      id: "2",
      name: "Maria Hansen",
      role: "Tekniker",
      position: "Engineer",
      email: "maria@company.dk",
      phone: "+45 23 45 67 89",
      company: "PLCH NET",
    },
    {
      id: "3",
      name: "Peter Andersen",
      role: "Elektriker",
      position: "Electrician",
      email: "peter@company.dk",
      phone: "+45 34 56 78 90",
      company: "Contractor A/S",
    },
  ])

  const changeTaskStatus = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map((task) => {
            if (task.id === taskId) {
              const statuses = ["pending", "in-progress", "completed"]
              const currentIndex = statuses.indexOf(task.status)
              const nextStatus = statuses[(currentIndex + 1) % statuses.length]
              return { ...task, status: nextStatus }
            }
            return task
          })
          return { ...project, tasks: updatedTasks }
        }
        return project
      }),
    )
  }

  const updateTaskDate = (taskId: string, date: Date | undefined) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => ({
        ...project,
        tasks: project.tasks.map((task) => (task.id === taskId ? { ...task, dueDate: date } : task)),
      })),
    )
  }

  const getStatusBadge = (status: string, projectId?: string, taskId?: string) => {
    const handleClick = () => {
      if (projectId && taskId) {
        changeTaskStatus(projectId, taskId)
      }
    }

    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer" onClick={handleClick}>
            ✅ Færdig
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer" onClick={handleClick}>
            ⏳ I gang
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer" onClick={handleClick}>
            🔜 Mangler
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return ""
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "✅ Færdig"
      case "in-progress":
        return "⏳ I gang"
      case "pending":
        return "🔜 Mangler"
      default:
        return status
    }
  }

  const addContact = (contactData: any) => {
    const newContact = {
      id: Date.now().toString(),
      ...contactData,
    }
    setContacts((prev) => [...prev, newContact])

    if (selectedProject) {
      setProjectContacts((prev) => ({
        ...prev,
        [selectedProject]: [...(prev[selectedProject] || []), newContact.id],
      }))
    }
  }

  const linkContactToProject = (contactId: string, projectId: string) => {
    setProjectContacts((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), contactId],
    }))
  }

  const unlinkContactFromProject = (contactId: string, projectId: string) => {
    setProjectContacts((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter((id) => id !== contactId),
    }))
  }

  const addTaskNote = (projectId: string, taskId: string, text: string, linkedContactId?: string) => {
    const now = new Date()
    const newNote = {
      text,
      date: now.toLocaleDateString("da-DK"), // bagud-kompat
      timestamp: now.toISOString(), // dato + tid
      linkedContactId: linkedContactId || null,
    }

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                notes: [...task.notes, newNote],
                linkedContacts:
                  linkedContactId && !task.linkedContacts.includes(linkedContactId)
                    ? [...task.linkedContacts, linkedContactId]
                    : task.linkedContacts,
              }
            }
            return task
          })
          return { ...project, tasks: updatedTasks }
        }
        return project
      }),
    )
  }

  const handleTaskReorder = (result: any) => {
    if (!result.destination || !selectedProject) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProject) {
          const newTasks = Array.from(project.tasks)
          const [reorderedTask] = newTasks.splice(sourceIndex, 1)
          newTasks.splice(destinationIndex, 0, reorderedTask)
          return { ...project, tasks: newTasks }
        }
        return project
      }),
    )
  }

  const updateTaskPriority = (taskId: string, newPriority: string) => {
    if (!selectedProject) return

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === selectedProject) {
          const updatedTasks = project.tasks.map((task) =>
            task.id === taskId ? { ...task, priority: newPriority } : task,
          )
          return { ...project, tasks: updatedTasks }
        }
        return project
      }),
    )
  }

  const filteredTasks = selectedProject
    ? projects.find((p) => p.id === selectedProject)?.tasks || []
    : projects.flatMap((p) => p.tasks)

  const filteredContacts = selectedProject
    ? contacts.filter((c) => {
        const linkedContactIds = projectContacts[selectedProject] || []
        return linkedContactIds.includes(c.id)
      })
    : contacts

  const availableContacts = selectedProject
    ? contacts.filter((c) => {
        const linkedContactIds = projectContacts[selectedProject] || []
        return !linkedContactIds.includes(c.id)
      })
    : []

  const handleProjectSubmit = (e: any) => {
    e.preventDefault()
    if (projectForm.name && projectForm.type) {
      addProject(projectForm)
      setProjectForm({
        name: "",
        type: "station",
        description: "",
        projectNumber: "", // Reset projectNumber
      })
      setNewProjectDialog(false)
    }
  }

  const handleContactSubmit = (e: any) => {
    e.preventDefault()
    if (contactForm.name && contactForm.email) {
      addContact(contactForm)
      setContactForm({
        name: "",
        role: "",
        position: "",
        email: "",
        phone: "",
        company: "",
      })
      setNewContactDialog(false)
    }
  }

  const handleSelectContact = (contactId: string) => {
    if (selectedProject) {
      linkContactToProject(contactId, selectedProject)
    }
    setSelectContactDialog(false)
  }

  const handleOversigtClick = () => {
    setSelectedProject(null)
    setActiveView("oversigt")
  }

  const handleKontaktBibliotekClick = () => {
    setSelectedProject(null)
    setActiveView("kontakter")
  }

  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen)
  }

  const [currentView, setCurrentView] = useState("oversigt")
  // FIXED: toast for user feedback
  React.useEffect(() => {
    try {
      localStorage.setItem("projects", JSON.stringify(projects))
    } catch (e) {}
  }, [projects])

  const addProject = (projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      status: "active",
      progress: 0,
      tasks:
        projectData.type === "station"
          ? stationTasks.map((t, i) => ({
              id: `${projectData.type}-${Date.now()}-${i}`,
              title: t.task,
              group: t.group,
              status: "pending",
              dueDate: new Date(Date.now() + i * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              notes: [],
              linkedContacts: [],
              subtasks: [],
              priority: "medium",
            }))
          : cableTasks.map((t, i) => ({
              id: `${projectData.type}-${Date.now()}-${i}`,
              title: t.task,
              group: t.group,
              status: "pending",
              dueDate: new Date(Date.now() + i * 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              notes: [],
              linkedContacts: [],
              subtasks: [],
              priority: "medium",
            })),
      ...projectData,
    }
    setProjects((prev) => [...prev, newProject])
  }

  const addProjects = (projectsData: any[]) => {
    setProjects((prev) => [...prev, ...projectsData])
  }

  const [subtaskForm, setSubtaskForm] = useState({
    title: "",
    dueDate: "",
  })
  const [subtaskDialog, setSubtaskDialog] = useState(false)
  const [expandedSubtasks, setExpandedSubtasks] = useState<{ [taskId: string]: boolean }>({})

  const addSubtask = (projectId: string, taskId: string, subtaskData: any) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map((task) => {
            if (task.id === taskId) {
              const newSubtask = {
                id: `subtask-${Date.now()}`,
                title: subtaskData.title,
                status: "pending",
                dueDate: subtaskData.dueDate,
                createdAt: new Date().toISOString(),
              }
              return {
                ...task,
                subtasks: [...(task.subtasks || []), newSubtask],
              }
            }
            return task
          })
          return { ...project, tasks: updatedTasks }
        }
        return project
      }),
    )
  }

  const toggleSubtaskStatus = (projectId: string, taskId: string, subtaskId: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map((task) => {
            if (task.id === taskId) {
              const updatedSubtasks = task.subtasks?.map((subtask) => {
                if (subtask.id === subtaskId) {
                  return {
                    ...subtask,
                    status: subtask.status === "completed" ? "pending" : "completed",
                  }
                }
                return subtask
              })
              return { ...task, subtasks: updatedSubtasks }
            }
            return task
          })
          return { ...project, tasks: updatedTasks }
        }
        return project
      }),
    )
  }

  const updateProjectStatus = (projectId: string, newStatus: string) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? { ...project, status: newStatus } : project)),
    )
  }

  const getProjectStatusBadge = (status: string, projectId: string) => {
    const statusConfig = {
      active: { label: "Aktiv", color: "bg-blue-100 text-blue-800" },
      completed: { label: "Afsluttet", color: "bg-green-100 text-green-800" },
      "on-hold": { label: "På hold", color: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "Annulleret", color: "bg-red-100 text-red-800" },
      planning: { label: "Planlægning", color: "bg-purple-100 text-purple-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    }

    return <Badge className={`${config.color} cursor-pointer hover:opacity-80`}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "Lav", color: "bg-gray-100 text-gray-800" },
      medium: { label: "Medium", color: "bg-blue-100 text-blue-800" },
      high: { label: "Høj", color: "bg-orange-100 text-orange-800" },
      urgent: { label: "Akut", color: "bg-red-100 text-red-800" },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || {
      label: priority,
      color: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const addTask = (taskData: any) => {
    if (!selectedProject) return

    const newTask = {
      id: `task-${Date.now()}`,
      status: "pending",
      notes: [],
      linkedContacts: [],
      subtasks: [],
      priority: taskData.priority || "medium",
      ...taskData,
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProject ? { ...project, tasks: [...project.tasks, newTask] } : project,
      ),
    )
  }

  const handleTaskSubmit = (e: any) => {
    e.preventDefault()
    if (taskForm.title && taskForm.group) {
      addTask(taskForm)
      setTaskForm({
        title: "",
        group: "",
        dueDate: "",
        priority: "medium",
      })
      setNewTaskDialog(false)
    }
  }

  const handleSubtaskSubmit = (e: any) => {
    e.preventDefault()
    if (subtaskForm.title && selectedTask) {
      addSubtask(selectedTask.projectId, selectedTask.id, subtaskForm)
      setSubtaskForm({
        title: "",
        dueDate: "",
      })
      setSubtaskDialog(false)
    }
  }

  const [expandedNotes, setExpandedNotes] = useState<{ [taskId: string]: boolean }>({})

  const handleNoteSubmit = (e: any) => {
    e.preventDefault()
    if (noteForm.text && selectedTask) {
      addTaskNote(selectedTask.projectId, selectedTask.id, noteForm.text, noteForm.linkedContactId || undefined)

      setNoteForm({ text: "", linkedContactId: "" })
      setTaskNoteDialog(false)
    }
  }

  const calculateProjectProgress = (project: any) => {
    const completedTasks = project.tasks.filter((task: any) => task.status === "completed").length
    const totalTasks = project.tasks.length
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  const getTasksProgress = (project: any) => {
    const completedTasks = project.tasks.filter((task: any) => task.status === "completed").length
    const totalTasks = project.tasks.length
    return `${completedTasks}/${totalTasks}`
  }

  const openNewContactDialog = () => {
    setContactForm({
      name: "",
      role: "",
      position: "",
      email: "",
      phone: "",
      company: "",
    })
    setNewContactDialog(true)
  }

  const openEditContactDialog = (contact: any) => {
    setSelectedContact(contact)
    setContactForm({
      name: contact.name || "",
      role: contact.role || "",
      position: contact.position || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
    })
    setEditContactDialog(true)
  }

  const ganttTasks = selectedProject
    ? projects
        .find((p) => p.id === selectedProject)
        ?.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          startDate: task.dueDate, // Assuming dueDate can be used as startDate for now
          endDate: task.dueDate, // Using same date for start/end for now
          status: task.status,
          statusText: task.status === "completed" ? "udført" : "mangler",
          group: task.group,
          progress: task.status === "completed" ? 100 : task.status === "in-progress" ? 50 : 0,
          subtasks: task.subtasks, // Pass subtasks data
          priority: task.priority, // Pass priority data
        }))
    : []

  const handleProjectDelete = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setProjectToDelete(projectId)
      setDeleteProjectDialog(true)
    }
  }

  const handleBatchDelete = () => {
    if (selectedProjects.length > 0) {
      setBatchDeleteDialog(true)
    }
  }

  const confirmProjectDelete = () => {
    if (projectToDelete) {
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete))

      // If the deleted project was selected, clear selection
      if (selectedProject === projectToDelete) {
        setSelectedProject(null)
        setActiveView("oversigt")
      }

      // Clear project contacts for deleted project
      setProjectContacts((prev) => {
        const updated = { ...prev }
        delete updated[projectToDelete]
        return updated
      })

      toast({
        title: "Projekt slettet",
        description: "Projektet er blevet slettet permanent.",
      })
    }

    setDeleteProjectDialog(false)
    setProjectToDelete(null)
  }

  const confirmBatchDelete = () => {
    if (selectedProjects.length > 0) {
      setProjects((prev) => prev.filter((p) => !selectedProjects.includes(p.id)))

      // If any deleted project was selected, clear selection
      if (selectedProject && selectedProjects.includes(selectedProject)) {
        setSelectedProject(null)
        setActiveView("oversigt")
      }

      // Clear project contacts for deleted projects
      setProjectContacts((prev) => {
        const updated = { ...prev }
        selectedProjects.forEach((projectId) => {
          delete updated[projectId]
        })
        return updated
      })

      toast({
        title: "Projekter slettet",
        description: `${selectedProjects.length} projekter er blevet slettet permanent.`,
      })

      // Reset batch mode
      setSelectedProjects([])
      setBatchMode(false)
    }

    setBatchDeleteDialog(false)
  }

  const toggleBatchMode = () => {
    setBatchMode(!batchMode)
    setSelectedProjects([])
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={(projectId) => {
            setSelectedProject(projectId)
            setActiveView("projekter")
          }}
          onProjectDelete={handleProjectDelete} // Added delete callback
          selectedProjects={selectedProjects}
          onProjectSelectionChange={setSelectedProjects}
          batchMode={batchMode}
          onToggleBatchMode={toggleBatchMode}
          onBatchDelete={handleBatchDelete}
          onOversigtClick={handleOversigtClick}
          onKontaktBibliotekClick={handleKontaktBibliotekClick}
          contacts={contacts} // Added contacts prop for search functionality
        />
        <div className="flex flex-1">
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Projekt Management</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {selectedProject
                          ? projects.find((p) => p.id === selectedProject)?.name
                          : activeView === "oversigt"
                            ? "Oversigt"
                            : "Kontakt Bibliotek"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="ml-auto px-4">
                <button
                  onClick={toggleRightSidebar}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={rightSidebarOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
                  </svg>
                  <span className="sr-only">Toggle Right Sidebar</span>
                </button>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <div className="p-6">
                  {selectedProject && (
                    <div className="mb-6 flex space-x-1 rounded-lg bg-muted p-1">
                      <button
                        onClick={() => setActiveView("projekter")}
                        className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          activeView === "projekter"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MynaIcons.Folder />
                        <span>Projekter</span>
                      </button>
                      <button
                        onClick={() => setActiveView("opgaver")}
                        className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          activeView === "opgaver"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MynaIcons.CheckSquare />
                        <span>Opgaver</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveView("tidsplan")
                          setRightSidebarOpen(false)
                        }}
                        className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          activeView === "tidsplan"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MynaIcons.Calendar />
                        <span>Tidsplan</span>
                      </button>
                      <button
                        onClick={() => setActiveView("kontakter")}
                        className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          activeView === "kontakter"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MynaIcons.Users />
                        <span>Kontakter</span>
                      </button>
                    </div>
                  )}

                  {!selectedProject && activeView === "oversigt" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Oversigt</h1>
                        <div className="flex gap-2 items-center">
                          <Button type="button" variant="secondary" onClick={() => setCsvOpen(true)}>
                            Importer CSV
                          </Button>
                          {!user ? (
                            <Button type="button" variant="outline" onClick={() => setAuthDialogOpen(true)}>Log ind</Button>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>{user.email}</span><Button type="button" variant="outline" onClick={signOut}>Log ud</Button></div>
                          )}
                          <Button onClick={() => setNewProjectDialog(true)}>
                            <Icons.Plus />
                            Nyt Projekt
                          </Button>
                        </div>
                      </div>

                      <Dialog open={newProjectDialog} onOpenChange={setNewProjectDialog}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Opret projekt</DialogTitle>
                          </DialogHeader>
                          <form
                            id="new-project-form"
                            onSubmit={(e) => {
                              e.preventDefault()
                              addProject(projectForm)
                              setProjectForm({ name: "", type: "station", description: "", projectNumber: "" }) // Reset projectNumber
                              setNewProjectDialog(false)
                              toast({ title: "Projekt oprettet", description: "Dit projekt er oprettet." })
                            }}
                          >
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="pname">Projektnavn</Label>
                                <Input
                                  id="pname"
                                  value={projectForm.name}
                                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="pnumber">Projektnummer (valgfrit)</Label>
                                <Input
                                  id="pnumber"
                                  placeholder="f.eks. S010, N010, N004"
                                  value={projectForm.projectNumber || ""}
                                  onChange={(e) => setProjectForm({ ...projectForm, projectNumber: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="ptype">Type</Label>
                                <select
                                  id="ptype"
                                  className="w-full border rounded-md h-9 px-3"
                                  value={projectForm.type}
                                  onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value })}
                                >
                                  <option value="station">Station</option>
                                  <option value="kabel">Kabel</option>
                                </select>
                              </div>
                              <div>
                                <Label htmlFor="pdesc">Beskrivelse</Label>
                                <Input
                                  id="pdesc"
                                  value={projectForm.description}
                                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                                />
                              </div>
                            </div>
                          </form>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setNewProjectDialog(false)}>
                              Annuller
                            </Button>
                            <Button type="submit" form="new-project-form">
                              Gem
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Aktive Projekter</h3>
                        <MynaIcons.Folder />
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">{projects.filter((p) => p.status === "active").length}</div>
                        <p className="text-xs text-muted-foreground">+1 fra sidste måned</p>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Afsluttede Opgaver</h3>
                        <MynaIcons.CheckSquare />
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">
                          {projects.flatMap((p) => p.tasks).filter((t) => t.status === "completed").length}
                        </div>
                        <p className="text-xs text-muted-foreground">+4 denne uge</p>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Igangværende</h3>
                        <Icons.Clock />
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">
                          {projects.flatMap((p) => p.tasks).filter((t) => t.status === "in-progress").length}
                        </div>
                        <p className="text-xs text-muted-foreground">2 forfaldne i dag</p>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Team Medlemmer</h3>
                        <MynaIcons.Users />
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">{contacts.length}</div>
                        <p className="text-xs text-muted-foreground">3 online nu</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!selectedProject && activeView === "kontakter" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Kontakt Bibliotek</h1>
                    <Button onClick={openNewContactDialog}>
                      <Icons.Plus />
                      Ny Kontakt
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="rounded-lg border bg-card p-6">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {contact.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.role}</p>
                            <p className="text-sm text-muted-foreground">{contact.company}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => openEditContactDialog(contact)}>
                            <Icons.Edit />
                          </Button>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject && activeView === "projekter" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Projekt Detaljer</h2>
                  {(() => {
                    const project = projects.find((p) => p.id === selectedProject)
                    if (!project) return null

                    const dynamicProgress = calculateProjectProgress(project)
                    const tasksProgress = getTasksProgress(project)

                    return (
                      <div className="space-y-6">
                        <div className="rounded-lg border bg-card p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {project.type === "station" ? "🏭 Station Projekt" : "🔌 Kabel Projekt"}
                                </p>
                                {project.projectNumber && (
                                  <p className="text-sm text-muted-foreground">
                                    Projektnummer: {project.projectNumber}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Select
                                  value={project.status}
                                  onValueChange={(value) => updateProjectStatus(project.id, value)}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="planning">🔵 Planlægning</SelectItem>
                                    <SelectItem value="active">🟢 Aktiv</SelectItem>
                                    <SelectItem value="on-hold">🟡 På hold</SelectItem>
                                    <SelectItem value="completed">✅ Afsluttet</SelectItem>
                                    <SelectItem value="cancelled">🔴 Annulleret</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button variant="destructive" size="sm" onClick={() => handleProjectDelete(project.id)}>
                                  <Icons.Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                {getProjectStatusBadge(project.status, project.id)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">Fremgang</p>
                                <p className="text-lg font-semibold">{dynamicProgress}%</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Opgaver</p>
                                <p className="text-lg font-semibold">{tasksProgress}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Timeline
                          events={createTimelineEvents([project], filteredContacts)}
                          title={`${project.name} - Projekt Tidslinje`}
                          showFilters={true}
                        />
                      </div>
                    )
                  })()}
                </div>
              )}

              {selectedProject && activeView === "opgaver" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Opgaver</h2>
                    <Button onClick={() => setNewTaskDialog(true)}>
                      <Icons.Plus />
                      Ny Opgave
                    </Button>
                  </div>

                  <Dialog open={newTaskDialog} onOpenChange={setNewTaskDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Opret opgave</DialogTitle>
                      </DialogHeader>
                      <form
                        id="new-task-form"
                        onSubmit={(e) => {
                          e.preventDefault()
                          addTask(taskForm)
                          setTaskForm({ title: "", group: "", dueDate: "", priority: "medium" })
                          setNewTaskDialog(false)
                          toast({ title: "Opgave oprettet", description: "Din opgave er oprettet." })
                        }}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="ttitle">Titel</Label>
                            <Input
                              id="ttitle"
                              value={taskForm.title}
                              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="tgroup">Gruppe</Label>
                            <Input
                              id="tgroup"
                              value={taskForm.group}
                              onChange={(e) => setTaskForm({ ...taskForm, group: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="tdue">Forfaldsdato</Label>
                            <Input
                              id="tdue"
                              type="date"
                              value={taskForm.dueDate}
                              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="tprio">Prioritet</Label>
                            <select
                              id="tprio"
                              className="w-full border rounded-md h-9 px-3"
                              value={taskForm.priority}
                              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                            >
                              <option value="low">Lav</option>
                              <option value="medium">Medium</option>
                              <option value="high">Høj</option>
                              <option value="urgent">Akut</option>
                            </select>
                          </div>
                        </div>
                      </form>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNewTaskDialog(false)}>
                          Annuller
                        </Button>
                        <Button type="submit" form="new-task-form">
                          Gem
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <DragDropContext onDragEnd={handleTaskReorder}>
                    <div className="space-y-4">
                      {Object.entries(
                        filteredTasks.reduce((groups: any, task: any) => {
                          const group = task.group || "Ingen Gruppe"
                          if (!groups[group]) groups[group] = []
                          groups[group].push(task)
                          return groups
                        }, {}),
                      ).map(([group, tasks]: [string, any]) => (
                        <div key={group} className="space-y-2">
                          <h3 className="text-lg font-semibold">{group}</h3>
                          <Droppable droppableId={group}>
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {(tasks as any[]).map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`rounded-lg border transition-all ${
                                          snapshot.isDragging ? "shadow-lg scale-105" : ""
                                        }`}
                                      >
                                        <div className="flex items-center justify-between p-4">
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <p className="font-medium">{task.title}</p>
                                              <select
                                                value={task.priority || "medium"}
                                                onChange={(e) => updateTaskPriority(task.id, e.target.value)}
                                                className="text-xs border rounded px-2 py-1 bg-white"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <option value="low">Lav</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">Høj</option>
                                                <option value="urgent">Akut</option>
                                              </select>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Forfald: {task.dueDate}</p>
                                            {task.subtasks && task.subtasks.length > 0 && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                Underopgaver:{" "}
                                                {task.subtasks.filter((st: any) => st.status === "completed").length}/
                                                {task.subtasks.length}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {getStatusBadge(task.status, selectedProject, task.id)}
                                            {task.subtasks && task.subtasks.length > 0 && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  setExpandedSubtasks((prev) => ({
                                                    ...prev,
                                                    [task.id]: !prev[task.id],
                                                  }))
                                                }}
                                              >
                                                <Icons.ChevronDown
                                                  className={`h-4 w-4 transition-transform ${expandedSubtasks[task.id] ? "rotate-180" : ""}`}
                                                />
                                                <span className="ml-1 text-xs">({task.subtasks.length})</span>
                                              </Button>
                                            )}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setSelectedTask({ ...task, projectId: selectedProject })
                                                setSubtaskDialog(true)
                                              }}
                                              title="Tilføj underopgave"
                                            >
                                              <Icons.Plus className="h-3 w-3" />
                                            </Button>
                                            {task.notes && task.notes.length > 0 && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  setExpandedNotes((prev) => ({
                                                    ...prev,
                                                    [task.id]: !prev[task.id],
                                                  }))
                                                }}
                                              >
                                                <Icons.ChevronDown
                                                  className={`h-4 w-4 transition-transform ${expandedNotes[task.id] ? "rotate-180" : ""}`}
                                                />
                                                <span className="ml-1 text-xs">({task.notes.length})</span>
                                              </Button>
                                            )}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setSelectedTask({ ...task, projectId: selectedProject })
                                                setTaskNoteDialog(true)
                                              }}
                                            >
                                              <Icons.Note />
                                            </Button>
                                          </div>
                                        </div>

                                        {task.subtasks && task.subtasks.length > 0 && expandedSubtasks[task.id] && (
                                          <div className="border-t bg-muted/20 p-4">
                                            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                              Underopgaver:
                                            </h4>
                                            <div className="space-y-2">
                                              {task.subtasks.map((subtask: any, subtaskIndex: number) => (
                                                <div
                                                  key={subtaskIndex}
                                                  className="flex items-center justify-between rounded-md bg-background p-2 text-sm"
                                                >
                                                  <div className="flex items-center space-x-2">
                                                    <button
                                                      onClick={() =>
                                                        toggleSubtaskStatus(selectedProject!, task.id, subtask.id)
                                                      }
                                                      className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                                                        subtask.status === "completed"
                                                          ? "bg-green-500 border-green-500 text-white"
                                                          : "border-gray-300 hover:border-gray-400"
                                                      }`}
                                                      aria-label={
                                                        subtask.status === "completed"
                                                          ? "Marker som mangler"
                                                          : "Marker som udført"
                                                      }
                                                    >
                                                      {subtask.status === "completed" && "✓"}
                                                    </button>

                                                    <span
                                                      className={
                                                        subtask.status === "completed"
                                                          ? "line-through text-muted-foreground"
                                                          : ""
                                                      }
                                                    >
                                                      {subtask.title}
                                                    </span>

                                                    <span
                                                      className={`ml-3 text-[11px] rounded px-1.5 py-0.5 ${
                                                        subtask.status === "completed"
                                                          ? "bg-green-100 text-green-800"
                                                          : "bg-yellow-100 text-yellow-800"
                                                      }`}
                                                    >
                                                      {subtask.status === "completed" ? "udført" : "mangler"}
                                                    </span>
                                                  </div>

                                                  <div className="text-xs text-muted-foreground">
                                                    {subtask.dueDate && `Forfald: ${subtask.dueDate}`}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {task.notes && task.notes.length > 0 && expandedNotes[task.id] && (
                                          <div className="border-t bg-muted/30 p-4">
                                            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Noter:</h4>
                                            <div className="space-y-2">
                                              {task.notes.map((note: any, noteIndex: number) => (
                                                <div key={noteIndex} className="rounded-md bg-background p-3 text-sm">
                                                  <p className="mb-1">{note.text}</p>
                                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>
                                                      {note.timestamp ? (
                                                        <>
                                                          {new Date(note.timestamp).toLocaleDateString("da-DK")}
                                                          <br />
                                                          <span className="text-xs text-muted-foreground">
                                                            kl.{" "}
                                                            {new Date(note.timestamp).toLocaleTimeString("da-DK", {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                            })}
                                                          </span>
                                                        </>
                                                      ) : (
                                                        note.date
                                                      )}
                                                    </span>

                                                    {note.linkedContactId &&
                                                      (() => {
                                                        const c = contacts.find((c) => c.id === note.linkedContactId)
                                                        return (
                                                          <span className="leading-tight">
                                                            Kontakt: {c?.name || "Ukendt"}
                                                            {c?.company && (
                                                              <span className="block text-[11px] text-muted-foreground/80">
                                                                {c.company}
                                                              </span>
                                                            )}
                                                          </span>
                                                        )
                                                      })()}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      ))}
                    </div>
                  </DragDropContext>
                </div>
              )}

              {selectedProject && activeView === "tidsplan" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Tidsplan</h2>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Icons.Download />
                        Eksporter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Icons.Filter />
                        Filter
                      </Button>
                    </div>
                  </div>

                  <GanttChart
                    tasks={ganttTasks} // Updated to use ganttTasks
                    onTaskClick={(task) => {
                      setSelectedTask({ ...task, projectId: selectedProject })
                      setTaskNoteDialog(true)
                    }}
                    onTaskDrag={(taskId, newStartDate, newEndDate) => {
                      // gem nye datoer ved drag
                      setProjects((prev) =>
                        prev.map((project) => ({
                          ...project,
                          tasks: project.tasks.map((t) =>
                            t.id === taskId
                              ? {
                                  ...t,
                                  startDate: newStartDate,
                                  dueDate: newEndDate ?? t.dueDate,
                                }
                              : t,
                          ),
                        })),
                      )
                    }}
                    onTaskUpdate={(taskId, updates) => {
                      // FIX: brug 'updates' i stedet for ikke-eksisterende 'date'
                      setProjects((prevProjects) =>
                        prevProjects.map((project) => ({
                          ...project,
                          tasks: project.tasks.map((task) =>
                            task.id === taskId
                              ? {
                                  ...task,
                                  ...(updates.startDate ? { startDate: updates.startDate } : {}),
                                  ...(updates.endDate ? { dueDate: updates.endDate } : {}),
                                  ...(updates.dueDate ? { dueDate: updates.dueDate } : {}), // hvis din Gantt kalder den 'dueDate'
                                }
                              : task,
                          ),
                        })),
                      )
                    }}
                  />
                </div>
              )}

              {selectedProject && activeView === "kontakter" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Projekt Kontakter</h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setSelectContactDialog(true)}>
                        <Icons.Users />
                        Vælg fra Bibliotek
                      </Button>
                      <Button onClick={openNewContactDialog}>
                        <Icons.Plus />
                        Ny Kontakt
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} className="rounded-lg border bg-card p-6">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {contact.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.role}</p>
                            <p className="text-sm text-muted-foreground">{contact.company}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (selectedProject) {
                                unlinkContactFromProject(contact.id, selectedProject)
                              }
                            }}
                          >
                            <Icons.Trash2 />
                          </Button>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SidebarInset>
          {rightSidebarOpen && (
            <aside className="w-64 shrink-0 border-l bg-background p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Detaljer</h3>
                <button
                  onClick={toggleRightSidebar}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={rightSidebarOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
                  </svg>
                  <span className="sr-only">Toggle Right Sidebar</span>
                </button>
              </div>
              {/* Sidebar content will go here */}
            </aside>
          )}
        </div>
      </SidebarProvider>

      {/* Dialogs */}
      <Dialog open={newContactDialog} onOpenChange={setNewContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ny Kontakt</DialogTitle>
          </DialogHeader>
          <form id="new-contact-form" onSubmit={handleContactSubmit}>
            <div className="space-y-4">
              <Input
                placeholder="Navn"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
              <Input
                placeholder="Rolle"
                value={contactForm.role}
                onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
              />
              <Input
                placeholder="Stilling"
                value={contactForm.position}
                onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
              />
              <Input
                placeholder="Telefon"
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
              <Input
                placeholder="Firma"
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewContactDialog(false)}>
              Annuller
            </Button>
            <Button type="submit" form="new-contact-form">
              Gem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editContactDialog} onOpenChange={setEditContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger Kontakt</DialogTitle>
          </DialogHeader>
          <form
            id="edit-contact-form"
            onSubmit={(e) => {
              e.preventDefault() /* TODO: Implement edit contact logic */
              setEditContactDialog(false)
            }}
          >
            <div className="space-y-4">
              <Input
                placeholder="Navn"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
              <Input
                placeholder="Rolle"
                value={contactForm.role}
                onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
              />
              <Input
                placeholder="Stilling"
                value={contactForm.position}
                onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
              />
              <Input
                placeholder="Telefon"
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
              <Input
                placeholder="Firma"
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContactDialog(false)}>
              Annuller
            </Button>
            <Button type="submit" form="edit-contact-form">
              Gem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subtaskDialog} onOpenChange={setSubtaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tilføj Underopgave</DialogTitle>
          </DialogHeader>
          <form id="subtask-form" onSubmit={handleSubtaskSubmit}>
            <div className="space-y-4">
              <Input
                placeholder="Underopgave Titel"
                value={subtaskForm.title}
                onChange={(e) => setSubtaskForm({ ...subtaskForm, title: e.target.value })}
                required
              />
              <Input
                placeholder="Forfaldsdato"
                type="date"
                value={subtaskForm.dueDate}
                onChange={(e) => setSubtaskForm({ ...subtaskForm, dueDate: e.target.value })}
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubtaskDialog(false)}>
              Annuller
            </Button>
            <Button type="submit" form="subtask-form">
              Gem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={taskNoteDialog} onOpenChange={setTaskNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tilføj Note til Opgave</DialogTitle>
          </DialogHeader>
          <form id="note-form" onSubmit={handleNoteSubmit}>
            <div className="space-y-4">
              <Label htmlFor="note-text">Note</Label>
              <Textarea
                id="note-text"
                value={noteForm.text}
                onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })}
                required
              />
              <Label htmlFor="linked-contact">Link Kontakt (valgfrit)</Label>
              <Select onValueChange={(value) => setNoteForm({ ...noteForm, linkedContactId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Vælg kontakt" />
                </SelectTrigger>
                <SelectContent>
                  {availableContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskNoteDialog(false)}>
              Annuller
            </Button>
            <Button type="submit" form="note-form">
              Gem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={selectContactDialog} onOpenChange={setSelectContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vælg Kontakt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-accent"
                onClick={() => handleSelectContact(contact.id)}
              >
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.company}</p>
                </div>
                <Icons.ChevronRight />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectContactDialog(false)}>
              Luk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CSVImport
        open={csvOpen}
        onOpenChange={setCsvOpen}
        existingProjects={projects.map((p) => ({ id: p.id, projectNumber: p.projectNumber }))}
        onUpsert={({ create, update }) => upsertProjectsToDb({ create, update })} />

      <Dialog open={deleteProjectDialog} onOpenChange={setDeleteProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slet projekt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Er du sikker på, at du vil slette dette projekt? Denne handling kan ikke fortrydes.
            </p>
            {projectToDelete && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="font-medium">{projects.find((p) => p.id === projectToDelete)?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {projects.find((p) => p.id === projectToDelete)?.tasks.length} opgaver vil også blive slettet
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProjectDialog(false)}>
              Annuller
            </Button>
            <Button variant="destructive" onClick={confirmProjectDelete}>
              Slet projekt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={batchDeleteDialog} onOpenChange={setBatchDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slet flere projekter</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Er du sikker på, at du vil slette {selectedProjects.length} projekter? Denne handling kan ikke fortrydes.
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedProjects.map((projectId) => {
                const project = projects.find((p) => p.id === projectId)
                return project ? (
                  <div key={projectId} className="p-3 bg-muted rounded-md">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.tasks.length} opgaver vil også blive slettet
                    </p>
                  </div>
                ) : null
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteDialog(false)}>
              Annuller
            </Button>
            <Button variant="destructive" onClick={confirmBatchDelete}>
              Slet {selectedProjects.length} projekter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Log ind</DialogTitle>
    </DialogHeader>
    <div className="space-y-3">
      <Label htmlFor="login-email">E-mail</Label>
      <Input id="login-email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="din@email.dk" />
      <p className="text-sm text-muted-foreground">Vi sender et magic link til din e-mail.</p>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setAuthDialogOpen(false)}>Annuller</Button>
      <Button
        onClick={async () => {
          const { error } = await signInWithEmail(loginEmail)
          if (error) {
            toast({ title: "Login fejlede", description: error.message })
          } else {
            toast({ title: "Tjek din e-mail", description: "Vi har sendt et login-link." })
            setAuthDialogOpen(false)
          }
        }}
      >
        Send login-link
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </>
  )
}
