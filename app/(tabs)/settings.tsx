import { useLanguage } from '@/context/LanguageContext';
import { ThemeMode, useSettings } from '@/context/SettingsContext';
import Constants from 'expo-constants';
import React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { List, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { lang, setLang, t } = useLanguage();
  const { themeMode, setThemeMode } = useSettings();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={[styles.heading, { color: colors.primary }]}>
          {t('tab_settings')}
        </Text>

        <List.Section>
          <List.Subheader>{t('settings_language')}</List.Subheader>
          <SegmentedButtons
            value={lang}
            onValueChange={(v) => setLang(v as 'de' | 'ar')}
            buttons={[
              { value: 'de', label: 'Deutsch', icon: 'alphabetical' },
              { value: 'ar', label: 'العربية', icon: 'abjad-arabic' },
            ]}
            style={styles.segmented}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>{t('settings_appearance')}</List.Subheader>
          <SegmentedButtons
            value={themeMode}
            onValueChange={(v) => setThemeMode(v as ThemeMode)}
            buttons={[
              { value: 'system', label: t('theme_system'), icon: 'theme-light-dark' },
              { value: 'light', label: t('theme_light'), icon: 'white-balance-sunny' },
              { value: 'dark', label: t('theme_dark'), icon: 'weather-night' },
            ]}
            style={styles.segmented}
          />
        </List.Section>

        <Image
          source={require('@/assets/jobwasil/jobwasil-magician.png')}
          style={styles.mascot}
        />
        <Text style={[styles.about, { color: colors.onSurfaceVariant }]}>
          {t('settings_about')}
        </Text>
        <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>
          {t('version')} {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 90 },
  heading: { fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  segmented: { marginHorizontal: 16 },
  mascot: { width: 90, height: 90, alignSelf: 'center', marginTop: 32, opacity: 0.85 },
  about: { textAlign: 'center', marginTop: 12, paddingHorizontal: 24, lineHeight: 22 },
  version: { textAlign: 'center', marginTop: 8, fontSize: 12 },
});
