import { DatesRange } from './dates-range';

export interface InfoAbout {
  expenses: number;
  income: number;
  organizations: number;
  accounts: number;
  dates: DatesRange;
  expensesNoCommodity: number;
  expensesNoTradeplace: number;
  expensesTradeplace: number;
}
