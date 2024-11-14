export const venueQuery =
`
*,
venue_types (
    name
),
lgu(
    name,
    contact_info,
    address
),
profiles(
name, 
    phone_number, 
    affiliation
),
venue_amenities (
    amenities (
        id,
        name
    )
)
`

export const venueAllQuery =
`
*,
venue_types (
    name
)
`