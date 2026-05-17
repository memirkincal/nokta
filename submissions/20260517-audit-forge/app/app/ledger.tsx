import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenShell } from '@/components/ScreenShell';
import { theme } from '@/constants/theme';

const cycles = [
  { id: '01', label: 'READ', kg: 1, note: 'Read the burn-in report and identify the host boundary.' },
  { id: '02', label: 'LOCATE', kg: 2, note: 'Map the issue to the screen and the smallest possible file set.' },
  { id: '03', label: 'HYPOTHESIZE', kg: 3, note: 'Write one repair idea before touching code.' },
  { id: '04', label: 'REPAIR', kg: 4, note: 'Make a small change and keep the diff narrow.' },
  { id: '05', label: 'VERIFY', kg: 5, note: 'Check that the change still behaves like a drop-in primitive.' },
];

export default function LedgerScreen() {
  return (
    <ScreenShell
      title="Ratchet first, heroics later"
      eyebrow="Phase B"
      blurb="The ledger explains how the host app stays honest: each success adds weight, and the rollback stays visible instead of getting erased."
      currentRoute="ledger"
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <Ionicons name="repeat" size={18} color={theme.accent} />
          <Text style={styles.summaryLabel}>Forge loop</Text>
        </View>
        <Text style={styles.summaryText}>
          The workflow is intentionally monotonic. The kg column rises, the rollback is named, and the human touch points are counted.
        </Text>
      </View>

      <View style={styles.tape}>
        {cycles.map((cycle, index) => (
          <View key={cycle.id} style={styles.cycleCard}>
            <Text style={styles.cycleId}>{cycle.id}</Text>
            <Text style={styles.cycleLabel}>{cycle.label}</Text>
            <Text style={styles.cycleNote}>{cycle.note}</Text>
            <Text style={styles.cycleKg}>{cycle.kg} kg</Text>
            {index < cycles.length - 1 ? <View style={styles.connector} /> : null}
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: theme.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 18,
    gap: 10,
    marginBottom: 14,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryLabel: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  summaryText: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  tape: {
    gap: 12,
  },
  cycleCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  cycleId: {
    color: theme.accent2,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  cycleLabel: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '900',
  },
  cycleNote: {
    color: theme.muted,
    lineHeight: 20,
    fontSize: 13,
  },
  cycleKg: {
    color: theme.success,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  connector: {
    position: 'absolute',
    left: 32,
    bottom: -12,
    width: 2,
    height: 12,
    backgroundColor: 'rgba(255,191,95,0.30)',
  },
});
