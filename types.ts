
export enum PricingZone {
  AFRICA = 'AFRICA',
  EUROPE = 'EUROPE',
  GLOBAL = 'GLOBAL'
}

export type Language = 'fr' | 'en' | 'it' | 'es';
export type TimeFormat = '24h' | '12h' | 'seconds';

export interface Resource {
  id: string;
  title: string;
  type: 'BOOK' | 'VIDEO' | 'AUDIO';
  author: string;
  description: string;
  price: number | 'FREE';
  currency: string;
  link: string;
  thumbnail?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  neoLifeId: string;
  role: 'LEADER' | 'ADMIN' | 'PROSPECT';
  avatar?: string;
  bio?: string;
  country?: string;
  joinedDate: Date;
}

export interface Biomarkers {
  glycemia_mmol_l?: number;
  cholesterol_total_mmol_l?: number;
  hdl_mmol_l?: number;
  ldl_mmol_l?: number;
  triglycerides_mmol_l?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  bmi?: number;
}

export interface RestorationProtocol {
  product: string;
  dosage: string;
  duration_days: number;
}

export interface ClinicalData {
  patient: {
    age?: number;
    sex?: string;
  };
  biomarkers: Biomarkers;
  analysis: string;
  protocol: RestorationProtocol[];
  risk_flags: string[];
  timestamps: {
    created_at: string;
  };
}

export interface DiagnosticReport {
  id: string;
  date: Date;
  title: string;
  type: 'BLOOD_WORK' | 'PRESCRIPTION' | 'HEALTH_CHECK';
  summary: string;
  fullContent: string;
  status: 'STABLE' | 'ALERT' | 'OPTIMIZED';
  image?: string;
  clinicalData?: ClinicalData;
}

export interface AIPersona {
  name: string;
  role: string;
  philosophy: string;
  tonality: string;
  coreValues: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string; 
  starkInsight: string;
  practicalExercise: string;
}

// Added AcademyModule interface to resolve the import error in AcademyView.tsx
export interface AcademyModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isPremium?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
}

export interface ReferralContext {
  referrerId: string;
  referrerName: string;
  shopUrl?: string;
  language?: Language;
}

export interface AdminMonitorStats {
  totalNetSaaS: number;
  aiEffectiveness: number;
  orphanLeadsCount: number;
  totalActiveHubs: number;
}

export interface WhiteLabelInstance {
  id: string;
  clientName: string;
  industry: string;
  aiName: string;
  currency: string;
  primaryColor: string;
  catalogType: 'neolife' | 'custom';
  logoUrl: string;
  setupFee: number;
  royaltyRate: number;
  isLocked: boolean;
  deploymentDate: Date;
  status: 'ACTIVE' | 'PENDING' | 'LOCKED';
}
