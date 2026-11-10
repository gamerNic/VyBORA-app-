/**
 * Generates real, audible 16-bit PCM WAV audio files.
 * This guarantees authentic sound is emitted through HTMLAudioElement
 * even before the user imports their own personal MP3/FLAC music.
 */

function encodeWav(samplesL: Float32Array, samplesR: Float32Array, sampleRate = 44100): Blob {
  const numSamples = samplesL.length;
  const buffer = new ArrayBuffer(44 + numSamples * 4);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + numSamples * 4, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM = 1)
  view.setUint16(20, 1, true);
  // channel count (2 for stereo)
  view.setUint16(22, 2, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 2 channels * 2 bytes)
  view.setUint32(28, sampleRate * 4, true);
  // block align (2 channels * 2 bytes)
  view.setUint16(32, 4, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, numSamples * 4, true);

  // Write interleaved 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left channel
    let sL = Math.max(-1, Math.min(1, samplesL[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    offset += 2;

    // Right channel
    let sR = Math.max(-1, Math.min(1, samplesR[i]));
    view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Cache of generated blob URLs
const wavUrlCache: Record<string, string> = {};

export function getRealWavTrackUrl(trackId: string): string {
  if (wavUrlCache[trackId]) {
    return wavUrlCache[trackId];
  }

  const sampleRate = 44100;
  const durationSec = 32; // 32 seconds rich musical loop
  const totalSamples = sampleRate * durationSec;
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  // Musical scales for each track
  let bpm = 120;
  let rootFreq = 110; // A2
  let melodyScale = [220, 261.63, 329.63, 392.00, 440, 523.25]; // A minor pentatonic

  if (trackId === 'track-2') {
    bpm = 124;
    rootFreq = 92.5; // F#2
    melodyScale = [185, 220, 277.18, 370, 440, 554.37]; // F# minor
  } else if (trackId === 'track-3') {
    bpm = 90;
    rootFreq = 82.41; // E2
    melodyScale = [164.81, 196.00, 246.94, 293.66, 329.63, 392.00]; // E minor ambient
  } else if (trackId === 'track-4') {
    bpm = 128;
    rootFreq = 73.42; // D2
    melodyScale = [146.83, 174.61, 220, 293.66, 349.23, 440]; // D minor electro
  }

  const beatSamples = Math.floor(sampleRate * (60 / bpm));
  const sixteenthSamples = Math.floor(beatSamples / 4);

  // Render musical layers
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const beatIndex = Math.floor(i / beatSamples);
    const sixteenthIndex = Math.floor(i / sixteenthSamples);
    const posInBeat = (i % beatSamples) / beatSamples;
    const posInSixteenth = (i % sixteenthSamples) / sixteenthSamples;

    let sampleL = 0;
    let sampleR = 0;

    // 1. Kick Drum (on every beat 0, 1, 2, 3)
    if (posInBeat < 0.25) {
      const kickEnv = Math.exp(-posInBeat * 28);
      const kickFreq = 130 * Math.exp(-posInBeat * 35) + 42;
      const kickWave = Math.sin(2 * Math.PI * kickFreq * t);
      sampleL += kickWave * kickEnv * 0.45;
      sampleR += kickWave * kickEnv * 0.45;
    }

    // 2. Snare / Clap (on beats 1 and 3 of every 4-beat bar)
    const barBeat = beatIndex % 4;
    if ((barBeat === 1 || barBeat === 3) && posInBeat < 0.2) {
      const snareEnv = Math.exp(-posInBeat * 30);
      const whiteNoise = (Math.random() * 2 - 1) * 0.25;
      const snareTone = Math.sin(2 * Math.PI * 185 * t) * 0.15;
      sampleL += (whiteNoise + snareTone) * snareEnv;
      sampleR += (whiteNoise + snareTone) * snareEnv;
    }

    // 3. Hi-Hat (every 16th note, slightly accented on offbeats)
    if (posInSixteenth < 0.08) {
      const hatEnv = Math.exp(-posInSixteenth * 60);
      const hatNoise = (Math.random() * 2 - 1) * 0.09;
      sampleL += hatNoise * hatEnv * 0.8;
      sampleR += hatNoise * hatEnv * 1.1; // stereo width
    }

    // 4. Sub-Bassline (Root note pulses)
    const bassNoteIdx = Math.floor(beatIndex / 4) % 4;
    const bassFreq = rootFreq * (bassNoteIdx === 2 ? 1.189 : bassNoteIdx === 3 ? 1.334 : 1.0);
    const bassEnv = 0.5 + 0.3 * Math.sin(posInBeat * Math.PI);
    const bassWave = Math.sin(2 * Math.PI * bassFreq * t) + 0.3 * Math.sin(2 * Math.PI * bassFreq * 2 * t);
    sampleL += bassWave * bassEnv * 0.25;
    sampleR += bassWave * bassEnv * 0.25;

    // 5. Arpeggio / Synth Lead
    const leadNote = melodyScale[(sixteenthIndex + Math.floor(sixteenthIndex / 8)) % melodyScale.length];
    const leadEnv = Math.exp(-posInSixteenth * 12);
    const leadWave = Math.sin(2 * Math.PI * leadNote * t) * 0.14 +
                     Math.sin(2 * Math.PI * leadNote * 1.5 * t) * 0.06;
    // Stereo panning based on note index
    const pan = Math.sin(sixteenthIndex * 0.5);
    sampleL += leadWave * leadEnv * (0.5 - pan * 0.3);
    sampleR += leadWave * leadEnv * (0.5 + pan * 0.3);

    // 6. Atmospheric Chord Pad
    const padFreq = rootFreq * 2;
    const padWave = (Math.sin(2 * Math.PI * padFreq * t) +
                     Math.sin(2 * Math.PI * (padFreq * 1.25) * t) +
                     Math.sin(2 * Math.PI * (padFreq * 1.5) * t)) * 0.04;
    sampleL += padWave;
    sampleR += padWave;

    // Soft master limiter to prevent clipping
    left[i] = Math.tanh(sampleL);
    right[i] = Math.tanh(sampleR);
  }

  const blob = encodeWav(left, right, sampleRate);
  const url = URL.createObjectURL(blob);
  wavUrlCache[trackId] = url;
  return url;
}
