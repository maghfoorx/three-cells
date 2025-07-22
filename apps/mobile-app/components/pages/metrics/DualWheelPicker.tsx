import { Text, Vibration, View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import React from "react";
import { Doc } from "@packages/backend/convex/_generated/dataModel";

function countDecimalPlaces(num: number): number {
  if (!isFinite(num)) return 0;
  const s = num.toString();
  const parts = s.split(".");
  return parts.length > 1 ? parts[1].length : 0;
}

export default function DualValuePicker({
  value,
  onChange,
  increment,
  colorHex,
}: {
  value: number;
  onChange: (val: number) => void;
  increment: number;
  colorHex: string;
}) {
  const decimalPlaces = countDecimalPlaces(increment);
  const fractionRange = Math.pow(10, decimalPlaces);
  const integerPart = Math.floor(value);
  const fractionPart = Math.round((value - integerPart) * fractionRange);

  const rangeStart = React.useMemo(() => {
    return Math.max(0, Math.floor((integerPart - 50) / 10) * 10);
  }, [integerPart]);

  const integerItemsOnWheel = React.useMemo(() => {
    return Array.from({ length: 101 }, (_, i) => {
      const val = rangeStart + i;
      return {
        value: val,
        label: val.toString(),
      };
    });
  }, [rangeStart]);

  const selectedIndex = integerPart - rangeStart;

  const safeIndex = Math.max(0, Math.min(100, selectedIndex));

  const formatFraction = (num: number) =>
    num.toString().padStart(decimalPlaces, "0");

  const showFractionWheel = increment < 1;

  return (
    <View className="flex-row justify-center items-center gap-4 h-[200px] mb-8">
      {/* Integer Wheel */}
      <WheelPickerExpo
        key={`int-${integerPart}`}
        height={200}
        width={100}
        initialSelectedIndex={safeIndex}
        items={integerItemsOnWheel}
        onChange={({ item }) => {
          const newValue = showFractionWheel
            ? parseFloat(`${item.value}.${formatFraction(fractionPart)}`)
            : item.value;
          if (newValue !== value) {
            onChange(newValue); // Avoid triggering onChange if value didn’t change
          }
        }}
        selectedStyle={{ borderColor: colorHex, borderWidth: 1 }}
        haptics={true}
      />
      {showFractionWheel && (
        <View>
          <Text>.</Text>
        </View>
      )}

      {/* Fraction Wheel - Only shown if increment has decimals */}
      {showFractionWheel && (
        <WheelPickerExpo
          key={`int-${fractionPart}`}
          height={200}
          width={80}
          initialSelectedIndex={fractionPart}
          items={Array.from({ length: fractionRange }, (_, i) => ({
            label: formatFraction(i),
            value: i,
          }))}
          onChange={({ item }) => {
            const newValue = parseFloat(
              `${integerPart}.${formatFraction(item.value)}`,
            );
            onChange(newValue);
            Vibration.vibrate(10);
          }}
          selectedStyle={{ borderColor: colorHex, borderWidth: 1 }}
          haptics={true}
        />
      )}
    </View>
  );
}
