
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  avatarText?: string;
};

export default function AppHeader({
  title,
  subtitle,
  avatarText = 'D',
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.brand}>{title}</Text>

        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{avatarText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerText: {
    flex: 1,
  },
  brand: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#C9F4E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#047857',
    fontSize: 18,
    fontWeight: '700',
  },
});
