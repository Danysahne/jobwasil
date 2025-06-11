import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Card } from 'react-native-paper';
import { fetchJobs } from '@/services/BundesApi';

export default function HomeScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await fetchJobs(10, 1);
        const results =
          (data as any)?.stellenangebote || (data as any)?.jobs || (data as any)?.result || [];
        setJobs(Array.isArray(results) ? results : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator animating style={styles.loading} />
      ) : (
        jobs.map((job, idx) => (
          <Card key={idx} style={styles.card}>
            <Card.Title
              title={job.berufsbezeichnung || job.titel || job.title}
              subtitle={job.arbeitsort || job.ort || job.location}
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
});
