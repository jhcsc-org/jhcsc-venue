
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingUpdate, getOperationColor } from "@/types/logs";
import { format, isToday } from "date-fns";

interface UpdatesTableProps {
    updates?: BookingUpdate[];
    isLoading?: boolean;
}

export const UpdatesTable = ({ updates, isLoading }: UpdatesTableProps) => {
    if (isLoading) {
        return (
            <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                    Loading...
                </TableCell>
            </TableRow>
        );
    }

    return (
        <div className="overflow-hidden border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Operation</TableHead>
                        <TableHead>Status Changes</TableHead>
                        <TableHead>Booking ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!updates?.length ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center">
                                No updates found
                            </TableCell>
                        </TableRow>
                    ) : (
                        updates.map((update) => (
                            <TableRow
                                key={update.audit_log_id}
                                className="transition-colors hover:bg-muted/50"
                            >
                                <TableCell className="whitespace-nowrap">
                                    {isToday(new Date(update.changed_at))
                                        ? format(new Date(update.changed_at), "HH:mm")
                                        : format(new Date(update.changed_at), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getOperationColor(update.operation)}>
                                        {update.operation}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {update.changed_data.is_confirmed ? (
                                        <Badge variant="default">Confirmed</Badge>
                                    ) : update.changed_data.is_deleted ? (
                                        <Badge variant="destructive">Cancelled</Badge>
                                    ) : (
                                        <Badge variant="secondary">Pending</Badge>
                                    )}
                                </TableCell>
                                <TableCell>#{update.record_id}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};