import androidx.compose.animation.core.copy
import androidx.core.graphics.values
import com.qwishi.model.FillShiftRequest
import com.qwishi.model.ShiftOpeningRequest
import com.qwishi.model.ShiftOpeningResponse
import com.qwishi.service.SquareService
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import java.util.UUID

// Placeholder for fetching merchant's Square access token
// In a real app, this would come from your secure store after OAuth
fun getMerchantAccessTokenForCompany(companyId: String): String? {
    // SIMULATION: Replace with actual token retrieval logic
    if (companyId == "company_123") {
        return java.lang.System.getenv("SQUARE_SANDBOX_ACCESS_TOKEN_COMPANY_123") // Store this as env var
    }
    return null
}

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }

    val squareService = SquareService()

    // In-memory store for QwiSHi openings (Replace with DB in production)
    val qwishiOpeningsDb = mutableMapOf<String, ShiftOpeningResponse>()

    routing {
        // --- API Documentation Route (Static or generated) ---
        java.nio.file.Paths.get("/") {
            call.respondText(
                """
                QwiSHi API Documentation (Simplified)
                --------------------------------------
                POST   /openings                 - Create a new shift opening
                GET    /openings?companyId=...   - List open shifts for a company
                POST   /openings/{openingId}/fill - Fill a shift opening
                """.trimIndent(),
                androidx.compose.ui.autofill.ContentType.Text.Plain
            )
        }

        // --- Shift Opening Routes ---
        route("/openings") {
            // POST /openings - Create a new shift opening
            post {
                val openingRequest = call.receive<ShiftOpeningRequest>()

                val merchantToken = getMerchantAccessTokenForCompany(openingRequest.companyId)
                if (merchantToken == null) {
                    call.respond(
                        HttpStatusCode.Unauthorized,
                        "Invalid company or missing Square token."
                    )
                    return@post
                }

                // 1. Create Availability in Square
                val availabilityResult =
                    squareService.createShiftAvailability(merchantToken, openingRequest)

                availabilityResult.fold(
                    onSuccess = { squareAvailability ->
                        val qwishiOpeningId = UUID.randomUUID().toString()
                        val response = ShiftOpeningResponse(
                            qwishiOpeningId = qwishiOpeningId,
                            squareAvailabilityId = squareAvailability.id,
                            squareBookingId = null, // Not booked yet
                            companyId = openingRequest.companyId,
                            locationSquareId = openingRequest.locationSquareId,
                            serviceVariationSquareId = openingRequest.serviceVariationSquareId,
                            teamMemberSquareId = openingRequest.teamMemberSquareId,
                            startAt = squareAvailability.startAt ?: openingRequest.startAt,
                            endAt = openingRequest.endAt, // Availability might not return endAt directly
                            status = "OPEN",
                            notes = openingRequest.notes
                        )
                        qwishiOpeningsDb[qwishiOpeningId] = response // Store in our "DB"
                        call.respond(HttpStatusCode.Created, response)
                    },
                    onFailure = { error ->
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            "Failed to create Square availability: ${error.message}"
                        )
                    }
                )
            }

            // GET /openings?companyId=...&locationSquareId=...&serviceVariationSquareId=...&startAt=...&endAt=...
            java.nio.file.Paths.get {
                val companyId = call.request.queryParameters["companyId"]
                val locationId = call.request.queryParameters["locationSquareId"]
                val serviceId = call.request.queryParameters["serviceVariationSquareId"]
                val rangeStart =
                    call.request.queryParameters["startAt"] // e.g., 2024-03-01T00:00:00Z
                val rangeEnd =
                    call.request.queryParameters["endAt"]     // e.g., 2024-03-31T23:59:59Z


                if (companyId == null || locationId == null || serviceId == null || rangeStart == null || rangeEnd == null) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        "Missing query parameters: companyId, locationSquareId, serviceVariationSquareId, startAt, endAt are required."
                    )
                    return@get
                }

                val merchantToken = getMerchantAccessTokenForCompany(companyId)
                if (merchantToken == null) {
                    call.respond(
                        HttpStatusCode.Unauthorized,
                        "Invalid company or missing Square token."
                    )
                    return@get
                }

                val searchResult = squareService.retrieveOpenAvailabilities(
                    merchantToken,
                    locationId,
                    serviceId,
                    rangeStart,
                    rangeEnd
                )
                searchResult.fold(
                    onSuccess = { availabilities ->
                        // Map Square Availabilities to QwiSHiOpeningResponse
                        // This is a simplified mapping. You'd need to cross-reference with your
                        // qwishiOpeningsDb to see if they are already tracked or considered "FILLED"
                        // by a QwiSHi booking. For now, we just list what Square says is available.
                        val response = availabilities.mapNotNull { av ->
                            // Find if this availability corresponds to an existing QwiSHi opening
                            val existingQwishiOpening =
                                qwishiOpeningsDb.values.find { it.squareAvailabilityId == av.id && it.status == "OPEN" }
                            if (existingQwishiOpening != null) {
                                existingQwishiOpening // Return existing QwiSHi opening if found and open
                            } else if (qwishiOpeningsDb.values.none { it.squareAvailabilityId == av.id }) {
                                // If not tracked by QwiSHi yet, create a representation.
                                // This scenario means an availability exists in Square but not in QwiSHi's cache.
                                // You might want to sync this or handle it differently.
                                // For simplicity, we'll create a temporary representation if not filled by QwiSHi.
                                // A more robust system would involve checking if a corresponding booking exists in Square.
                                ShiftOpeningResponse(
                                    qwishiOpeningId = "square_av_${av.id}", // Temporary ID
                                    squareAvailabilityId = av.id,
                                    squareBookingId = null,
                                    companyId = companyId,
                                    locationSquareId = av.locationId ?: locationId,
                                    serviceVariationSquareId = av.appointmentSegments?.firstOrNull()?.serviceVariationId
                                        ?: serviceId,
                                    teamMemberSquareId = av.appointmentSegments?.firstOrNull()?.teamMemberId,
                                    startAt = av.startAt ?: "",
                                    endAt = "", // Square Availability search doesn't always provide a clear end time for the slot
                                    status = "OPEN",
                                    notes = null
                                )
                            } else {
                                null // It's tracked by QwiSHi but already filled, or some other state
                            }
                        }
                        call.respond(HttpStatusCode.OK, response)
                    },
                    onFailure = { error ->
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            "Failed to retrieve openings: ${error.message}"
                        )
                    }
                )
            }

            // POST /openings/{openingId}/fill - Mark a shift as filled by creating a booking
            post("/{openingId}/fill") {
                val openingId = call.parameters["openingId"]
                val fillRequest = call.receive<FillShiftRequest>()

                val qwishiOpening = qwishiOpeningsDb[openingId]
                if (qwishiOpening == null || qwishiOpening.status == "FILLED") {
                    call.respond(HttpStatusCode.NotFound, "Opening not found or already filled.")
                    return@post
                }

                val merchantToken = getMerchantAccessTokenForCompany(qwishiOpening.companyId)
                if (merchantToken == null) {
                    call.respond(
                        HttpStatusCode.Unauthorized,
                        "Invalid company or missing Square token."
                    )
                    return@post
                }

                // Create a booking in Square
                val bookingResult = squareService.bookShift(
                    merchantAccessToken = merchantToken,
                    squareAvailabilityId = qwishiOpening.squareAvailabilityId, // Can be null if we are booking directly
                    locationId = qwishiOpening.locationSquareId,
                    serviceVariationId = qwishiOpening.serviceVariationSquareId,
                    startAt = qwishiOpening.startAt, // Important: Use the original start time
                    customerNote = fillRequest.customerNote,
                    teamMemberIdToBook = fillRequest.employeeSquareTeamMemberId
                )

                bookingResult.fold(
                    onSuccess = { squareBooking ->
                        // Update our internal QwiSHi opening status
                        val updatedOpening = qwishiOpening.copy(
                            status = "FILLED",
                            squareBookingId = squareBooking.id
                            // Potentially update teamMemberSquareId if it wasn't set before
                        )
                        qwishiOpeningsDb[openingId] = updatedOpening
                        call.respond(HttpStatusCode.OK, updatedOpening)

                        // TODO: Potentially delete the original Square Availability if it's now fully booked
                        // This depends on whether one availability slot can be booked multiple times
                        // or if it's a single-slot availability.
                        // if (qwishiOpening.squareAvailabilityId != null) {
                        //    squareService.deleteAvailability(merchantToken, qwishiOpening.squareAvailabilityId)
                        // }
                    },
                    onFailure = { error ->
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            "Failed to book shift in Square: ${error.message}"
                        )
                    }
                )
            }
        }
    }
}