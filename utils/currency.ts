import { SupportedCurrency } from "@/provider/currency.provider";

export function formatCurrency(
  value: number,
  currency: SupportedCurrency = "EUR"
): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
