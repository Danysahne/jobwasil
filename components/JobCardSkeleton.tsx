import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

function Bone({ width, height }: { width: number | `${number}%`; height: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 6,
        backgroundColor: colors.surfaceVariant,
      }}
    />
  );
}

export function JobCardSkeleton({ count = 5 }: { count?: number }) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={styles.card} mode="elevated">
          <Card.Content>
            <Animated.View style={[styles.content, pulse]}>
              <Bone width="85%" height={20} />
              <Bone width="55%" height={14} />
              <View style={styles.chipRow}>
                <Bone width={90} height={28} />
                <Bone width={80} height={28} />
              </View>
            </Animated.View>
          </Card.Content>
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  content: { gap: 8 },
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
});
