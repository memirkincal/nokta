import React, { useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

function makeBars(level) {
  const base = Math.max(0.04, Math.min(1, level));
  return Array.from({ length: 28 }, (_, index) => {
    const phase = index / 27;
    const wave = Math.sin((phase + 0.15) * Math.PI * 2) * 0.18 + 0.82;
    const bump = index % 3 === 0 ? 0.1 : index % 2 === 0 ? 0.05 : 0;
    return Math.max(0.08, Math.min(1, base * wave + bump));
  });
}

export default function VoiceVisualizer({ listening, level, transcript }) {
  const bars = useMemo(() => makeBars(level), [level]);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={[styles.pulse, listening && styles.pulseLive]} />
        <Text style={styles.label}>{listening ? 'Listening' : 'Mic idle'}</Text>
        <Text style={styles.levelText}>{Math.round(level * 100)}%</Text>
      </View>

      <View style={styles.waveRail}>
        {bars.map((value, index) => (
          <Animated.View
            key={`${index}-${value.toFixed(2)}`}
            style={[
              styles.bar,
              {
                height: 14 + value * 62,
                opacity: listening ? 0.35 + value * 0.65 : 0.28,
              },
              index % 5 === 0 && styles.barAccent,
            ]}
          />
        ))}
      </View>

      <Text style={styles.transcript} numberOfLines={3}>
        {transcript || 'Speak to see the wave and transcript land here.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#64748b',
  },
  pulseLive: {
    backgroundColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  label: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  levelText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  waveRail: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 14,
  },
  bar: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#7c5cff',
  },
  barAccent: {
    backgroundColor: '#22d3ee',
  },
  transcript: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
});
