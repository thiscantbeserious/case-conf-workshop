import { NextRequest } from "next/server";
import { requireAuth, successResponse, errorResponse } from "@/lib/api-utils";
import { excludePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const result = await requireAuth(request);
    if ("error" in result) {
      return result.error;
    }

    return successResponse(excludePassword(result.user));
  } catch (error) {
    console.error("Test token error:", error);
    return errorResponse(500, "Internal server error");
  }
}
