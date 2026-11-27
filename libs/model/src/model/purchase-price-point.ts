export interface PurchasePricePoint {
  tradeplaceId: string;
  tradeplaceName: string;
  transferDate: string | Date;
  price: number;
  currencyCode?: string;
}
