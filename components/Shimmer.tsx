import React, { useEffect } from 'react';
import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

function usePulse() {
  const opacity = useSharedValue(0.45);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 650 }), -1, true);
  }, [opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

/** A single pulsing placeholder bar, sized like a line of text. */
export function ShimmerLine({
  width = '100%',
  height = 16,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const pulse = usePulse();
  return (
    <Animated.View
      style={[
        pulse,
        { width, height, borderRadius: height / 2, backgroundColor: colors.surfaceVariant },
        style,
      ]}
    />
  );
}

/** A block of pulsing lines with varied widths, resembling a paragraph. */
export function ShimmerParagraph({
  lines = 6,
  lineHeight = 14,
}: {
  lines?: number;
  lineHeight?: number;
}) {
  const widths: DimensionValue[] = ['100%', '92%', '97%', '85%', '95%', '70%'];
  return (
    <View style={styles.paragraph}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerLine key={i} width={widths[i % widths.length]} height={lineHeight} />
      ))}
    </View>
  );
}

/**
 * Shows shimmer lines while `pending`, then fades the children in.
 * Used for text that arrives asynchronously (Arabic translations).
 */
export function TranslatingText({
  pending,
  lines = 1,
  lineHeight = 16,
  lastLineWidth = '60%',
  children,
}: {
  pending: boolean;
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: DimensionValue;
  children: React.ReactNode;
}) {
  const opacity = useSharedValue(1);
  const wasPending = React.useRef(pending);

  useEffect(() => {
    if (wasPending.current && !pending) {
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 450 });
    }
    wasPending.current = pending;
  }, [pending, opacity]);

  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (pending) {
    return (
      <View style={styles.paragraph}>
        {Array.from({ length: lines }).map((_, i) => (
          <ShimmerLine
            key={i}
            width={i === lines - 1 ? lastLineWidth : '100%'}
            height={lineHeight}
          />
        ))}
      </View>
    );
  }

  return <Animated.View style={fade}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  paragraph: { gap: 8, alignSelf: 'stretch' },
});
