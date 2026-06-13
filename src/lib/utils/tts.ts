// Text-to-Speech utility
// Uses browser Web Speech API (no external service, privacy-first)

export interface TTSOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function speak(options: TTSOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech Synthesis API not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.lang = options.lang || 'de-DE';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(event.error));

    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window;
}
