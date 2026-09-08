export type ArcadeSound = 'collect' | 'bank' | 'hit';
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
      modulation.gain.value = 24;
      tint.gain.value = 0.12;
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
      lifting ? 0.1 : 0.045,
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
  function clatter(delay: number, duration: number, volume: number) {
    if (voices.size >= 24) return;
    const source = ac.createBufferSource(),
      filter = ac.createBiquadFilter(),
      when = ac.currentTime + delay;
    source.buffer = noise;
    filter.type = 'lowpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(1800, when);
    filter.frequency.exponentialRampToValueAtTime(180, when + duration);
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
        for (const [i, pitch] of [660, 880, 1320].entries())
          note('square', pitch, pitch * 1.025, i * 0.045, 0.085, 0.065);
      } else if (kind === 'bank') {
        // Falling cargo: three weighted impacts, a rattling bed, then a latch clang.
        for (let i = 0; i < 3; i++) {
          note('triangle', 125 - i * 16, 38, i * 0.13, 0.24, 0.35 - i * 0.06);
          clatter(i * 0.13, 0.2, 0.16 - i * 0.025);
        }
        note('square', 440, 310, 0.43, 0.18, 0.07);
        note('triangle', 880, 620, 0.43, 0.22, 0.05);
      } else {
        note('sawtooth', 180, 48, 0, 0.22, 0.08);
        clatter(0, 0.13, 0.11);
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
