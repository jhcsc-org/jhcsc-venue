import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { UpdateItem, getUpdateSummary, getUpdateTitle } from "@/types/updates";
import { useList } from "@refinedev/core";
import { format, isToday } from "date-fns";
import { Bell, Clock, Filter, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

const navItems = [
    { title: "All Updates", icon: Bell, filter: "all" },
    { title: "Unread", icon: MessageSquare, filter: "unread" },
    { title: "Recent", icon: Clock, filter: "recent" },
    { title: "Filtered", icon: Filter, filter: "filtered" },
];

export const UpdatesPage = () => {
    const [activeFilter, setActiveFilter] = useState(navItems[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 500);

    const { data, isLoading } = useList<UpdateItem>({
        resource: "vw_updates",
        sorters: [{ field: "changed_at", order: "desc" }],
        filters: [
            ...(debouncedSearch ? [{
                field: "record_id",
                operator: "contains" as const,
                value: debouncedSearch
            }] : []),
            ...(activeFilter.filter === "recent" ? [{
                field: "changed_at",
                operator: "gte" as const,
                value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }] : [])
        ],
    });

    const updates = useMemo(() => data?.data.map(update => ({
        ...update,
        title: getUpdateTitle(update),
        summary: getUpdateSummary(update),
        isRead: false
    })) ?? [], [data?.data]);

    const filteredUpdates = useMemo(() => {
        return updates.filter(update => {
            if (debouncedSearch && !update.record_id.toString().includes(debouncedSearch)) return false;
            return true;
        });
    }, [updates, debouncedSearch]);

    return (
        <div className="flex-1 col-span-3">
            <div className="space-y-4">
                <Input
                    placeholder="Search by booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-sm"
                />
            </div>
            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-12rem)]">
                    {isLoading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : !filteredUpdates.length ? (
                        <div className="p-4 text-center">No updates found</div>
                    ) : (
                        <div className="divide-y">
                            {filteredUpdates.map((update) => (
                                <button
                                    type="button"
                                    key={update.audit_log_id}
                                    className={cn(
                                        "flex flex-col items-start w-full gap-2 p-4 text-sm leading-tight",
                                        "hover:bg-muted/50 transition-colors",
                                        "focus:outline-none focus:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center w-full gap-2">
                                        <span className="font-medium">
                                            {update.title}
                                        </span>
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {isToday(new Date(update.changed_at))
                                                ? format(new Date(update.changed_at), "HH:mm")
                                                : format(new Date(update.changed_at), "MMM dd")}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-break-spaces">
                                        {update.summary}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </div>
    );
};