import { theme } from 'antd';

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#22C55E',
    colorInfo: '#3B82F6',

    colorBgBase: '#F9FAFB',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',

    colorBorder: '#E5E7EB',

    colorText: '#0F172A',
    colorTextSecondary: '#475569',
    colorTextDisabled: '#94A3B8',

    borderRadius: 10,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontFamilyCode: 'Inter, system-ui, sans-serif',
  },
  cssVar: {
    key: 'ant',
  },
  components: {
    Typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
    },
  },
};
