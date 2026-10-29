
export const colors = {
  light: {
    background: '#F6F8FB',
    surface: '#FFFFFF',

    primary: '#059669',
    primaryLight: '#D1FAE5',
    primaryBorder: '#A7F3D0',
    primaryText: '#047857',

    text: '#111827',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textBody: '#334155',

    border: '#E2E8F0',
    divider: '#F1F5F9',
    inputBackground: '#F8FAFC',

    successBackground: '#D1FAE5',
    successText: '#047857',

    warningBackground: '#FEF3C7',
    warningText: '#92400E',

    dangerBackground: '#FEE2E2',
    dangerText: '#B91C1C',

    disabled: '#CBD5E1',
  },

  dark: {
    background: '#0F172A',
    surface: '#1E293B',

    primary: '#34D399',
    primaryLight: '#064E3B',
    primaryBorder: '#065F46',
    primaryText: '#6EE7B7',

    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textBody: '#E2E8F0',

    border: '#334155',
    divider: '#273449',
    inputBackground: '#0F172A',

    successBackground: '#064E3B',
    successText: '#6EE7B7',

    warningBackground: '#78350F',
    warningText: '#FDE68A',

    dangerBackground: '#7F1D1D',
    dangerText: '#FCA5A5',

    disabled: '#475569',
  },
} as const;

export type ThemeMode = keyof typeof colors;

export type ThemeColors = (typeof colors)[ThemeMode];
