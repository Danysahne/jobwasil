import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Searchbar } from 'react-native-paper';
import { fetchJobs, searchJobs } from '@/services/BundesApi';
import { useRouter } from 'expo-router';
import type { Job } from '@/JobwasilAPI';

function formatArbeitsort(arbeitsort?: Job['arbeitsort']): string {
  if (!arbeitsort) return '';
  const { ort, plz } = arbeitsort;
  return `${ort ?? ''} ${plz ?? ''}`.trim();
}

export default function HomeScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const router = useRouter();

  async function loadJobs(search?: string) {
    setLoading(true);
    try {
      const data = search ? await searchJobs(search, 10, 1) : await fetchJobs(10, 1);
      const results =
        (data as any)?.stellenangebote || (data as any)?.jobs || (data as any)?.result || [];
      setJobs(Array.isArray(results) ? results : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function onSearch() {
    loadJobs(query);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Searchbar
        placeholder="Search jobs"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={onSearch}
        style={styles.searchBar}
      />
      {loading ? (
        <ActivityIndicator animating style={styles.loading} />
      ) : (
        jobs.map((job, idx) => (
          <Card
            key={idx}
            style={styles.card}
            onPress={() =>
              router.push(`/job/${(job as any).hashId || (job as any).refnr || idx}`)
            }>
            <Card.Title
              title={job.berufsbezeichnung || job.titel || job.title}
              subtitle={
                job.arbeitsort
                  ? formatArbeitsort(job.arbeitsort)
                  : job.ort || job.location || ''
              }
            />
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  loading: {
    marginTop: 32,
  },
  searchBar: {
    marginBottom: 16,
  },
});
