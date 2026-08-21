import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateNoteQuality } from './noteQuality.js';

test('evaluates the agreed first-run and rerun scenario', () => {
  const note = { narrative: 'The client remained stable while discussing several difficult events during this individual treatment session today.' };

  const firstRun = evaluateNoteQuality(note);
  assert.deepEqual(firstRun.completedItems.map(item => item.label), [
    'Completeness', 'Uniqueness', 'Progress Mentioned', 'Golden Thread',
  ]);
  assert.deepEqual(firstRun.openItems.map(item => item.title), [
    'Intervention Used', 'Client Response to Intervention', 'Compliant Plan', 'Service Code Match',
  ]);

  const rerun = evaluateNoteQuality(note, [], true);
  assert.deepEqual(rerun.openItems.map(item => item.title), [
    'Intervention Used', 'Client Response to Intervention', 'Compliant Plan',
  ]);
});

test('recognizes intervention, response field, and future plan across active fields', () => {
  const note = {
    intervention: 'The therapist provided psychoeducation about coping skills.',
    response: 'Engaged throughout the exercise.',
    plan: 'The client will continue practicing before the next session.',
  };
  const sections = [
    { id: 'intervention', label: 'Intervention' },
    { id: 'response', label: 'Client Response' },
    { id: 'plan', label: 'Plan' },
  ];

  const results = evaluateNoteQuality(note, sections);
  const passed = results.completedItems.map(item => item.label);
  assert.ok(passed.includes('Intervention Used'));
  assert.ok(passed.includes('Client Response to Intervention'));
  assert.ok(passed.includes('Compliant Plan'));
});
