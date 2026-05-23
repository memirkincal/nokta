import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Portal, Dialog, Button, FAB, Surface, Chip } from 'react-native-paper';

function buildReportMarkdown({ title, screen, transcript, level, persona, reason, kind }) {
  const stamp = new Date().toISOString();
  return `# Audit Report - ${title}

**Kind:** ${kind}
**Screen:** ${screen}
**Generated:** ${stamp}
**Persona:** ${persona}
**Mic level:** ${Math.round(level * 100)}%
**Burn-in:** Voice dictation + visual state captured from the current session

## Customer note

${reason}

## Dictated transcript

> ${transcript || 'No transcript yet. Speak into the mic and regenerate.'}

## Read

The current session shows the ${screen} flow during a live voice-driven demo.

## Locate

The issue or opportunity belongs to the current screen and its voice/bridge/forge surface.

## Hypothesize

${kind === 'bridge' ? 'If the assistant gets stuck twice, open the human bridge and hand the case to a person.' : 'The fix should stay small and keep the voice/avatar loop smooth.'}

## Repair

Use the dictated note to guide the next change.

## Test

Manual voice run, visual check, and forge ratchet review.

## Verify

The burn-in report is now available for the coding agent and can be pasted into the next cycle.`;
}

export default function AuditWidget({
  currentScreen,
  transcript,
  level,
  persona,
  onCreateReport,
  reports = [],
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('voice');
  const [reason, setReason] = useState('Voice and avatar motion need to stay smooth and readable.');

  const report = useMemo(() => {
    return buildReportMarkdown({
      title:
        kind === 'voice'
          ? 'Voice Visualizer'
          : kind === 'avatar'
          ? 'Avatar Lipsync'
          : 'Forge Bridge',
      screen: currentScreen,
      transcript,
      level,
      persona,
      reason,
      kind,
    });
  }, [currentScreen, transcript, level, persona, reason, kind]);

  const saveReport = () => {
    onCreateReport?.({
      id: `report-${Date.now()}`,
      kind,
      title:
        kind === 'voice'
          ? 'Voice Visualizer'
          : kind === 'avatar'
          ? 'Avatar Lipsync'
          : 'Forge Bridge',
      markdown: report,
    });
    setOpen(false);
  };

  return (
    <>
      <FAB
        icon="clipboard-text"
        style={styles.fab}
        onPress={() => setOpen(true)}
        label="Audit"
        color="#06111b"
      />

      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)} style={styles.dialog}>
          <Dialog.Title>AuditWidget</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.caption}>Current screen: {currentScreen}</Text>
            <View style={styles.chips}>
              <Chip selected={kind === 'voice'} onPress={() => setKind('voice')} style={styles.chip}>
                Voice
              </Chip>
              <Chip selected={kind === 'avatar'} onPress={() => setKind('avatar')} style={styles.chip}>
                Avatar
              </Chip>
              <Chip selected={kind === 'bridge'} onPress={() => setKind('bridge')} style={styles.chip}>
                Bridge
              </Chip>
            </View>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              placeholder="What should the coding agent fix?"
              placeholderTextColor="#64748b"
              style={styles.input}
            />
            <Surface style={styles.preview} elevation={0}>
              <ScrollView>
                <Text style={styles.previewText}>{report}</Text>
              </ScrollView>
            </Surface>
            <Text style={styles.caption}>Saved reports: {reports.length}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)} textColor="#cbd5e1">
              Close
            </Button>
            <Button mode="contained" onPress={saveReport}>
              Save report
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    backgroundColor: '#67e8f9',
    zIndex: 30,
  },
  dialog: {
    backgroundColor: '#0b1220',
  },
  caption: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: 'rgba(248, 250, 252, 0.06)',
  },
  input: {
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    color: '#f8fafc',
    padding: 12,
    backgroundColor: 'rgba(8, 15, 33, 0.88)',
    marginBottom: 10,
  },
  preview: {
    borderRadius: 18,
    backgroundColor: '#050a14',
    maxHeight: 260,
    padding: 12,
  },
  previewText: {
    color: '#dbe4ff',
    fontSize: 12,
    lineHeight: 18,
  },
});
