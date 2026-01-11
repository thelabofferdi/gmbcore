import { DiagnosticReport } from '../types';
import { saveClinicalData, getClinicalHistory } from './supabaseService';

const DB_NAME = 'ndsa_bio_archive';
const DB_VERSION = 1;
const STORE_NAME = 'diagnostics';

declare global {
  interface Window {
    currentUser?: { id: string };
  }
}

export const storageService = {
  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveReport(report: DiagnosticReport): Promise<void> {
    if (!window.currentUser) throw new Error('User not authenticated');
    
    const { error } = await saveClinicalData(window.currentUser.id, {
      patient_age: report.clinicalData?.patient?.age,
      patient_sex: report.clinicalData?.patient?.sex,
      analysis: report.clinicalData?.analysis || report.summary,
      protocol: report.clinicalData?.protocol || [],
      risk_flags: report.clinicalData?.risk_flags || []
    });
    
    if (error) throw error;
  },

  async getAllReports(): Promise<DiagnosticReport[]> {
    if (!window.currentUser) return [];
    
    const { data, error } = await getClinicalHistory(window.currentUser.id);
    if (error) return [];
    
    return (data || []).map(record => ({
      id: record.id,
      date: new Date(record.created_at),
      title: 'Diagnostic',
      type: 'HEALTH_CHECK' as const,
      summary: record.analysis || '',
      fullContent: record.analysis || '',
      status: 'STABLE' as const,
      clinicalData: {
        patient: {
          age: record.patient_age,
          sex: record.patient_sex
        },
        biomarkers: {},
        analysis: record.analysis,
        protocol: record.protocol || [],
        risk_flags: record.risk_flags || [],
        timestamps: { created_at: record.created_at }
      }
    }));
  },

  async deleteReport(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async compressImage(base64: string, maxWidth = 1280, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
      };
    });
  }
};
