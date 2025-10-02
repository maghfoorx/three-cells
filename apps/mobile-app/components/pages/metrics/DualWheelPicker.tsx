import { Text, Vibration, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
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

  const formatFraction = (num: number) =>
    num.toString().padStart(decimalPlaces, "0");

  const showFractionWheel = increment < 1;

  return (
    <View className="flex-row justify-center items-center gap-4 mb-8">
      {/* Integer Picker */}
      <View style={{ flex: 1 }}>
        <Picker
          selectedValue={integerPart}
          onValueChange={(itemValue) => {
            const newValue = showFractionWheel
              ? parseFloat(`${itemValue}.${formatFraction(fractionPart)}`)
              : itemValue;
            if (newValue !== value) {
              onChange(newValue);
            }
          }}
          style={{ height: 200 }}
        >
          {integerItemsOnWheel.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>

      {showFractionWheel && (
        <View>
          <Text className="text-2xl">.</Text>
        </View>
      )}

      {/* Fraction Picker - Only shown if increment has decimals */}
      {showFractionWheel && (
        <View style={{ flex: 1 }}>
          <Picker
            selectedValue={fractionPart}
            onValueChange={(itemValue) => {
              const newValue = parseFloat(
                `${integerPart}.${formatFraction(itemValue)}`,
              );
              onChange(newValue);
              Vibration.vibrate(10);
            }}
            style={{ height: 200 }}
          >
            {Array.from({ length: fractionRange }, (_, i) => (
              <Picker.Item key={i} label={formatFraction(i)} value={i} />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );
}
