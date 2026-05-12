import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
  ProgressBar,
  SegmentedButtons,
  Snackbar,
  Surface,
  Text as PaperText,
  TextInput,
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import {
  SAMPLE_PASTE,
  SOURCE_OPTIONS,
  attachMentorReview,
  buildIdeaCards,
  buildMentorSession,
  getBoardStats,
  markCardSeparate,
  mergeCardWithClosest,
  titleCase,
} from './src/noktaEngine';

const VIEW_OPTIONS = [
  { value: 'capture', label: 'Capture' },
  { value: 'dedup', label: 'Dedup' },
  { value: 'hoop', label: 'Hoop' },
];

const REVIEW_MODE_OPTIONS = [
  { value: 'HOOTL', label: 'HOOTL' },
  { value: 'HOTL', label: 'HOTL' },
  { value: 'HITL', label: 'HITL' },
];

const ROLE_OPTIONS = [
  { value: 'mentor', label: 'Mentor' },
  { value: 'expert', label: 'Expert' },
  { value: 'reviewer', label: 'Reviewer' },
];

const theme = {
  ...MD3DarkTheme,
  roundness: 18,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7c5cff',
    secondary: '#22c7a2',
    tertiary: '#ffb84d',
    background: '#07101d',
    surface: '#10192c',
    surfaceVariant: '#18233d',
    onSurface: '#f5f7ff',
    onSurfaceVariant: '#b2bddf',
  },
};

