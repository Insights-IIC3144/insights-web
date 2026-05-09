import { useState, useEffect } from "react";
import { executiveService } from "@/services/executiveService";
import { competitiveService } from "@/services/competitiveService";
import { AudiencesData, RetentionData } from "@/types/executive";
import { CompetitiveCardsData } from "@/types/competitive";
import { FilterParams } from "@/types/shared";
import { useUserContext } from "@/context/UserContext";

export function usePerformanceCardsData(activeFilters: Record<string, string>) {
  const { days, selectedBrand: brand } = useUserContext();
  const [audiences, setAudiences] = useState<AudiencesData | null>(null);
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [competitiveCards, setCompetitiveCards] = useState<CompetitiveCardsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params: FilterParams = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== "")
      );
      if (days > 0) params.days = days;

      const [audRes, retRes] = await Promise.allSettled([
        executiveService.getAudiences(params),
        executiveService.getRetention(params),
      ]);

      if (audRes.status === "fulfilled") setAudiences(audRes.value);
      if (retRes.status === "fulfilled") setRetention(retRes.value);

      if (brand) {
        const compRes = await competitiveService.getCards({ ...params, brand }).catch(() => null);
        setCompetitiveCards(compRes);
      } else {
        setCompetitiveCards(null);
      }

      setLoading(false);
    };
    fetchData();
  }, [activeFilters, days, brand]);

  return { audiences, retention, competitiveCards, hasBrand: !!brand, loading };
}
