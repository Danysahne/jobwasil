import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider as PaperProvider } from 'react-native-paper';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { AccessGate } from '@/components/AccessGate';
import { Onboarding } from '@/components/Onboarding';
import { darkTheme, lightTheme, navDarkTheme, navLightTheme } from '@/constants/theme';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';

// Suppress errors thrown by browser extensions (e.g. MetaMask) so they don't
// surface in the Expo error overlay. These errors originate entirely in the
// extension's own scripts and are harmless to our app.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.filename?.startsWith('chrome-extension://') || e.filename?.startsWith('moz-extension://')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
  window.addEventListener('unhandledrejection', (e) => {
    const msg: string = e.reason?.message ?? e.reason?.toString() ?? '';
    const stack: string = e.reason?.stack ?? '';
    if (msg.includes('MetaMask') || stack.includes('chrome-extension://') || stack.includes('moz-extension://')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
}

function LangToggle() {
  const { lang, setLang } = useLanguage();
  const { resolvedScheme } = useSettings();
  const theme = resolvedScheme === 'dark' ? darkTheme : lightTheme;
  return (
    <TouchableOpacity
      style={[styles.toggle, { backgroundColor: theme.colors.primary }]}
      onPress={() => setLang(lang === 'de' ? 'ar' : 'de')}
      accessibilityLabel="Switch language"
    >
      <Text style={[styles.toggleText, { color: theme.colors.onPrimary }]}>
        {lang === 'de' ? 'عربي' : 'DE'}
      </Text>
    </TouchableOpacity>
  );
}

function AppStack() {
  const { t } = useLanguage();
  const { resolvedScheme } = useSettings();
  const isDark = resolvedScheme === 'dark';

  return (
    <PaperProvider theme={isDark ? darkTheme : lightTheme}>
      <Onboarding>
        <AccessGate>
        <ThemeProvider value={isDark ? navDarkTheme : navLightTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="job/[id]"
              options={{ title: t('job_detail'), headerRight: () => <LangToggle /> }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </ThemeProvider>
        </AccessGate>
      </Onboarding>
    </PaperProvider>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  // Hold rendering until persisted language/theme are loaded to avoid a flash
  const { hydrated: langReady } = useLanguage();
  const { hydrated: themeReady } = useSettings();
  if (!langReady || !themeReady) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <LanguageProvider>
      <SettingsProvider>
        <FavoritesProvider>
          <Gate>
            <AppStack />
          </Gate>
        </FavoritesProvider>
      </SettingsProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  toggle: {
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
});
