import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "@/utils/debounce";
import { BaseRecord, useTable } from "@refinedev/core";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import 'react-lazy-load-image-component/src/effects/blur.css';
import VenueCard from "./components/venue-card";
import { useVenueFilter } from "./hooks/useVenueFilter";
import { venueAllQuery } from "./utils/venue-query";
import { TVenueAllQuery } from "./utils/venue-query.types";

interface VenueListFilterProps {
    filters: ReturnType<typeof useVenueFilter>["filters"] & { search: string };
    venueTypes: ReturnType<typeof useVenueFilter>["venueTypes"];
    handlers: ReturnType<typeof useVenueFilter>["handlers"] & { handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void };
}

const VenueListFilter = React.memo(({ filters, venueTypes, handlers }: VenueListFilterProps) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        const debouncedCheck = debounce(checkMobile, 250);

        checkMobile();
        window.addEventListener('resize', debouncedCheck);
        return () => {
            window.removeEventListener('resize', debouncedCheck);
            debouncedCheck.cancel();
        };
    }, []);

    return (
        <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col items-start justify-start gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 w-full">
                    <Input
                        placeholder="Search Venues"
                        value={filters.search}
                        onChange={handlers.handleSearch}
                        className="w-full pl-10 md:w-64"
                    />
                    <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                </div>
                <div className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handlers.toggleSortOrder}
                    >
                        {filters.sortOrder === "asc" ? (
                            <div className="flex items-center justify-center">
                                <ArrowUp className="w-4 h-4 mr-1" />
                                <span>Sort Ascending</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <ArrowDown className="w-4 h-4 mr-1" />
                                <span>Sort Descending</span>
                            </div>
                        )}
                    </Button>
                    <Select value={filters.sortField} onValueChange={handlers.handleSortChange}>
                        <SelectTrigger className="min-w-44">
                            Sort By: {filters.sortField}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                            <SelectItem value="rate">Rate</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.priceFilter} onValueChange={handlers.handlePriceFilterChange}>
                        <SelectTrigger className="w-full">
                            Price: {filters.priceFilter}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                {isMobile ? (
                    <Select
                        value={filters.venueTypeFilter}
                        onValueChange={(value) => handlers.handleVenueTypeFilterChange(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select venue types" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                            <SelectItem value="all">All</SelectItem>
                            {venueTypes?.data.map((type: BaseRecord) => (
                                <SelectItem key={type.id} value={type.id as string}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="flex flex-row flex-wrap gap-2 pl-4">
                            <Button
                                variant={filters.venueTypeFilter === "all" ? "default" : "outline"}
                                onClick={() => handlers.handleVenueTypeFilterChange("all")}
                                className="whitespace-nowrap"
                                size="sm"
                            >
                                All
                            </Button>
                            {venueTypes?.data.map((type: BaseRecord, index: number) => (
                                <Button
                                    key={index}
                                    variant={filters.venueTypeFilter === type.id ? "default" : "outline"}
                                    onClick={() => handlers.handleVenueTypeFilterChange(type.id as string)}
                                    className="whitespace-nowrap"
                                    size="sm"
                                >
                                    {type.name}
                                </Button>
                            ))}
                        </CarouselContent>
                    </Carousel>
                )}
            </div>
        </div>
    );
});

const VenueList: React.FC = () => {
    const [searchValue, setSearchValue] = useState("");

    const { tableQuery, setFilters, setSorters, setCurrent, setPageSize, current, pageSize } = useTable<TVenueAllQuery>({
        resource: "venues",
        initialSorter: [{ field: "name", order: "asc" }],
        meta: {
            select: venueAllQuery
        },
        pagination: {
            mode: "server",
            current: 1,
            pageSize: 9,
        },
        sorters: {
            mode: "server",
        },
        filters: {
            mode: "server",
            initial: [
                {
                    field: "name",
                    operator: "contains",
                    value: "",
                },
                {
                    field: "location",
                    operator: "contains",
                    value: "",
                },
                {
                    field: "is_paid",
                    operator: "eq",
                    value: undefined,
                },
                {
                    field: "venue_type_id",
                    operator: "eq",
                    value: undefined,
                },
            ],
        },
        queryOptions: {
            keepPreviousData: true,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        },
    });

    const { filters, venueTypes, handlers: baseHandlers } = useVenueFilter();

    const filtersRef = useRef(filters);

    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    useEffect(() => {
        setSorters([{ field: filters.sortField, order: filters.sortOrder }]);
        setFilters([
            { field: "name", operator: "contains", value: searchValue },
            { field: "location", operator: "contains", value: searchValue },
            { field: "is_paid", operator: "eq", value: filters.priceFilter === "all" ? undefined : filters.priceFilter === "paid" },
            { field: "venue_type_id", operator: "eq", value: filters.venueTypeFilter === "all" ? undefined : filters.venueTypeFilter },
        ]);
    }, [filters.sortField, filters.sortOrder, filters.priceFilter, filters.venueTypeFilter, searchValue, setFilters, setSorters]);

    const handlePageChange = useCallback((newPage: number) => {
        const maxPage = Math.ceil((tableQuery.data?.total ?? 0) / pageSize);
        if (newPage >= 1 && newPage <= maxPage) {
            setCurrent(newPage);
        }
    }, [setCurrent, tableQuery.data?.total, pageSize]);

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize);
        setCurrent(1);
    }, [setPageSize, setCurrent]);

    const renderVenueCards = useCallback(() =>
        (tableQuery.data?.data ?? []).map((venue) => (
            <VenueCard
                key={venue.id}
                data={venue}
                className="col-span-3 sm:col-span-2 md:col-span-1"
            />
        )),
        [tableQuery.data?.data]);

    const debouncedSearch = useRef(
        debounce((value: string) => {
            setFilters([
                { field: "name", operator: "contains", value },
                { field: "location", operator: "contains", value },
                {
                    field: "is_paid",
                    operator: "eq",
                    value: filtersRef.current.priceFilter === "all" ? undefined : filtersRef.current.priceFilter === "paid"
                },
                {
                    field: "venue_type_id",
                    operator: "eq",
                    value: filtersRef.current.venueTypeFilter === "all" ? undefined : filtersRef.current.venueTypeFilter
                },
            ]);
        }, 300)
    ).current;

    const handlers = useMemo(() => ({
        ...baseHandlers,
        handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchValue(value);
            debouncedSearch(value);
        },
    }), [baseHandlers, debouncedSearch]);

    const memoizedFilters = useMemo(() => ({
        ...filters,
        search: searchValue
    }), [filters, searchValue]);

    return (
        <div className="flex flex-col gap-4">
            <VenueListFilter
                filters={memoizedFilters}
                venueTypes={venueTypes}
                handlers={handlers}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(tableQuery.isFetching || tableQuery.isLoading) ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="w-full h-48" />
                    ))
                ) : renderVenueCards()}
            </div>
            <div className="flex flex-col items-center justify-between gap-3 mt-4 sm:flex-row">
                <div className="flex flex-row items-center justify-center w-full gap-2 sm:w-auto sm:justify-start">
                    <Button
                        onClick={() => handlePageChange(current - 1)}
                        disabled={current === 1}
                        className="w-24"
                    >
                        Previous
                    </Button>
                    <Badge variant="outline" className="min-h-full px-4 rounded-md">Page {current}</Badge>
                    <Button
                        onClick={() => handlePageChange(current + 1)}
                        disabled={current === Math.ceil((tableQuery.data?.total ?? 0) / pageSize)}
                        className="w-24"
                    >
                        Next
                    </Button>
                </div>
                <Select
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                    <SelectTrigger className="w-full sm:w-[150px]">
                        {`${pageSize} per page`}
                    </SelectTrigger>
                    <SelectContent className="w-full sm:w-auto">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default VenueList;
