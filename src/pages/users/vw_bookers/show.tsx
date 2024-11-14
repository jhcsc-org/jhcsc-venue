import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BaseKey, useDelete, useNavigation, useShow } from "@refinedev/core";
import { format, parseISO } from "date-fns";
import {
    Building,
    Calendar,
    ChevronLeft,
    Clock,
    DollarSign,
    MapPin,
    Phone,
    User,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

// Type Definitions
type BookingSchedule = {
    booking_schedule_id: number;
    date: string;
    start_time: string;
    end_time: string;
};

type Payment = {
    payment_id: number;
    amount: number;
    payment_mode_id: number;
    payment_mode: string;
    payment_date: string;
    is_down_payment: boolean;
    confirmation_status: boolean;
    transaction_reference: string | null;
    currency_code: string;
};

type VwBooker = {
    id: number;
    user_id: string;
    user_name: string;
    user_phone_number: string;
    user_affiliation: string | null;
    venue_id: number;
    venue_name: string;
    venue_location: string;
    venue_photo: string | null;
    manager_id: string;
    manager_name: string;
    payment_status_id: number;
    payment_status: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    is_confirmed: boolean;
    booking_schedules: BookingSchedule[];
    payments: Payment[];
};

// Main Component
export const RequestedShow: React.FC = () => {
    const { query } = useShow<VwBooker>();
    const { data, isLoading } = query;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const { mutate: deleteBooking } = useDelete();
    const navigate = useNavigation();

    const handleDelete = () => {
        toast.promise(
            Promise.all([
                new Promise((resolve, reject) => {
                    deleteBooking(
                        {
                            resource: "bookings",
                            id: data?.data?.id as BaseKey,
                        },
                        {
                            onSuccess: () => {
                                setIsDeleteDialogOpen(false);
                                navigate.replace("/booked/all");
                                resolve("Success");
                            },
                            onError: (error) => {
                                reject(error);
                            },
                        }
                    );
                }),
                // Artificial delay of 1 second
                new Promise((resolve) => setTimeout(resolve, 1000))
            ]).then(() => "Success"),
            {
                loading: "Cancelling booking...",
                success: "Booking cancelled successfully",
                error: "Failed to cancel booking",
            }
        );
    };

    const record = data?.data;

    if (isLoading) {
        return <BookingShowSkeleton />;
    }

    if (!record) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-500">No booking data found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate.goBack()}>
                        <ChevronLeft className="w-6 h-6 text-primary-500" />
                    </Button>
                    <CardTitle className="text-xl font-semibold">Booking Details</CardTitle>
                </div>
                <Badge variant="default" className={cn(getBadgeVariant(String(record.is_confirmed)), "text-sm")}>
                    {record.is_confirmed ? 'Confirmed' : 'Pending'}
                </Badge>
            </div>
            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <InfoItem
                            icon={<User className="w-5 h-5 text-gray-500" />}
                            label="Booking ID"
                            value={`#${record.id}`}
                        />
                        <InfoItem
                            icon={<Clock className="w-5 h-5 text-gray-500" />}
                            label="Requested At"
                            value={formatDate(record.created_at)}
                        />
                        <InfoItem
                            icon={<DollarSign className="w-5 h-5 text-gray-500" />}
                            label="Total Amount"
                            value={record.total_amount <= 0 ? "Free" : formatCurrency(record.total_amount)}
                        />
                        <InfoItem
                            icon={<MapPin className="w-5 h-5 text-gray-500" />}
                            label="Venue Location"
                            value={record.venue_location}
                        />
                    </div>
                </div>
            </Card>

            {/* User and Venue Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* User Information */}
                <Section title="User Information">
                    <div className="space-y-4">
                        <InfoItem
                            icon={<User className="w-5 h-5 text-gray-500" />}
                            label="Name"
                            value={record.user_name}
                        />
                        <InfoItem
                            icon={<Phone className="w-5 h-5 text-gray-500" />}
                            label="Phone"
                            value={record.user_phone_number}
                        />
                        {record.user_affiliation && (
                            <InfoItem
                                icon={<Building className="w-5 h-5 text-gray-500" />}
                                label="Affiliation"
                                value={record.user_affiliation}
                            />
                        )}
                    </div>
                </Section>

                {/* Venue Information */}
                <Section title="Venue Information">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-md">
                                <Building className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{record.venue_name}</h3>
                                <p className="text-sm text-gray-600">{record.venue_location}</p>
                            </div>
                        </div>
                        <InfoItem
                            icon={<User className="w-5 h-5 text-gray-500" />}
                            label="Manager"
                            value={record.manager_name}
                        />
                        <InfoItem
                            icon={<Building className="w-5 h-5 text-gray-500" />}
                            label="Affiliation"
                            value={record.user_affiliation || "N/A"}
                        />
                    </div>
                </Section>
            </div>

            {/* Booking Schedule */}
            <Section title="Booking Schedule">
                {record.booking_schedules.length > 0 ? (
                    <div className="space-y-3">
                        {record.booking_schedules.map((schedule) => (
                            <Card key={schedule.booking_schedule_id} className="p-4 shadow-sm">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-primary-500" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {format(parseISO(schedule.date), "MMMM d, yyyy")}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No schedules available.</p>
                )}
            </Section>

            {/* Payment Information */}
            <Section title="Payment Information">
                <div className="space-y-6">
                    {/* Payment Summary Card */}
                    <Card className="bg-muted/30">
                        <CardContent className="p-6">
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Total Amount</span>
                                    <p className="text-2xl font-bold">{formatCurrency(record.total_amount)}</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Total Paid</span>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(record.payments.reduce((sum, payment) =>
                                            sum + (payment.confirmation_status ? payment.amount : 0), 0
                                        ))}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <div>
                                        <Badge
                                            variant={getBadgeVariant(record.payment_status)}
                                            className="px-3 py-1 text-sm"
                                        >
                                            {capitalizeFirstLetter(record.payment_status)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    {record.payments.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-medium">Payment History</CardTitle>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-sm font-medium text-left">Date</th>
                                            <th className="px-4 py-3 text-sm font-medium text-left">Payment Mode</th>
                                            <th className="px-4 py-3 text-sm font-medium text-left">Reference</th>
                                            <th className="px-4 py-3 text-sm font-medium text-right">Amount</th>
                                            <th className="px-4 py-3 text-sm font-medium text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {record.payments.map((payment) => (
                                            <tr key={payment.payment_id} className="transition-colors bg-card hover:bg-muted/50">
                                                <td className="px-4 py-3 text-sm">
                                                    {format(parseISO(payment.payment_date), "MMM d, yyyy")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <DollarSign className="w-4 h-4 text-primary-500" />
                                                        <span className="text-sm font-medium">{payment.payment_mode}</span>
                                                        {payment.is_down_payment && (
                                                            <Badge variant="secondary" className="text-xs">Down Payment</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {payment.transaction_reference || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-right">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Badge
                                                        variant={payment.confirmation_status ? "default" : "secondary"}
                                                        className="text-xs"
                                                    >
                                                        {payment.confirmation_status ? "Confirmed" : "Pending"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-6">
                            <div className="text-center text-muted-foreground">
                                <p>No payment records found.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </Section>

            {!record.is_confirmed ? (
                <>
                    <div className="flex justify-end w-full space-x-4">
                        <Button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            variant="destructive"
                            className="flex items-center w-full space-x-2"
                        >
                            <Clock className="w-5 h-5" />
                            <span>Cancel Booking</span>
                        </Button>
                    </div>

                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Cancel Booking</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to cancel this booking? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            ) : null}
        </div>
    );
};

// Reusable Section Component
const Section: React.FC<{ title: string; children: React.ReactNode }> = React.memo(
    ({ title, children }) => (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
);

// Reusable InfoItem Component
const InfoItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}> = React.memo(({ icon, label, value }) => (
    <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm font-medium text-gray-500">{label}:</span>
        <span className="text-sm">{value}</span>
    </div>
));

// Skeleton Loader Component
const BookingShowSkeleton: React.FC = () => {
    return (
        <Card className="p-6">
            <div className="space-y-4 animate-pulse">
                <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 rounded-full bg-muted-foreground" />
                    <div className="w-1/3 h-6 rounded bg-muted-foreground" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-muted-foreground" />
                        <div className="w-1/2 h-4 rounded bg-muted-foreground" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-muted-foreground" />
                        <div className="w-1/2 h-4 rounded bg-muted-foreground" />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground" />
                    <div className="w-1/2 h-4 rounded bg-muted-foreground" />
                </div>
            </div>
        </Card>
    );
};

const getBadgeVariant = (
    status: string
): "default" | "secondary" => {
    if (status === "true") {
        return "default";
    }
    return "secondary";
};

const capitalizeFirstLetter = (string: string): string => {
    return string
        ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
        : "";
};

const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
        return format(parseISO(dateString), "PPpp");
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
};

const formatTime = (timeString: string): string => {
    if (!timeString) return "N/A";
    try {
        return format(parseISO(`1970-01-01T${timeString}Z`), "hh:mm a");
    } catch (error) {
        console.error("Error formatting time:", error);
        return "Invalid Time";
    }
};

const formatDateTimeRange = (schedule: BookingSchedule): string => {
    const date = parseISO(schedule.date);
    return `${format(date, "MMMM d, yyyy")} | ${formatTime(
        schedule.start_time
    )} - ${formatTime(schedule.end_time)}`;
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
