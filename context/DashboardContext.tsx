"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
  days: number;
  setDays: (days: number) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  days: 90,
  setDays: () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState(90);
  return (
    <DashboardContext.Provider value={{ days, setDays }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
