export interface CurrencyExchangeStat {
  sourceCurrency: string;
  destCurrency: string;
  averageRate: number;
  currentRate: number;
  totalExchanged: number;
  delta: number;
}
