import { DarkTheme as NavDark, DefaultTheme as NavLight } from '@react-navigation/native';
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Brand palette inspired by the Jobwasil magician mascot:
// deep violet primary, warm amber accent.

export const lightTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5B3FA8',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E8DDFF',
    onPrimaryContainer: '#21005D',
    secondary: '#F2A03D',
    onSecondary: '#3F2500',
    secondaryContainer: '#FFDDB8',
    onSecondaryContainer: '#2A1800',
    tertiary: '#7D5260',
    background: '#FDF8FF',
    surface: '#FDF8FF',
    surfaceVariant: '#E7E0EC',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#F6F0FA',
      level2: '#F2EBF8',
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#CDBDFF',
    onPrimary: '#36217A',
    primaryContainer: '#4D3591',
    onPrimaryContainer: '#E8DDFF',
    secondary: '#F2A03D',
    onSecondary: '#452B00',
    secondaryContainer: '#633F00',
    onSecondaryContainer: '#FFDDB8',
    tertiary: '#EFB8C8',
    background: '#141218',
    surface: '#141218',
    surfaceVariant: '#49454F',
  },
};

const { LightTheme: navLight, DarkTheme: navDark } = adaptNavigationTheme({
  reactNavigationLight: NavLight,
  reactNavigationDark: NavDark,
  materialLight: lightTheme,
  materialDark: darkTheme,
});

export const navLightTheme = navLight;
export const navDarkTheme = navDark;
