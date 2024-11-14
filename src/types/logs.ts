export interface Payment {
    payment_id: number;
    amount: number;
    payment_mode_id: number;
    payment_date: string;
    is_down_payment: boolean;
    confirmation_status: boolean;
    transaction_reference: string | null;
    currency_code: string;
}

export interface BookingLog {
    booking_id: number;
    user_id: string;
    user_name: string;
    venue_id: number;
    venue_name: string;
    payment_status_id: number;
    payment_status: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    is_confirmed: boolean;
    payments: Payment[];
}

export const getStatusColor = (status: string, isConfirmed: boolean) => {
    if (!isConfirmed) return "bg-yellow-500";
    switch (status.toLowerCase()) {
        case "paid": return "bg-green-500";
        case "free": return "bg-blue-500";
        case "pending": return "bg-orange-500";
        default: return "bg-gray-500";
    }
};

export interface BookingUpdate {
    audit_log_id: number;
    table_name: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    record_id: number;
    changed_data: {
        id: number;
        user_id: string;
        venue_id: number;
        payment_status_id: number;
        total_amount: number;
        created_at: string;
        updated_at: string;
        is_deleted: boolean;
        is_confirmed: boolean;
    };
    changed_by: string | null;
    changed_at: string;
}

export const getOperationColor = (operation: string) => {
    switch (operation.toUpperCase()) {
        case 'INSERT': return "bg-green-500";
        case 'UPDATE': return "bg-blue-500";
        case 'DELETE': return "bg-red-500";
        default: return "bg-gray-500";
    }
};