function App() {
  const [activeView, setActiveView] = useState('capture');
  const [currentSource, setCurrentSource] = useState('WhatsApp');
  const [rawText, setRawText] = useState(SAMPLE_PASTE);
  const [cards, setCards] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewMode, setReviewMode] = useState('HOTL');
  const [reviewRole, setReviewRole] = useState('mentor');
  const [session, setSession] = useState({
    cardId: null,
    status: 'idle',
    bridgeState: 'Local rehearsal mode',
    transcript: '',
    writeback: '',
    recommendation: 'keep-separate',
    timeline: [],
    mode: 'HOTL',
    role: 'mentor',
    summary: '',
    tokenPreview: '',
  });
  const [notice, setNotice] = useState('');

  const timersRef = useRef([]);
  const reviewRunRef = useRef(0);

  const streamConfigured = Boolean(
    process.env.EXPO_PUBLIC_STREAM_API_KEY ||
      process.env.EXPO_PUBLIC_TOKEN_SERVER_URL ||
      process.env.EXPO_PUBLIC_STREAM_ENABLE_TRANSCRIPTION === 'true'
  );
  const tokenServerUrl = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL || '';

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === activeCardId) || null,
    [cards, activeCardId]
  );
  const boardStats = useMemo(() => getBoardStats(cards), [cards]);
  const averageConfidence = useMemo(() => {
    if (!cards.length) {
      return 0;
    }

    return cards.reduce((sum, card) => sum + card.confidence, 0) / cards.length;
  }, [cards]);

  useEffect(() => {
    if (activeCardId && !cards.some((card) => card.id === activeCardId)) {
      setActiveCardId(cards[0]?.id || null);
    }
  }, [activeCardId, cards]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
      reviewRunRef.current += 1;
    },
    []
  );

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const pushNotice = (message) => {
    setNotice(message);
  };

  const handleLoadSample = () => {
    clearTimers();
    setRawText(SAMPLE_PASTE);
    setCurrentSource('WhatsApp');
    setActiveView('capture');
    pushNotice('Sample notes loaded.');
  };

  const handleReset = () => {
    clearTimers();
    setRawText('');
    setCards([]);
    setActiveCardId(null);
    setIsAnalyzing(false);
    setSession({
      cardId: null,
      status: 'idle',
      bridgeState: 'Local rehearsal mode',
      transcript: '',
      writeback: '',
      recommendation: 'keep-separate',
      timeline: [],
      mode: reviewMode,
      role: reviewRole,
      summary: '',
      tokenPreview: '',
    });
    setActiveView('capture');
    pushNotice('Workspace cleared.');
  };

  const handleAnalyze = () => {
    if (!rawText.trim()) {
      pushNotice('Paste some notes first.');
      return;
    }

    clearTimers();
    setIsAnalyzing(true);

    const timer = setTimeout(() => {
      const result = buildIdeaCards(rawText, currentSource);

      if (!result.cards.length) {
        setCards([]);
        setActiveCardId(null);
        setIsAnalyzing(false);
        pushNotice('No meaningful notes found.');
        return;
      }

      setCards(result.cards);
      setActiveCardId(result.cards[0]?.id || null);
      setIsAnalyzing(false);
      setActiveView('dedup');
      pushNotice(`${result.stats.clusters} idea card(s) built from ${result.stats.totalNotes} notes.`);
    }, 420);

    timersRef.current.push(timer);
  };

  const handleMergeCard = (cardId) => {
    const result = mergeCardWithClosest(cards, cardId);
    if (!result.merged) {
      pushNotice(result.message);
      return;
    }

    setCards(result.cards);
    setActiveCardId(result.mergedCard?.id || cardId);
    setActiveView('dedup');
    pushNotice(result.message);
  };

  const handleKeepSeparate = (cardId) => {
    const nextCards = markCardSeparate(cards, cardId);
    setCards(nextCards);
    setActiveCardId(cardId);
    setActiveView('dedup');
    pushNotice('Card locked as separate.');
  };

  const fetchStreamToken = async (serverUrl, payload) => {
    const endpoint = `${serverUrl.replace(/\/$/, '')}/token`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Token request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.token || data.accessToken || data.streamToken || '';
  };

  const beginMentorReview = (cardId) => {
    const card = cards.find((item) => item.id === cardId);
    if (!card) {
      pushNotice('Select a card first.');
      return;
    }

    clearTimers();
    setActiveCardId(cardId);
    setActiveView('hoop');

    const runId = reviewRunRef.current + 1;
    reviewRunRef.current = runId;

    setSession({
      cardId,
      status: 'requesting',
      bridgeState: streamConfigured ? 'Requesting Stream token' : 'Local rehearsal mode',
      transcript: '',
      writeback: '',
      recommendation: card.confidence >= 0.78 && card.closeMatch ? 'merge' : 'keep-separate',
      timeline: [
        { step: 'Request', detail: 'Mentor review requested from the selected card.' },
      ],
      mode: reviewMode,
      role: reviewRole,
      summary: '',
      tokenPreview: '',
    });

    const timer = setTimeout(async () => {
      let bridgeState = streamConfigured ? 'Stream bridge ready' : 'Local rehearsal mode';
      let tokenPreview = '';

      if (streamConfigured && tokenServerUrl) {
        try {
          const token = await fetchStreamToken(tokenServerUrl, {
            userId: 'guest-mentor',
            roomName: card.title,
            mode: reviewMode,
            role: reviewRole,
          });
          tokenPreview = token ? `${token.slice(0, 8)}...` : '';
          bridgeState = token ? 'Stream token received' : 'Stream bridge ready';
        } catch (error) {
          bridgeState = 'Stream bridge fallback to local rehearsal';
        }
      }

      if (reviewRunRef.current !== runId) {
        return;
      }

      const sessionResult = buildMentorSession(card, {
        mode: reviewMode,
        role: reviewRole,
        streamConfigured,
      });

      setSession({
        cardId,
        status: 'ready',
        bridgeState,
        transcript: sessionResult.transcript,
        writeback: sessionResult.writeback,
        recommendation: sessionResult.recommendation,
        timeline: sessionResult.timeline,
        mode: sessionResult.mode,
        role: sessionResult.role,
        summary: sessionResult.summary,
        tokenPreview,
      });
      pushNotice(`${card.title} is ready for mentor review.`);
    }, 520);

    timersRef.current.push(timer);
  };

  const handleWriteback = () => {
    if (!session.cardId) {
      pushNotice('Start a mentor review first.');
      return;
    }

    let nextCards = cards;
    let targetId = session.cardId;

    if (session.recommendation === 'merge') {
      const mergeResult = mergeCardWithClosest(nextCards, session.cardId);
      if (mergeResult.merged) {
        nextCards = mergeResult.cards;
        targetId = mergeResult.mergedCard.id;
      }
    } else {
      nextCards = markCardSeparate(nextCards, session.cardId);
    }

    nextCards = attachMentorReview(nextCards, targetId, {
      mode: session.mode,
      role: session.role,
      recommendation: session.recommendation === 'merge' ? 'mentor-merge' : 'mentor-separate',
      transcript: session.transcript,
      note: session.writeback,
      reviewState: 'written-back',
      approved: session.recommendation !== 'keep-separate',
    });

    setCards(nextCards);
    setActiveCardId(targetId);
    setActiveView('dedup');
    setSession((prev) => ({
      ...prev,
      cardId: targetId,
      status: 'written-back',
    }));
    pushNotice('Mentor writeback applied.');
  };

  const handleShareTranscript = async () => {
    if (!session.transcript) {
      pushNotice('No transcript is available yet.');
      return;
    }

    await Share.share({
      message: [
        `Nokta Hoop session for ${selectedCard?.title || 'selected card'}`,
        `Bridge: ${session.bridgeState}`,
        `Mode: ${session.mode}`,
        `Role: ${session.role}`,
        '',
        session.transcript,
      ].join('\n'),
    });
  };

  const activeBoard = (
    <Surface style={styles.heroCard} elevation={1}>
      <View style={styles.heroHeader}>
        <View style={styles.heroCopy}>
          <PaperText variant="headlineSmall" style={styles.heroTitle}>
            Track C + Hoop
          </PaperText>
          <PaperText style={styles.heroSubtitle}>
            Paste rough notes, dedup them into idea cards, then route the selected card into a human review room.
          </PaperText>
        </View>
        <Chip icon={streamConfigured ? 'lan-connect' : 'account-voice'} style={styles.heroChip}>
          {streamConfigured ? 'Stream ready' : 'Local demo'}
        </Chip>
      </View>

      <View style={styles.metricGrid}>
        <MetricTile label="Cards" value={boardStats.cards} hint="dedup output" accent="primary" />
        <MetricTile
          label="Reviewed"
          value={boardStats.reviewed}
          hint="writebacks"
          accent="secondary"
        />
        <MetricTile
          label="Locked"
          value={boardStats.locked}
          hint="kept separate"
          accent="tertiary"
        />
        <MetricTile
          label="Confidence"
          value={`${Math.round(averageConfidence * 100)}%`}
          hint="board average"
          accent="primary"
        />
      </View>
    </Surface>
  );

  const sourceRail = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sourceRail}>
      {SOURCE_OPTIONS.map((option) => (
        <Chip
          key={option.key}
          selected={currentSource === option.key}
          icon={option.icon}
          style={[styles.sourceChip, currentSource === option.key && styles.sourceChipSelected]}
          onPress={() => setCurrentSource(option.key)}
        >
          {option.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const capturePanel = (
    <View style={styles.panelStack}>
      <Surface style={styles.panelCard} elevation={1}>
        <View style={styles.panelHeader}>
          <View>
            <PaperText variant="titleLarge" style={styles.panelTitle}>
              Capture workspace
            </PaperText>
            <PaperText style={styles.panelSubtitle}>
              Label new notes with a source, then push them through the Track C pipeline.
            </PaperText>
          </View>
          <Chip icon="information-outline" style={styles.helperChip}>
            Prefixes like `wa:` or `mail:` override the selected source.
          </Chip>
        </View>

        {sourceRail}

        <TextInput
          value={rawText}
          onChangeText={setRawText}
          mode="outlined"
          multiline
          numberOfLines={10}
          placeholder="Paste WhatsApp exports, bullet notes, email snippets, or voice note transcriptions..."
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
            disabled={isAnalyzing || !rawText.trim()}
            style={styles.primaryButton}
          >
            Analyze notes
          </Button>
          <Button mode="outlined" icon="book-open-variant" onPress={handleLoadSample} style={styles.secondaryButton}>
            Load sample
          </Button>
          <Button mode="text" icon="restart" onPress={handleReset} textColor={theme.colors.onSurfaceVariant}>
            Reset
          </Button>
        </View>
      </Surface>

      <Surface style={styles.panelCard} elevation={1}>
        <View style={styles.panelHeader}>
          <View>
            <PaperText variant="titleLarge" style={styles.panelTitle}>
              Why this slice is original
            </PaperText>
            <PaperText style={styles.panelSubtitle}>
              Provenance tags, confidence rails, and mentor writeback keep this from looking like a generic note app.
            </PaperText>
          </View>
        </View>

        <View style={styles.storyRow}>
          <StoryCard title="1. Normalize" description="Strip bullets, detect source prefixes, and turn fragments into note objects." />
          <StoryCard title="2. Dedup" description="Compare token overlap, bigrams, and intent anchors to cluster similar notes." />
          <StoryCard title="3. Hoop" description="Send a card to a human review room, capture a transcript, and write it back." />
        </View>
      </Surface>
    </View>
  );

  const dedupPanel = (
    <View style={styles.panelStack}>
      <Surface style={styles.panelCard} elevation={1}>
        <View style={styles.panelHeader}>
          <View>
            <PaperText variant="titleLarge" style={styles.panelTitle}>
              Dedup board
            </PaperText>
            <PaperText style={styles.panelSubtitle}>
              Each card keeps its provenance trail, confidence score, and a merge candidate.
            </PaperText>
          </View>
          <Chip icon="shape-outline" style={styles.helperChip}>
            {cards.length ? `${cards.length} cards` : 'No cards yet'}
          </Chip>
        </View>

        {!cards.length ? (
          <View style={styles.emptyState}>
            <PaperText variant="titleMedium" style={styles.emptyTitle}>
              Nothing has been clustered yet.
            </PaperText>
            <PaperText style={styles.panelSubtitle}>
              Go back to Capture, paste the sample notes, and run Analyze.
            </PaperText>
          </View>
        ) : (
          <View style={styles.cardStack}>
            {cards.map((card) => {
              const isActive = card.id === selectedCard?.id;
              const lockedLabel = card.locked ? 'Locked' : card.decision === 'merged' ? 'Merged' : 'Auto';
              const closeMatchLabel = card.closeMatch ? `${card.closeMatch.title} (${Math.round(card.closeMatch.score * 100)}%)` : 'No close match';

              return (
                <Pressable
                  key={card.id}
                  onPress={() => {
                    setActiveCardId(card.id);
                    setActiveView('hoop');
                  }}
                  style={({ pressed }) => [
                    styles.ideaPressable,
                    pressed && styles.ideaPressablePressed,
                  ]}
                >
                  <Card style={[styles.ideaCard, isActive && styles.ideaCardActive, card.locked && styles.ideaCardLocked]}>
                    <Card.Content>
                      <View style={styles.ideaTopRow}>
                        <Chip icon="source-branch" style={styles.metaChip}>
                          {card.sourceSummary}
                        </Chip>
                        <Chip
                          icon={card.locked ? 'lock-outline' : 'sparkles'}
                          style={[
                            styles.metaChip,
                            card.locked ? styles.metaChipLocked : styles.metaChipOpen,
                          ]}
                        >
                          {lockedLabel}
                        </Chip>
                      </View>

                      <PaperText variant="titleLarge" style={styles.ideaTitle}>
                        {card.title}
                      </PaperText>
                      <PaperText style={styles.ideaSummary}>{card.summary}</PaperText>

                      <View style={styles.progressHeader}>
                        <PaperText style={styles.progressLabel}>Confidence</PaperText>
                        <PaperText style={styles.progressValue}>
                          {Math.round(card.confidence * 100)}% · {card.confidenceLabel}
                        </PaperText>
                      </View>
                      <ProgressBar
                        progress={card.confidence}
                        style={styles.progressBar}
                        color={card.confidence >= 0.78 ? theme.colors.secondary : theme.colors.primary}
                      />

                      <View style={styles.keywordWrap}>
                        {card.keywords.map((keyword) => (
                          <Chip key={keyword} compact style={styles.keywordChip}>
                            {keyword}
                          </Chip>
                        ))}
                      </View>

                      <View style={styles.detailGrid}>
                        <InfoTile label="Notes" value={card.noteCount} />
                        <InfoTile label="Sources" value={card.uniqueSources} />
                        <InfoTile label="Match" value={`${Math.round((card.avgMatchScore || 0) * 100)}%`} />
                      </View>

                      <View style={styles.matchBox}>
                        <PaperText style={styles.matchLabel}>Closest merge candidate</PaperText>
                        <PaperText style={styles.matchValue}>{closeMatchLabel}</PaperText>
                      </View>

                      {card.mentorFeedback ? (
                        <View style={styles.feedbackBox}>
                          <PaperText style={styles.matchLabel}>Mentor writeback</PaperText>
                          <PaperText style={styles.feedbackText}>{card.mentorFeedback}</PaperText>
                        </View>
                      ) : null}

                      {card.history.length ? (
                        <View style={styles.historyBox}>
                          <PaperText style={styles.matchLabel}>History</PaperText>
                          {card.history.slice(-2).map((entry) => (
                            <PaperText key={entry} style={styles.historyText}>
                              • {entry}
                            </PaperText>
                          ))}
                        </View>
                      ) : null}

                      <View style={styles.cardActions}>
                        <Button
                          mode="contained-tonal"
                          icon="merge"
                          onPress={() => handleMergeCard(card.id)}
                          style={styles.cardActionButton}
                        >
                          Merge closest
                        </Button>
                        <Button
                          mode="outlined"
                          icon="split-vertical"
                          onPress={() => handleKeepSeparate(card.id)}
                          style={styles.cardActionButton}
                        >
                          Keep separate
                        </Button>
                        <Button
                          mode="text"
                          icon="account-tie"
                          onPress={() => beginMentorReview(card.id)}
                          textColor={theme.colors.secondary}
                        >
                          Ask mentor
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </Surface>
    </View>
  );

  const hoopPanel = (
    <View style={styles.panelStack}>
      <Surface style={styles.panelCard} elevation={1}>
        <View style={styles.panelHeader}>
          <View>
            <PaperText variant="titleLarge" style={styles.panelTitle}>
              Hoop review room
            </PaperText>
            <PaperText style={styles.panelSubtitle}>
              A selected idea card can be sent to a human review loop and written back as project memory.
            </PaperText>
          </View>
          <Chip icon={streamConfigured ? 'video-wireless-outline' : 'video-off-outline'} style={styles.helperChip}>
            {session.bridgeState}
          </Chip>
        </View>

        <SegmentedButtons
          value={reviewMode}
          onValueChange={setReviewMode}
          buttons={REVIEW_MODE_OPTIONS}
          style={styles.segmented}
        />

        <View style={styles.roleRow}>
          {ROLE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              selected={reviewRole === option.value}
              style={[styles.roleChip, reviewRole === option.value && styles.roleChipSelected]}
              onPress={() => setReviewRole(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </View>

        {selectedCard ? (
          <Card style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.ideaTopRow}>
                <Chip icon="shape-outline" style={styles.metaChip}>
                  {selectedCard.sourceSummary}
                </Chip>
                <Chip icon="badge-account-horizontal-outline" style={styles.metaChip}>
                  {Math.round(selectedCard.confidence * 100)}% confidence
                </Chip>
              </View>

              <PaperText variant="titleLarge" style={styles.ideaTitle}>
                {selectedCard.title}
              </PaperText>
              <PaperText style={styles.ideaSummary}>{selectedCard.summary}</PaperText>

              <View style={styles.detailGrid}>
                <InfoTile label="Selected" value={selectedCard.noteCount} />
                <InfoTile label="Mode" value={reviewMode} />
                <InfoTile label="Role" value={titleCase(reviewRole)} />
              </View>

              <View style={styles.sessionActions}>
                <Button
                  mode="contained"
                  icon="play-circle-outline"
                  onPress={() => beginMentorReview(selectedCard.id)}
                  style={styles.cardActionButton}
                >
                  Start review
                </Button>
                <Button
                  mode="contained-tonal"
                  icon="content-save-outline"
                  onPress={handleWriteback}
                  disabled={!session.transcript}
                  style={styles.cardActionButton}
                >
                  Write back
                </Button>
                <Button
                  mode="outlined"
                  icon="share-outline"
                  onPress={handleShareTranscript}
                  disabled={!session.transcript}
                  style={styles.cardActionButton}
                >
                  Export transcript
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.emptyState}>
            <PaperText variant="titleMedium" style={styles.emptyTitle}>
              No card is selected for Hoop yet.
            </PaperText>
            <PaperText style={styles.panelSubtitle}>
              Pick a card in the Dedup board and send it to the review room.
            </PaperText>
          </View>
        )}

        <View style={styles.timelineBox}>
          <PaperText variant="titleMedium" style={styles.sectionTitle}>
            Session timeline
          </PaperText>
          {session.status === 'requesting' ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <PaperText style={styles.panelSubtitle}>Connecting to the review room...</PaperText>
            </View>
          ) : null}
          {session.timeline.length ? (
            session.timeline.map((item) => <TimelineItem key={item.step} item={item} />)
          ) : (
            <PaperText style={styles.panelSubtitle}>
              Start a review to capture the mentoring timeline and writeback note.
            </PaperText>
          )}
        </View>

        <View style={styles.transcriptBox}>
          <View style={styles.panelHeader}>
            <View>
              <PaperText variant="titleMedium" style={styles.sectionTitle}>
                Transcript and writeback
              </PaperText>
              <PaperText style={styles.panelSubtitle}>
                The transcript is the piece that makes the human loop visible inside the idea artifact.
              </PaperText>
            </View>
            {session.tokenPreview ? (
              <Chip icon="key-outline" style={styles.helperChip}>
                {session.tokenPreview}
              </Chip>
            ) : null}
          </View>

          <Surface style={styles.transcriptSurface} elevation={0}>
            <PaperText style={styles.transcriptText}>
              {session.transcript || 'No transcript yet. Press Start review to generate one.'}
            </PaperText>
          </Surface>

          {session.writeback ? (
            <View style={styles.writebackBox}>
              <PaperText style={styles.matchLabel}>Writeback note</PaperText>
              <PaperText style={styles.feedbackText}>{session.writeback}</PaperText>
            </View>
          ) : null}

          <View style={styles.sessionFooter}>
            <Chip icon="check-decagram-outline" style={styles.helperChip}>
              {session.recommendation === 'merge' ? 'Merge recommended' : 'Keep separate recommended'}
            </Chip>
            <Chip icon="server-security" style={styles.helperChip}>
              {streamConfigured ? 'Stream bridge armed' : 'Local fallback'}
            </Chip>
          </View>
        </View>
      </Surface>
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backdropOne} />
        <View style={styles.backdropTwo} />
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content
            title="Nokta"
            subtitle="Track C migration + Hoop review"
            titleStyle={styles.appbarTitle}
            subtitleStyle={styles.appbarSubtitle}
          />
          <Appbar.Action icon="book-open-variant" onPress={handleLoadSample} />
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
            {activeBoard}

            <SegmentedButtons
              value={activeView}
              onValueChange={setActiveView}
              buttons={VIEW_OPTIONS}
              style={styles.segmented}
            />

            {activeView === 'capture' ? capturePanel : null}
            {activeView === 'dedup' ? dedupPanel : null}
            {activeView === 'hoop' ? hoopPanel : null}

            <Surface style={styles.footerCard} elevation={0}>
              <PaperText style={styles.footerText}>
                Expo-ready local demo. If the Stream env vars are available, the review room uses a token-server handshake;
                otherwise it falls back to a deterministic rehearsal session so the app stays runnable.
              </PaperText>
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>

        <Snackbar
          visible={Boolean(notice)}
          onDismiss={() => setNotice('')}
          duration={2400}
          style={styles.snackbar}
        >
          {notice}
        </Snackbar>
      </SafeAreaView>
    </PaperProvider>
  );
}

function MetricTile({ label, value, hint, accent }) {
  return (
    <Surface style={[styles.metricTile, styles[`metricTile${accent}`]]} elevation={0}>
      <PaperText style={styles.metricLabel}>{label}</PaperText>
      <PaperText variant="headlineSmall" style={styles.metricValue}>
        {value}
      </PaperText>
      <PaperText style={styles.metricHint}>{hint}</PaperText>
    </Surface>
  );
}

function StoryCard({ title, description }) {
  return (
    <Surface style={styles.storyCard} elevation={0}>
      <PaperText style={styles.storyTitle}>{title}</PaperText>
      <PaperText style={styles.storyDescription}>{description}</PaperText>
    </Surface>
  );
}

function InfoTile({ label, value }) {
  return (
    <Surface style={styles.infoTile} elevation={0}>
      <PaperText style={styles.infoLabel}>{label}</PaperText>
      <PaperText style={styles.infoValue}>{value}</PaperText>
    </Surface>
  );
}

function TimelineItem({ item }) {
  return (
    <Surface style={styles.timelineItem} elevation={0}>
      <View style={styles.timelineDot} />
      <View style={styles.timelineCopy}>
        <PaperText style={styles.timelineStep}>{item.step}</PaperText>
        <PaperText style={styles.timelineDetail}>{item.detail}</PaperText>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  backdropOne: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(124, 92, 255, 0.16)',
  },
  backdropTwo: {
    position: 'absolute',
    bottom: 120,
    left: -110,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(34, 199, 162, 0.12)',
  },
  appbar: {
    backgroundColor: 'rgba(7, 16, 29, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  appbarTitle: {
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  appbarSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(16, 25, 44, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: theme.colors.onSurface,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 20,
  },
  heroChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 199, 162, 0.12)',
    borderColor: 'rgba(34, 199, 162, 0.25)',
  },
  metricGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metricTileprimary: {
    backgroundColor: 'rgba(124, 92, 255, 0.10)',
  },
  metricTilesecondary: {
    backgroundColor: 'rgba(34, 199, 162, 0.10)',
  },
  metricTiletertiary: {
    backgroundColor: 'rgba(255, 184, 77, 0.10)',
  },
  metricLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricValue: {
    color: theme.colors.onSurface,
    marginTop: 6,
    fontWeight: '800',
  },
  metricHint: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  segmented: {
    backgroundColor: 'rgba(16, 25, 44, 0.94)',
    padding: 6,
    borderRadius: 20,
  },
  panelStack: {
    gap: 16,
  },
  panelCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(16, 25, 44, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  panelTitle: {
    color: theme.colors.onSurface,
    fontWeight: '800',
  },
  panelSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 20,
  },
  helperChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sourceRail: {
    gap: 10,
    paddingBottom: 12,
  },
  sourceChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sourceChipSelected: {
    backgroundColor: 'rgba(124, 92, 255, 0.18)',
    borderColor: 'rgba(124, 92, 255, 0.4)',
  },
  input: {
    backgroundColor: 'rgba(7, 16, 29, 0.75)',
  },
  inputOutline: {
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 16,
  },
  secondaryButton: {
    borderRadius: 16,
  },
  storyRow: {
    gap: 10,
  },
  storyCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  storyTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  storyDescription: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardStack: {
    gap: 14,
  },
  ideaPressable: {
    borderRadius: 24,
  },
  ideaPressablePressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  ideaCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(7, 16, 29, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ideaCardActive: {
    borderColor: 'rgba(124, 92, 255, 0.45)',
    backgroundColor: 'rgba(124, 92, 255, 0.08)',
  },
  ideaCardLocked: {
    borderColor: 'rgba(255, 184, 77, 0.28)',
  },
  ideaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metaChipLocked: {
    backgroundColor: 'rgba(255, 184, 77, 0.10)',
  },
  metaChipOpen: {
    backgroundColor: 'rgba(34, 199, 162, 0.10)',
  },
  ideaTitle: {
    color: theme.colors.onSurface,
    marginTop: 12,
    fontWeight: '800',
  },
  ideaSummary: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  progressLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  progressValue: {
    color: theme.colors.onSurface,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    marginTop: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  keywordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  keywordChip: {
    backgroundColor: 'rgba(124, 92, 255, 0.10)',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  infoTile: {
    flexGrow: 1,
    flexBasis: '31%',
    borderRadius: 18,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  infoValue: {
    color: theme.colors.onSurface,
    marginTop: 6,
    fontWeight: '700',
  },
  matchBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  feedbackBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 199, 162, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 199, 162, 0.18)',
  },
  historyBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  matchLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  matchValue: {
    color: theme.colors.onSurface,
    marginTop: 6,
    lineHeight: 20,
  },
  feedbackText: {
    color: theme.colors.onSurface,
    marginTop: 8,
    lineHeight: 20,
  },
  historyText: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  cardActions: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  cardActionButton: {
    borderRadius: 16,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  roleChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  roleChipSelected: {
    backgroundColor: 'rgba(124, 92, 255, 0.18)',
    borderColor: 'rgba(124, 92, 255, 0.4)',
  },
  reviewCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(7, 16, 29, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sessionActions: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  timelineBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: theme.colors.secondary,
  },
  timelineCopy: {
    flex: 1,
  },
  timelineStep: {
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  timelineDetail: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 18,
  },
  transcriptBox: {
    marginTop: 16,
  },
  transcriptSurface: {
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(7, 16, 29, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  transcriptText: {
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  writebackBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 92, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 255, 0.18)',
  },
  sessionFooter: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  footerCard: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  footerText: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 19,
  },
  snackbar: {
    backgroundColor: '#121a2d',
  },
});

export default App;
