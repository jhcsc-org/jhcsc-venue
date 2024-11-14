import { TableType } from "@/types/dev.types";

export interface TVenueQuery extends TableType<"venues"> {
    venue_types: Pick<TableType<"venue_types">, "name">;
    lgu: Pick<TableType<"lgu">, "name" | "contact_info" | "address">;
    profiles: Pick<TableType<"profiles">, "name" | "phone_number" | "affiliation">;
    venue_amenities: {
        amenities: Pick<TableType<"amenities">, "id" | "name">;
    }[];
}

export interface TVenueAllQuery extends Pick<TableType<"venues">, "id" | "name" | "location" | "is_paid" | "rate" | "venue_photo"> {
    venue_types: Pick<TableType<"venue_types">, "name">;
}
