import type { AuditFixture } from './audit-types';

export const AUDIT_FIXTURES: AuditFixture[] = [
  {
    screenKey: 'home',
    screenLabel: 'Home',
    reportSlug: 'home-safe-area-collision',
    reportTitle: 'Home route: CTA collides with the audit lane',
    issue: 'Primary CTA and the floating audit button are both asking for the same bottom-right space.',
    observation: 'The hero card looks clean, but the lower button stack becomes cramped once the FAB appears.',
    hypothesis: 'The safe-area padding is correct for the content, but it does not reserve a lane for the widget overlay.',
    repair: 'Increase bottom padding on the hero stack and reserve a fixed FAB lane so the widget stays drop-in friendly.',
    reproduction: [
      'Open the home route on a narrow handset width.',
      'Scroll until the CTA stack is fully visible.',
      'Open the audit widget and note the overlap risk.'
    ],
    burnInAsset: './assets/home-burnin.svg',
    noteSeed: 'Reserve the lower-right lane before the FAB lands.'
  },
  {
    screenKey: 'inspect',
    screenLabel: 'Inspect',
    reportSlug: 'inspect-card-density',
    reportTitle: 'Inspect route: evidence cards need clearer spacing',
    issue: 'The evidence rail compresses too hard and the call to action becomes visually noisy.',
    observation: 'One dense card is fine, but three stacked density patterns make the route feel busy.',
    hypothesis: 'The problem is not the content itself; it is the lack of rhythm between cards and labels.',
    repair: 'Use a calmer vertical cadence and let the strongest evidence card breathe above the fold.',
    reproduction: [
      'Open the inspect route.',
      'Compare the evidence card, status pills, and the export action.',
      'Check whether the yellow burn-in box still isolates the main issue.'
    ],
    burnInAsset: './assets/inspect-burnin.svg',
    noteSeed: 'Restore rhythm so the evidence card becomes the anchor.'
  },
  {
    screenKey: 'ledger',
    screenLabel: 'Ledger',
    reportSlug: 'ledger-ratchet-line',
    reportTitle: 'Ledger route: ratchet progress should be explicit',
    issue: 'The forge story needs a visible ratchet line so a rollback does not look like random churn.',
    observation: 'The current layout reads like a status page, but the learner needs the cycle history at a glance.',
    hypothesis: 'If the ledger is made monotonic and the rollback is named, the human touch points become auditable.',
    repair: 'Add a simple cycle strip, pin the rollback row, and keep kg values increasing across successful cycles.',
    reproduction: [
      'Open the ledger route.',
      'Read the cycle strip from left to right.',
      'Confirm that rollback is visible but does not break the monotonic kg story.'
    ],
    burnInAsset: './assets/ledger-burnin.svg',
    noteSeed: 'Show ratchet progress without hiding the rollback.'
  }
];

export function getAuditFixture(screenKey: string) {
  return AUDIT_FIXTURES.find((fixture) => fixture.screenKey === screenKey) ?? AUDIT_FIXTURES[0];
}
