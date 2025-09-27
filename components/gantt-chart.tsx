"use client"

import * as React from "react"

type Status = "pending" | "in-progress" | "completed"

export type GanttTask = {
  id: string
  title: string
  startDate: string // ISO yyyy-mm-dd
  endDate: string // ISO yyyy-mm-dd
  status: Status
  statusText?: string // fx "udført" | "mangler"
  group?: string
  parentId?: string
  dependencies?: string[] // Array of task IDs this task depends on
  progress?: number // 0-100 percentage
  subtasks?: Array<{
    id: string
    title: string
    status: Status
    dueDate: string
  }>
  priority?: "low" | "medium" | "high" | "urgent"
}

type Props = {
  tasks: GanttTask[]
  rowHeight?: number
  leftColWidth?: number
  onTaskClick?: (task: GanttTask) => void
  onTaskDrag?: (taskId: string, newStart: string, newEnd: string) => void
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void
}

export default function GanttChart({ tasks, rowHeight = 42, leftColWidth = 360, onTaskClick }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartScrollRef = React.useRef<HTMLDivElement>(null)
  const taskScrollRef = React.useRef<HTMLDivElement>(null)
  const [pxPerDay, setPxPerDay] = React.useState(30)
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null)

  const parse = (d: string) => new Date(d + "T00:00:00")
  const addDays = (d: Date, n: number) => {
    const x = new Date(d)
    x.setDate(x.getDate() + n)
    return x
  }
  const daysBetween = (a: Date, b: Date) => Math.max(1, Math.round((+b - +a) / 86400000))

  const minStart = new Date(Math.min(...tasks.map((t) => +parse(t.startDate))))
  const maxEnd = new Date(Math.max(...tasks.map((t) => +parse(t.endDate))))
  const viewStart = addDays(minStart, -2)
  const viewEnd = addDays(maxEnd, 2)
  const totalDays = daysBetween(viewStart, viewEnd)

  React.useEffect(() => {
    const measure = () => {
      const el = containerRef.current
      if (!el) return
      const width = el.clientWidth - leftColWidth
      setPxPerDay(Math.max(20, Math.min(56, Math.floor(width / totalDays))))
    }
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    measure()
    return () => ro.disconnect()
  }, [leftColWidth, totalDays])

  const groups = new Map<string, GanttTask[]>()
  tasks
    .slice()
    .sort((a, b) => +parse(a.startDate) - +parse(b.startDate) || a.title.localeCompare(b.title))
    .forEach((t) => {
      const g = t.group || "Øvrige"
      if (!groups.has(g)) groups.set(g, [])
      groups.get(g)!.push(t)
    })

  type Row =
    | { kind: "group"; id: string; title: string }
    | { kind: "task"; task: GanttTask; level: number }
    | {
        kind: "subtask"
        subtask: { id: string; title: string; status: Status; dueDate: string }
        parentTask: GanttTask
        level: number
      }

  const rows: Row[] = []
  for (const [g, list] of groups) {
    rows.push({ kind: "group", id: g, title: g })
    const tops = list.filter((t) => !t.parentId)
    const subs = list.filter((t) => t.parentId)

    tops.forEach((t) => {
      rows.push({ kind: "task", task: t, level: 0 })
      if (t.subtasks && t.subtasks.length > 0) {
        t.subtasks.forEach((subtask) => {
          rows.push({ kind: "subtask", subtask, parentTask: t, level: 1 })
        })
      }
    })
    subs.forEach((t) => rows.push({ kind: "task", task: t, level: 1 }))
  }

  const dayToX = (d: Date) => daysBetween(viewStart, d) * pxPerDay
  const rangeToRect = (s: Date, e: Date) => {
    const startDay = daysBetween(viewStart, s)
    const endDay = daysBetween(viewStart, e)
    const x = startDay * pxPerDay
    const w = Math.max((endDay - startDay) * pxPerDay, pxPerDay * 0.8)
    return { x, w }
  }

  const today = new Date()
  const showToday = today >= viewStart && today <= viewEnd
  const todayX = dayToX(today)

  const COLORS = {
    done: "bg-emerald-500 shadow-sm",
    prog: "bg-blue-500 shadow-sm",
    todo: "bg-amber-500 shadow-sm",
    chipDone: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    chipProg: "bg-blue-100 text-blue-800 ring-1 ring-blue-300",
    chipTodo: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
    selected: "ring-2 ring-blue-400",
    priorityLow: "bg-gray-100 text-gray-700",
    priorityMedium: "bg-blue-100 text-blue-700",
    priorityHigh: "bg-orange-100 text-orange-700",
    priorityUrgent: "bg-red-100 text-red-700",
  }

  const syncScroll = (source: "task" | "chart", scrollLeft: number, scrollTop: number) => {
    if (source === "task" && chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = scrollLeft
      chartScrollRef.current.scrollTop = scrollTop
    } else if (source === "chart" && taskScrollRef.current) {
      taskScrollRef.current.scrollLeft = scrollLeft
      taskScrollRef.current.scrollTop = scrollTop
    }
  }

  const statusChip = (status: Status, statusText?: string) => {
    const txt = statusText ?? (status === "completed" ? "udført" : "mangler")
    const cls = status === "completed" ? COLORS.chipDone : status === "in-progress" ? COLORS.chipProg : COLORS.chipTodo
    const icon = status === "completed" ? "✓" : status === "in-progress" ? "⟳" : "○"
    return (
      <span
        className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${cls}`}
      >
        <span aria-hidden className="text-xs">
          {icon}
        </span>
        {txt}
      </span>
    )
  }

  const priorityBadge = (priority?: string) => {
    if (!priority) return null

    const priorityConfig = {
      low: { label: "Lav", color: COLORS.priorityLow },
      medium: { label: "Medium", color: COLORS.priorityMedium },
      high: { label: "Høj", color: COLORS.priorityHigh },
      urgent: { label: "Akut", color: COLORS.priorityUrgent },
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig]
    if (!config) return null

    return (
      <span className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const barColor = (status: Status, isSelected: boolean) => {
    let baseColor = status === "completed" ? COLORS.done : status === "in-progress" ? COLORS.prog : COLORS.todo
    if (isSelected) baseColor += ` ${COLORS.selected}`
    return baseColor
  }

  if (!tasks.length) return <div className="rounded-lg border p-6 text-muted-foreground">Ingen data</div>

  return (
    <div ref={containerRef} className="w-full rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">Tidsplan</h3>
        <div className="flex items-center gap-6 text-sm">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="inline-block h-3 w-6 rounded-full bg-emerald-500 shadow-sm" /> Udført
          </span>
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="inline-block h-3 w-6 rounded-full bg-blue-500 shadow-sm" /> I gang
          </span>
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="inline-block h-3 w-6 rounded-full bg-amber-500 shadow-sm" /> Mangler
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Panel */}
        <div className="flex-shrink-0 border-r bg-slate-50" style={{ width: leftColWidth }}>
          {/* Left Header */}
          <div className="border-b bg-slate-100 text-base font-semibold text-slate-700">
            <div className="px-4 py-3">Opgave</div>
          </div>

          {/* Left Task List - synchronized scrolling */}
          <div
            ref={taskScrollRef}
            className="max-h-[70vh] overflow-auto"
            onScroll={(e) => syncScroll("task", e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
          >
            {rows.map((row, idx) => {
              const zebra = idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"

              if (row.kind === "group") {
                return (
                  <div
                    key={`g-${row.id}-${idx}`}
                    className="border-b bg-slate-200 sticky top-0 z-10"
                    style={{ height: rowHeight }}
                  >
                    <div className="flex items-center pl-4 pr-3 text-sm font-bold tracking-wide text-slate-700 h-full">
                      <span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-3" />
                      {row.title}
                    </div>
                  </div>
                )
              }

              if (row.kind === "task") {
                const t = row.task
                const isSelected = selectedTask === t.id

                return (
                  <div key={t.id} className={`border-b transition-colors ${zebra}`} style={{ height: rowHeight }}>
                    <div className="flex items-center pl-4 pr-2 overflow-hidden h-full">
                      <div className="flex items-center min-w-0 flex-1">
                        {row.level > 0 && (
                          <div className="mr-3 flex items-center flex-shrink-0">
                            <div className="w-4 h-px bg-slate-300" />
                            <div className="w-2 h-2 rounded-full bg-slate-300 ml-1" />
                          </div>
                        )}
                        <button
                          className={`truncate font-medium hover:text-blue-600 transition-colors min-w-0 flex-shrink ${
                            isSelected ? "text-blue-600 font-semibold" : "text-slate-700"
                          }`}
                          title={t.title}
                          onClick={() => {
                            setSelectedTask(isSelected ? null : t.id)
                            onTaskClick?.(t)
                          }}
                        >
                          {t.title}
                        </button>
                        <div className="flex-shrink-0 flex items-center">
                          {priorityBadge(t.priority)}
                          {statusChip(t.status, t.statusText)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              if (row.kind === "subtask") {
                const subtask = row.subtask
                const isSelected = selectedTask === subtask.id

                return (
                  <div key={subtask.id} className={`border-b transition-colors ${zebra}`} style={{ height: rowHeight }}>
                    <div className="flex items-center pl-4 pr-2 overflow-hidden h-full">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="mr-3 flex items-center flex-shrink-0">
                          <div className="w-6 h-px bg-slate-300" />
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1" />
                        </div>
                        <button
                          className={`truncate font-medium text-sm hover:text-blue-600 transition-colors min-w-0 flex-shrink ${
                            isSelected ? "text-blue-600 font-semibold" : "text-slate-600"
                          }`}
                          title={subtask.title}
                          onClick={() => {
                            setSelectedTask(isSelected ? null : subtask.id)
                          }}
                        >
                          {subtask.title}
                        </button>
                        <div className="flex-shrink-0">{statusChip(subtask.status)}</div>
                      </div>
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>

        {/* Scrollable Chart Area */}
        <div className="flex-1 overflow-hidden">
          {/* Chart Header - horizontal dates */}
          <div className="border-b bg-slate-50">
            <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
              <div className="flex text-xs font-medium text-slate-600" style={{ minWidth: totalDays * pxPerDay }}>
                {Array.from({ length: totalDays }).map((_, i) => {
                  const d = addDays(viewStart, i)
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  const isToday = d.toDateString() === today.toDateString()
                  const shouldShowLabel = i % 2 === 0 || isToday
                  const label = shouldShowLabel ? d.toISOString().slice(5, 10) : ""
                  return (
                    <div
                      key={i}
                      className={`flex h-10 items-center justify-center border-r last:border-r-0 transition-colors ${
                        isToday
                          ? "bg-blue-100 text-blue-700 font-semibold"
                          : isWeekend
                            ? "bg-slate-100"
                            : "bg-white hover:bg-slate-50"
                      }`}
                      style={{ width: pxPerDay, minWidth: pxPerDay }}
                    >
                      <span className="text-center leading-tight">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Chart Content - synchronized scrolling */}
          <div
            ref={chartScrollRef}
            className="max-h-[70vh] overflow-auto relative"
            onScroll={(e) => syncScroll("chart", e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
          >
            <div className="overflow-x-auto">
              <div style={{ minWidth: totalDays * pxPerDay }}>
                {rows.map((row, idx) => {
                  const zebra = idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"

                  if (row.kind === "group") {
                    return (
                      <div
                        key={`g-${row.id}-${idx}`}
                        className="bg-slate-100 sticky top-0 z-10 border-b"
                        style={{ height: rowHeight }}
                      />
                    )
                  }

                  if (row.kind === "task") {
                    const t = row.task
                    const { x, w } = rangeToRect(parse(t.startDate), parse(t.endDate))
                    const isSelected = selectedTask === t.id

                    return (
                      <div key={t.id} className={`border-b transition-colors ${zebra}`} style={{ height: rowHeight }}>
                        <div className="relative h-full">
                          {/* grid */}
                          <div className="absolute inset-0 flex">
                            {Array.from({ length: totalDays }).map((_, i) => {
                              const d = addDays(viewStart, i)
                              const isWeekend = d.getDay() === 0 || d.getDay() === 6
                              const isToday = d.toDateString() === today.toDateString()
                              return (
                                <div
                                  key={i}
                                  className={`border-r last:border-r-0 ${
                                    isToday ? "bg-blue-50" : isWeekend ? "bg-slate-100" : ""
                                  }`}
                                  style={{ width: pxPerDay }}
                                />
                              )
                            })}
                          </div>

                          {/* Today marker */}
                          {showToday && (
                            <div
                              className="pointer-events-none absolute top-0 h-full w-0.5 bg-blue-500 shadow-sm z-20"
                              style={{ left: todayX }}
                              aria-hidden
                            />
                          )}

                          <div className="absolute inset-0 flex items-center">
                            {/* Progress background bar */}
                            {t.progress !== undefined && (
                              <div
                                className="absolute bg-slate-200 rounded-full"
                                style={{
                                  left: x,
                                  height: row.level > 0 ? 12 : 16,
                                  width: w,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              />
                            )}

                            <div
                              className={`absolute rounded-full transition-all duration-150 select-none ${barColor(t.status, isSelected)}`}
                              style={{
                                left: x + 1,
                                height: row.level > 0 ? 14 : 18,
                                width: Math.max(
                                  (t.progress !== undefined ? w * (t.progress / 100) : w) - 2,
                                  pxPerDay * 0.8,
                                ),
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                              title={`${t.title} • ${t.statusText ?? ""} ${t.progress ? `• ${t.progress}%` : ""}`}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (row.kind === "subtask") {
                    const subtask = row.subtask
                    const parentTask = row.parentTask
                    // Use parent task dates for subtask positioning
                    const { x, w } = rangeToRect(parse(parentTask.startDate), parse(parentTask.endDate))
                    const isSelected = selectedTask === subtask.id

                    return (
                      <div
                        key={subtask.id}
                        className={`border-b transition-colors ${zebra}`}
                        style={{ height: rowHeight }}
                      >
                        <div className="relative h-full">
                          {/* grid */}
                          <div className="absolute inset-0 flex">
                            {Array.from({ length: totalDays }).map((_, i) => {
                              const d = addDays(viewStart, i)
                              const isWeekend = d.getDay() === 0 || d.getDay() === 6
                              const isToday = d.toDateString() === today.toDateString()
                              return (
                                <div
                                  key={i}
                                  className={`border-r last:border-r-0 ${
                                    isToday ? "bg-blue-50" : isWeekend ? "bg-slate-100" : ""
                                  }`}
                                  style={{ width: pxPerDay }}
                                />
                              )
                            })}
                          </div>

                          {/* Today marker */}
                          {showToday && (
                            <div
                              className="pointer-events-none absolute top-0 h-full w-0.5 bg-blue-500 shadow-sm z-20"
                              style={{ left: todayX }}
                              aria-hidden
                            />
                          )}

                          <div className="absolute inset-0 flex items-center">
                            {/* Subtask bar - smaller and offset */}
                            <div
                              className={`absolute rounded-full transition-all duration-150 select-none ${barColor(subtask.status, isSelected)} opacity-75`}
                              style={{
                                left: x + 8,
                                height: 10,
                                width: Math.max(w * 0.6, pxPerDay * 0.5),
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                              title={`${subtask.title} • ${subtask.status}`}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { GanttChart }
