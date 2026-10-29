
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatusBadgeProps = {
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const badgeStyle =
    status === 'In Stock'
      ? styles.inStock
      : status === 'Low Stock'
        ? styles.lowStock
        : styles.outOfStock;

  const textStyle =
    status === 'In Stock'
      ? styles.inStockText
      : status === 'Low Stock'
        ? styles.lowStockText
        : styles.outOfStockText;

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.text, textStyle]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
  },
  inStock: {
    backgroundColor: '#D1FAE5',
  },
  inStockText: {
    color: '#047857',
  },
  lowStock: {
    backgroundColor: '#FEF3C7',
  },
  lowStockText: {
    color: '#92400E',
  },
  outOfStock: {
    backgroundColor: '#FEE2E2',
  },
  outOfStockText: {
    color: '#B91C1C',
  },
});
