import { useLanguage } from '@/context/LanguageContext';
import { saveAccessCode, verifyAccess } from '@/services/ApiClient';
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, TextInput, useTheme } from 'react-native-paper';

type GateState = 'checking' | 'locked' | 'open';

/**
 * Blocks the app until the proxy accepts the stored access code.
 * Fails open when the server is unreachable (offline use of favorites)
 * and when the proxy runs without ACCESS_CODE (local development).
 */
export function AccessGate({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [state, setState] = useState<GateState>('checking');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    verifyAccess().then((ok) => setState(ok ? 'open' : 'locked'));
  }, []);

  async function submit() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(false);
    const ok = await verifyAccess(trimmed);
    if (ok) {
      await saveAccessCode(trimmed);
      setState('open');
    } else {
      setError(true);
    }
    setSubmitting(false);
  }

  if (state === 'open') return <>{children}</>;

  if (state === 'checking') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require('@/assets/jobwasil/jobwasil-magician.png')}
        style={styles.mascot}
      />
      <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
        {t('access_title')}
      </Text>
      <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
        {t('access_message')}
      </Text>
      <TextInput
        mode="outlined"
        value={code}
        onChangeText={setCode}
        placeholder={t('access_placeholder')}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        onSubmitEditing={submit}
        left={<TextInput.Icon icon="key" />}
        style={styles.input}
        error={error}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{t('access_error')}</Text>
      ) : null}
      <Button
        mode="contained"
        onPress={submit}
        loading={submitting}
        disabled={submitting || !code.trim()}
        style={styles.button}>
        {t('access_submit')}
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  mascot: { width: 110, height: 110, marginBottom: 16 },
  title: { fontWeight: '800', marginBottom: 8 },
  message: { textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  input: { alignSelf: 'stretch', maxWidth: 420, width: '100%' },
  error: { marginTop: 8 },
  button: { marginTop: 20, minWidth: 180 },
});
