"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox" // sørg for at denne findes i dit UI-bibliotek
import { cn } from "@/lib/utils"

const projektTyper = {
  // FIXED: præcis mapping: Station=S010, HSP Kabel=N010, LSP Kabel=N004
  S010: { type: "station", name: "Station" },
  N010: { type: "cable", name: "HSP Kabel" },
  N004: { type: "cable", name: "LSP Kabel" },
  // FIXED: N010 & N004 bindes til kabel-skabelonen med det samme
}

type ParsedRow = {
  id: string
  name: string
  projectNumber: string
  type: keyof typeof projektTyper | "unknown"
  recognizedType: string
  description?: string
  debtorNumber?: string
  debtorName?: string
  expectedStart?: string // ISO yyyy-mm-dd
  expectedEnd?: string // ISO yyyy-mm-dd
  originalData: Record<string, string>
}

interface CSVImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (projects: any[]) => void // fallback for backwards-compat: kun "create"
  // FIXED: nye valgfri props for opdatering uden duplikater
  existingProjects?: Array<{ id: string; projectNumber: string }>
  onUpsert?: (payload: {
    create: any[]
    update: Array<{ id: string; projectNumber: string; name?: string; expectedStart?: string; expectedEnd?: string }>
  }) => void
}

export function CSVImport({ open, onOpenChange, onImport, existingProjects = [], onUpsert }: CSVImportProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [parsedProjects, setParsedProjects] = useState<ParsedRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({}) // FIXED: udvælgelses-UI

  // --- helpers ---
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[._-]+/g, "")
      .trim()

  const dateToISO = (v?: string) => {
    if (!v) return undefined
    // forsøg dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, yyyy/mm/dd
    const t = v.trim()
    const m1 = t.match(/^(\d{2})[-/.](\d{2})[-/.](\d{4})$/) // dd-mm-yyyy
    if (m1) {
      const [_, dd, mm, yyyy] = m1
      return `${yyyy}-${mm}-${dd}`
    }
    const m2 = t.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})$/) // yyyy-mm-dd
    if (m2) return t.replace(/[/.]/g, "-")
    // fallback: Date-parse og til ISO-date
    const d = new Date(t)
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]
    return undefined
  }

  const headerIndex = (headers: string[], keys: string[]) => {
    const nheaders = headers.map(normalize)
    for (const k of keys) {
      const nk = normalize(k)
      const idx = nheaders.indexOf(nk)
      if (idx !== -1) return idx
    }
    return -1
  }

  const getField = (vals: string[], headers: string[], candidates: string[]) => {
    const idx = headerIndex(headers, candidates)
    return idx >= 0 ? (vals[idx] ?? "").trim() : ""
  }

  const detectTypeFromProjectNumber = (pn: string): { key: keyof typeof projektTyper | "unknown"; label: string } => {
    const prefix = (pn || "").replace(/\s+/g, "").slice(0, 4).toUpperCase(); // FIXED: first 4 chars of project number
    if (prefix in projektTyper) {
      const info = projektTyper[prefix as keyof typeof projektTyper]
      return { key: prefix as keyof typeof projektTyper, label: info.name }
    }
    return { key: "N010" as keyof typeof projektTyper, label: "Kabel" }  // fallback til kabel
  }


  const parseCSVFile = (csvText: string): ParsedRow[] => {
    console.log("[v0] CSV text length:", csvText.length)
    console.log("[v0] First 200 chars:", csvText.substring(0, 200))

    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)

    console.log("[v0] Parsed lines count:", lines.length)
    console.log("[v0] First few lines:", lines.slice(0, 3))

    if (lines.length < 2) {
      console.log("[v0] Not enough lines in CSV")
      return []
    }

    const detectDelimiter = (line: string): string => {
      const semicolonCount = (line.match(/;/g) || []).length
      const commaCount = (line.match(/,/g) || []).length
      return semicolonCount > commaCount ? ";" : ","
    }

    const delimiter = detectDelimiter(lines[0])
    console.log("[v0] Detected delimiter:", delimiter)

    const headers = lines[0].replace(/^\ufeff/, "").split(delimiter).map((h) => h.replace(/^"|"$/g, "").trim())
    console.log("[v0] Headers:", headers)

    const result: ParsedRow[] = lines.slice(1).map((line, index) => {
      const values = line.split(delimiter).map((v) => v.replace(/^"|"$/g, "").trim())
      console.log(`[v0] Row ${index + 1} values:`, values)

      const projectNumber =
        getField(values, headers, [
          "Projekt-id",
          "Projekt ID",
          "Projektnummer",
          "Projekt nr",
          "Projekt nummer",
          "Project Number",
          "ProjectNumber",
          "Nummer",
          "Projektnr",
          "Projektkode", // fallback: some exports put number in code field
        ]) || '' // FIXED: fjern PROJ- fallback; kræver projektnummer fra CSV

      const projectCode =
        getField(values, headers, ["Projektkode", "Kode", "Code", "Type"]) || (projectNumber || "").split("-")[0] || ""

      const name =
        getField(values, headers, [
          "Projektnavn",
          "Navn",
          "Name",
          "Projektbeskrivelse",
          "Beskrivelse",
          "Description",
        ]) || `Projekt ${index + 1}`

      const description = getField(values, headers, [
        "Beskrivelse",
        "Description",
        "Projektbeskrivelse",
        "Bemærkninger",
        "Notes",
      ])

      const debtorNumber = getField(values, headers, [
        "Debitor nr",
        "Debitornr",
        "Debitor",
        "Customer No",
        "CustomerNo",
        "Kundenr",
        "Kunde nr",
      ])

      const debtorName = getField(values, headers, [
        "Navn på debitor",
        "Debitor navn",
        "DebitorName",
        "Customer Name",
        "Kundenavn",
        "Kunde navn",
      ])

      const expectedStart = dateToISO(
        getField(values, headers, [
          "Forventet start",
          "Startdato",
          "Expected Start",
          "Planned Start",
          "Start dato",
          "Planlagt start",
        ]),
      )

      const expectedEnd = dateToISO(
        getField(values, headers, [
          "Forventet slut",
          "Slutdato",
          "Expected End",
          "Planned End",
          "Slut dato",
          "Planlagt slut",
        ]),
      )

      let typeKey: keyof typeof projektTyper | "unknown" = "unknown"
      let typeLabel = "Ukendt projekttype"

      console.log(`[v0] Detecting type for project ${index + 1}:`, { projectNumber, projectCode })

      const projectPrefix = projectNumber.split("-")[0]?.toUpperCase()
      console.log(`[v0] Project prefix:`, projectPrefix)

      if (projectPrefix && projectPrefix in projektTyper) {
        typeKey = projectPrefix as keyof typeof projektTyper
        typeLabel = projektTyper[typeKey].name
        console.log(`[v0] Type detected from prefix:`, typeKey, typeLabel)
      }
      // Then try project code field
      else if (projectCode) {
        const upperCode = projectCode.toUpperCase()
        console.log(`[v0] Trying project code:`, upperCode)
        if (upperCode in projektTyper) {
          typeKey = upperCode as keyof typeof projektTyper
          typeLabel = projektTyper[typeKey].name
          console.log(`[v0] Type detected from code:`, typeKey, typeLabel)
        }
      }
      // Finally try to detect from project name or description
      else {
        const searchText = `${name} ${description}`.toLowerCase()
        console.log(`[v0] Trying text detection:`, searchText)
        if (searchText.includes("station") || searchText.includes("trafo")) {
          typeKey = "S010"
          typeLabel = projektTyper.S010.name
        } else if (searchText.includes("kabel") || searchText.includes("cable")) {
          if (searchText.includes("hsp") || searchText.includes("høj")) {
            typeKey = "N010"
            typeLabel = projektTyper.N010.name
          } else if (searchText.includes("lsp") || searchText.includes("lav")) {
            typeKey = "N004"
            typeLabel = projektTyper.N004.name
          } else {
            // Default to HSP cable if just "kabel"
            typeKey = "N010"
            typeLabel = projektTyper.N010.name
          }
        }
      }

      console.log(`[v0] Final type for project ${index + 1}:`, typeKey, typeLabel)

      return {
        id: `csv-import-${Date.now()}-${index}`,
        name,
        projectNumber,
        type: typeKey,
        recognizedType: typeLabel,
        description,
        debtorNumber,
        debtorName,
        expectedStart,
        expectedEnd,
        originalData: Object.fromEntries(headers.map((h, i) => [h, values[i] || ""])),
      }
    })

    console.log("[v0] Final parsed projects:", result.length)
    return result
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        const csvText = e.target?.result as string
        try {
          const projects = parseCSVFile(csvText)
          setParsedProjects(projects)
          // FIXED: default-markér alle som valgt
          setSelected(Object.fromEntries(projects.map((p) => [p.id, true])))
          setPreviewMode(true)
        } catch (error) {
          console.error("Error parsing CSV:", error)
        }
      }
      reader.readAsText(file, 'utf-8') // FIXED: UTF-8 for ØÆÅ/øæå
    }
  }

  // skabeloner
  const stationTasks = useMemo(
    () => [
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
    ],
    [],
  )

  const cableTasks = useMemo(
    () => [
      { group: "Kabel – Plan", task: "Kontakter & interessenter" },
      { group: "Kabel – Plan", task: "Planlægning & Projektering (trace, KSK, tilladelser)" },
      { group: "Kabel – Indkøb", task: "Bestilling af materialer (kabler, muffe, rør)" },
      { group: "Kabel – Udførsel", task: "Gravearbejde & rørlægning" },
      { group: "Kabel – Udførsel", task: "Kabeltræk & terminering" },
      { group: "Kabel – Test", task: "Måling & test (Max/min/PD)" },
      { group: "Kabel – Dokumentation", task: "As-built, fotos, Doconote" },
      { group: "Kabel – Afslutning", task: "Oprydning & økonomi (fakturering)" },
    ],
    [],
  )

  const makeTasksForType = (type: ParsedRow["type"]) => {
    const arr =
      type === "station" ? stationTasks : cableTasks // FIXED: N010/N004 -> kabel-skabelon
    return (arr || []).map((t, i) => ({
      id: `${type}-${Date.now()}-${i}`,
      title: t.task,
      group: t.group,
      status: "pending",
      dueDate: new Date(Date.now() + i * (type === "station" ? 2 : 3) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: [],
      linkedContacts: [],
      subtasks: [],
      priority: "medium",
    }))
  }

  const existingByNumber = useMemo(() => {
    const map = new Map<string, { id: string; projectNumber: string }>()
    for (const p of existingProjects) {
      if (p.projectNumber) map.set(p.projectNumber, p)
    }
    return map
  }, [existingProjects])

  const handleImport = () => {
    setIsProcessing(true)

    const selectedRows = parsedProjects.filter((p) => selected[p.id])

    // opdel i create og update
    const update: Array<{
      id: string
      projectNumber: string
      name?: string
      expectedStart?: string
      expectedEnd?: string
    }> = []
    const create: any[] = []

    for (const project of selectedRows) {
      const match = existingByNumber.get(project.projectNumber)
      if (match) {
        // FIXED: opdater eksisterende (ingen duplikater)
        update.push({
          id: match.id,
          projectNumber: project.projectNumber,
          name: project.name || undefined,
          expectedStart: project.expectedStart || undefined,
          expectedEnd: project.expectedEnd || undefined,
        })
      } else {
        // FIXED: kun nye projekter får skabelon-opgaver
        const typeMeta = projektTyper[project.type as keyof typeof projektTyper]
        // FIXED: bind template type to 'station' or 'cable'
        create.push({
          id: `csv-create-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: project.name,
          type: typeMeta ? typeMeta.type : "station",
          // fuldt projektnummer fra CSV
          projectNumber: project.projectNumber,
          description: project.description || "",
          debtorNumber: project.debtorNumber || "",
          debtorName: project.debtorName || "",
          expectedStart: project.expectedStart || undefined,
          expectedEnd: project.expectedEnd || undefined,
          status: "planning",
          progress: 0,
          tasks: makeTasksForType(project.type),
        })
      }
    }

    if (onUpsert) {
      // FIXED: ny API med create + update
      onUpsert({ create, update })
    } else {
      // Backwards compat: kun "create" projekter sendes retur
      onImport(create)
    }

    // Reset state
    setCsvFile(null)
    setParsedProjects([])
    setPreviewMode(false)
    setIsProcessing(false)
    onOpenChange(false)
  }

  const resetImport = () => {
    setCsvFile(null)
    setParsedProjects([])
    setPreviewMode(false)
    setSelected({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer Projekter fra CSV</DialogTitle>
        </DialogHeader>

        {!previewMode ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Vælg CSV fil</Label>
              <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="mt-2" />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Understøttede projektkoder:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(projektTyper).map(([code, info]) => (
                  <div key={code} className="flex items-center space-x-2">
                    <Badge variant="outline">{code}</Badge>
                    <span>{info.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>CSV kolonner (fleksible navne understøttes):</p>
              <ul className="list-disc list-inside mt-1">
                <li>Projektnummer (fx N010-KB-0750-04-12)</li>
                <li>Projektkode (S010, N010, N004)</li>
                <li>Projektnavn</li>
                <li>Beskrivelse (valgfrit)</li>
                <li>Debitor nr. (valgfrit)</li>
                <li>Navn på debitor (valgfrit)</li>
                <li>Forventet start / Forventet slut (valgfrit)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Forhåndsvisning ({parsedProjects.length} projekter)</h3>
              <Button variant="outline" size="sm" onClick={resetImport}>
                Vælg anden fil
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {parsedProjects.map((project) => {
                const exists = !!existingByNumber.get(project.projectNumber)
                return (
                  <div key={project.id} className={cn("border rounded-lg p-4", exists && "bg-muted/40")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {/* FIXED: vælg specifikke projekter */}
                        <Checkbox
                          checked={!!selected[project.id]}
                          onCheckedChange={(v: boolean) => setSelected((s) => ({ ...s, [project.id]: !!v }))}
                          aria-label="Vælg til import"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{project.name}</h4>
                            {project.projectNumber && <Badge variant="secondary">Projekt-id: {project.projectNumber}</Badge>}
                            <Badge variant="outline">
                              {project.type === "station" ? "🏭" : project.type === "unknown" ? "❓" : "🔌"}{" "}
                              {project.recognizedType}
                            </Badge>
                            {exists && <Badge variant="default">Opdaterer eksisterende</Badge>}
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                          )}

                          {/* Debitor-info */}
                          {(project.debtorNumber || project.debtorName) && (
                            <div className="text-sm mt-2 flex flex-wrap gap-2">
                              {project.debtorNumber && (
                                <Badge variant="outline">Debitor nr.: {project.debtorNumber}</Badge>
                              )}
                              {project.debtorName && <Badge variant="outline">Debitor: {project.debtorName}</Badge>}
                            </div>
                          )}

                          {/* Datoer */}
                          {(project.expectedStart || project.expectedEnd) && (
                            <div className="text-xs text-muted-foreground mt-2">
                              {project.expectedStart && <span>Forventet start: {project.expectedStart}</span>}
                              {project.expectedStart && project.expectedEnd && <span> • </span>}
                              {project.expectedEnd && <span>Forventet slut: {project.expectedEnd}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuller
          </Button>
          {previewMode && (
            <Button onClick={handleImport} disabled={isProcessing}>
              {isProcessing ? "Importerer..." : `Importer ${Object.values(selected).filter(Boolean).length} projekter`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
