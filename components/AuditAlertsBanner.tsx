import React from 'react';
import { ShieldCheck, AlertTriangle, FileCheck, Coins, ArrowRight } from 'lucide-react';
import { Transaction, TransactionType, LegalObligation } from '../types';
import { UNITS } from '../constants';

interface AuditAlertsBannerProps {
  transactions: Transaction[];
  obligations: LegalObligation[];
  onNavigateToTab: (tab: 'units' | 'audit' | 'documents') => void;
}

export const AuditAlertsBanner: React.FC<AuditAlertsBannerProps> = ({
  transactions,
  obligations,
  onNavigateToTab
}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Quantidade de unidades pendentes no mês atual
  const pendingUnitsCount = UNITS.filter(unit => {
    return !transactions.some(t => {
      const tDate = new Date(t.date);
      return (
        t.unitId === unit &&
        t.type === TransactionType.REVENUE &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    });
  }).length;

  // Obrigações a vencer em menos de 60 dias
  const urgentObligations = obligations.filter(o => o.status === 'A_VENCER' || o.status === 'VENCIDO');

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-3xl p-4 sm:p-5 text-white shadow-xl mb-6 sm:mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Auditoria de Posse Válida
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Residencial Sevilla • 12 Unidades (101 a 304)
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
              Painel de Governança do Síndico-Programador: Integridade Contábil 100% Auditada
            </h4>
          </div>
        </div>

        {/* Indicadores rápidos de auditoria */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 sm:gap-3 text-xs pt-1 lg:pt-0">
          <button 
            onClick={() => onNavigateToTab('units')}
            className={`flex items-center justify-between sm:justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl transition-all border ${
              pendingUnitsCount > 0 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Coins size={14} className="shrink-0" />
              <span className="truncate">
                {pendingUnitsCount > 0 
                  ? `${pendingUnitsCount} pendência(s)` 
                  : '12 cotas quitadas'}
              </span>
            </div>
            <ArrowRight size={12} className="opacity-70 shrink-0" />
          </button>

          <button 
            onClick={() => onNavigateToTab('audit')}
            className={`flex items-center justify-between sm:justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl transition-all border ${
              urgentObligations.length > 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={14} className={`shrink-0 ${urgentObligations.length > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="truncate">
                {urgentObligations.length > 0 
                  ? `${urgentObligations.length} Laudo(s) em atenção` 
                  : '6 Laudos em Dia'}
              </span>
            </div>
            <ArrowRight size={12} className="opacity-70 shrink-0" />
          </button>

          <button 
            onClick={() => onNavigateToTab('documents')}
            className="flex items-center justify-between sm:justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <div className="flex items-center gap-1.5">
              <FileCheck size={14} className="text-indigo-400 shrink-0" />
              <span>Dossiê & Atas</span>
            </div>
            <ArrowRight size={12} className="opacity-70 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
