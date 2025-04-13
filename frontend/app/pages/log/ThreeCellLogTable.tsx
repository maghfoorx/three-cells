import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { SCORE_COLORS, type ThreeCellLog } from "~/types";
import { gql, useQuery } from "@apollo/client";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import color from "color";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const ALL_THREE_CELL_ENTERIES = gql`
  query AllThreeCellEntries {
    allThreeCellEntries {
      id
      date_for
      score
      summary
      focused_hours
    }
  }
`;

const columns: ColumnDef<ThreeCellLog>[] = [
  {
    accessorKey: "date_for",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4" />
        )}
      </button>
    ),
    cell: ({ row }) => format(new Date(row.original.date_for), "MMM dd, yyyy"),
  },
  {
    accessorKey: "summary",
    header: "Summary",
  },
  {
    accessorKey: "focused_hours",
    header: ({ column }) => (
      <button
        className="flex w-full items-center justify-end gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Focused Hours
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4" />
        )}
      </button>
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.focused_hours}</div>
    ),
  },
  {
    accessorKey: "score",
    header: ({ column }) => (
      <button
        className="flex w-full items-center justify-end gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Score
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4" />
        )}
      </button>
    ),
    cell: ({ row }) => <div className="text-right">{row.original.score}</div>,
  },
];

export default function ThreeCellLogTable() {
  const navigate = useNavigate();
  const { data: getQueryData } = useQuery(ALL_THREE_CELL_ENTERIES);

  const threeCellsLog = getQueryData?.allThreeCellEntries ?? [];

  const [sorting, setSorting] = useState<SortingState>(
    JSON.parse(localStorage.getItem("threeCellLogTableSorting") ?? "[]") ?? []
  );

  const [data, setData] = useState(threeCellsLog);

  useEffect(() => {
    if (getQueryData?.allThreeCellEntries) {
      setData(getQueryData.allThreeCellEntries);
    }
  }, [getQueryData]);

  useEffect(() => {
    localStorage.setItem("threeCellLogTableSorting", JSON.stringify(sorting));
  }, [sorting]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const handleRowClicked = (row: Row<ThreeCellLog>) => {
    if (row.original.date_for != null) {
      navigate(`/track/${row.original.date_for}`);
    }
  };

  return (
    <Table className="max-w-3xl rounded-lg border">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              No enteries made yet
            </TableCell>
          </TableRow>
        )}

        {table.getRowModel().rows.map((row) => {
          const baseColor =
            SCORE_COLORS[row.original.score.toString()] ?? "#ffffff";
          const rowColor = color(baseColor).fade(0.7).rgb().string();

          return (
            <TableRow
              key={row.id}
              style={{ backgroundColor: rowColor }}
              className="hover:cursor-pointer"
              onClick={() => handleRowClicked(row)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
