export type ArcadeSound =
  | 'collect'
  | 'bank'
  | 'hit'
  | 'power'
  | 'level'
  | 'repel'
  | 'launch'
  | 'dash'
  | 'warning'
  | 'upgrade'
  | 'finish';
export type BeamSound = 0 | 1 | 2; // Off, searching, lifting.

// Synthesized locally: no audio files, timers, or sound before an explicit opt-in.
export function createArcadeAudio(ac: AudioContext) {
  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);
  const noise = ac.createBuffer(
    1,
    Math.ceil(ac.sampleRate * 0.35),
    ac.sampleRate,
  );
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  let enabled = false,
    disposed = false,
    beamState: BeamSound = 0;
  let beam: {
    carrier: OscillatorNode;
    harmonic: OscillatorNode;
    lfo: OscillatorNode;
    modulation: GainNode;
    gain: GainNode;
    tint: GainNode;
  } | null = null;
  const voices = new Set<() => void>();

  function stopBeam() {
    if (!beam) return;
    for (const node of [beam.carrier, beam.harmonic, beam.lfo]) {
      node.stop();
      node.disconnect();
    }
    beam.modulation.disconnect();
    beam.gain.disconnect();
    beam.tint.disconnect();
    beam = null;
  }
  function updateBeam() {
    if (!enabled || !beamState || disposed) {
      stopBeam();
      return;
    }
    if (!beam) {
      const carrier = ac.createOscillator(),
        harmonic = ac.createOscillator(),
        lfo = ac.createOscillator();
      const modulation = ac.createGain(),
        gain = ac.createGain(),
        tint = ac.createGain();
      carrier.type = 'triangle';
      harmonic.type = 'square';
      lfo.type = 'sine';
      modulation.gain.value = 18;
      tint.gain.value = 0.075;
      gain.gain.value = 0;
      lfo.connect(modulation);
      modulation.connect(carrier.frequency);
      carrier.connect(gain);
      harmonic.connect(tint);
      tint.connect(gain);
      gain.connect(master);
      carrier.start();
      harmonic.start();
      lfo.start();
      beam = { carrier, harmonic, lfo, modulation, gain, tint };
    }
    const lifting = beamState === 2;
    beam.carrier.frequency.setTargetAtTime(
      lifting ? 260 : 145,
      ac.currentTime,
      0.07,
    );
    beam.harmonic.frequency.setTargetAtTime(
      lifting ? 520 : 290,
      ac.currentTime,
      0.07,
    );
    beam.lfo.frequency.setTargetAtTime(lifting ? 14 : 6, ac.currentTime, 0.07);
    beam.gain.gain.setTargetAtTime(
      lifting ? 0.08 : 0.03,
      ac.currentTime,
      0.035,
    );
  }
  function envelope(
    source: OscillatorNode | AudioBufferSourceNode,
    when: number,
    duration: number,
    volume: number,
    filter?: BiquadFilterNode,
  ) {
    if (voices.size >= 24) return;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(volume, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    if (filter) {
      source.connect(filter);
      filter.connect(gain);
    } else source.connect(gain);
    gain.connect(master);
    let ended = false;
    const cleanup = () => {
      if (ended) return;
      ended = true;
      source.disconnect();
      filter?.disconnect();
      gain.disconnect();
      voices.delete(cancel);
    };
    const cancel = () => {
      if (!ended) {
        source.stop();
        cleanup();
      }
    };
    voices.add(cancel);
    source.onended = cleanup;
    source.start(when);
    source.stop(when + duration + 0.01);
  }
  function note(
    type: OscillatorType,
    from: number,
    to: number,
    delay: number,
    duration: number,
    volume: number,
  ) {
    if (voices.size >= 24) return;
    const source = ac.createOscillator(),
      when = ac.currentTime + delay;
    source.type = type;
    source.frequency.setValueAtTime(from, when);
    source.frequency.exponentialRampToValueAtTime(to, when + duration);
    envelope(source, when, duration, volume);
  }
  function clatter(
    delay: number,
    duration: number,
    volume: number,
    from = 1800,
    to = 180,
  ) {
    if (voices.size >= 24) return;
    const source = ac.createBufferSource(),
      filter = ac.createBiquadFilter(),
      when = ac.currentTime + delay;
    source.buffer = noise;
    filter.type = 'lowpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(from, when);
    filter.frequency.exponentialRampToValueAtTime(to, when + duration);
    envelope(source, when, duration, volume, filter);
  }
  function silence() {
    beamState = 0;
    stopBeam();
    for (const cancel of voices) cancel();
  }
  return {
    setEnabled(value: boolean) {
      if (disposed) return;
      enabled = value;
      master.gain.setValueAtTime(value ? 0.42 : 0, ac.currentTime);
      if (!value) {
        stopBeam();
        for (const cancel of voices) cancel();
      } else updateBeam();
    },
    beam(value: BeamSound) {
      if (value === beamState || disposed) return;
      beamState = value;
      updateBeam();
    },
    play(kind: ArcadeSound) {
      if (!enabled || disposed || ac.state !== 'running') return;
      if (kind === 'collect') {
        // A quick, soft two-note pickup; the longer phrase belongs to unloading.
        note('triangle', 784, 784, 0, 0.09, 0.09);
        note('square', 1047, 1047, 0.045, 0.1, 0.025);
      } else if (kind === 'bank') {
        // Cargo settles into the bed, followed by a rising C-major reward.
        // Keep the high notes steady: descending electronic tones signal damage.
        for (let i = 0; i < 3; i++) {
          note('triangle', 105 - i * 12, 55, i * 0.075, 0.13, 0.16 - i * 0.025);
          clatter(i * 0.075, 0.09, 0.065 - i * 0.012, 1100, 260);
        }
        [523.25, 659.25, 783.99, 1046.5].forEach((pitch, i) => {
          const delay = 0.2 + i * 0.075;
          const duration = i === 3 ? 0.26 : 0.14;
          note('triangle', pitch, pitch, delay, duration, 0.11);
          note('square', pitch, pitch, delay, duration, 0.025);
        });
      } else if (kind === 'launch') {
        // Pneumatic lift-off and a bright delivery confirmation, never a crash.
        note('triangle', 130, 1047, 0, 0.24, 0.12);
        clatter(0, 0.18, 0.07, 350, 2400);
        note('square', 784, 784, 0.25, 0.14, 0.035);
        note('triangle', 1047, 1047, 0.34, 0.24, 0.11);
      } else if (kind === 'dash') {
        clatter(0, 0.18, 0.09, 450, 3400);
        note('triangle', 180, 1400, 0, 0.16, 0.075);
        note('square', 360, 1800, 0.025, 0.12, 0.02);
      } else if (kind === 'warning') {
        // Radar pips warn about entry; no descending damage-like interval.
        note('triangle', 740, 740, 0, 0.07, 0.055);
        note('triangle', 740, 740, 0.14, 0.07, 0.055);
      } else if (kind === 'upgrade' || kind === 'finish') {
        const melody =
          kind === 'upgrade'
            ? [262, 330, 392, 523, 784]
            : [523, 392, 440, 659, 784];
        melody.forEach((pitch, i) => {
          note('square', pitch, pitch, i * 0.1, 0.17, 0.045);
          note('triangle', pitch / 2, pitch / 2, i * 0.1, 0.2, 0.07);
        });
      } else if (kind === 'power' || kind === 'level') {
        const pitches =
          kind === 'power'
            ? [392, 523.25, 659.25, 1046.5]
            : [392, 493.88, 587.33];
        pitches.forEach((pitch, i) =>
          note(
            'triangle',
            pitch,
            pitch,
            i * 0.075,
            0.17,
            kind === 'power' ? 0.12 : 0.07,
          ),
        );
        if (kind === 'power')
          note('square', 1046.5, 1046.5, 0.225, 0.18, 0.025);
      } else if (kind === 'repel') {
        note('triangle', 196, 784, 0, 0.14, 0.13);
        note('square', 784, 784, 0.1, 0.1, 0.03);
        note('triangle', 1175, 1175, 0.15, 0.16, 0.07);
      } else if (kind === 'hit') {
        // A rough, low double buzz is reserved for losing a shield.
        note('sawtooth', 190, 46, 0, 0.2, 0.1);
        note('square', 145, 38, 0.055, 0.16, 0.045);
        clatter(0, 0.1, 0.1, 2400, 120);
      }
    },
    silence,
    destroy() {
      if (disposed) return;
      silence();
      enabled = false;
      disposed = true;
      master.disconnect();
    },
  };
}
export type ArcadeAudio = ReturnType<typeof createArcadeAudio>;
