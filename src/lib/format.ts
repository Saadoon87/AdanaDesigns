export const appTimeZone = "Africa/Cairo";

export const egpFormatter = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0
});

export const numberFormatter = new Intl.NumberFormat("en-EG");

export const dateFormatter = new Intl.DateTimeFormat("en-EG", {
  dateStyle: "medium",
  timeZone: appTimeZone
});

export function formatMoney(value: number | string | null | undefined): string {
  return egpFormatter.format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }

  return dateFormatter.format(new Date(value));
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
