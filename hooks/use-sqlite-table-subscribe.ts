import { useCallback, useEffect } from "react"
import { ColumnTable } from "@/worker/web-worker/meta-table/column"

import {
  DataUpdateSignalType,
  EidosDataEventChannelMsg,
  EidosDataEventChannelMsgType,
  EidosDataEventChannelName,
} from "@/lib/const"
import { isComputedField } from "@/lib/fields/helper"
import { getTableIdByRawTableName } from "@/lib/utils"

import { useSqlite, useSqliteStore } from "./use-sqlite"

export const useSqliteTableSubscribe = (tableName: string) => {
  const { setRows, delRows, getRowIds } = useSqliteStore()
  const { sqlite } = useSqlite()
  const tableId = getTableIdByRawTableName(tableName)

  const recompute = useCallback(
    async (tableId: string, rowIds: string[]) => {
      if (!sqlite) return []
      const rows = await sqlite.getRecomputeRows(tableId, rowIds)
      return rows
    },
    [sqlite]
  )

  useEffect(() => {
    const bc = new BroadcastChannel(EidosDataEventChannelName)
    const handler = (ev: MessageEvent<EidosDataEventChannelMsg>) => {
      const { type, payload } = ev.data
      // resend msg to main thread, why broadcast channel not work???
      window.postMessage(ev.data)
      if (type === EidosDataEventChannelMsgType.DataUpdateSignalType) {
        const { table, _new, _old } = payload
        if (tableName !== table) return
        switch (payload.type) {
          case DataUpdateSignalType.AddColumn:
          case DataUpdateSignalType.UpdateColumn:
            if (_old && ColumnTable.isColumnTypeChanged(_new.type, _old.type)) {
              // pass
            } else if (!isComputedField(_new?.type)) {
              break
            }
            // FIXME: update too many rows
            // if a generated column is updated, we need to recompute all rows in memory
            recompute(tableId, getRowIds(tableId)).then((rows) => {
              setRows(tableId, rows)
            })
            break
          case DataUpdateSignalType.Update:
            recompute(tableId, [_new._id]).then((rows) => {
              setRows(tableId, rows)
            })
            break
          case DataUpdateSignalType.Delete:
            delRows(tableId, [_old._id])
            break
          case DataUpdateSignalType.Insert:
            recompute(tableId, [_new._id]).then((rows) => {
              setRows(tableId, rows)
            })
            break
          default:
            break
        }
      }
    }
    bc.addEventListener("message", handler)
    return () => {
      bc.close()
    }
  }, [delRows, recompute, tableId, setRows, tableName, getRowIds])
}
