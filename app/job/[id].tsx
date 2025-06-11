import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import type { Job } from '@/JobwasilAPI';
import { fetchJobDetail } from '@/services/BundesApi';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (typeof id !== 'string') return;
      try {
        const data = await fetchJobDetail(id);
        setJob(data as Job);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <>
      <Stack.Screen options={{ title: job?.berufsbezeichnung || job?.titel || job?.title || 'Job Detail' }} />
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator />
        ) : job ? (
          <Card>
            <Card.Title title={job.berufsbezeichnung || job.titel || job.title} />
            <Card.Content>
              <Text>{JSON.stringify(job, null, 2)}</Text>
            </Card.Content>
          </Card>
        ) : (
          <Text>No data available.</Text>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
