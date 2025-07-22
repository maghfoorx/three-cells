import { Text, Vibration, View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import color from "color";
import React from "react";

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
  maxInteger = 200,
  colorHex,
}: {
  value: number;
  onChange: (val: number) => void;
  increment: number;
  maxInteger?: number;
  colorHex: string;
}) {
  const decimalPlaces = countDecimalPlaces(increment);
  const fractionRange = Math.pow(10, decimalPlaces);

  const integerPart = Math.floor(value);
  const fractionPart = Math.round((value - integerPart) * fractionRange);

  const formatFraction = (num: number) =>
    num.toString().padStart(decimalPlaces, "0");

  const showFractionWheel = increment < 1;

  return (
    <View className="flex-row justify-center items-center gap-4 h-[200px] mb-8">
      {/* Integer Wheel */}
      <WheelPickerExpo
        height={200}
        width={100}
        initialSelectedIndex={integerPart}
        items={Array.from({ length: maxInteger + 1 }, (_, i) => ({
          label: i.toString(),
          value: i,
        }))}
        onChange={({ item }) => {
          const newValue = showFractionWheel
            ? parseFloat(`${item.value}.${formatFraction(fractionPart)}`)
            : item.value;
          onChange(newValue);
        }}
        selectedStyle={{ borderColor: colorHex, borderWidth: 1 }}
        haptics={true}
      />
      <View>
        <Text>.</Text>
      </View>

      {/* Fraction Wheel - Only shown if increment has decimals */}
      {showFractionWheel && (
        <WheelPickerExpo
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
        />
      )}
    </View>
  );
}
