import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { captureRef as captureViewRef, captureScreen as captureWholeScreen } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { AuditWidget, type AuditStorage } from './mobile-audit/src';
import { loadAuditNotes, saveAuditNotes } from './src/auditStorage';

type ScreenId = 'home' | 'inspection' | 'settings';

const SCREENS: Array<{
  id: ScreenId;
  title: string;
  subtitle: string;
  accent: string;
  chips: string[];
}> = [
  {
    id: 'home',
    title: 'Home',
    subtitle: 'Dashboard snapshot with quick stats and a visual bug trail.',
    accent: '#ff6b6b',
    chips: ['Queue', 'Signals', 'Summary'],
  },
  {
    id: 'inspection',
    title: 'Inspection',
    subtitle: 'A denser surface for checking edge cases and layout regressions.',
    accent: '#4ecdc4',
    chips: ['Forms', 'Spacing', 'Feedback'],
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Stable controls, toggles, and a place to compare states.',
    accent: '#ffd166',
    chips: ['Theme', 'Sync', 'Access'],
  },
];

const SAMPLE_CARDS = [
  {
    title: 'Launch queue',
    body: 'Bug reports should be readable enough to hand to a coding agent without extra cleanup.',
  },
  {
    title: 'Burn-in preview',
    body: 'The selected region must stay visible in the exported artifact, not just in the app.',
  },
  {
    title: 'Local storage',
    body: 'Notes should live on device first so the widget can work without a backend.',
  },
];

const storage: AuditStorage = {
  loadNotes: loadAuditNotes,
  saveNotes: saveAuditNotes,
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const activeScreen = useMemo(
    () => SCREENS.find((screen) => screen.id === currentScreen) ?? SCREENS[0],
    [currentScreen]
  );

  const writeFile = async (filename: string, content: string) => {
    const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}${filename}`;
    await FileSystem.writeAsStringAsync(uri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return uri;
  };

  const writeFileBinary = async (filename: string, base64: string) => {
    const uri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}${filename}`;
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return uri;
  };

  const shareFile = async (uri: string) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backdropTop} />
      <View style={styles.backdropBottom} />

      <View style={styles.appShell}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>Nokta audit host</Text>
              <Text style={styles.title}>Three screens, one bug trail.</Text>
              <Text style={styles.subtitle}>
                This demo is wired for drop-in bug capture, burn-in selection, and markdown export.
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{activeScreen.title}</Text>
            </View>
          </View>

          <View style={styles.navRow}>
            {SCREENS.map((screen) => {
              const active = screen.id === currentScreen;
              return (
                <Pressable
                  key={screen.id}
                  onPress={() => setCurrentScreen(screen.id)}
                  style={({ pressed }) => [
                    styles.navButton,
                    active && { borderColor: screen.accent, backgroundColor: `${screen.accent}22` },
                    pressed && styles.navPressed,
                  ]}
                >
                  <Text style={[styles.navTitle, active && { color: screen.accent }]}>
                    {screen.title}
                  </Text>
                  <Text style={styles.navSubtitle}>{screen.subtitle}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.heroCard}>
            <View style={[styles.heroAccent, { backgroundColor: activeScreen.accent }]} />
            <Text style={styles.heroLabel}>{activeScreen.title} screen</Text>
            <Text style={styles.heroText}>{activeScreen.subtitle}</Text>
            <View style={styles.chipRow}>
              {activeScreen.chips.map((chip) => (
                <View key={chip} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.cardGrid}>
            {SAMPLE_CARDS.map((card) => (
              <View key={card.title} style={styles.card}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardBody}>{card.body}</Text>
              </View>
            ))}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Why this host exists</Text>
            <Text style={styles.panelText}>
              The audit widget is mounted as a floating overlay. Tap the red FAB to capture a
              screen, draw a yellow burn-in box, and export a markdown report from the same device.
            </Text>
            <Text style={styles.panelText}>
              The current screen marker is forwarded into the widget so exported notes keep a stable
              provenance trail.
            </Text>
          </View>
        </ScrollView>

        <AuditWidget
          appName="Nokta Audit Host"
          initialPosition={{ bottom: 108, right: 18 }}
          deps={{
            captureScreen: () => captureWholeScreen({ format: 'png', quality: 0.95, result: 'tmpfile' }),
            captureRef: (ref) =>
              captureViewRef(ref, { format: 'png', quality: 0.95, result: 'tmpfile' }),
            writeFile,
            writeFileBinary,
            shareFile,
            storage,
            currentScreen: activeScreen.title,
            reporterId: 'local-dev',
            BugIcon: <Text style={styles.bugIcon}>B</Text>,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#081120',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#081120',
  },
  backdropTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 107, 107, 0.16)',
  },
  backdropBottom: {
    position: 'absolute',
    left: -100,
    bottom: 140,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(78, 205, 196, 0.12)',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 180,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  kicker: {
    color: '#8aa0c6',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontSize: 12,
    marginBottom: 6,
  },
  title: {
    color: '#f6f8ff',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    maxWidth: 260,
  },
  subtitle: {
    color: '#aab7d4',
    marginTop: 10,
    lineHeight: 20,
    maxWidth: 330,
  },
  pill: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    color: '#f6f8ff',
    fontWeight: '700',
  },
  navRow: {
    gap: 10,
  },
  navButton: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  navPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  navTitle: {
    color: '#f6f8ff',
    fontSize: 18,
    fontWeight: '700',
  },
  navSubtitle: {
    color: '#aab7d4',
    marginTop: 6,
    lineHeight: 18,
  },
  heroCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: '#101a30',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    gap: 10,
  },
  heroAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 140,
    height: 140,
    borderBottomLeftRadius: 140,
    opacity: 0.18,
  },
  heroLabel: {
    color: '#8aa0c6',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: '700',
  },
  heroText: {
    color: '#f6f8ff',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    maxWidth: 320,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    color: '#dbe4ff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardGrid: {
    gap: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    color: '#f6f8ff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardBody: {
    color: '#aab7d4',
    lineHeight: 20,
  },
  panel: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  panelTitle: {
    color: '#f6f8ff',
    fontSize: 17,
    fontWeight: '700',
  },
  panelText: {
    color: '#aab7d4',
    lineHeight: 20,
  },
  bugIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
});
