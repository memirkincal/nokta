import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/constants/theme';
import { getAuditFixture } from '@/lib/audit-samples';
import { buildAuditMarkdown, buildReportFileName, slugify } from '@/lib/audit-report';
import type { AuditDeps, AuditNote, AuditStatus } from '@/lib/audit-types';

type AuditWidgetProps = {
  deps: AuditDeps;
};

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatStamp(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function AuditWidget({ deps }: AuditWidgetProps) {
  const [mode, setMode] = useState<'fab' | 'compose' | 'history'>('fab');
  const [notes, setNotes] = useState<AuditNote[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<AuditStatus>('open');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Ready to capture');
  const bounce = useRef(new Animated.Value(0)).current;
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;

    deps.storage
      .loadNotes()
      .then((loaded) => {
        if (alive) {
          setNotes(loaded);
        }
      })
      .catch(() => {
        if (alive) {
          setNotes([]);
        }
      });

    return () => {
      alive = false;
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, [deps.storage]);

  useEffect(() => {
    Animated.spring(bounce, {
      toValue: mode === 'fab' ? 0 : 1,
      useNativeDriver: true,
      friction: 7,
      tension: 72,
    }).start();
  }, [bounce, mode]);

  const fixture = getAuditFixture(deps.currentScreen);
  const iconScale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  async function persistNext(nextNotes: AuditNote[]) {
    setNotes(nextNotes);
    await deps.storage.saveNotes(nextNotes);
  }

  async function handleCapture() {
    setBusy(true);
    setMessage(`Capturing ${fixture.screenLabel}...`);

    try {
      const screenshotUri = await deps.captureScreen();
      const id = makeId();
      const draftText = draft.trim() || fixture.noteSeed;
      const note: AuditNote = {
        id,
        screenKey: fixture.screenKey,
        title: fixture.reportTitle,
        note: draftText,
        status,
        screenshotUri,
        reporterId: deps.reporterId,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        reportUri: '',
      };

      const reportPath = buildReportFileName(note, fixture);
      const reportContent = buildAuditMarkdown(
        {
          ...note,
          reportUri: reportPath,
        },
        fixture
      );
      const reportUri = await deps.writeFile(reportPath, reportContent);
      const savedNote: AuditNote = {
        ...note,
        reportUri,
      };

      const nextNotes: AuditNote[] = [savedNote, ...notes];
      await persistNext(nextNotes);
      setDraft('');
      setMessage(`Saved ${slugify(fixture.reportSlug)} to markdown`);
      setMode('history');
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'Unknown capture error';
      setMessage(`Capture failed: ${fallback}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleShare(note: AuditNote) {
    if (!note.reportUri) {
      return;
    }

    await deps.shareFile(note.reportUri);
    setMessage(`Shared ${note.title}`);
  }

  async function handleToggleStatus(note: AuditNote) {
    const nextNotes: AuditNote[] = notes.map((item) =>
      item.id === note.id
        ? {
            ...item,
            status: item.status === 'open' ? 'fixed' : 'open',
            updatedAt: nowIso(),
          }
        : item
    );
    await persistNext(nextNotes);
  }

  function onFabPress() {
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
      tapTimeout.current = null;
      setMode('history');
      setMessage('Opened report history');
      return;
    }

    tapTimeout.current = setTimeout(() => {
      tapTimeout.current = null;
      setMode('compose');
      setMessage(`Compose report for ${fixture.screenLabel}`);
    }, 220);
  }

  const panelTitle = mode === 'history' ? 'Report history' : 'Compose audit report';

  return (
    <>
      <Pressable
        onPress={onFabPress}
        accessibilityRole="button"
        accessibilityLabel="Open audit widget"
        style={styles.fabHitArea}
      >
        <Animated.View style={[styles.fab, { transform: [{ scale: iconScale }] }]}>
          <LinearGradient colors={[theme.danger, '#ff9d5c']} style={styles.fabGradient}>
            <Ionicons name="warning-outline" size={24} color="#fff7f0" />
          </LinearGradient>
        </Animated.View>
      </Pressable>

      <Modal visible={mode !== 'fab'} animationType="fade" transparent onRequestClose={() => setMode('fab')}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMode('fab')} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>AuditWidget</Text>
                <Text style={styles.sheetTitle}>{panelTitle}</Text>
              </View>
              <Pressable onPress={() => setMode('fab')} style={styles.closeButton}>
                <Ionicons name="close" size={18} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaLabel}>route</Text>
                <Text style={styles.metaValue}>{fixture.screenLabel}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaLabel}>status</Text>
                <Text style={styles.metaValue}>{status}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaLabel}>notes</Text>
                <Text style={styles.metaValue}>{notes.length}</Text>
              </View>
            </View>

            {mode === 'compose' ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.composeBody}>
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Fixture</Text>
                  <Text style={styles.cardHeadline}>{fixture.reportTitle}</Text>
                  <Text style={styles.cardBody}>{fixture.issue}</Text>
                </View>

                <View style={styles.formBlock}>
                  <Text style={styles.formLabel}>Burn-in note</Text>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder={fixture.noteSeed}
                    placeholderTextColor={theme.muted}
                    multiline
                    style={styles.input}
                    selectionColor={theme.accent}
                  />
                </View>

                <View style={styles.statusRow}>
                  {(['open', 'fixed'] as AuditStatus[]).map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setStatus(item)}
                      style={[styles.statusChip, status === item && styles.statusChipActive]}
                    >
                      <Text style={[styles.statusChipText, status === item && styles.statusChipTextActive]}>{item}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable onPress={handleCapture} disabled={busy} style={styles.primaryButtonWrap}>
                  <LinearGradient colors={[theme.accent, '#ff8f5a']} style={styles.primaryButton}>
                    <Ionicons name="document-text-outline" size={18} color="#1a1206" />
                    <Text style={styles.primaryButtonText}>{busy ? 'Capturing...' : 'Burn in + save markdown'}</Text>
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyBody}>
                {notes.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="albums-outline" size={28} color={theme.accent2} />
                    <Text style={styles.emptyTitle}>No reports yet</Text>
                    <Text style={styles.emptyText}>Switch to compose mode and capture the first burn-in report.</Text>
                  </View>
                ) : (
                  notes.map((note) => (
                    <View key={note.id} style={styles.noteCard}>
                      <View style={styles.noteTopRow}>
                        <Text style={styles.noteTitle}>{note.title}</Text>
                        <Pressable onPress={() => handleToggleStatus(note)} style={styles.noteStatusPill}>
                          <Text style={styles.noteStatusText}>{note.status}</Text>
                        </Pressable>
                      </View>
                      <Text style={styles.noteMeta}>{note.screenKey.toUpperCase()} - {formatStamp(note.createdAt)}</Text>
                      <Text style={styles.noteBody}>{note.note}</Text>
                      <View style={styles.noteActions}>
                        <Pressable onPress={() => handleShare(note)} style={styles.inlineButton}>
                          <Text style={styles.inlineButtonText}>Share</Text>
                        </Pressable>
                        <Text style={styles.inlineHint}>{note.reportUri ? note.reportUri : 'report not written'}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <Text style={styles.message}>{message}</Text>
            <Text style={styles.footerHint}>
              Double tap the FAB lane behavior is approximated with a quick second press to open history.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabHitArea: {
    position: 'absolute',
    right: 18,
    bottom: 26,
    zIndex: 99,
  },
  fab: {
    borderRadius: 18,
    shadowColor: theme.shadow,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 12,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,10,18,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.panel,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    maxHeight: '84%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sheetEyebrow: {
    color: theme.accent,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontWeight: '800',
  },
  sheetTitle: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.line,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metaPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: theme.panelStrong,
    borderWidth: 1,
    borderColor: theme.line,
    minWidth: 96,
  },
  metaLabel: {
    color: theme.muted,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.1,
    marginBottom: 4,
    fontWeight: '700',
  },
  metaValue: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '800',
  },
  composeBody: {
    gap: 14,
    paddingBottom: 10,
  },
  historyBody: {
    gap: 12,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  cardLabel: {
    color: theme.accent2,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  cardHeadline: {
    color: theme.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  cardBody: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  formBlock: {
    gap: 10,
  },
  formLabel: {
    color: theme.text,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  input: {
    minHeight: 104,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.line,
    color: theme.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  statusChipActive: {
    backgroundColor: 'rgba(255,191,95,0.16)',
    borderColor: 'rgba(255,191,95,0.40)',
  },
  statusChipText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusChipTextActive: {
    color: theme.text,
  },
  primaryButtonWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  primaryButton: {
    minHeight: 54,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexDirection: 'row',
  },
  primaryButtonText: {
    color: '#1a1206',
    fontSize: 15,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    color: theme.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  noteTitle: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  noteStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,191,95,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,191,95,0.30)',
  },
  noteStatusText: {
    color: theme.accent,
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  noteMeta: {
    color: theme.muted,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  noteBody: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 20,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inlineButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(99,208,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99,208,255,0.25)',
  },
  inlineButtonText: {
    color: theme.accent2,
    fontSize: 12,
    fontWeight: '800',
  },
  inlineHint: {
    flex: 1,
    color: theme.muted,
    fontSize: 11,
    textAlign: 'right',
  },
  message: {
    color: theme.accent2,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  footerHint: {
    color: theme.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
});
