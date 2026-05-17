import type { AuditFixture, AuditNote } from './audit-types';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildAuditMarkdown(note: AuditNote, fixture: AuditFixture) {
  return [
    `# ${fixture.reportTitle}`,
    '',
    `- Screen: ${fixture.screenLabel}`,
    `- Status: ${note.status}`,
    `- Reporter: ${note.reporterId ?? 'anonymous'}`,
    `- Created: ${formatDate(note.createdAt)}`,
    `- Report file: ${note.reportUri}`,
    '',
    '## Issue',
    fixture.issue,
    '',
    '## Observation',
    fixture.observation,
    '',
    '## Hypothesis',
    fixture.hypothesis,
    '',
    '## Repair',
    fixture.repair,
    '',
    '## Reproduction',
    ...fixture.reproduction.map((step) => `- ${step}`),
    '',
    '## Burn-in',
    `![Burn-in evidence](${fixture.burnInAsset})`,
    '',
    '## Host note',
    note.note,
    '',
    '## Routing hint',
    `This report came from the ${fixture.screenKey} route and should be read as input for the next forge cycle.`,
    '',
  ].join('\n');
}

export function buildReportFileName(note: AuditNote, fixture: AuditFixture) {
  return `audit-reports/${slugify(`${fixture.reportSlug}-${note.id}`)}.md`;
}
