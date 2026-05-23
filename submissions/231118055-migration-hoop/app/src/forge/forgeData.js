export const FORGE_CYCLES = [
  {
    cycle: 1,
    report: 'voice-note-01.md',
    hypothesis: 'A dedicated voice visualizer should make the mic feel alive and lower perceived latency.',
    result: 'success',
    changedFiles: ['App.js', 'src/components/VoiceVisualizer.js', 'src/hooks/useVoiceCapture.js'],
    test: 'manual talk test + transcript preview',
    commit: 'working-tree',
    kg: 1,
  },
  {
    cycle: 2,
    report: 'voice-note-02.md',
    hypothesis: 'The avatar should always reload on every mic tick to show more motion.',
    result: 'rollback',
    changedFiles: [],
    test: 'frame drops visible; animation stuttered heavily.',
    commit: 'rollback/no-commit',
    kg: 1,
  },
  {
    cycle: 3,
    report: 'voice-note-03.md',
    hypothesis: 'Only the jaw and head should react to amplitude; the rest of the scene should stay calm.',
    result: 'success',
    changedFiles: ['src/components/AvatarStage.js'],
    test: 'voice test with low/high amplitude phrases',
    commit: 'working-tree',
    kg: 2,
  },
  {
    cycle: 4,
    report: 'voice-note-04.md',
    hypothesis: 'After two failed cycles in a row, the expert bridge should open immediately.',
    result: 'success',
    changedFiles: ['src/bridge/BridgeModal.js', 'src/forge/forgeData.js'],
    test: 'stuck heuristic + bridge open path',
    commit: 'working-tree',
    kg: 3,
  },
];

export function buildForgeStats(cycles = FORGE_CYCLES) {
  const successCount = cycles.filter((cycle) => cycle.result === 'success').length;
  const rollbackCount = cycles.length - successCount;
  const totalKg = cycles[cycles.length - 1]?.kg || 0;
  const stuck = isStuck(cycles);

  return {
    successCount,
    rollbackCount,
    totalKg,
    stuck,
  };
}

export function isStuck(cycles = FORGE_CYCLES) {
  const tail = cycles.slice(-2);
  if (tail.length < 2) {
    return false;
  }

  return tail.every((cycle) => cycle.result === 'rollback' || cycle.result === 'fail');
}
