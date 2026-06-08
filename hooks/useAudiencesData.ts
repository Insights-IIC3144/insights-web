import { useState, useEffect } from "react";
import { audiencesService } from "@/services/audiencesService";
import { AudiencesKpis, AudiencesGender, AudiencesAge, AudiencesRfm, AudiencesFunnel } from "@/types/audiences";
import { FilterParams } from "@/types/shared";
import { useUserContext } from "@/context/UserContext";

export function useAudiencesData(activeFilters: Record<string, string>) {
  const [kpis, setKpis] = useState<AudiencesKpis | null>(null);
  const [gender, setGender] = useState<AudiencesGender[]>([]);
  const [age, setAge] = useState<AudiencesAge[]>([]);
  const [rfm, setRfm] = useState<AudiencesRfm[]>([]);
  const [funnel, setFunnel] = useState<AudiencesFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const { days, selectedBrand: brand } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: FilterParams = Object.fromEntries(
          Object.entries(activeFilters).filter(([, v]) => v !== "")
        );
        if (days > 0) params.days = days;
        if (brand) params.brand = brand;

        const [kpisRes, genderRes, ageRes, rfmRes, funnelRes] = await Promise.all([
          audiencesService.getKpis(params),
          audiencesService.getGenderBreakdown(params),
          audiencesService.getAgeBreakdown(params),
          audiencesService.getRfmCohorts(params),
          audiencesService.getFunnel(params),
        ]);

        if (kpisRes) setKpis(kpisRes);
        if (genderRes) setGender(genderRes);
        if (ageRes) setAge(ageRes);
        if (rfmRes) setRfm(rfmRes);
        if (funnelRes) setFunnel(funnelRes);
      } catch (err) {
        console.error("Error fetching audiences data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeFilters, days, brand]);

  return { kpis, gender, age, rfm, funnel, loading };
}
