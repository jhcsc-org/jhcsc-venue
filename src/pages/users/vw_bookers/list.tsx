import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableType } from "@/types/dev.types";
import { GetManyResponse, useMany, useNavigation } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Fuse from 'fuse.js';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, DollarSign, MapPin, Phone, User } from "lucide-react";
import React, { useMemo, useState } from "react";

export const RequestedList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const columns = useMemo<ColumnDef<TableType<"vw_booker"> & { id: number }>[]>(
        () => [
            {
                id: "booking_info",
                header: "Booking Details",
                cell: ({ row }) => (
                    <div className="flex flex-col space-y-1">
                        <div className="font-medium">{row.original.venue_name || 'N/A'}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{row.original.venue_location || 'N/A'}</span>
                        </div>
                    </div>
                ),
            },
            {
                id: "user_info",
                header: "Customer",
                cell: ({ row }) => (
                    <div className="flex flex-col space-y-1">
                        <div className="font-medium">{row.original.user_name}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-3 h-3 mr-1" />
                            <span>{row.original.user_phone_number || 'N/A'}</span>
                        </div>
                    </div>
                ),
            },
            {
                id: "user_name",
                accessorKey: "user_name",
                header: "User Name",
                cell: function render({ getValue }) {
                    return (
                        <a href={`mailto:${getValue<string>()}`}>
                            {getValue<string>()}
                        </a>
                    );
                },
            },
            {
                id: "user_phone_number",
                accessorKey: "user_phone_number",
                header: "User Phone Number",
            },
            {
                id: "user_affiliation",
                accessorKey: "user_affiliation",
                header: "User Affiliation",
            },
            {
                id: "venue_id",
                header: "Venue",
                accessorKey: "venue_id",
                cell: function render({ getValue, table }) {
                    const meta = table.options.meta as {
                        venueData: GetManyResponse;
                    };

                    const venue = meta.venueData?.data?.find(
                        (item) => item.id === getValue<string>(),
                    );

                    return venue?.name ?? "Loading...";
                },
            },
            {
                id: "venue_name",
                accessorKey: "venue_name",
                header: "Venue Name",
            },
            {
                id: "venue_location",
                accessorKey: "venue_location",
                header: "Venue Location",
            },
            {
                id: "manager_name",
                accessorKey: "manager_name",
                header: "Manager Name",
            },
            {
                id: "booking_status",
                accessorKey: "booking_status",
                header: "Booking Status",
            },
            {
                id: "payment_status_id",
                header: "Payment Status",
                accessorKey: "payment_status_id",
                cell: function render({ getValue, table }) {
                    const meta = table.options.meta as {
                        paymentStatusData: GetManyResponse;
                    };

                    const paymentStatus = meta.paymentStatusData?.data?.find(
                        (item) => item.id === getValue<string>(),
                    );

                    return (
                        <span title="Inferencer failed to render this field (Cannot find key)">
                            Cannot Render
                        </span>
                    );
                },
            },
            {
                id: "payment_status",
                accessorKey: "payment_status",
                header: "Payment Status",
            },
            {
                id: "total_amount",
                accessorKey: "total_amount",
                header: "Total Amount",
            },
            {
                id: "created_at",
                accessorKey: "created_at",
                header: "Created At",
                cell: function render({ getValue }) {
                    return new Date(getValue<string>()).toLocaleString(undefined, {
                        timeZone: "UTC",
                    });
                },
            },
            {
                id: "updated_at",
                accessorKey: "updated_at",
                header: "Updated At",
                cell: function render({ getValue }) {
                    return new Date(getValue<string>()).toLocaleString(undefined, {
                        timeZone: "UTC",
                    });
                },
            },
            {
                id: "is_deleted",
                accessorKey: "is_deleted",
                header: "Is Deleted",
                cell: function render({ getValue }) {
                    return getValue<string>() ? "yes" : "no";
                },
            },
            {
                id: "is_confirmed",
                accessorKey: "is_confirmed",
                header: "Is Confirmed",
                cell: function render({ getValue }) {
                    return getValue<string>() ? "yes" : "no";
                },
            },
            {
                id: "payments",
                header: "Payments",
                accessorKey: "payments",
                cell: function render({ getValue, table }) {
                    const meta = table.options.meta as {
                        paymentsData: GetManyResponse;
                    };

                    const payments = getValue<string[]>()?.map((item) => {
                        return meta.paymentsData?.data?.find(
                            (resourceItems) => resourceItems.id === item,
                        );
                    });

                    return (
                        <ul>
                            {payments?.map((item, index) => (
                                <li key={index}>{item ? item.id : "N/A"}</li>
                            ))}
                        </ul>
                    );
                },
            },
            {
                id: "actions",
                accessorKey: "id",
                header: "Actions",
                cell: function render({ getValue }) {
                    return (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: "4px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    show("vw_booker", getValue() as string);
                                }}
                            >
                                Show
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    edit("vw_booker", getValue() as string);
                                }}
                            >
                                Edit
                            </button>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const { edit, show } = useNavigation();

    const {
        getHeaderGroups,
        getRowModel,
        setOptions,
        refineCore: {
            tableQueryResult: { data: tableData, isError, isLoading },
        },
        getState,
        setPageIndex,
        getCanPreviousPage,
        getPageCount,
        getCanNextPage,
        nextPage,
        previousPage,
        setPageSize,
    } = useTable<TableType<"vw_booker"> & { id: number }>({
        columns,
        refineCoreProps: {
            filters: {
                permanent: [{
                    field: "is_deleted",
                    value: "false",
                    operator: "eq",
                }, {
                    field: "is_confirmed",
                    value: "false",
                    operator: "eq",
                }],
                mode: "server",
            },
        }
    });

    const { data: bookingData } = useMany({
        resource: "bookings",
        ids: tableData?.data?.map((item) => item?.id).filter((id): id is number => id !== null) ?? [],
        queryOptions: {
            enabled: !!tableData?.data,
        },
    });

    const { data: venueData } = useMany({
        resource: "venues",
        ids: tableData?.data?.map((item) => item?.venue_id).filter((id): id is number => id !== null) ?? [],
        queryOptions: {
            enabled: !!tableData?.data,
        },
    });

    const { data: paymentStatusData } = useMany({
        resource: "payment_statuses",
        ids: tableData?.data?.map((item) => item?.payment_status_id).filter((id): id is number => id !== null) ?? [],
        queryOptions: {
            enabled: !!tableData?.data,
        },
    });

    const { data: paymentsData } = useMany({
        resource: "payments",
        ids: tableData?.data?.flatMap((item) =>
            Array.isArray(item?.payments)
                ? item.payments.filter((payment): payment is number => typeof payment === 'number')
                : []
        ) ?? [],
        queryOptions: {
            enabled: !!tableData?.data,
        },
    });

    setOptions((prev) => ({
        ...prev,
        meta: {
            ...prev.meta,
            bookingData,
            venueData,
            paymentStatusData,
            paymentsData,
        },
    }));

    const fuse = useMemo(() => {
        if (!tableData?.data) return null;
        return new Fuse(tableData.data, {
            keys: ['id', 'user_name', 'user_phone_number', 'venue_name', 'booking_status'],
            threshold: 0.3,
        });
    }, [tableData?.data]);

    const filteredData = useMemo(() => {
        if (!tableData?.data) return [];
        let result = tableData.data;

        if (searchTerm && fuse) {
            result = fuse.search(searchTerm).map(item => item.item);
        }

        return result;
    }, [tableData?.data, searchTerm, fuse]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-52">Loading...</div>;
    }

    if (isError) {
        return <div className="flex items-center justify-center h-52">Something went wrong!</div>;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col pb-4 space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <Input
                        placeholder="Search by name, venue, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="md:w-64"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredData.map((row) => (
                    <Card key={row.id} className="flex flex-col overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between text-lg">
                                <span>Booking {row.id || "N/A"}</span>
                                <Badge variant="default">{row.is_confirmed ? 'Confirmed' : 'Pending'}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow pt-2">
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">{row.user_name || "N/A"}</span>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">{row.user_phone_number || "N/A"}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">{row.venue_name || "N/A"}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">
                                        {formatDate(row.created_at || "") || "N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm font-semibold">
                                        {row.total_amount === null ? "Free" : formatCurrency(row.total_amount || 0)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-4 space-x-2 bg-muted/50">
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full"
                                onClick={() => row.id !== null && show("vw_booker", row.id)}
                            >
                                View
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {filteredData.length === 0 && (
                <div className="py-10 text-center">No bookings found matching your criteria.</div>
            )}
            <div className="flex items-center justify-between py-4 mt-4 space-x-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {getState().pagination.pageIndex + 1} of {getPageCount()} page(s)
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageIndex(0)}
                        disabled={!getCanPreviousPage()}
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previousPage()}
                        disabled={!getCanPreviousPage()}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => nextPage()}
                        disabled={!getCanNextPage()}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageIndex(getPageCount() - 1)}
                        disabled={!getCanNextPage()}
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </Button>
                    <span className="flex items-center gap-1">
                        <div>Page</div>
                        <Input
                            className="w-16"
                            type="number"
                            defaultValue={getState().pagination.pageIndex + 1}
                            onChange={(e) => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                setPageIndex(page);
                            }}
                        />
                    </span>
                    <Select
                        value={getState().pagination.pageSize.toString()}
                        onValueChange={(value) => setPageSize(Number(value))}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder={getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={pageSize.toString()}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

const getBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'cancelled':
            return 'destructive';
        default:
            return 'secondary';
    }
};

const capitalizeFirstLetter = (string: string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : "";
};

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
        return format(new Date(dateString), "PPP p");
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
};

const formatCurrency = (amount: number | string) => {
    if (amount === null || amount === undefined) return "N/A";
    const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numericAmount);
};

const getStatusDotColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return 'bg-green-500';
        case 'pending':
            return 'bg-yellow-500';
        case 'cancelled':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
};

const getStatusTooltip = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return 'This booking has been confirmed';
        case 'pending':
            return 'Waiting for confirmation';
        case 'cancelled':
            return 'This booking was cancelled';
        default:
            return 'Status unknown';
    }
};
