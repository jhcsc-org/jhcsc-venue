import { BookingUpdate } from "./logs";

export interface UpdateItem extends BookingUpdate {
    title: string;
    summary: string;
    isRead: boolean;
}

export const getUpdateTitle = (update: BookingUpdate): string => {
    if (update.operation === 'INSERT') return 'New Booking';
    if (update.operation === 'DELETE') return 'Booking Removed';

    const { is_confirmed, is_deleted } = update.changed_data;
    if (is_deleted) return 'Booking Cancelled';
    if (is_confirmed) return 'Booking Confirmed';
    return 'Booking Updated';
};

export const getUpdateSummary = (update: BookingUpdate): string => {
    const bookingRef = `Booking #${update.record_id}`;

    if (update.operation === 'INSERT') return `${bookingRef} has been created`;
    if (update.operation === 'DELETE') return `${bookingRef} has been permanently removed`;

    const { is_confirmed, is_deleted } = update.changed_data;
    if (is_deleted && is_confirmed) return `${bookingRef} has been cancelled after confirmation`;
    if (is_deleted) return `${bookingRef} has been cancelled`;
    if (is_confirmed) return `${bookingRef} has been confirmed`;

    return `${bookingRef} details have been updated`;
};