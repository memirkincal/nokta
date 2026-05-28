import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AuditWidget from '../components/AuditWidget';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Avatar'>;
};

const VISUAL_BARS = [0.42, 0.68, 0.24, 0.74, 0.54, 0.33, 0.62, 0.21];

export default function AvatarScreen({ navigation }: Props) {
  async function openAssetGuide() {
    await Linking.openURL('https://avaturn.me');
  }

  return (
    <View style={styles.container}>
      <View style={styles.bgGlowOne} />
      <View style={styles.bgGlowTwo} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Avatar lab</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Put your face here later.</Text>
          <Text style={styles.heroCopy}>
            Replace the placeholder with your custom `avatar.glb`, then connect voice level and lipsync.
          </Text>
        </View>

        <View style={styles.stage}>
          <View style={styles.face}>
            <View style={styles.eyeRow}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            <View style={styles.mouth} />
          </View>
        </View>

        <View style={styles.waveCard}>
          <Text style={styles.sectionTitle}>Voice bars</Text>
          <View style={styles.bars}>
            {VISUAL_BARS.map((bar, index) => (
              <View key={String(index)} style={[styles.bar, { height: 24 + bar * 64 }]} />
            ))}
          </View>
        </View>

        <View style={styles.steps}>
          <Text style={styles.sectionTitle}>What you do next</Text>
          <Text style={styles.step}>1. Export your face from Avaturn as GLB.</Text>
          <Text style={styles.step}>2. Save it as `app/assets/avatar.glb`.</Text>
          <Text style={styles.step}>3. Later, map mouth/jaw nodes to the mic level or viseme data.</Text>
          <Text style={styles.step}>4. Rebuild the APK after the asset is added.</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={openAssetGuide}>
          <Text style={styles.primaryText}>Open Avaturn</Text>
        </TouchableOpacity>
      </ScrollView>

      <AuditWidget screenName="Avatar Lab" notes="Avatar placeholder and voice bars." cards={[]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  bgGlowOne: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(34, 211, 238, 0.11)',
  },
  bgGlowTwo: {
    position: 'absolute',
    bottom: -90,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(250, 204, 21, 0.09)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  backText: {
    color: '#e2e8f0',
    fontWeight: '800',
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 24,
    padding: 18,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroCopy: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  stage: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.14)',
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: {
    width: 180,
    height: 180,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    backgroundColor: 'rgba(103, 232, 249, 0.06)',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 30,
  },
  eye: {
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: '#67e8f9',
  },
  mouth: {
    width: 56,
    height: 18,
    borderBottomWidth: 4,
    borderBottomColor: '#67e8f9',
    borderRadius: 18,
  },
  waveCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    height: 100,
  },
  bar: {
    flex: 1,
    borderRadius: 99,
    backgroundColor: '#67e8f9',
    opacity: 0.85,
  },
  steps: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 24,
    padding: 16,
    gap: 8,
  },
  step: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#facc15',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#08111f',
    fontWeight: '900',
  },
});
