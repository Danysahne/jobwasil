import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { TranslatingText } from '@/components/Shimmer';
import { iconForJob } from '@/constants/jobIcons';
import { useFavorites, FavoriteJob } from '@/context/FavoritesContext';
import { useDirection } from '@/hooks/useDirection';

export interface JobCardData {
  id: string;
  title: string;
  employer?: string;
  location?: string;
  date?: string;
  /** German original title — stored in favorites regardless of display language. */
  titleDe: string;
  titleAr?: string;
  /** German job category (beruf) — drives the category icon. */
  beruf?: string;
  /** True while the Arabic translation for this card is still loading. */
  translating?: boolean;
}

export function JobCard({ job, onPress }: { job: JobCardData; onPress: () => void }) {
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isRTL, textAlign, row } = useDirection();
  const fav = isFavorite(job.id);

  const favoriteJob: FavoriteJob = {
    id: job.id,
    titel: job.titleDe,
    titelAr: job.titleAr,
    arbeitgeber: job.employer,
    ort: job.location,
    beruf: job.beruf,
    savedAt: 0,
  };

  return (
    <Card style={styles.card} mode="elevated" onPress={onPress}>
      <Card.Content>
        <View style={[styles.headerRow, { flexDirection: row }]}>
          <Avatar.Icon
            icon={iconForJob(job.beruf ?? job.titleDe)}
            size={42}
            style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}
            color={colors.onPrimaryContainer}
          />
          <View style={styles.titleWrap}>
            <TranslatingText pending={!!job.translating} lines={2} lineHeight={17}>
              <Text
                variant="titleMedium"
                style={[styles.title, { textAlign }]}
                numberOfLines={2}>
                {job.title}
              </Text>
            </TranslatingText>
          </View>
          <IconButton
            icon={fav ? 'heart' : 'heart-outline'}
            iconColor={fav ? colors.primary : colors.onSurfaceVariant}
            size={22}
            style={styles.heart}
            onPress={() => toggleFavorite(favoriteJob)}
            accessibilityLabel={fav ? 'Remove favorite' : 'Add favorite'}
          />
        </View>
        {job.employer ? (
          <Text
            variant="bodyMedium"
            style={[{ textAlign, color: colors.onSurfaceVariant }]}
            numberOfLines={1}>
            {job.employer}
          </Text>
        ) : null}
        <View style={[styles.chipRow, { flexDirection: row }]}>
          {job.location ? (
            <Chip icon="map-marker" compact style={styles.chip} textStyle={styles.chipText}>
              {job.location}
            </Chip>
          ) : null}
          {job.date ? (
            <Chip icon="calendar" compact style={styles.chip} textStyle={styles.chipText}>
              {job.date}
            </Chip>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  headerRow: { alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  avatar: { marginTop: 2 },
  titleWrap: { flex: 1, justifyContent: 'center', minHeight: 42 },
  title: { fontWeight: '700' },
  heart: { margin: 0, marginTop: -6 },
  chipRow: { flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: { height: 30 },
  chipText: { fontSize: 12, lineHeight: 14 },
});
