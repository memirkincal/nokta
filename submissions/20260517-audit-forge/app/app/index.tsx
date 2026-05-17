import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenShell } from '@/components/ScreenShell';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ScreenShell
      title="Drop-in audit, no backend"
      eyebrow="Phase A"
      blurb="The host app stays simple. One mount point, three routes, and a floating widget that turns a visual annoyance into a markdown artifact."
      currentRoute="home"
    >
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconBubble}>
            <Ionicons name="flash" size={20} color={theme.bg} />
          </View>
          <Text style={styles.cardTitle}>Single mount</Text>
        </View>
        <Text style={styles.cardText}>
          The audit widget lives in the host tree, but it does not own navigation or storage. The boundary stays sharp.
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.tile}>
          <Text style={styles.tileKicker}>1</Text>
          <Text style={styles.tileTitle}>Capture</Text>
          <Text style={styles.tileText}>Tap the FAB, take the screen, and keep the visual context.</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileKicker}>2</Text>
          <Text style={styles.tileTitle}>Burn in</Text>
          <Text style={styles.tileText}>Yellow highlight becomes part of the image, not a loose overlay.</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileKicker}>3</Text>
          <Text style={styles.tileTitle}>Export</Text>
          <Text style={styles.tileText}>Markdown goes straight to the coding agent or the review thread.</Text>
        </View>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteMark}>A host app should survive without the widget.</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 18,
    gap: 10,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '900',
  },
  cardText: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  grid: {
    gap: 12,
    marginBottom: 14,
  },
  tile: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 20,
    padding: 16,
  },
  tileKicker: {
    color: theme.accent2,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  tileTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  tileText: {
    color: theme.muted,
    lineHeight: 20,
  },
  quoteCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,191,95,0.35)',
    backgroundColor: 'rgba(255,191,95,0.10)',
  },
  quoteMark: {
    color: theme.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
});
