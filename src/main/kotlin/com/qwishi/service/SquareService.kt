import androidx.privacysandbox.tools.core.generator.build
import com.qwishi.model.ShiftOpeningRequest
import com.squareup.square.Environment
import com.squareup.square.SquareClient
import com.squareup.square.api.BookingsApi
import com.squareup.square.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class SquareService {
    // IMPORTANT: In production, manage access tokens securely per merchant (OAuth)
    // For this example, we'll simulate having a token.
    private fun getClient(merchantSquareAccessToken: String): SquareClient {
        return SquareClient.Builder()
            .environment(Environment.SANDBOX) // Use SANDBOX for testing
            .accessToken(merchantSquareAccessToken)
            .build()
    }

    suspend fun createShiftAvailability(
        merchantAccessToken: String,
        openingRequest: ShiftOpeningRequest
    ): Result<Availability> {
        return withContext(Dispatchers.IO) {
            try {
                val client = getClient(merchantAccessToken)
                val bookingsApi = client.bookingsApi

                val availabilityRequest = CreateAvailabilityRequest.Builder(
                    Availability.Builder(
                        startAt = openingRequest.startAt,
                        locationId = openingRequest.locationSquareId,
                        appointmentSegments = listOf(
                            AppointmentSegment.Builder()
                                .durationMinutes(
                                    calculateDurationMinutes(
                                        openingRequest.startAt,
                                        openingRequest.endAt
                                    )
                                )
                                .serviceVariationId(openingRequest.serviceVariationSquareId)
                                .teamMemberId(
                                    openingRequest.teamMemberSquareId ?: "ANY_TEAM_MEMBER"
                                ) // Or handle if truly unassigned
                                .build()
                        )
                    ).build()
                ).idempotencyKey(UUID.randomUUID().toString())
                    .build()

                val result = bookingsApi.createAvailability(availabilityRequest)
                if (result.isSuccess) {
                    com.google.android.gms.common.api.Result.success(result.data!!.availability!!)
                } else {
                    com.google.android.gms.common.api.Result.failure(Exception("Square API Error: ${result.errors?.joinToString { it.detail }}"))
                }
            } catch (e: Exception) {
                com.google.android.gms.common.api.Result.failure(e)
            }
        }
    }

    suspend fun bookShift(
        merchantAccessToken: String,
        squareAvailabilityId: String?, // If booking an existing availability
        locationId: String,
        serviceVariationId: String,
        startAt: String, // Required for creating a new booking directly
        customerNote: String?,
        teamMemberIdToBook: String // The team member ID who is filling the shift
    ): Result<Booking> {
        return withContext(Dispatchers.IO) {
            try {
                val client = getClient(merchantAccessToken)
                val bookingsApi = client.bookingsApi

                // For simplicity, we are creating a new booking directly.
                // You could also search for the specific availability and then update it,
                // or if Square's model allows, convert an availability to a booking.
                // Creating a new booking is often more straightforward.

                val booking = Booking.Builder()
                    .locationId(locationId)
                    .startAt(startAt) // Must be precise
                    .appointmentSegments(
                        listOf(
                            AppointmentSegment.Builder()
                                .serviceVariationId(serviceVariationId)
                                .teamMemberId(teamMemberIdToBook)
                                // Duration can be complex if not aligning perfectly with a pre-defined service.
                                // Assuming service variation has a defined duration.
                                .build()
                        )
                    )
                    // .customerId() // Optional: if you have a Square Customer ID for the "employer" or "system"
                    .customerNote(customerNote ?: "Booked via QwiSHi")
                    .build()

                val createBookingRequest = CreateBookingRequest.Builder(booking)
                    .idempotencyKey(UUID.randomUUID().toString())
                    .build()

                val result = bookingsApi.createBooking(createBookingRequest)
                if (result.isSuccess) {
                    // If you were booking against a specific availability, you might want to delete
                    // or mark that availability as filled in your system or via Square API if possible.
                    // For now, creating a new booking is simpler.
                    com.google.android.gms.common.api.Result.success(result.data!!.booking!!)
                } else {
                    com.google.android.gms.common.api.Result.failure(Exception("Square API Error creating booking: ${result.errors?.joinToString { it.detail }}"))
                }

            } catch (e: Exception) {
                com.google.android.gms.common.api.Result.failure(e)
            }
        }
    }

    // Helper to calculate duration (very basic, needs robust date parsing)
    private fun calculateDurationMinutes(start: String, end: String): Int {
        // Basic example, use a proper date/time library for robust parsing and calculation
        try {
            // This is a placeholder. java.time or kotlinx-datetime should be used.
            val startMillis = java.time.OffsetDateTime.parse(start).toInstant().toEpochMilli()
            val endMillis = java.time.OffsetDateTime.parse(end).toInstant().toEpochMilli()
            return ((endMillis - startMillis) / (1000 * 60)).toInt()
        } catch (e: java.lang.Exception) {
            return 60 // Default
        }
    }

    suspend fun retrieveOpenAvailabilities(
        merchantAccessToken: String,
        locationId: String,
        serviceVariationId: String, // Shift type
        startAtRangeBegin: String, // ISO 8601
        startAtRangeEnd: String    // ISO 8601
    ): Result<List<Availability>> {
        return withContext(Dispatchers.IO) {
            try {
                val client = getClient(merchantAccessToken)
                val bookingsApi = client.bookingsApi

                val searchAvailabilityRequest = SearchAvailabilityRequest.Builder(
                    SearchAvailabilityQuery.Builder(
                        SearchAvailabilityFilter.Builder(
                            startAtRange = TimeRange.Builder()
                                .startAt(startAtRangeBegin)
                                .endAt(startAtRangeEnd)
                                .build()
                        )
                            .locationId(locationId)
                            .addAppointmentSegments( // Search for segments matching our shift type
                                AppointmentSegmentFilter.Builder()
                                    .serviceVariationIdFilter(
                                        ServiceVariationIdFilter.Builder()
                                            .any(listOf(serviceVariationId))
                                            .build()
                                    )
                                    .build()
                            )
                            .build()
                    ).build()
                ).build()

                val result = bookingsApi.searchAvailability(searchAvailabilityRequest)
                if (result.isSuccess) {
                    com.google.android.gms.common.api.Result.success(result.data?.availabilities ?: java.util.Collections.emptyList())
                } else {
                    com.google.android.gms.common.api.Result.failure(Exception("Square API Error searching availability: ${result.errors?.joinToString { it.detail }}"))
                }
            } catch (e: Exception) {
                com.google.android.gms.common.api.Result.failure(e)
            }
        }
    }
}