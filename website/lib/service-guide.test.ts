import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendService, serviceNotesHint } from './service-guide.ts';
import { serviceNames } from './pickup.ts';
void test('situations route to the confirmed service catalog', () => {
  const cases = [
    ['items', '', 'Bulk item removal'],
    ['property', '', 'Trash outs'],
    ['community', 'weekly', 'Weekly bulk service'],
    ['community', 'chute', 'Chute room clear outs'],
    ['reuse', '', 'Donations & recyclables'],
  ];
  for (const [goal, area, expected] of cases) {
    const result = recommendService(goal, area);
    assert.equal(result?.service, expected);
    assert.ok((serviceNames as readonly string[]).includes(result!.service));
  }
});
void test('incomplete and unknown choices never guess a service', () => {
  for (const [goal, area] of [
    ['', ''],
    ['community', ''],
    ['community', 'items'],
    ['chute', ''],
    ['unknown', 'weekly'],
  ]) {
    assert.equal(recommendService(goal, area), null);
  }
});
void test('service guidance changes by need and keeps an unknown-service fallback', () => {
  assert.match(serviceNotesHint('Weekly bulk service'), /enclosures/);
  assert.match(serviceNotesHint('Chute room clear outs'), /chute rooms/);
  assert.match(serviceNotesHint('Donations & recyclables'), /acceptance/);
  assert.equal(
    serviceNotesHint('unrecognized'),
    serviceNotesHint('Help me choose'),
  );
});
