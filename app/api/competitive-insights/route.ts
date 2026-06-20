import auth0 from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";
import { getCompetitiveInsights } from "@/lib/competitiveInsightsCache";

const { getAccessToken, withApiAuthRequired } = auth0;

const handler = async (request: NextRequest) => {
  try {
    const res = new NextResponse();
    const { accessToken } = await getAccessToken(request, res);

    if (!accessToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand") || "";
    const category = searchParams.get("category") || "";
    const days = searchParams.get("days") || "";

    const insights = await getCompetitiveInsights(brand, category, days, accessToken);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error in /api/competitive-insights:", error);
    return NextResponse.json(
      { error: "Error interno de comunicación con el backend" },
      { status: 500 }
    );
  }
};

export const GET = withApiAuthRequired(handler as any);
