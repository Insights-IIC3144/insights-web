"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BRANDS } from "@/lib/mock";

interface DashboardContextType {
  days: number;
  setDays: (days: number) => void;
  brand: string;
  setBrand: (brand: string) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  days: 90,
  setDays: () => {},
  brand: BRANDS[0],
  setBrand: () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState(90);
  const [brand, setBrand] = useState(BRANDS[0]);
  
  return (
    <DashboardContext.Provider value={{ days, setDays, brand, setBrand }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
