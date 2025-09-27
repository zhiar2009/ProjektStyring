"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

interface NaturalDatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  label?: string
  id?: string
}

export function NaturalDatePicker({ value, onChange, placeholder, label, id }: NaturalDatePickerProps) {
  const [inputValue, setInputValue] = useState("")
  const [parsedDate, setParsedDate] = useState<Date | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Danish natural language date parsing
  const parseNaturalDate = (input: string): Date | null => {
    const today = new Date()
    const normalizedInput = input.toLowerCase().trim()

    // Direct date patterns
    if (normalizedInput === "i dag" || normalizedInput === "idag") {
      return today
    }

    if (normalizedInput === "i morgen" || normalizedInput === "imorgen") {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      return tomorrow
    }

    if (normalizedInput === "i går" || normalizedInput === "igår") {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      return yesterday
    }

    // Weekday patterns
    const weekdays = {
      mandag: 1,
      tirsdag: 2,
      onsdag: 3,
      torsdag: 4,
      fredag: 5,
      lørdag: 6,
      søndag: 0,
    }

    for (const [day, dayNum] of Object.entries(weekdays)) {
      if (normalizedInput.includes(day)) {
        const targetDate = new Date(today)
        const currentDay = today.getDay()
        const daysUntilTarget = (dayNum - currentDay + 7) % 7
        if (daysUntilTarget === 0 && !normalizedInput.includes("næste")) {
          // If it's the same day and not "næste", assume next week
          targetDate.setDate(today.getDate() + 7)
        } else {
          targetDate.setDate(today.getDate() + daysUntilTarget)
        }
        return targetDate
      }
    }

    // Relative date patterns
    const relativePatterns = [
      { pattern: /om (\d+) dag(e)?/i, multiplier: 1 },
      { pattern: /(\d+) dag(e)? frem/i, multiplier: 1 },
      { pattern: /om (\d+) uge(r)?/i, multiplier: 7 },
      { pattern: /(\d+) uge(r)? frem/i, multiplier: 7 },
      { pattern: /om (\d+) måned(er)?/i, multiplier: 30 },
      { pattern: /(\d+) måned(er)? frem/i, multiplier: 30 },
    ]

    for (const { pattern, multiplier } of relativePatterns) {
      const match = normalizedInput.match(pattern)
      if (match) {
        const number = Number.parseInt(match[1])
        const targetDate = new Date(today)
        if (multiplier === 30) {
          targetDate.setMonth(today.getMonth() + number)
        } else {
          targetDate.setDate(today.getDate() + number * multiplier)
        }
        return targetDate
      }
    }

    // Week patterns
    if (normalizedInput.includes("næste uge")) {
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      return nextWeek
    }

    if (normalizedInput.includes("denne uge")) {
      return today
    }

    // Month patterns
    if (normalizedInput.includes("næste måned")) {
      const nextMonth = new Date(today)
      nextMonth.setMonth(today.getMonth() + 1)
      return nextMonth
    }

    // Try to parse as regular date (DD/MM/YYYY or DD-MM-YYYY)
    const datePatterns = [
      /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2})/,
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    ]

    for (const pattern of datePatterns) {
      const match = normalizedInput.match(pattern)
      if (match) {
        const day = Number.parseInt(match[1])
        const month = Number.parseInt(match[2]) - 1 // JavaScript months are 0-indexed
        let year = Number.parseInt(match[3])

        if (year < 100) {
          year += 2000 // Assume 2000s for 2-digit years
        }

        const date = new Date(year, month, day)
        if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
          return date
        }
      }
    }

    return null
  }

  // Generate suggestions based on input
  const generateSuggestions = (input: string): string[] => {
    if (!input) return []

    const suggestions = [
      "i dag",
      "i morgen",
      "i går",
      "mandag",
      "tirsdag",
      "onsdag",
      "torsdag",
      "fredag",
      "lørdag",
      "søndag",
      "næste mandag",
      "næste tirsdag",
      "næste onsdag",
      "næste torsdag",
      "næste fredag",
      "om 1 dag",
      "om 2 dage",
      "om 3 dage",
      "om 1 uge",
      "om 2 uger",
      "næste uge",
      "næste måned",
      "denne uge",
    ]

    return suggestions.filter((s) => s.toLowerCase().includes(input.toLowerCase())).slice(0, 5)
  }

  useEffect(() => {
    if (inputValue) {
      const parsed = parseNaturalDate(inputValue)
      setParsedDate(parsed)

      if (parsed) {
        const isoDate = parsed.toISOString().split("T")[0]
        onChangeRef.current(isoDate)
      }

      setSuggestions(generateSuggestions(inputValue))
    } else {
      setParsedDate(null)
      setSuggestions([])
    }
  }, [inputValue])

  // Initialize from value prop
  useEffect(() => {
    if (value && !inputValue) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setParsedDate(date)
      }
    }
  }, [value, inputValue])

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("da-DK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setSuggestions([])
  }

  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <div className="relative">
          <Input
            id={id}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder || "f.eks. 'i morgen', 'næste uge', '15/12/2024'"}
            className="pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Parsed date display */}
      {parsedDate && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            📅 {formatDate(parsedDate)}
          </Badge>
        </div>
      )}

      {/* Fallback regular date input */}
      <div className="text-xs text-muted-foreground">
        Eller vælg dato:
        <Input
          type="date"
          value={value}
          onChange={(e) => {
            onChangeRef.current(e.target.value)
            setInputValue("")
          }}
          className="mt-1"
        />
      </div>
    </div>
  )
}
