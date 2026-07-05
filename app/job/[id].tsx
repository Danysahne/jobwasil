import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { ActivityIndicator, Card, Chip, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { fetchJobDetail } from '@/services/BundesApi';
import { translateFields } from '@/services/TranslateApi';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';

interface JobDetail {
  stellenangebotsTitel?: string;
  firma?: string;
  hauptberuf?: string;
  weitereBerufe?: string[];
  stellenangebotsBeschreibung?: string;
  stellenlokationen?: { adresse?: { ort?: string; region?: string; land?: string } }[];
  vertragsdauer?: string;
  arbeitszeitVollzeit?: boolean;
  arbeitszeitTeilzeit?: boolean;
  arbeitszeitSchichtNachtWochenende?: boolean;
  arbeitszeitHeimTelearbeit?: boolean;
  festgehalt?: number;
  verguetungsangabe?: string;
  artDerVerguetung?: string;
  eintrittszeitraum?: { von?: string };
  datumErsteVeroeffentlichung?: string;
  istArbeitnehmerUeberlassung?: boolean;
  stellenangebotsart?: string;
  referenznummer?: string;
}

function formatDate(dateStr: string | undefined, locale: string) {
  if (!dateStr) return '';
  try { return new Date(dateStr).toLocaleDateString(locale); } catch { return dateStr; }
}

function formatSalary(job: JobDetail, perHour: string, perMonth: string) {
  if (!job.festgehalt) return null;
  const unit = job.verguetungsangabe === 'STUNDENLOHN' ? perHour : perMonth;
  return `${job.festgehalt.toFixed(2).replace('.', ',')} ${unit}`;
}

function formatLocation(job: JobDetail) {
  const loc = job.stellenlokationen?.[0]?.adresse;
  if (!loc) return '';
  return [loc.ort, loc.region].filter(Boolean).join(', ');
}

type Translate = (key: any) => string;

function formatWorkTime(job: JobDetail, t: Translate) {
  const types = [];
  if (job.arbeitszeitVollzeit) types.push(t('worktime_vz'));
  if (job.arbeitszeitTeilzeit) types.push(t('worktime_tz'));
  if (job.arbeitszeitSchichtNachtWochenende) types.push(t('worktime_snw'));
  if (job.arbeitszeitHeimTelearbeit) types.push(t('worktime_ho'));
  return types.join(' · ');
}

function formatContract(vertragsdauer: string | undefined, t: Translate) {
  if (vertragsdauer === 'UNBEFRISTET') return t('contract_unlimited');
  if (vertragsdauer === 'BEFRISTET') return t('contract_limited');
  return vertragsdauer ?? '';
}

// ── Simple inline markdown renderer ─────────────────────────────────────────

type MdSegment = { bold: boolean; text: string };

function parseInline(line: string): MdSegment[] {
  const segments: MdSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, match: RegExpExecArray | null;
  while ((match = re.exec(line)) !== null) {
    if (match.index > last) segments.push({ bold: false, text: line.slice(last, match.index) });
    segments.push({ bold: true, text: match[1] });
    last = match.index + match[0].length;
  }
  if (last < line.length) segments.push({ bold: false, text: line.slice(last) });
  return segments.length ? segments : [{ bold: false, text: line }];
}

type MdBlock =
  | { type: 'paragraph'; segments: MdSegment[] }
  | { type: 'bullet'; segments: MdSegment[] }
  | { type: 'heading'; level: number; text: string };

function parseMarkdown(text: string): MdBlock[] {
  return text.split('\n').filter(l => l.trimEnd()).map(raw => {
    const line = raw.trimEnd();
    if (/^#{1,3}\s/.test(line))
      return { type: 'heading', level: line.match(/^(#+)/)?.[1].length ?? 1, text: line.replace(/^#+\s*/, '') };
    if (/^[-*]\s/.test(line))
      return { type: 'bullet', segments: parseInline(line.replace(/^[-*]\s*/, '')) };
    return { type: 'paragraph', segments: parseInline(line) };
  });
}

function InlineText({ segments, color }: { segments: MdSegment[]; color: string }) {
  return (
    <RNText style={{ color }}>
      {segments.map((s, i) =>
        s.bold
          ? <RNText key={i} style={[md.bold, { color }]}>{s.text}</RNText>
          : <RNText key={i} style={{ color }}>{s.text}</RNText>
      )}
    </RNText>
  );
}

function DescriptionBlock({ text, rtl }: { text: string; rtl: boolean }) {
  const { colors } = useTheme();
  const primary = colors.onSurface;
  const secondary = colors.onSurfaceVariant;
  const align = rtl ? 'right' : 'left';

  try {
    const blocks = parseMarkdown(text);
    return (
      <View>
        {blocks.map((block, i) => {
          if (block.type === 'heading') {
            const s = block.level === 1 ? md.h1 : block.level === 2 ? md.h2 : md.h3;
            return <RNText key={i} style={[s, { color: primary, textAlign: align }]}>{block.text}</RNText>;
          }
          if (block.type === 'bullet') {
            return (
              <View key={i} style={[md.bulletRow, rtl && md.bulletRowRtl]}>
                <RNText style={[md.bullet, { color: secondary }]}>•</RNText>
                <RNText style={[md.bulletText, { color: secondary, textAlign: align }]}>
                  <InlineText segments={block.segments} color={secondary} />
                </RNText>
              </View>
            );
          }
          return (
            <RNText key={i} style={[md.paragraph, { color: secondary, textAlign: align }]}>
              <InlineText segments={block.segments} color={secondary} />
            </RNText>
          );
        })}
      </View>
    );
  } catch {
    return (
      <RNText style={[md.paragraph, { color: secondary, textAlign: align }]}>
        {text.replace(/\*\*/g, '').replace(/^[-*]\s/gm, '• ')}
      </RNText>
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isArabic, t } = useLanguage();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const dateLocale = isArabic ? 'ar' : 'de-DE';

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(false);

  // Translated field overrides — only set when Arabic is active
  const [translated, setTranslated] = useState<Record<string, string>>({});

  // Load raw job data
  useEffect(() => {
    if (typeof id !== 'string') return;
    setLoading(true);
    setError(false);
    setTranslated({});
    fetchJobDetail(id)
      .then(data => setJob(data as JobDetail))
      .catch(e => { console.error(e); setError(true); })
      .finally(() => setLoading(false));
  }, [id]);

  // Translate when language switches to Arabic
  useEffect(() => {
    if (!isArabic || !job) return;
    // Already have a translation cached
    if (Object.keys(translated).length > 0) return;

    const fields: Record<string, string> = {};
    if (job.stellenangebotsTitel) fields.titel = job.stellenangebotsTitel;
    if (job.firma) fields.firma = job.firma;
    if (job.stellenangebotsBeschreibung) fields.beschreibung = job.stellenangebotsBeschreibung;

    if (Object.keys(fields).length === 0) return;
    setTranslating(true);
    translateFields(fields, `job-${id}`)
      .then(setTranslated)
      .finally(() => setTranslating(false));
  }, [isArabic, job]);

  const title = isArabic
    ? (translated.titel ?? job?.stellenangebotsTitel ?? t('job_detail'))
    : (job?.stellenangebotsTitel ?? t('job_detail'));

  const firma = isArabic ? (translated.firma ?? job?.firma) : job?.firma;
  const beschreibung = isArabic
    ? (translated.beschreibung ?? job?.stellenangebotsBeschreibung)
    : job?.stellenangebotsBeschreibung;

  const fav = typeof id === 'string' && isFavorite(id);
  const heartButton =
    job && typeof id === 'string' ? (
      <IconButton
        icon={fav ? 'heart' : 'heart-outline'}
        iconColor={fav ? colors.primary : colors.onSurfaceVariant}
        size={22}
        onPress={() =>
          toggleFavorite({
            id,
            titel: job.stellenangebotsTitel ?? '',
            titelAr: translated.titel,
            arbeitgeber: job.firma,
            ort: formatLocation(job) || undefined,
            beruf: job.hauptberuf,
            savedAt: 0,
          })
        }
        accessibilityLabel={fav ? 'Remove favorite' : 'Add favorite'}
      />
    ) : null;

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator animating style={styles.loading} />
        ) : error || !job ? (
          <Text style={[styles.error, { color: colors.error }]}>
            {t('job_load_error')}
          </Text>
        ) : (
          <>
            {/* Header */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={[styles.titleRow, isArabic && styles.rowRtl]}>
                  <Text variant="headlineSmall" style={[styles.title, styles.titleFlex, isArabic && styles.rtl]}>{title}</Text>
                  {heartButton}
                </View>
                {firma ? <Text variant="titleMedium" style={[styles.company, isArabic && styles.rtl]}>{firma}</Text> : null}
                {formatLocation(job) ? (
                  <Text variant="bodyMedium" style={[styles.location, isArabic && styles.rtl]}>
                    📍 {formatLocation(job)}
                  </Text>
                ) : null}
              </Card.Content>
            </Card>

            {/* Chips */}
            <View style={[styles.chips, isArabic && styles.chipsRtl]}>
              {formatContract(job.vertragsdauer, t) ? (
                <Chip icon="file-document-outline" style={styles.chip}>{formatContract(job.vertragsdauer, t)}</Chip>
              ) : null}
              {formatWorkTime(job, t) ? (
                <Chip icon="clock-outline" style={styles.chip}>{formatWorkTime(job, t)}</Chip>
              ) : null}
              {job.istArbeitnehmerUeberlassung ? (
                <Chip icon="account-arrow-right" style={styles.chip}>{t('temp_work')}</Chip>
              ) : null}
            </View>

            {/* Key facts */}
            <Card style={styles.card}>
              <Card.Content>
                {formatSalary(job, t('salary_per_hour'), t('salary_per_month')) ? (
                  <View style={[styles.row, isArabic && styles.rowRtl]}>
                    <Text variant="labelLarge">💰 {t('salary')}</Text>
                    <Text variant="bodyLarge" style={styles.value}>{formatSalary(job, t('salary_per_hour'), t('salary_per_month'))}</Text>
                  </View>
                ) : null}
                {job.eintrittszeitraum?.von ? (
                  <View style={[styles.row, isArabic && styles.rowRtl]}>
                    <Text variant="labelLarge">📅 {t('start_date')}</Text>
                    <Text variant="bodyLarge" style={styles.value}>{formatDate(job.eintrittszeitraum.von, dateLocale)}</Text>
                  </View>
                ) : null}
                {job.datumErsteVeroeffentlichung ? (
                  <View style={[styles.row, isArabic && styles.rowRtl]}>
                    <Text variant="labelLarge">🗓 {t('published')}</Text>
                    <Text variant="bodyMedium" style={styles.value}>{formatDate(job.datumErsteVeroeffentlichung, dateLocale)}</Text>
                  </View>
                ) : null}
                {job.referenznummer ? (
                  <View style={[styles.row, isArabic && styles.rowRtl]}>
                    <Text variant="labelLarge">🔖 {t('ref_number')}</Text>
                    <Text variant="bodySmall" style={styles.value}>{job.referenznummer}</Text>
                  </View>
                ) : null}
              </Card.Content>
            </Card>

            {/* Description */}
            {beschreibung ? (
              <Card style={styles.card}>
                <Card.Title title={t('description')} />
                <Divider />
                <Card.Content style={styles.descContent}>
                  {translating ? (
                    <ActivityIndicator animating style={styles.translating} />
                  ) : (
                    <DescriptionBlock text={beschreibung} rtl={isArabic} />
                  )}
                </Card.Content>
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  loading: { marginTop: 48 },
  translating: { marginVertical: 24 },
  error: { marginTop: 32, textAlign: 'center' },
  card: { borderRadius: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  titleFlex: { flex: 1 },
  title: { fontWeight: 'bold', marginBottom: 4 },
  company: { marginBottom: 4 },
  location: { color: '#666' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipsRtl: { flexDirection: 'row-reverse' },
  chip: { marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowRtl: { flexDirection: 'row-reverse' },
  value: { flex: 1, textAlign: 'right' },
  descContent: { paddingTop: 8 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});

const md = StyleSheet.create({
  h1: { fontSize: 17, fontWeight: 'bold', marginTop: 14, marginBottom: 4 },
  h2: { fontSize: 15, fontWeight: 'bold', marginTop: 12, marginBottom: 3 },
  h3: { fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 2 },
  paragraph: { fontSize: 14, lineHeight: 22, marginBottom: 6 },
  bold: { fontWeight: 'bold' },
  bulletRow: { flexDirection: 'row', marginBottom: 4, paddingLeft: 4 },
  bulletRowRtl: { flexDirection: 'row-reverse', paddingLeft: 0, paddingRight: 4 },
  bullet: { fontSize: 14, lineHeight: 22, marginRight: 8 },
  bulletText: { fontSize: 14, lineHeight: 22, flex: 1 },
});
