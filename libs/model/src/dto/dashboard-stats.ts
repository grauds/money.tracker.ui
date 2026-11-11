export interface DashboardStats {
  lastDataUpdate: Date | null;
  totalIncomeCount: number;
  totalIncomeSum: number;
  totalExpenseCount: number;
  totalExpenseSum: number;
  totalDebtCount: number;
  totalDebtSum: number;
  netWorth: number;
  savingsRate: number;
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
}
