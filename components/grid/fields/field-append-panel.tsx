"use client"

import { useClickAway } from "ahooks"
import {
  BaselineIcon,
  CalendarDaysIcon,
  CheckSquareIcon,
  HashIcon,
  ImageIcon,
  LinkIcon,
  SigmaIcon,
  StarIcon,
  TagIcon,
  TagsIcon,
} from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { IUIColumn } from "@/hooks/use-table"
import { FieldType } from "@/lib/fields/const"
import { cn } from "@/lib/utils"

import { useTableAppStore } from "../store"

export function FieldAppendPanel({
  addField,
  uiColumns,
}: {
  addField: (fieldName: string, fieldType: FieldType) => Promise<void>
  uiColumns: IUIColumn[]
}) {
  const [selectedFieldType, setSelectedFieldType] = React.useState<string>()
  const ref = React.useRef<HTMLDivElement>(null)
  const { isAddFieldEditorOpen, setIsAddFieldEditorOpen } = useTableAppStore()
  const fieldTypes = [
    { name: "Text", value: FieldType.Text, icon: BaselineIcon },
    { name: "Number", value: FieldType.Number, icon: HashIcon },
    { name: "Select", value: FieldType.Select, icon: TagIcon },
    { name: "MultiSelect", value: FieldType.MultiSelect, icon: TagsIcon },
    {
      name: "Checkbox",
      value: FieldType.Checkbox,
      icon: CheckSquareIcon,
    },
    { name: "Rating", value: FieldType.Rating, icon: StarIcon },

    { name: "URL", value: FieldType.URL, icon: LinkIcon },
    { name: "Date", value: FieldType.Date, icon: CalendarDaysIcon },
    { name: "Files", value: FieldType.File, icon: ImageIcon },
    // { name: "Formula", value: FieldType.Formula, icon: SigmaIcon },
  ]

  const handleAddField = (field: (typeof fieldTypes)[0]) => {
    const newFieldName = `${field.name}${uiColumns.length + 1}`
    addField(newFieldName, field.value).then(() =>
      setIsAddFieldEditorOpen(false)
    )
    // setSelectedFieldType(field.name)
    // for now just close, not support edit field
  }

  useClickAway(
    () => {
      isAddFieldEditorOpen && setIsAddFieldEditorOpen(false)
    },
    ref,
    ["mousedown", "touchstart"]
  )

  return (
    <div
      ref={ref}
      className={cn(
        "absolute right-0 z-50 h-screen w-[400px] bg-white shadow-lg dark:bg-slate-950"
      )}
    >
      {selectedFieldType ? (
        <div>{selectedFieldType}</div>
      ) : (
        <div>
          <h2 className="relative px-6 text-lg font-semibold tracking-tight">
            add field
          </h2>
          <div className="space-y-1 p-2">
            {fieldTypes.map((field, i) => {
              const Icon = field.icon
              return (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-normal"
                  key={`${field.name}-${field.value}`}
                  onClick={(e) => {
                    handleAddField(field)
                  }}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {field.name}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
