import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Chip, Surface } from 'react-native-paper';

const COLORS = {
  success: '#22c55e',
  rollback: '#fb7185',
  fail: '#fb7185',
};

export default function ForgeRail({ cycles, stats, onOpenBridge, bridgeHint }) {
  return (
    <Surface style={styles.wrap} elevation={1}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Forge ledger</Text>
          <Text style={styles.subtitle}>
            20 minute cycles · success + rollback ratchet
          </Text>
        </View>
        <Chip icon={stats.stuck ? 'alert' : 'check'} style={styles.chip}>
          {stats.stuck ? 'STUCK' : 'Healthy'}
        </Chip>
      </View>

      {stats.stuck ? (
        <View style={styles.bridgeBox}>
          <Text style={styles.bridgeTitle}>Two failures in a row. Open the expert bridge.</Text>
          <Text style={styles.bridgeText}>{bridgeHint}</Text>
          <Button mode="contained" onPress={onOpenBridge} style={styles.bridgeButton}>
            Uzmana Bağlan
          </Button>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {cycles.map((cycle) => {
          const tint = COLORS[cycle.result] || '#f8fafc';
          return (
            <View key={cycle.cycle} style={styles.card}>
              <View style={[styles.badge, { borderColor: tint }]}>
                <Text style={[styles.badgeText, { color: tint }]}>
                  {cycle.result.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.cycle}>Cycle {cycle.cycle}</Text>
              <Text style={styles.report} numberOfLines={1}>
                {cycle.report}
              </Text>
              <Text style={styles.hypothesis} numberOfLines={3}>
                {cycle.hypothesis}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: tint }]}>{cycle.kg}kg</Text>
                <Text style={styles.meta}>{cycle.humanTouches || 0} touches</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 28,
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  chip: {
    backgroundColor: 'rgba(248, 250, 252, 0.06)',
  },
  bridgeBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.20)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  bridgeTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },
  bridgeText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  bridgeButton: {
    alignSelf: 'flex-start',
  },
  rail: {
    gap: 12,
    paddingVertical: 4,
  },
  card: {
    width: 210,
    borderRadius: 22,
    padding: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  cycle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  report: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  hypothesis: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
    minHeight: 58,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
});
