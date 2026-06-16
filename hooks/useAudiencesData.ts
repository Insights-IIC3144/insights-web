import { useState, useEffect, useRef, useCallback } from "react";
import { audiencesService } from "@/services/audiencesService";
import { AudiencesKpis, AudiencesGender, AudiencesAge, AudiencesRfm, AudiencesFunnel } from "@/types/audiences";
import { AiInsightDto } from "@/types/insights";
import { FilterParams } from "@/types/shared";
import { useUserContext } from "@/context/UserContext";

export function useAudiencesData(activeFilters: Record<string, string>) {
  const [kpis, setKpis] = useState<AudiencesKpis | null>(null);
  const [gender, setGender] = useState<AudiencesGender[]>([]);
  const [age, setAge] = useState<AudiencesAge[]>([]);
  const [rfm, setRfm] = useState<AudiencesRfm[]>([]);
  const [funnel, setFunnel] = useState<AudiencesFunnel[]>([]);
  const [insights, setInsights] = useState<AiInsightDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const { days, selectedBrand: brand } = useUserContext();
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const buildParams = useCallback((): FilterParams => {
    const params: FilterParams = Object.fromEntries(
      Object.entries(activeFilters).filter(([, v]) => v !== "")
    );
    if (days > 0) params.days = days;
    if (brand) params.brand = brand;
    return params;
  }, [activeFilters, days, brand]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = buildParams();

        const [kpisRes, genderRes, ageRes, rfmRes, funnelRes] = await Promise.all([
          audiencesService.getKpis(params),
          audiencesService.getGenderBreakdown(params),
          audiencesService.getAgeBreakdown(params),
          audiencesService.getRfmCohorts(params),
          audiencesService.getFunnel(params),
        ]);

        if (cancelled) return;
        if (kpisRes) setKpis(kpisRes);
        if (genderRes) setGender(genderRes);
        if (ageRes) setAge(ageRes);
        if (rfmRes) setRfm(rfmRes);
        if (funnelRes) setFunnel(funnelRes);
      } catch (err) {
        console.error("Error fetching audiences data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        const params = buildParams();
        const insightsRes = await audiencesService.getInsights(params);
        if (!cancelled && insightsRes) setInsights(insightsRes);
      } catch (err) {
        console.error("Error fetching audiences insights:", err);
        if (!cancelled) setInsights([]);
      } finally {
        if (!cancelled) setLoadingInsights(false);
      }
    };

    fetchData();
    fetchInsights();

    return () => {
      cancelled = true;
    };
  }, [buildParams]);

  const refetchInsights = useCallback(() => {
    setLoadingInsights(true);
    const params = buildParams();
    audiencesService.getInsights(params)
      .then((res) => {
        if (!mountedRef.current) return;
        if (res) setInsights(res);
        setLoadingInsights(false);
      })
      .catch((err) => {
        console.error("Error refetching audiences insights:", err);
        if (!mountedRef.current) return;
        setInsights([]);
        setLoadingInsights(false);
      });
  }, [buildParams]);

  return { kpis, gender, age, rfm, funnel, loading, insights, loadingInsights, refetchInsights };
}
