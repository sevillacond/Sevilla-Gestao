export type UnitId = 
  | '101' | '102' | '103' | '104'
  | '201' | '202' | '203' | '204'
  | '301' | '302' | '303' | '304';

export enum TransactionType {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export type AccountType = 'ORDINARIA' | 'FUNDO_RESERVA' | 'FUNDO_OBRAS';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  unitId?: UnitId;
  category: string;
  account: AccountType;
  receiptNumber?: string;
  isReconciled?: boolean;
}

export interface UnitDetails {
  id: UnitId;
  floor: number;
  residentName: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  idealFraction: number; // e.g., 8.333% (1/12)
  parkingSpot: string;
  notes?: string;
}

export interface LegalObligation {
  id: string;
  name: string;
  category: 'Segurança & Incêndio' | 'Manutenção Predial' | 'Legal & Fiscal' | 'Sanitária';
  lastInspectionDate: string;
  nextDueDate: string;
  status: 'VIGENTE' | 'A_VENCER' | 'VENCIDO';
  responsibleCompany: string;
  documentNumber: string;
  periodicity: string;
  notes: string;
}

export interface CondoDocument {
  id: string;
  title: string;
  category: 'AUDITORIA_POSSE' | 'REGIMENTO' | 'CONVENCAO' | 'ATA_ASSEMBLEIA' | 'MANUAL_SISTEMA';
  date: string;
  version: string;
  author: string;
  summary: string;
  fullText: string;
  tags: string[];
}

export interface CondoState {
  condoName: string;
  condoEmail: string;
  cnpj: string;
  address: string;
  portalUrl?: string;
  monthlyFee: number;
  reserveFundPercentage: number; // 10%
  bankOrdinaryBalance: number;
  bankReserveBalance: number;
  transactions: Transaction[];
  units: Record<UnitId, UnitDetails>;
  legalObligations: LegalObligation[];
  documents: CondoDocument[];
  sindico: {
    name: string;
    role: string;
    contactEmail: string;
    termStart: string;
    termEnd: string;
    status: string;
  };
}
