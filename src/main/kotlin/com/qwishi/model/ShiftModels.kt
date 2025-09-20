import kotlinx.serialization.Serializable

// --- QwiSHi Specific Models for API Requests/Responses ---

@Serializable
data class ShiftOpeningRequest(
    val companyId: String, // Your internal QwiSHi company ID
    val locationSquareId: String, // Square Location ID
    val serviceVariationSquareId: String, // Square Service Variation ID representing the shift type/role
    val teamMemberSquareId: String?, // Optional: If pre-assigning or if it's a specific team member's availability
    val startAt: String, // ISO 8601 DateTime string (e.g., "2024-03-15T09:00:00Z")
    val endAt: String,   // ISO 8601 DateTime string (e.g., "2024-03-15T17:00:00Z")
    val notes: String? = null
)

@Serializable
data class ShiftOpeningResponse(
    val qwishiOpeningId: String, // Your internal ID for this opening
    val squareAvailabilityId: String?, // ID from Square's Availability
    val squareBookingId: String?,    // ID from Square if booked immediately
    val companyId: String,
    val locationSquareId: String,
    val serviceVariationSquareId: String, val teamMemberSquareId: String?,
    val startAt: String,
    val endAt: String,
    val status: String, // e.g., "OPEN", "FILLED"
    val notes: String? = null
)

@Serializable
data class FillShiftRequest(
    val employeeQwishiId: String,    // QwiSHi ID of the employee filling the shift
    val employeeSquareTeamMemberId: String, // Square Team Member ID of the employee
    val customerNote: String? = "Shift filled by QwiSHi app." // Note for the Square Booking
)

// --- Internal Models (you might expand these) ---
// data class Company(val id: String, val name: String, val squareMerchantId: String, var squareAccessToken: String?)
// data class Employee(val id: String, val name: String, val squareTeamMemberId: String?)