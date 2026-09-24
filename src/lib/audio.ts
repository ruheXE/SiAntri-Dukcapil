/**
 * Text-to-Speech (TTS) Engine for Queue Calls in Indonesian
 */

// Simple audio tone synth for calling chime
function playChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        resolve();
        return;
      }
      const ctx = new AudioContextClass();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Gong chime chime frequencies (C5 -> E5 -> G5)
      const now = ctx.currentTime;
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.2); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.4); // G5

      osc2.frequency.setValueAtTime(1046.50, now + 0.4); // C6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.4);
      osc1.stop(now + 0.9);
      osc2.stop(now + 0.9);

      setTimeout(() => {
        ctx.close();
        resolve();
      }, 950);
    } catch (e) {
      console.warn('Audio chime fallback:', e);
      resolve();
    }
  });
}

function speakIndonesianText(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.88; // Slightly slow and clear for public announcement
    utterance.pitch = 1.0;

    // Find Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Format Ticket Number for Indonesian Pronunciation
 * e.g., "A-005" -> "A, nol nol lima"
 * "P-012" -> "P, nol satu dua"
 */
export function formatTicketForVoice(ticketId: string): string {
  const parts = ticketId.split('-');
  if (parts.length < 2) return ticketId;

  const prefix = parts[0];
  const digits = parts[1].split('').map(d => {
    switch (d) {
      case '0': return 'nol';
      case '1': return 'satu';
      case '2': return 'dua';
      case '3': return 'tiga';
      case '4': return 'empat';
      case '5': return 'lima';
      case '6': return 'enam';
      case '7': return 'tujuh';
      case '8': return 'delapan';
      case '9': return 'sembilan';
      default: return d;
    }
  }).join(' ');

  return `Nomor antrian ${prefix}, ${digits}`;
}

export async function announceTicket(ticketId: string, deskName: string): Promise<void> {
  await playChime();
  const voiceText = `${formatTicketForVoice(ticketId)}, silakan menuju ${deskName}`;
  await speakIndonesianText(voiceText);
}
