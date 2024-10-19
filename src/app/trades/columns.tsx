"use client"

import { Execution, Trade } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"


export const columns: ColumnDef<Trade & {executions:Execution[]}>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "account",
    header: "Account",
  },
  {
    accessorKey: "ticker",
    header: "Symbol",
  },
  {
    accessorKey: "direction",
    header: "Direction",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({row}) => row.original.startDate.toLocaleDateString(),
  },
  {
    accessorKey: "pnl",
    header: "P&L",
    cell: ({row}) => row.original.pnl.toFixed(2),
  },
  {
    accessorKey: "volume",
    header: "Volume",
  },
  {
    accessorKey: "executions",
    header: "Executions",
    cell:({row}) => row.original.executions.length,
  },
  {
    accessorKey: "averagePrice",
    header: "AvgPrice",
    cell: ({row}) => row.original.averagePrice.toFixed(2),
  },
  {
    accessorKey: "commission",
    header: "Commission",
    cell : ({row}) => row.original.commission.toFixed(2),
  },
  {
    accessorKey: "fees",
    header: "Fees",
    cell : ({row}) => row.original.fees.toFixed(2),
  },
  {
    accessorKey: "status",
    header: "Status",

  },
  {
    accessorKey: "result",
    header: "Result",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({row}) => row.original.endDate?.toLocaleDateString(),
  },
  {
    accessorKey: "executionTime",
    header: "Time",
    cell: ({row}) => row.original.executionTime,
  },
  {
    accessorKey: "notes",
    header: "Notes",
  }

]

