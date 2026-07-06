import { JobCard, JobCardData } from '@/components/JobCard';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { t, isArabic } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();

  const cards: JobCardData[] = favorites.map((fav) => ({
    id: fav.id,
    title: isArabic ? fav.titelAr ?? fav.titel : fav.titel,
    titleDe: fav.titel,
    titleAr: fav.titelAr,
    employer: fav.arbeitgeber,
    beruf: fav.beruf,
    location: fav.ort,
    date: fav.savedAt
      ? new Date(fav.savedAt).toLocaleDateString(isArabic ? 'ar' : 'de-DE')
      : undefined,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={[styles.heading, { color: colors.primary }]}>
          {t('tab_favorites')}
        </Text>
        {cards.length === 0 ? (
          <View style={styles.empty}>
            <Image
              source={require('@/assets/jobwasil/jobwasil-magician.png')}
              style={styles.emptyImage}
            />
            <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
              {t('favorites_empty')}
            </Text>
          </View>
        ) : (
          cards.map((card) => (
            <JobCard key={card.id} job={card} onPress={() => router.push(`/job/${card.id}`)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 90 },
  heading: { fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  empty: { alignItems: 'center', marginTop: 48 },
  emptyImage: { width: 110, height: 110, opacity: 0.5, marginBottom: 16 },
  message: { textAlign: 'center', fontSize: 15, lineHeight: 24 },
});
