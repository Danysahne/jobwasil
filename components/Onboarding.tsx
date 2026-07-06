import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { Lang, useLanguage } from '@/context/LanguageContext';
import { ThemeMode, useSettings } from '@/context/SettingsContext';
import { useDirection } from '@/hooks/useDirection';

const STORAGE_KEY = 'jobwasil.onboarded';

type GateState = 'checking' | 'show' | 'done';

function FeatureRow({ icon, title, text }: { icon: string; title: string; text: string }) {
  const { colors } = useTheme();
  const { row, textAlign } = useDirection();
  return (
    <View style={[styles.featureRow, { flexDirection: row }]}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon as any} size={26} color={colors.onPrimaryContainer} />
      </View>
      <View style={styles.featureText}>
        <Text variant="titleMedium" style={[{ textAlign }, styles.featureTitle]}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={[{ textAlign, color: colors.onSurfaceVariant }]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

/**
 * First-launch wizard: language choice → feature tour → initial settings.
 * Shown once; sets jobwasil.onboarded afterwards.
 */
export function Onboarding({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useLanguage();
  const { themeMode, setThemeMode } = useSettings();
  const { colors } = useTheme();
  const { row } = useDirection();
  const [state, setState] = useState<GateState>('checking');
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => setState(v ? 'done' : 'show'))
      .catch(() => setState('done'));
  }, []);

  if (state === 'done') return <>{children}</>;

  if (state === 'checking') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating />
      </View>
    );
  }

  function chooseLang(l: Lang) {
    setLang(l);
    setStep(1);
  }

  function finish() {
    AsyncStorage.setItem(STORAGE_KEY, '1').catch(() => {});
    setState('done');
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}>
      <Image
        source={require('@/assets/jobwasil/jobwasil-magician.png')}
        style={styles.mascot}
      />

      {step === 0 ? (
        <>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
            Willkommen! · أهلاً بك!
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {'In welcher Sprache möchtest du die App nutzen?\nبأي لغة تريد استخدام التطبيق؟'}
          </Text>
          <Button
            mode={lang === 'de' ? 'contained' : 'outlined'}
            onPress={() => chooseLang('de')}
            style={styles.langButton}
            contentStyle={styles.langButtonContent}
            labelStyle={styles.langButtonLabel}>
            🇩🇪 Deutsch
          </Button>
          <Button
            mode={lang === 'ar' ? 'contained' : 'outlined'}
            onPress={() => chooseLang('ar')}
            style={styles.langButton}
            contentStyle={styles.langButtonContent}
            labelStyle={styles.langButtonLabel}>
            العربية
          </Button>
        </>
      ) : step === 1 ? (
        <>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
            {t('ob_features_title')}
          </Text>
          <View style={styles.features}>
            <FeatureRow
              icon="magnify"
              title={t('ob_feature_search_title')}
              text={t('ob_feature_search_text')}
            />
            <FeatureRow
              icon="translate"
              title={t('ob_feature_translate_title')}
              text={t('ob_feature_translate_text')}
            />
            <FeatureRow
              icon="heart"
              title={t('ob_feature_fav_title')}
              text={t('ob_feature_fav_text')}
            />
          </View>
        </>
      ) : (
        <>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
            {t('ob_settings_title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {t('ob_settings_text')}
          </Text>
          <Text variant="labelLarge" style={styles.settingLabel}>
            {t('settings_language')}
          </Text>
          <SegmentedButtons
            value={lang}
            onValueChange={(v) => setLang(v as Lang)}
            buttons={[
              { value: 'de', label: 'Deutsch' },
              { value: 'ar', label: 'العربية' },
            ]}
            style={styles.segmented}
          />
          <Text variant="labelLarge" style={styles.settingLabel}>
            {t('settings_appearance')}
          </Text>
          <SegmentedButtons
            value={themeMode}
            onValueChange={(v) => setThemeMode(v as ThemeMode)}
            buttons={[
              { value: 'system', label: t('theme_system') },
              { value: 'light', label: t('theme_light') },
              { value: 'dark', label: t('theme_dark') },
            ]}
            style={styles.segmented}
          />
        </>
      )}

      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === step ? colors.primary : colors.surfaceVariant },
            ]}
          />
        ))}
      </View>

      {/* Navigation */}
      {step > 0 ? (
        <View style={[styles.nav, { flexDirection: row }]}>
          <Button mode="outlined" onPress={() => setStep(step - 1)} style={styles.navButton}>
            {t('ob_back')}
          </Button>
          <Button
            mode="contained"
            onPress={() => (step === 2 ? finish() : setStep(step + 1))}
            style={styles.navButton}>
            {step === 2 ? t('ob_start') : t('ob_next')}
          </Button>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  mascot: { width: 120, height: 120, marginBottom: 20 },
  title: { fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  langButton: { alignSelf: 'stretch', maxWidth: 420, width: '100%', marginBottom: 14 },
  langButtonContent: { paddingVertical: 10 },
  langButtonLabel: { fontSize: 18 },
  features: { alignSelf: 'stretch', maxWidth: 480, width: '100%', gap: 22, marginTop: 8 },
  featureRow: { gap: 14, alignItems: 'flex-start' },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontWeight: '700', marginBottom: 2 },
  settingLabel: { marginTop: 18, marginBottom: 8, alignSelf: 'center' },
  segmented: { alignSelf: 'stretch', maxWidth: 480 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 32 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  nav: { gap: 12, marginTop: 20, alignSelf: 'stretch', maxWidth: 480 },
  navButton: { flex: 1 },
});
