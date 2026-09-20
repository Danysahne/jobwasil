import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  Modal,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useLanguage } from '@/context/LanguageContext';
import { useDirection } from '@/hooks/useDirection';

export type WorkTime = 'vz' | 'tz' | 'ho' | 'snw' | 'mj';

export interface JobFilters {
  wo?: string;
  umkreis?: number;
  arbeitszeit?: WorkTime[];
}

export function countActiveFilters(f: JobFilters): number {
  let n = 0;
  if (f.wo) n++;
  if (f.arbeitszeit?.length) n += f.arbeitszeit.length;
  return n;
}

const WORK_TIMES: WorkTime[] = ['vz', 'tz', 'ho', 'snw', 'mj'];
const RADII = ['10', '25', '50', '100'];

export function FilterSheet({
  visible,
  filters,
  onDismiss,
  onApply,
}: {
  visible: boolean;
  filters: JobFilters;
  onDismiss: () => void;
  onApply: (f: JobFilters) => void;
}) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { textAlign, row } = useDirection();

  const [wo, setWo] = useState(filters.wo ?? '');
  const [umkreis, setUmkreis] = useState(String(filters.umkreis ?? 25));
  const [worktime, setWorktime] = useState<WorkTime[]>(filters.arbeitszeit ?? []);

  // Re-sync local state when the sheet opens with new outer filters
  React.useEffect(() => {
    if (visible) {
      setWo(filters.wo ?? '');
      setUmkreis(String(filters.umkreis ?? 25));
      setWorktime(filters.arbeitszeit ?? []);
    }
  }, [visible, filters]);

  const toggleWorktime = (wt: WorkTime) =>
    setWorktime((prev) => (prev.includes(wt) ? prev.filter((x) => x !== wt) : [...prev, wt]));

  const apply = () =>
    onApply({
      wo: wo.trim() || undefined,
      umkreis: wo.trim() ? Number(umkreis) : undefined,
      arbeitszeit: worktime.length ? worktime : undefined,
    });

  const reset = () => onApply({});

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
        <Text variant="titleLarge" style={[styles.heading, { textAlign }]}>
          {t('filters')}
        </Text>

        <Text variant="labelLarge" style={[styles.label, { textAlign }]}>
          {t('filter_location')}
        </Text>
        <TextInput
          mode="outlined"
          value={wo}
          onChangeText={setWo}
          placeholder={t('filter_location_placeholder')}
          left={<TextInput.Icon icon="map-marker" />}
          style={styles.input}
        />

        <Text variant="labelLarge" style={[styles.label, { textAlign }]}>
          {t('filter_radius')} (km)
        </Text>
        <SegmentedButtons
          value={umkreis}
          onValueChange={setUmkreis}
          buttons={RADII.map((r) => ({ value: r, label: r }))}
        />

        <Text variant="labelLarge" style={[styles.label, { textAlign }]}>
          {t('filter_worktime')}
        </Text>
        <View style={[styles.chipRow, { flexDirection: row }]}>
          {WORK_TIMES.map((wt) => (
            <Chip
              key={wt}
              selected={worktime.includes(wt)}
              showSelectedCheck
              onPress={() => toggleWorktime(wt)}
              style={styles.chip}>
              {t(`worktime_${wt}`)}
            </Chip>
          ))}
        </View>

        <View style={[styles.actions, { flexDirection: row }]}>
          <Button mode="contained" onPress={apply} style={styles.actionBtn}>
            {t('apply')}
          </Button>
          <Button mode="outlined" onPress={reset} style={styles.actionBtn}>
            {t('reset')}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 16,
    marginTop: 'auto',
    marginBottom: 32,
    padding: 20,
    borderRadius: 20,
    gap: 4,
  },
  heading: { fontWeight: '700', marginBottom: 8 },
  label: { marginTop: 14, marginBottom: 6 },
  input: { marginBottom: 2 },
  chipRow: { flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 2 },
  actions: { gap: 12, marginTop: 22 },
  actionBtn: { flex: 1 },
});
