import { NextResponse } from "next/server";
import type { HealthResponse } from "@novaai/types";

export function GET() {
  const response: HealthResponse = {
    ok: true,
    service: "novaai-web",
    version: "0.3.0"
  };

  return NextResponse.json(response);
}