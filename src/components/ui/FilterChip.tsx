
import React from 'react';
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';

type FilterChipsProps = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export default function FilterChips({
  options,
  selected,
  onSelect,
  style,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const isSelected = selected === option;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.chip,
              isSelected && styles.selectedChip,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                isSelected && styles.selectedChipText,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  selectedChip: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
