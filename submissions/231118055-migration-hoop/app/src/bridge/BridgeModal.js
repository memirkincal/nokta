import React, { useMemo } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button, Surface } from 'react-native-paper';

const ROOM_NAME = 'NoktaBridge231118055';
const ROOM_URL = `https://meet.jit.si/${ROOM_NAME}`;

export default function BridgeModal({ visible, onClose, transcript, summary, onChangeSummary }) {
  const joinedText = useMemo(() => {
    return transcript
      ? transcript.slice(0, 180)
      : 'When the forge gets stuck twice in a row, this bridge opens automatically.';
  }, [transcript]);

  const openBrowser = async () => {
    await Linking.openURL(ROOM_URL);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Uzmana Bağlan</Text>
            <Text style={styles.subtitle}>Jitsi room · screen share + audio + video</Text>
          </View>
          <Button mode="text" textColor="#e2e8f0" onPress={onClose}>
            Kapat
          </Button>
        </View>

        <Surface style={styles.card} elevation={2}>
          <Text style={styles.label}>Bridge summary</Text>
          <Text style={styles.body}>{joinedText}</Text>
        </Surface>

        <Surface style={styles.webCard} elevation={2}>
          <WebView
            source={{ uri: ROOM_URL }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
          />
        </Surface>

        <Surface style={styles.card} elevation={2}>
          <Text style={styles.label}>Meeting notes for BRIDGE.md</Text>
          <TextInput
            value={summary}
            onChangeText={onChangeSummary}
            placeholder="What did the expert tell us?"
            placeholderTextColor="#64748b"
            style={styles.input}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.actions}>
            <Button mode="contained" onPress={openBrowser}>
              Open in browser
            </Button>
            <Button mode="outlined" textColor="#e2e8f0" onPress={onClose}>
              Back to forge
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07111d',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  label: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  webCard: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.18)',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.20)',
    borderRadius: 16,
    padding: 12,
    color: '#f8fafc',
    backgroundColor: 'rgba(8, 15, 33, 0.88)',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
});
