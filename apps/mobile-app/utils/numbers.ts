export function formatValueByIncrement(value: number, increment: number = 1) {
  const decimalPlaces = increment < 1 ? getDecimalPlaces(increment) : 0;
  return value.toFixed(decimalPlaces); // ← return string to preserve formatting
}

function getDecimalPlaces(num: number) {
  const parts = num.toString().split(".");
  return parts.length > 1 ? parts[1].length : 0;
}
