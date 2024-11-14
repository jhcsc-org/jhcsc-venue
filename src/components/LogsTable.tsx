
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingLog, getStatusColor } from "@/types/logs";
import { format, isToday } from "date-fns";

interface LogsTableProps {
    logs?: BookingLog[];
    isLoading?: boolean;
    setSelectedBooking: (log: BookingLog) => void;
}

export const LogsTable = ({ logs, isLoading, setSelectedBooking }: LogsTableProps) => {
    if (isLoading) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
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
                        <TableHead>Venue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Confirmation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!logs?.length ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center">
                                No records found
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow
                                key={log.booking_id}
                                className="transition-colors cursor-pointer hover:bg-muted/50"
                                onClick={() => setSelectedBooking(log)}
                            >
                                <TableCell className="whitespace-nowrap">
                                    {isToday(new Date(log.created_at))
                                        ? format(new Date(log.created_at), "HH:mm")
                                        : format(new Date(log.created_at), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell>{log.venue_name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getStatusColor(log.payment_status, log.is_confirmed)}>
                                        {log.payment_status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {log.total_amount.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'PHP'
                                    })}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={log.is_confirmed ? "default" : "secondary"}>
                                        {log.is_confirmed ? "Confirmed" : "Pending"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};