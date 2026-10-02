// Prices are stored as plain numbers; display is always RWF with thousands
// separators and no decimals (RWF has no practical subunit).
export function formatRwf(value: number | null | undefined): string {
  const whole = Math.round(Number(value) || 0);
  return `RWF ${whole.toLocaleString('en-US')}`;
}
