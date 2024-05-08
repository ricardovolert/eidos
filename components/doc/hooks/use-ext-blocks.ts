import { FunctionComponent, useEffect, useMemo, useState } from "react"
import { IScript } from "@/worker/web-worker/meta-table/script"

import { useCurrentPathInfo } from "@/hooks/use-current-pathinfo"
import { useScripts } from "@/hooks/use-scripts"
import { useSqlite } from "@/hooks/use-sqlite"

export interface ExtBlock {
  name: string
  icon: string
  node: any
  plugin: FunctionComponent
  onSelect: (editor: any) => void
  keywords: string[]
}
export const useExtBlocks = () => {
  const [extBlocks, setExtBlocks] = useState<ExtBlock[]>([])

  useEffect(() => {
    const extBlocks = ((window as any).__DOC_EXT_BLOCKS as ExtBlock[]) || []
    setExtBlocks(extBlocks)
  }, [])
  return extBlocks
}

export const useEnabledExtBlocks = () => {
  const { space } = useCurrentPathInfo()
  const [scripts, setScripts] = useState<IScript[]>([])
  const [loading, setLoading] = useState(true)
  const { sqlite } = useSqlite()
  useEffect(() => {
    if (!sqlite) return
    sqlite?.listScripts("enabled").then((res) => {
      setScripts(
        res.filter((script) => script.type === "block" && script.enabled)
      )
      setLoading(false)
    })
  }, [space, sqlite])

  return {
    loading,
    scripts,
  }
}
