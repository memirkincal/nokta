import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/constants/theme';

type ScreenShellProps = {
  title: string;
  eyebrow: string;
  blurb: string;
  children: ReactNode;
  currentRoute: 'home' | 'inspect' | 'ledger';
};

const routes = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'inspect', label: 'Inspect', href: '/inspect' },
  { key: 'ledger', label: 'Ledger', href: '/ledger' },
] as const;

export function ScreenShell({ title, eyebrow, blurb, children, currentRoute }: ScreenShellProps) {
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.bg, theme.bgSoft, '#090d17']} style={styles.root}>
      <View style={styles.glowA} />
      <View style={styles.glowB} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.navRow}>
          {routes.map((route) => (
            <Pressable
              key={route.key}
              onPress={() => router.push(route.href)}
              style={({ pressed }) => [
                styles.navChip,
                currentRoute === route.key && styles.navChipActive,
                pressed && styles.navChipPressed,
              ]}
            >
              <Text style={[styles.navChipText, currentRoute === route.key && styles.navChipTextActive]}>
                {route.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.blurb}>{blurb}</Text>
        </View>

        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glowA: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,191,95,0.16)',
  },
  glowB: {
    position: 'absolute',
    bottom: 120,
    left: -100,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(99,208,255,0.12)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 68,
    paddingBottom: 40,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  navChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: theme.line,
  },
  navChipActive: {
    backgroundColor: 'rgba(255,191,95,0.16)',
    borderColor: 'rgba(255,191,95,0.45)',
  },
  navChipPressed: {
    transform: [{ scale: 0.98 }],
  },
  navChipText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  navChipTextActive: {
    color: theme.text,
  },
  hero: {
    gap: 10,
    marginBottom: 22,
  },
  eyebrow: {
    color: theme.accent,
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: theme.text,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1.3,
  },
  blurb: {
    color: theme.muted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 620,
  },
});
