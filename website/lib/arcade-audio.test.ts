import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createArcadeAudio } from './arcade-audio.ts';

// Verify the audio lifecycle without relying on speakers or a browser's autoplay policy.
function context() {
  const sources: {
    stopped: boolean;
    disconnected: boolean;
    frequency: { value: number };
    onended?: () => void;
  }[] = [];
  const param = () => ({
    value: 0,
    setValueAtTime(v: number) {
      this.value = v;
    },
    linearRampToValueAtTime(v: number) {
      this.value = v;
    },
    exponentialRampToValueAtTime(v: number) {
      this.value = v;
    },
    setTargetAtTime(v: number) {
      this.value = v;
    },
  });
  const node = () => ({
    disconnected: false,
    connect() {},
    disconnect() {
      this.disconnected = true;
    },
  });
  const source = () => {
    const n = {
      ...node(),
      frequency: param(),
      type: '',
      stopped: false,
      onended: undefined as (() => void) | undefined,
      start() {},
      stop(when?: number) {
        if (when === undefined) {
          this.stopped = true;
          this.onended?.();
        }
      },
    };
    sources.push(n);
    return n;
  };
  const ac = {
    currentTime: 1,
    sampleRate: 1000,
    state: 'running',
    destination: {},
    createGain: () => ({ ...node(), gain: param() }),
    createOscillator: source,
    createBufferSource: source,
    createBiquadFilter: () => ({
      ...node(),
      frequency: param(),
      Q: param(),
      type: '',
    }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(350) }),
  };
  return { audio: createArcadeAudio(ac as unknown as AudioContext), sources };
}
void test('audio stays silent until opt-in and reuses one beam instead of spawning per frame', () => {
  const { audio, sources } = context();
  audio.beam(1);
  audio.play('bank');
  assert.equal(sources.length, 0);
  audio.setEnabled(true);
  assert.equal(sources.length, 3);
  for (let i = 0; i < 100; i++) audio.beam(1);
  assert.equal(sources.length, 3);
  audio.beam(2);
  assert.equal(sources.length, 3);
  assert.equal(sources[0].frequency.value, 260);
  audio.beam(0);
  assert.ok(sources.every((s) => s.stopped && s.disconnected));
});
void test('mute cancels scheduled cargo sounds; pause and destroy release beam and effect nodes', () => {
  const { audio, sources } = context();
  audio.setEnabled(true);
  audio.beam(1);
  audio.play('bank');
  assert.equal(sources.length, 11);
  audio.setEnabled(false);
  assert.ok(sources.every((s) => s.stopped && s.disconnected));
  audio.play('collect');
  assert.equal(sources.length, 11);
  audio.setEnabled(true);
  audio.beam(2);
  audio.play('collect');
  audio.silence();
  assert.ok(sources.every((s) => s.stopped && s.disconnected));
  audio.beam(1);
  audio.destroy();
  audio.destroy();
  assert.ok(sources.every((s) => s.stopped && s.disconnected));
  const total = sources.length;
  audio.setEnabled(true);
  audio.beam(2);
  audio.play('hit');
  assert.equal(sources.length, total);
});
void test('rapid effects have a bounded voice count', () => {
  const { audio, sources } = context();
  audio.setEnabled(true);
  for (let i = 0; i < 50; i++) audio.play('bank');
  assert.equal(sources.length, 24);
  audio.destroy();
  assert.ok(sources.every((s) => s.stopped));
});
