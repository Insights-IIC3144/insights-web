export interface AudiencesKpis {
  uniqueCustomers: number;
  uniqueCustomersDeltaPct: number | null;
  ordersPerCustomer: number;
  ordersPerCustomerDeltaPct: number | null;
  avgRecencyDays: number;
  avgRecencyDeltaPct: number | null;
  avgTicketPerCustomer: number;
  avgTicketDeltaPct: number | null;
}

export interface AudiencesGender {
  gender: string;
  customerCount: number;
  percentage: number;
}

export interface AudiencesAge {
  ageRange: string;
  customerCount: number;
}

export interface AudiencesRfm {
  recencyDays: number;
  avgFrequency: number;
  avgTicket: number;
  customerCount: number;
}
