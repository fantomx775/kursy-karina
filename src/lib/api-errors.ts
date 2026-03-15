// Standardized API error response format
export interface ApiError {
  error: string;
  details?: any;
  field?: string;
  code?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Standard error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Nie jesteś zalogowany",
  FORBIDDEN: "Nie masz uprawnień do tej operacji",
  NOT_FOUND: "Nie znaleziono żądanego zasobu",
  VALIDATION_FAILED: "Nieprawidłowe dane",
  SERVER_ERROR: "Wystąpił błąd serwera",
  NETWORK_ERROR: "Problem z połączeniem",
  SLUG_EXISTS: "Kurs o tym adresie URL już istnieje",
  COUPON_INVALID: "Nieprawidłowy kod kuponu",
  PAYMENT_FAILED: "Płatność nie powiodła się",
} as const;

// Helper function to create standardized error responses
export function createErrorResponse(
  error: string,
  status: number = 500,
  options?: { field?: string; details?: any; code?: string }
): Response {
  const errorBody: ApiError = {
    error,
    ...options,
  };

  return Response.json(errorBody, { status });
}

// Helper function to create standardized success responses
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): Response {
  return Response.json({ success: true, data }, { status });
}

// Helper function to handle API errors consistently
export function handleApiError(error: unknown): Response {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("Unauthorized")) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }
    if (error.message.includes("Forbidden")) {
      return createErrorResponse(ERROR_MESSAGES.FORBIDDEN, 403);
    }
    if (error.message.includes("not found")) {
      return createErrorResponse(ERROR_MESSAGES.NOT_FOUND, 404);
    }
    if (error.message.includes("validation")) {
      return createErrorResponse(ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }

    // Generic error
    return createErrorResponse(
      process.env.NODE_ENV === "production" 
        ? ERROR_MESSAGES.SERVER_ERROR 
        : error.message,
      500
    );
  }

  return createErrorResponse(ERROR_MESSAGES.SERVER_ERROR, 500);
}

// Type guard for API responses
export function isApiError(response: any): response is ApiError {
  return response && typeof response === "object" && "error" in response;
}
