
import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  valueColor?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  style,
  valueColor = '#111827',
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon ? <View>{icon}</View> : null}
      </View>

      <Text style={[styles.value, { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    flexGrow: 1,
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
  },
  value: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
});