import { generateJoseAudio, decodeBase64, decodeAudioData } from './geminiService';
import { Language } from '../types';

type VoiceCallback = (isSpeaking: boolean, key?: string) => void;

class VoiceService {
  private audioContext: AudioContext | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private subscribers: VoiceCallback[] = [];

  subscribe(callback: VoiceCallback): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notify(isSpeaking: boolean, key?: string) {
    this.subscribers.forEach(callback => callback(isSpeaking, key));
  }

  async speak(text: string, language: Language = 'fr', key?: string): Promise<void> {
    try {
      // Arrêter la lecture précédente
      this.stop();

      this.notify(true, key);

      // Générer l'audio
      const audioData = await generateJoseAudio(text, language);
      if (!audioData) {
        this.notify(false);
        return;
      }

      // Initialiser le contexte audio si nécessaire
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      // Décoder et jouer l'audio
      const decodedData = decodeBase64(audioData);
      const audioBuffer = await decodeAudioData(decodedData, this.audioContext, 24000, 1);
      
      this.activeSource = this.audioContext.createBufferSource();
      this.activeSource.buffer = audioBuffer;
      this.activeSource.connect(this.audioContext.destination);
      
      this.activeSource.onended = () => {
        this.notify(false);
        this.activeSource = null;
      };

      this.activeSource.start();
    } catch (error) {
      console.error('Voice service error:', error);
      this.notify(false);
    }
  }

  stop(): void {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) {
        // Source déjà arrêtée
      }
      this.activeSource = null;
    }
    this.notify(false);
  }

  isSupported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
  }
}

export const voiceService = new VoiceService();
