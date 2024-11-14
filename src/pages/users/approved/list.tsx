import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableType } from "@/types/dev.types";
import { useList, useNavigation } from "@refinedev/core";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, DollarSign, MapPin } from "lucide-react";
import React, { useMemo, useState } from "react";

type ApprovedBooking = TableType<"vw_user_approved">;

export const ApprovedList: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const { show } = useNavigation();

  const columns: ColumnDef<ApprovedBooking>[] = [
    {
      accessorKey: "venue_name",
      header: "Venue",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          <span className="font-medium transition-colors hover:text-primary">{row.original.venue_name || 'N/A'}</span>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{row.original.venue_location || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "booking_status",
      header: "Status",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="default"
                className={`
                  ${row.original.is_confirmed
                    ? 'bg-green-800 text-green-400 hover:bg-green-200'
                    : 'bg-yellow-800 text-yellow-400 hover:bg-yellow-200'}
                  transition-colors duration-200
                `}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${row.original.is_confirmed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span>{row.original.is_confirmed ? 'Confirmed' : 'Pending'}</span>
                </div>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.is_confirmed ? 'Booking is confirmed' : 'Waiting for confirmation'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.total_amount;
        return (
          <span className="font-medium">
            {amount === 0 ? 'Free' : amount !== null ? `$${Number(amount).toFixed(2)}` : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.created_at;
        return date ? format(new Date(date), "PPp") : 'N/A';
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { show } = useNavigation();
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (row.original.id !== null) {
                show("vw_user_approved", row.original.id.toString());
              }
            }}
            disabled={row.original.id === null}
          >
            View
          </Button>
        );
      },
    },
  ];

  const { data: tableData, isLoading } = useList<TableType<"vw_user_approved"> & { id: number }>({
    resource: "vw_user_approved",
  });

  const table = useReactTable({
    data: tableData?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const isMobile = useMemo(() => window.innerWidth < 768, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-52">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {table.getRowModel().rows.map((row) => (
            <Card key={row.id} className="transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-medium">{row.original.venue_name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{row.original.venue_location || 'N/A'}</span>
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    className={`
                      ${row.original.is_confirmed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'}
                    `}
                  >
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${row.original.is_confirmed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span>{row.original.is_confirmed ? 'Confirmed' : 'Pending'}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="flex items-center font-medium">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {row.original.total_amount === 0 ? 'Free' : `$${Number(row.original.total_amount).toFixed(2)}`}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Booked On</div>
                  <div className="flex items-center font-medium">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(row.original.created_at || ''), "MMM d, yyyy")}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    if (row.original.id !== null) {
                      show("vw_user_approved", row.original.id.toString());
                    }
                  }}
                  disabled={row.original.id === null}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex items-center justify-between py-4 space-x-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Rows per page</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="h-8 w-[70px] rounded-md border border-input bg-background text-sm"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
