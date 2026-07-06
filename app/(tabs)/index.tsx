import type { Job } from '@/JobwasilAPI';
import { FilterSheet, JobFilters, countActiveFilters } from '@/components/FilterSheet';
import { JobCard, JobCardData } from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/JobCardSkeleton';
import { searchJobs } from '@/services/BundesApi';
import { translateFields } from '@/services/TranslateApi';
import { useLanguage } from '@/context/LanguageContext';
import { useDirection } from '@/hooks/useDirection';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Badge, IconButton, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type JobWithTranslation = Job & { _titleAr?: string };

function jobId(job: Job, idx: number): string {
  return String((job as any).hashId || (job as any).refnr || idx);
}

function jobTitle(job: Job): string {
  return (job as any).berufsbezeichnung || (job as any).titel || (job as any).title || '';
}

function formatArbeitsort(arbeitsort?: Job['arbeitsort']): string {
  if (!arbeitsort) return '';
  const { ort, plz } = arbeitsort;
  return `${ort ?? ''} ${plz ?? ''}`.trim();
}

const ARABIC_RE = /[؀-ۿ]/;

export default function HomeScreen() {
  const [jobs, setJobs] = useState<JobWithTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<JobFilters>({});
  const [filterVisible, setFilterVisible] = useState(false);
  // German term actually sent to the API when the user searched in Arabic
  const [searchedAs, setSearchedAs] = useState<string | null>(null);
  const router = useRouter();
  const { t, isArabic, lang } = useLanguage();
  const { row, textAlign } = useDirection();
  const { colors } = useTheme();

  async function loadJobs(search: string, f: JobFilters) {
    setLoading(true);
    setError(false);
    try {
      // Arabic search terms are translated to German first — the
      // Bundesagentur API only matches German vocabulary.
      let was = search.trim() || undefined;
      let germanQuery: string | null = null;
      if (was && ARABIC_RE.test(was)) {
        const result = await translateFields({ q: was }, `query_${was}`, 'ar-de');
        if (result.q && result.q !== was) {
          germanQuery = result.q;
          was = result.q;
        }
      }
      setSearchedAs(germanQuery);

      const data = await searchJobs({
        was,
        wo: f.wo,
        umkreis: f.umkreis,
        arbeitszeit: f.arbeitszeit,
        size: 20,
        page: 1,
      });
      const results: JobWithTranslation[] = (data as any)?.stellenangebote || [];
      setJobs(Array.isArray(results) ? results : []);
    } catch (e) {
      console.error(e);
      setError(true);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs('', {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lazily translate titles only while Arabic is active. Results are merged
  // into the job objects so switching back and forth is instant.
  useEffect(() => {
    if (!isArabic || jobs.length === 0) return;
    if (jobs.every((j) => j._titleAr)) return;

    const fields: Record<string, string> = {};
    jobs.forEach((job, idx) => {
      if (!job._titleAr) {
        const title = jobTitle(job);
        if (title) fields[`job_${idx}`] = title;
      }
    });
    if (Object.keys(fields).length === 0) return;

    const cacheKey = `list_${jobs.map((j, i) => jobId(j, i)).join(',')}`;
    let cancelled = false;
    translateFields(fields, cacheKey).then((translated) => {
      if (cancelled) return;
      setJobs((prev) =>
        prev.map((job, idx) =>
          translated[`job_${idx}`] ? { ...job, _titleAr: translated[`job_${idx}`] } : job,
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [isArabic, jobs]);

  const activeFilters = countActiveFilters(filters);

  const cards: JobCardData[] = jobs.map((job, idx) => {
    const titleDe = jobTitle(job);
    return {
      id: jobId(job, idx),
      title: isArabic ? job._titleAr ?? titleDe : titleDe,
      translating: isArabic && !job._titleAr,
      titleDe,
      titleAr: job._titleAr,
      employer: (job as any).arbeitgeber,
      beruf: (job as any).beruf,
      location: formatArbeitsort(job.arbeitsort) || (job as any).ort || undefined,
      date: (job as any).aktuelleVeroeffentlichungsdatum
        ? new Date((job as any).aktuelleVeroeffentlichungsdatum).toLocaleDateString(
            isArabic ? 'ar' : 'de-DE',
          )
        : undefined,
    };
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand header */}
        <View style={[styles.brandRow, { flexDirection: row }]}>
          <Image
            source={require('@/assets/jobwasil/jobwasil-magician.png')}
            style={styles.logo}
          />
          <View style={styles.brandText}>
            <Text variant="headlineMedium" style={[styles.brandName, { color: colors.primary, textAlign }]}>
              {t('app_name')}
            </Text>
            <Text variant="bodySmall" style={[{ color: colors.onSurfaceVariant, textAlign }]}>
              {t('app_tagline')}
            </Text>
          </View>
        </View>

        {/* Search + filter */}
        <View style={[styles.searchRow, { flexDirection: row }]}>
          <Searchbar
            placeholder={t('search_placeholder')}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => loadJobs(query, filters)}
            style={styles.searchBar}
            inputStyle={{ textAlign }}
          />
          <View>
            <IconButton
              icon="tune-variant"
              mode="contained-tonal"
              size={26}
              onPress={() => setFilterVisible(true)}
              accessibilityLabel={t('filters')}
            />
            {activeFilters > 0 ? (
              <Badge style={styles.badge} size={18}>
                {activeFilters}
              </Badge>
            ) : null}
          </View>
        </View>

        {/* Arabic query was translated — show the German term actually used */}
        {searchedAs && !loading ? (
          <Text
            variant="bodySmall"
            style={[styles.searchedAs, { textAlign, color: colors.onSurfaceVariant }]}>
            {t('searched_as')}: {searchedAs}
          </Text>
        ) : null}

        {/* Results */}
        {loading ? (
          <JobCardSkeleton count={5} />
        ) : error ? (
          <Text style={[styles.message, { color: colors.error }]}>{t('load_error')}</Text>
        ) : cards.length === 0 ? (
          <View style={styles.empty}>
            <Image
              source={require('@/assets/jobwasil/jobwasil-magician.png')}
              style={styles.emptyImage}
            />
            <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
              {t('no_results')}
            </Text>
          </View>
        ) : (
          cards.map((card) => (
            <JobCard key={card.id} job={card} onPress={() => router.push(`/job/${card.id}`)} />
          ))
        )}
      </ScrollView>

      <FilterSheet
        visible={filterVisible}
        filters={filters}
        onDismiss={() => setFilterVisible(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterVisible(false);
          loadJobs(query, f);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 90 },
  brandRow: { alignItems: 'center', gap: 12, marginBottom: 16 },
  logo: { width: 64, height: 64 },
  brandText: { flex: 1 },
  brandName: { fontWeight: '800' },
  searchRow: { alignItems: 'center', gap: 4, marginBottom: 16 },
  searchedAs: { marginTop: -8, marginBottom: 12 },
  searchBar: { flex: 1 },
  badge: { position: 'absolute', top: 2, right: 2 },
  message: { marginTop: 24, textAlign: 'center', fontSize: 15 },
  empty: { alignItems: 'center', marginTop: 32 },
  emptyImage: { width: 110, height: 110, opacity: 0.5 },
});
