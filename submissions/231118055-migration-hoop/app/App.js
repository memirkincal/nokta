import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Appbar,
  Button,
  Card,
  Chip,
  MD3DarkTheme,
  PaperProvider,
  Snackbar,
  Surface,
  Text as PaperText,
  TextInput,
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SAMPLE_PASTE, SOURCE_OPTIONS } from './src/noktaEngine';
import { analyzeNotes, chatAboutNotes, getOpenRouterAnalysisConfig } from './src/openaiNotes';
import { useVoiceCapture } from './src/hooks/useVoiceCapture';
import VoiceVisualizer from './src/components/VoiceVisualizer';
import AvatarStage from './src/components/AvatarStage';
import ForgeRail from './src/components/ForgeRail';
import BridgeModal from './src/bridge/BridgeModal';
import AuditWidget from './src/audit/AuditWidget';
import { FORGE_CYCLES, buildForgeStats, isStuck } from './src/forge/forgeData';

const theme = {
  ...MD3DarkTheme,
  roundness: 18,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#67e8f9',
    secondary: '#7c5cff',
    tertiary: '#fbbf24',
    background: '#07111d',
    surface: '#10192c',
    surfaceVariant: '#18233d',
    onSurface: '#f5f7ff',
    onSurfaceVariant: '#b2bddf',
  },
};

const PERSONAS = {
  junior: {
    key: 'junior',
    label: 'Junior-Sen',
    tone: 'Warm, exploratory, a little playful.',
    headColor: '#6ee7ff',
    accent: '#67e8f9',
    badge: 'rgba(34, 211, 238, 0.12)',
    backdrop: 'rgba(34, 211, 238, 0.04)',
    scale: 1.2,
  },
  senior: {
    key: 'senior',
    label: 'Senior-Sen',
    tone: 'Calm, concise, and decisive.',
    headColor: '#8b5cf6',
    accent: '#c4b5fd',
    badge: 'rgba(124, 92, 255, 0.12)',
    backdrop: 'rgba(124, 92, 255, 0.05)',
    scale: 1.24,
  },
};

function Metric({ label, value, hint }) {
  return (
    <Surface style={styles.metric} elevation={0}>
      <PaperText style={styles.metricValue}>{value}</PaperText>
      <PaperText style={styles.metricLabel}>{label}</PaperText>
      <PaperText style={styles.metricHint}>{hint}</PaperText>
    </Surface>
  );
}

function CardInsight({ card, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.insightCard, selected && styles.insightCardActive]}>
      <View style={styles.insightHeader}>
        <Chip style={styles.insightChip}>{card.aiRecommendation || 'review'}</Chip>
        <PaperText style={styles.insightConfidence}>{Math.round((card.aiConfidence || 0) * 100)}%</PaperText>
      </View>
      <PaperText style={styles.insightTitle}>{card.title}</PaperText>
      <PaperText style={styles.insightBody} numberOfLines={3}>
        {card.aiAnswer || card.summary}
      </PaperText>
    </Pressable>
  );
}

