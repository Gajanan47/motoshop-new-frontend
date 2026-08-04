// Spec fields differ by vehicle type — a 2-wheeler's headline specs (seat height,
// kerb weight) aren't relevant to a 4-wheeler (seating capacity, boot space), and
// vice versa. Keeping this in one shared file means the admin form and the
// ProductDetails page can never drift out of sync on labels/units.

const TWO_WHEELER_SPECS = [
  { key: "mileage", label: "Mileage", unit: "kmpl", type: "number" },
  { key: "transmission", label: "Transmission", type: "text", placeholder: "e.g. 5-Speed Manual" },
  { key: "kerbWeight", label: "Kerb Weight", unit: "kg", type: "number" },
  { key: "seatHeight", label: "Seat Height", unit: "mm", type: "number" },
  { key: "groundClearance", label: "Ground Clearance", unit: "mm", type: "number" },
  { key: "fuelCapacity", label: "Fuel Tank Capacity", unit: "L", type: "number" },
  { key: "brakes", label: "Brakes (F/R)", type: "text", placeholder: "e.g. Disc / Disc" },
]

const FOUR_WHEELER_SPECS = [
  { key: "mileage", label: "Mileage", unit: "kmpl", type: "number" },
  { key: "transmission", label: "Transmission", type: "text", placeholder: "e.g. Automatic (CVT)" },
  { key: "seatingCapacity", label: "Seating Capacity", type: "number", placeholder: "e.g. 5" },
  { key: "bootSpace", label: "Boot Space", unit: "L", type: "number" },
  { key: "airbags", label: "Airbags", type: "number" },
  { key: "safetyRating", label: "Safety Rating", type: "text", placeholder: "e.g. 5-Star GNCAP" },
]

export function getSpecFields(type) {
  return String(type) === "4" ? FOUR_WHEELER_SPECS : TWO_WHEELER_SPECS
}