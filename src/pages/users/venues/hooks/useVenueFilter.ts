import { useList } from "@refinedev/core";
import { useCallback, useMemo, useState } from "react";

export function useVenueFilter() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [venueTypeFilter, setVenueTypeFilter] = useState<string>("all");

  const { data: venueTypes } = useList({
    resource: "venue_types",
    pagination: { mode: "off" },
  });

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortField(value);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const handlePriceFilterChange = useCallback((value: "all" | "free" | "paid") => {
    setPriceFilter(value);
  }, []);

  const handleVenueTypeFilterChange = useCallback((value: string) => {
    setVenueTypeFilter(value);
  }, []);

  const filters = useMemo(() => ({
    search,
    sortField,
    sortOrder,
    priceFilter,
    venueTypeFilter,
  }), [search, sortField, sortOrder, priceFilter, venueTypeFilter]);

  const handlers = useMemo(() => ({
    handleSearch,
    handleSortChange,
    toggleSortOrder,
    handlePriceFilterChange,
    handleVenueTypeFilterChange,
  }), [handleSearch, handleSortChange, toggleSortOrder, handlePriceFilterChange, handleVenueTypeFilterChange]);

  return {
    filters,
    venueTypes,
    handlers,
  };
}