import { theme } from 'antd';

export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#22C55E',
    colorInfo: '#3B82F6',

    colorBgBase: '#0B0F14',
    colorBgContainer: '#121826',
    colorBgElevated: '#1A2233',

    colorBorder: '#263044',

    colorText: '#E5E7EB',
    colorTextSecondary: '#9CA3AF',
    colorTextDisabled: '#6B7280',

    borderRadius: 10,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontFamilyCode: 'Inter, system-ui, sans-serif',
  },
  components: {
    Typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
    },
  },
};