export default function App() {
  const aiConfig = useMemo(() => getOpenRouterAnalysisConfig(), []);
  const voice = useVoiceCapture();
  const [selectedPersonaKey, setSelectedPersonaKey] = useState('junior');
  const persona = PERSONAS[selectedPersonaKey];
  const [currentSource, setCurrentSource] = useState('WhatsApp');
  const [rawText, setRawText] = useState(SAMPLE_PASTE);
  const [analysis, setAnalysis] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const [notice, setNotice] = useState('');
  const [auditReports, setAuditReports] = useState([]);
  const [forgeCycles, setForgeCycles] = useState(FORGE_CYCLES);
  const [bridgeVisible, setBridgeVisible] = useState(false);
  const [bridgeSummary, setBridgeSummary] = useState('');

  const composedText = useMemo(() => {
    const chunks = [voice.transcript, rawText.trim()].filter(Boolean);
    return chunks.join('\n\n');
  }, [rawText, voice.transcript]);

  const forgeStats = useMemo(() => buildForgeStats(forgeCycles), [forgeCycles]);
  const modeLabel = aiConfig.enabled
    ? `${aiConfig.providerLabel} ${aiConfig.model}`
    : 'Local fallback';

  const selectedCard = useMemo(() => {
    if (!analysis?.cards?.length) {
      return null;
    }

    return analysis.cards.find((card) => card.id === selectedCardId) || analysis.cards[0];
  }, [analysis, selectedCardId]);

  const analysisText = analysis
    ? `${analysis.title} · ${analysis.summary}`
    : 'Analyse, chat and forge all stay in one feedback loop.';

  useEffect(() => {
    if (isStuck(forgeCycles)) {
      setBridgeVisible(true);
      setNotice('Two rollback cycles detected. Human bridge opened.');
    }
  }, [forgeCycles]);

  const handleLoadSample = () => {
    setRawText(SAMPLE_PASTE);
    setChatInput('');
    setChatMessages([]);
    setAnalysis(null);
    setSelectedCardId(null);
    setCurrentSource('WhatsApp');
    setNotice('Sample notes loaded.');
  };

  const handleReset = () => {
    setRawText('');
    setChatInput('');
    setChatMessages([]);
    setAnalysis(null);
    setSelectedCardId(null);
    setCurrentSource('WhatsApp');
    setNotice('Workspace cleared.');
  };

  const handleAnalyze = async () => {
    if (!composedText.trim()) {
      setNotice('Voice or text input is empty.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeNotes({ rawText: composedText, source: currentSource });
      setAnalysis(result);
      setSelectedCardId(result.cards[0]?.id || null);
      setChatMessages([]);
      setChatInput('');
      setNotice(result.provider && result.provider !== 'local' ? `${result.providerLabel} answered.` : 'Local analysis ready.');
    } catch (error) {
      setNotice(error.message || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendChat = async () => {
    const question = chatInput.trim();
    if (!question) {
      setNotice('Ask a short follow-up question first.');
      return;
    }

    const nextHistory = [...chatMessages, { role: 'user', content: question }];
    setChatMessages(nextHistory);
    setChatInput('');
    setIsChatting(true);

    try {
      const reply = await chatAboutNotes({
        question,
        rawText: composedText,
        source: currentSource,
        cards: analysis?.cards || [],
        analysis,
        history: nextHistory,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply.reply,
          meta: reply.providerLabel ? `${reply.providerLabel}${reply.model ? ` ${reply.model}` : ''}` : '',
        },
      ]);

      if (reply.providerLabel) {
        setNotice(`${reply.providerLabel} reply ready.`);
      }
    } catch (error) {
      setNotice(error.message || 'Chat failed.');
    } finally {
      setIsChatting(false);
    }
  };

  const handleShare = async () => {
    if (!analysis) {
      setNotice('Run analysis before sharing.');
      return;
    }

    const lines = [
      'Nokta final week snapshot',
      `Mode: ${modeLabel}`,
      `Persona: ${persona.label}`,
      `Title: ${analysis.title}`,
      '',
      analysis.summary,
      '',
      analysis.directAnswer,
      '',
      'Next steps:',
      ...(analysis.nextSteps.length ? analysis.nextSteps.map((step) => `- ${step}`) : ['- None']),
    ];

    await Share.share({ message: lines.join('\n') });
  };

  const handleCreateReport = (report) => {
    setAuditReports((prev) => [report, ...prev].slice(0, 8));

    const lastKg = forgeCycles[forgeCycles.length - 1]?.kg ?? 0;
    const nextIndex = forgeCycles.length + 1;

    if (report.kind === 'bridge') {
      setForgeCycles((prev) => [
        ...prev,
        {
          cycle: nextIndex,
          report: `${report.kind}-${report.id}.md`,
          hypothesis: 'The assistant gets stuck and hands the case to a human expert.',
          result: 'rollback',
          changedFiles: ['src/bridge/BridgeModal.js', 'src/forge/forgeData.js'],
          test: 'Human bridge opened from the app',
          commit: 'working-tree',
          kg: lastKg,
        },
        {
          cycle: nextIndex + 1,
          report: `${report.kind}-${report.id}.md`,
          hypothesis: 'The human expert clarifies the case and keeps the bridge visible.',
          result: 'rollback',
          changedFiles: ['src/bridge/BridgeModal.js', 'BRIDGE.md'],
          test: 'Bridge transcript captured for the next cycle',
          commit: 'working-tree',
          kg: lastKg,
        },
      ]);
      setBridgeVisible(true);
      setBridgeSummary((prev) => prev || 'The bridge was opened because two consecutive rollback cycles were detected.');
      return;
    }

    setForgeCycles((prev) => [
      ...prev,
      {
        cycle: nextIndex,
        report: `${report.kind}-${report.id}.md`,
        hypothesis:
          report.kind === 'voice'
            ? 'Voice waveforms should stay smooth while the transcript catches up.'
            : 'The avatar should react to meter-driven mouth motion without jitter.',
        result: 'success',
        changedFiles:
          report.kind === 'voice'
            ? ['src/components/VoiceVisualizer.js', 'src/hooks/useVoiceCapture.js']
            : ['src/components/AvatarStage.js'],
        test: 'manual voice pass',
        commit: 'working-tree',
        kg: lastKg + 1,
      },
    ]);
  };

  const openBridge = () => {
    setBridgeVisible(true);
    if (!bridgeSummary) {
      setBridgeSummary('Forge got stuck twice. Human bridge requested.');
    }
  };

  const closeBridge = () => {
    setBridgeVisible(false);
  };

  const currentScreenLabel = 'Voice + Avatar + Forge';

  const panelSubtitle = voice.listening
    ? 'Voice is live, meter is moving, and the avatar should stay alive.'
    : 'Tap the mic to start dictation and let the avatar breathe with your voice.';

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backdropOne} />
        <View style={styles.backdropTwo} />

        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="NOKTA NOKTA" subtitle="Voice, avatar, audit and forge in one loop" />
          <Appbar.Action icon="book-open-variant" onPress={handleLoadSample} />
          <Appbar.Action icon="share-variant" onPress={handleShare} disabled={!analysis} />
          <Appbar.Action icon="refresh" onPress={handleReset} />
        </Appbar.Header>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Surface style={styles.heroCard} elevation={1}>
              <View style={styles.heroHeader}>
                <View style={styles.heroCopy}>
                  <PaperText variant="headlineSmall" style={styles.heroTitle}>
                    Kendi sesin, kendi yüzün, kendi forge döngün.
                  </PaperText>
                  <PaperText style={styles.heroSubtitle}>{panelSubtitle}</PaperText>
                </View>
                <Chip icon={aiConfig.enabled ? 'robot' : 'cloud-off-outline'} style={styles.heroChip}>
                  {modeLabel}
                </Chip>
              </View>

              <View style={styles.personaRow}>
                {Object.values(PERSONAS).map((entry) => (
                  <Chip
                    key={entry.key}
                    selected={selectedPersonaKey === entry.key}
                    onPress={() => setSelectedPersonaKey(entry.key)}
                    style={[styles.personaChip, selectedPersonaKey === entry.key && styles.personaChipSelected]}
                    textStyle={styles.personaChipText}
                  >
                    {entry.label}
                  </Chip>
                ))}
              </View>

              <View style={styles.metricGrid}>
                <Metric label="Notes" value={analysis?.stats?.totalNotes || 0} hint="raw + voice" />
                <Metric label="Cards" value={analysis?.cards?.length || 0} hint="dedup output" />
                <Metric label="kg" value={forgeStats.totalKg} hint="ratchet gain" />
                <Metric label="Mode" value={voice.listening ? 'Listening' : 'Ready'} hint="mic state" />
              </View>
            </Surface>

            <Surface style={styles.panelCard} elevation={1}>
              <View style={styles.panelHeader}>
                <View>
                  <PaperText variant="titleLarge" style={styles.panelTitle}>
                    Voice visualizer
                  </PaperText>
                  <PaperText style={styles.panelSubtitle}>
                    expo-av metering + speech recognition keeps the wave alive.
                  </PaperText>
                </View>
                <Chip icon={voice.listening ? 'microphone' : 'microphone-outline'} style={styles.helperChip}>
                  {voice.listening ? 'Live' : 'Idle'}
                </Chip>
              </View>

              <VoiceVisualizer
                listening={voice.listening}
                level={voice.meter}
                transcript={voice.transcript}
              />

              <View style={styles.voiceActions}>
                <Button
                  mode="contained"
                  icon={voice.listening ? 'stop' : 'microphone'}
                  onPress={voice.listening ? voice.stop : voice.start}
                  style={styles.primaryButton}
                >
                  {voice.listening ? 'Stop mic' : 'Start mic'}
                </Button>
                <Button mode="outlined" icon="swap-horizontal" onPress={openBridge} style={styles.secondaryButton}>
                  Open bridge
                </Button>
              </View>

              {voice.error ? <PaperText style={styles.warnText}>{voice.error}</PaperText> : null}
            </Surface>

            <Surface style={styles.panelCard} elevation={1}>
              <AvatarStage level={voice.meter} persona={persona} statusText={panelSubtitle} />
              <View style={styles.personaMeta}>
                <PaperText style={styles.panelSubtitle}>{persona.tone}</PaperText>
              </View>
            </Surface>

            <Surface style={styles.panelCard} elevation={1}>
              <View style={styles.panelHeader}>
                <View>
                  <PaperText variant="titleLarge" style={styles.panelTitle}>
                    Capture workspace
                  </PaperText>
                  <PaperText style={styles.panelSubtitle}>
                    Paste a pitch, a note dump, or a voice transcript. Voice text auto-feeds the analysis.
                  </PaperText>
                </View>
                <Chip icon="information-outline" style={styles.helperChip}>
                  {currentSource}
                </Chip>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sourceRail}>
                {SOURCE_OPTIONS.map((option) => (
                  <Chip
                    key={option.key}
                    selected={currentSource === option.key}
                    icon={option.icon}
                    style={[
                      styles.sourceChip,
                      currentSource === option.key && styles.sourceChipSelected,
                    ]}
                    onPress={() => setCurrentSource(option.key)}
                  >
                    {option.label}
                  </Chip>
                ))}
              </ScrollView>

              <TextInput
                value={rawText}
                onChangeText={setRawText}
                mode="outlined"
                multiline
                numberOfLines={10}
                placeholder="Paste WhatsApp exports, bullet notes, email snippets, or use voice dictation..."
                style={styles.input}
                outlineStyle={styles.inputOutline}
                textColor={theme.colors.onSurface}
                activeOutlineColor={theme.colors.primary}
              />

              <View style={styles.actionRow}>
                <Button
                  mode="contained"
                  icon="auto-fix"
                  onPress={handleAnalyze}
                  loading={isAnalyzing}
                  disabled={isAnalyzing || !composedText.trim()}
                  style={styles.primaryButton}
                >
                  Analyze notes
                </Button>
                <Button mode="outlined" icon="restart" onPress={handleReset} style={styles.secondaryButton}>
                  Reset
                </Button>
              </View>
            </Surface>

            {analysis ? (
              <Surface style={styles.panelCard} elevation={1}>
                <View style={styles.panelHeader}>
                  <View>
                    <PaperText variant="titleLarge" style={styles.panelTitle}>
                      AI answer
                    </PaperText>
                    <PaperText style={styles.panelSubtitle}>
                      Voice transcript and pasted notes are analyzed together.
                    </PaperText>
                  </View>
                  <Chip icon={analysis.provider !== 'local' ? 'robot-outline' : 'cloud-off-outline'} style={styles.helperChip}>
                    {analysis.providerLabel || 'Local'}
                  </Chip>
                </View>

                <PaperText variant="titleLarge" style={styles.answerTitle}>
                  {analysis.title}
                </PaperText>
                <PaperText style={styles.answerSummary}>{analysis.summary}</PaperText>
                <Surface style={styles.answerBubble} elevation={0}>
                  <PaperText style={styles.answerText}>{analysis.directAnswer}</PaperText>
                </Surface>

                <View style={styles.sectionBlock}>
                  <PaperText style={styles.sectionTitle}>Next steps</PaperText>
                  {analysis.nextSteps.length ? (
                    analysis.nextSteps.map((step) => (
                      <PaperText key={step} style={styles.bulletText}>
                        {'\u2022'} {step}
                      </PaperText>
                    ))
                  ) : (
                    <PaperText style={styles.panelSubtitle}>No next steps yet.</PaperText>
                  )}
                </View>

                <View style={styles.sectionBlock}>
                  <PaperText style={styles.sectionTitle}>Top cards</PaperText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRail}>
                    {analysis.cards.slice(0, 3).map((card) => (
                      <CardInsight
                        key={card.id}
                        card={card}
                        selected={selectedCard?.id === card.id}
                        onPress={() => setSelectedCardId(card.id)}
                      />
                    ))}
                  </ScrollView>
                </View>

                {chatMessages.length ? (
                  <View style={styles.sectionBlock}>
                    <PaperText style={styles.sectionTitle}>Chat follow-up</PaperText>
                    {chatMessages.map((message, index) => (
                      <Surface
                        key={`${message.role}-${index}`}
                        style={[
                          styles.chatBubble,
                          message.role === 'assistant' ? styles.chatBubbleAssistant : styles.chatBubbleUser,
                        ]}
                        elevation={0}
                      >
                        <PaperText style={styles.chatRole}>{message.role}</PaperText>
                        <PaperText style={styles.chatText}>{message.content}</PaperText>
                        {message.meta ? <PaperText style={styles.chatMeta}>{message.meta}</PaperText> : null}
                      </Surface>
                    ))}
                  </View>
                ) : null}

                <View style={styles.chatComposer}>
                  <TextInput
                    value={chatInput}
                    onChangeText={setChatInput}
                    mode="outlined"
                    placeholder="Ask a follow-up question..."
                    style={styles.chatInput}
                    outlineStyle={styles.inputOutline}
                    textColor={theme.colors.onSurface}
                    activeOutlineColor={theme.colors.primary}
                  />
                  <Button
                    mode="contained"
                    icon="send"
                    onPress={handleSendChat}
                    loading={isChatting}
                    disabled={isChatting}
                    style={styles.primaryButton}
                  >
                    Ask
                  </Button>
                </View>
              </Surface>
            ) : null}

            <ForgeRail
              cycles={forgeCycles}
              stats={forgeStats}
              onOpenBridge={openBridge}
              bridgeHint="Stuck mode opens the human bridge and captures a short meeting summary."
            />

            <Surface style={styles.panelCard} elevation={1}>
              <View style={styles.panelHeader}>
                <View>
                  <PaperText variant="titleLarge" style={styles.panelTitle}>
                    Audit reports
                  </PaperText>
                  <PaperText style={styles.panelSubtitle}>
                    Save burn-in markdown from voice-driven runs and feed it back into the forge.
                  </PaperText>
                </View>
                <Chip icon="file-document-outline" style={styles.helperChip}>
                  {auditReports.length}
                </Chip>
              </View>

              {auditReports.length ? (
                auditReports.map((report) => (
                  <Surface key={report.id} style={styles.reportCard} elevation={0}>
                    <PaperText style={styles.sectionTitle}>{report.title}</PaperText>
                    <PaperText style={styles.reportKind}>{report.kind.toUpperCase()}</PaperText>
                    <PaperText style={styles.reportPreview} numberOfLines={7}>
                      {report.markdown}
                    </PaperText>
                  </Surface>
                ))
              ) : (
                <PaperText style={styles.panelSubtitle}>
                  Tap the floating Audit button, generate 3 burn-in reports, and feed them into the forge.
                </PaperText>
              )}
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>

        <AuditWidget
          currentScreen={currentScreenLabel}
          transcript={voice.transcript}
          level={voice.meter}
          persona={persona.label}
          reports={auditReports}
          onCreateReport={handleCreateReport}
        />

        <BridgeModal
          visible={bridgeVisible}
          onClose={closeBridge}
          transcript={bridgeSummary || voice.transcript}
          summary={bridgeSummary}
          onChangeSummary={setBridgeSummary}
        />

        <Snackbar visible={Boolean(notice)} onDismiss={() => setNotice('')} duration={2600}>
          {notice}
        </Snackbar>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111d',
  },
  flex: {
    flex: 1,
  },
  backdropOne: {
    position: 'absolute',
    top: -110,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
  backdropTwo: {
    position: 'absolute',
    left: -80,
    bottom: -90,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(124, 92, 255, 0.11)',
  },
  appbar: {
    backgroundColor: 'rgba(7, 17, 29, 0.92)',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  heroCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    padding: 18,
    gap: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: '#f8fafc',
    fontWeight: '900',
  },
  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  heroChip: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
  },
  personaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  personaChip: {
    backgroundColor: 'rgba(248, 250, 252, 0.06)',
  },
  personaChipSelected: {
    backgroundColor: 'rgba(103, 232, 249, 0.14)',
  },
  personaChipText: {
    color: '#e2e8f0',
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '48.5%',
    backgroundColor: 'rgba(8, 15, 33, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 18,
    padding: 12,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricHint: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 3,
  },
  panelCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    padding: 16,
    gap: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  panelTitle: {
    color: '#f8fafc',
    fontWeight: '900',
  },
  panelSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  helperChip: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
  },
  voiceActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    flexGrow: 1,
    minWidth: 150,
  },
  secondaryButton: {
    flexGrow: 1,
    minWidth: 150,
  },
  warnText: {
    color: '#fbbf24',
    fontSize: 12,
  },
  personaMeta: {
    paddingTop: 2,
  },
  sourceRail: {
    gap: 10,
    paddingVertical: 2,
  },
  sourceChip: {
    backgroundColor: 'rgba(248, 250, 252, 0.06)',
  },
  sourceChipSelected: {
    backgroundColor: 'rgba(103, 232, 249, 0.14)',
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1,
    borderRadius: 24,
    minHeight: 220,
    padding: 18,
    fontSize: 14,
    lineHeight: 21,
  },
  inputOutline: {
    borderRadius: 24,
  },
  answerTitle: {
    color: '#f8fafc',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  answerSummary: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
  },
  answerBubble: {
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.18)',
    padding: 14,
  },
  answerText: {
    color: '#dbeafe',
    fontSize: 13,
    lineHeight: 19,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },
  bulletText: {
    color: '#dbe4ff',
    fontSize: 13,
    lineHeight: 19,
  },
  cardRail: {
    gap: 12,
    paddingVertical: 2,
  },
  insightCard: {
    width: 220,
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  insightCardActive: {
    borderColor: 'rgba(103, 232, 249, 0.34)',
    backgroundColor: 'rgba(8, 15, 33, 1)',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightChip: {
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
  },
  insightConfidence: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  insightTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  insightBody: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  chatComposer: {
    gap: 10,
  },
  chatInput: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1,
    borderRadius: 20,
  },
  chatBubble: {
    borderRadius: 18,
    padding: 12,
  },
  chatBubbleUser: {
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
  },
  chatBubbleAssistant: {
    backgroundColor: 'rgba(124, 92, 255, 0.08)',
  },
  chatRole: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  chatText: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 19,
  },
  chatMeta: {
    color: '#67e8f9',
    fontSize: 11,
    marginTop: 6,
  },
  reportCard: {
    backgroundColor: 'rgba(8, 15, 33, 0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    padding: 14,
  },
  reportKind: {
    color: '#67e8f9',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 8,
  },
  reportPreview: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
});
