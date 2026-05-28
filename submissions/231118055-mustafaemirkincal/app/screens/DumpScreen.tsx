import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyzeNotes, IdeaCard } from '../services/claudeApi';
import { RootStackParamList } from '../App';
import AuditWidget from '../components/AuditWidget';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dump'>;
};

const PLACEHOLDER = `WhatsApp export or rough notes work fine.

1. Launch idea cards for student projects
2. Need a cleaner way to deduplicate repeated decisions
3. This pitch feels strong but the scope is too wide
4. Follow up with design team before Friday
5. Maybe the mobile app should highlight the most actionable items
6. Decision: keep the first version local-first
7. Risk: no stable API key for the demo device
8. Repeated note: launch idea cards for student projects`;

export default function DumpScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  function handleChange(nextText: string) {
    setText(nextText);
    const lines = nextText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
    setLineCount(lines.length);
  }

  function appendExtraNote() {
    const next = extraNote.trim();
    if (!next) {
      Alert.alert('Empty note', 'Type a short extra note first.');
      return;
    }

    const separator = text.trim() ? '\n' : '';
    handleChange(`${text}${separator}${next}`);
    setExtraNote('');
  }

  async function handleAnalyze() {
    if (!text.trim()) {
      Alert.alert('Empty input', 'Paste a note dump, pitch, or messy chat export first.');
      return;
    }

    setLoading(true);
    try {
      const cards: IdeaCard[] = await analyzeNotes(text);
      navigation.navigate('Cards', { cards });
    } catch (error: any) {
      Alert.alert('Analysis failed', error?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>NOKTA</Text>
            <Text style={styles.kicker}>Idea Input, audit and handoff</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{lineCount || '0'} lines</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Turn messy notes into idea cards.</Text>
          <Text style={styles.heroCopy}>
            Paste WhatsApp exports, bullet lists, or rough meeting notes. NOKTA groups duplicates,
            trims the noise, and surfaces the most actionable cards.
          </Text>

          <View style={styles.chips}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Dedup</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Traceable</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>AI ready</Text>
            </View>
          </View>
        </View>

        <View style={styles.sampleBox}>
          <Text style={styles.sampleTitle}>What it handles</Text>
          <Text style={styles.sampleText}>
            Repeated ideas, mixed languages, team decisions, action items, and risk notes from
            chaotic chat logs or brainstorming dumps.
          </Text>
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder={PLACEHOLDER}
          placeholderTextColor="#7b8095"
          value={text}
          onChangeText={handleChange}
          textAlignVertical="top"
        />

        <View style={styles.extraNoteBox}>
          <Text style={styles.sampleTitle}>Add extra note</Text>
          <TextInput
            style={styles.extraInput}
            placeholder="Type one more line and append it to the dump"
            placeholderTextColor="#7b8095"
            value={extraNote}
            onChangeText={setExtraNote}
          />
          <TouchableOpacity style={styles.extraBtn} onPress={appendExtraNote}>
            <Text style={styles.extraBtnText}>Append note</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0b1020" />
          ) : (
            <Text style={styles.buttonText}>Analyze and deduplicate</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Avatar')}>
            <Text style={styles.linkText}>Avatar lab</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Bridge')}>
            <Text style={styles.linkText}>Expert bridge</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Local fallback is built in. The APK reads `EXPO_PUBLIC_GEMINI_API_KEY` from build-time
          config, so rebuild after editing `app/.env.local` if you want model-backed extraction.
        </Text>
      </ScrollView>

      <AuditWidget screenName="Idea Input" notes={text} cards={[]} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1020',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -100,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
  },
  bgGlowBottom: {
    position: 'absolute',
    left: -80,
    bottom: -120,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(34, 211, 238, 0.10)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brand: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  kicker: {
    color: '#98a2b3',
    marginTop: 2,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pill: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
    borderColor: 'rgba(248, 250, 252, 0.12)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    color: '#dbe4ff',
    fontSize: 12,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroCopy: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 10,
  },
  chip: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderColor: 'rgba(250, 204, 21, 0.25)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: '700',
  },
  sampleBox: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderColor: 'rgba(34, 211, 238, 0.16)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sampleTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  sampleText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
  },
  extraNoteBox: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderColor: 'rgba(34, 211, 238, 0.16)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  extraInput: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  extraBtn: {
    backgroundColor: '#22d3ee',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  extraBtnText: {
    color: '#07111f',
    fontSize: 13,
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1,
    borderRadius: 24,
    minHeight: 250,
    padding: 18,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#0b1020',
    fontSize: 16,
    fontWeight: '900',
  },
  linkRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  linkBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  linkText: {
    color: '#e2e8f0',
    fontWeight: '800',
    fontSize: 13,
  },
  footerNote: {
    color: '#7c8aa6',
    fontSize: 12,
    lineHeight: 18,
  },
});
