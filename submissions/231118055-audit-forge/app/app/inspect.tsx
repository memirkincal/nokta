import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenShell } from '@/components/ScreenShell';
import { AUDIT_FIXTURES } from '@/lib/audit-samples';
import { theme } from '@/constants/theme';

export default function InspectScreen() {
  return (
    <ScreenShell
      title="Evidence cards with room to breathe"
      eyebrow="Phase A"
      blurb="Each report keeps one issue in focus. The burn-in image, the note, and the repair path all point to the same thing."
      currentRoute="inspect"
    >
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <Ionicons name="scan" size={18} color={theme.accent2} />
          <Text style={styles.heroLabel}>Three reports, three screens</Text>
        </View>
        <Text style={styles.heroText}>
          The audit notes are arranged so a coding agent can read them as separate inputs instead of one giant blob.
        </Text>
      </View>

      <View style={styles.reportList}>
        {AUDIT_FIXTURES.map((fixture, index) => (
          <View key={fixture.screenKey} style={styles.reportCard}>
            <View style={styles.reportTop}>
              <Text style={styles.reportIndex}>0{index + 1}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>burn-in ready</Text>
              </View>
            </View>
            <Text style={styles.reportTitle}>{fixture.reportTitle}</Text>
            <Text style={styles.reportBody}>{fixture.issue}</Text>
            <Text style={styles.reportHint}>{fixture.noteSeed}</Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 18,
    marginBottom: 14,
    gap: 10,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroLabel: {
    color: theme.accent2,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroText: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  reportList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportIndex: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(126,231,135,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(126,231,135,0.24)',
  },
  statusText: {
    color: theme.success,
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  reportTitle: {
    color: theme.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
  },
  reportBody: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  reportHint: {
    color: theme.accent2,
    fontSize: 12,
    lineHeight: 18,
  },
});
