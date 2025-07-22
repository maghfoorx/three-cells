export function formatValueByIncrement(
  value: number,
  increment: number = 1,
): string {
  const decimalPlaces = getDecimalPlaces(increment);

  const roundedValue = Math.round(value / increment) * increment;

  return roundedValue.toFixed(decimalPlaces);
}

function getDecimalPlaces(num: number): number {
  const parts = num.toString().split(".");
  return parts.length > 1 ? parts[1].length : 0;
}
