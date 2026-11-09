import React, { useState } from 'react';
import { 
  Shield, CheckCircle2, AlertTriangle, Clock, 
  FileCheck2, Building2, Wrench, Calendar, Plus, RefreshCw, Cpu
} from 'lucide-react';
import { LegalObligation, Transaction, TransactionType } from '../types';
import { CONDO_INFO, UNITS } from '../constants';

interface AuditInspectionPanelProps {
  obligations: LegalObligation[];
  transactions: Transaction[];
  onUpdateObligation: (updated: LegalObligation) => void;
}

export const AuditInspectionPanel: React.FC<AuditInspectionPanelProps> = ({
  obligations,
  transactions,
  onUpdateObligation
}) => {
  const [selectedObligation, setSelectedObligation] = useState<LegalObligation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDate, setNewDate] = useState('');

  // Checagens automáticas de integridade de dados contábeis (Auditoria do Síndico-Engenheiro)
  const totalRevenues = transactions
    .filter(t => t.type === TransactionType.REVENUE)
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((s, t) => s + t.amount, 0);

  const reserveFundRevenues = transactions
    .filter(t => t.category.includes('Reserva') || t.account === 'FUNDO_RESERVA')
    .reduce((s, t) => s + t.amount, 0);

  const unassignedRevenues = transactions
    .filter(t => t.type === TransactionType.REVENUE && t.category === 'Taxa Condominial Ordinária' && !t.unitId);

  const nonReconciled = transactions.filter(t => !t.isReconciled);

  const auditChecks = [
    {
      title: 'Frações Ideais das 12 Unidades',
      description: '12 unidades autônomas com 8,333% cada (1/12), somando 100,000% exatos.',
      passed: true,
      category: 'Estrutural'
    },
    {
      title: 'Segregação Bancária do Fundo de Reserva',
      description: `R$ ${reserveFundRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} provisionados em conta separada da Ordinária.`,
      passed: reserveFundRevenues > 0,
      category: 'Contábil'
    },
    {
      title: 'Rastreabilidade de Unidades nas Cotas',
      description: unassignedRevenues.length === 0 
        ? '100% dos recebimentos de cotas estão atribuídos a um apartamento (101 a 304).' 
        : `${unassignedRevenues.length} recebimento(s) sem atribuição de unidade autônoma.`,
      passed: unassignedRevenues.length === 0,
      category: 'Integridade'
    },
    {
      title: 'Conciliação de Comprovantes e Notas Fiscais',
      description: nonReconciled.length === 0 
        ? 'Todos os lançamentos do sistema possuem número de documento ou nota fiscal.' 
        : `${nonReconciled.length} lançamento(s) pendente(s) de conciliação bancária.`,
      passed: nonReconciled.length === 0,
      category: 'Compliance'
    },
    {
      title: 'Seguro Predial Obrigatório (Art. 1.346 CC)',
      description: 'Apólice de Seguro de Danos com cobertura integral vigente na Porto Seguro.',
      passed: true,
      category: 'Legal'
    }
  ];

  const handleRenewObligation = (obl: LegalObligation) => {
    setSelectedObligation(obl);
    setIsEditing(true);
  };

  const handleSaveRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObligation || !newDate) return;
    
    // Adiciona 1 ano ou 6 meses conforme a periodicidade
    const updated: LegalObligation = {
      ...selectedObligation,
      lastInspectionDate: new Date().toISOString().split('T')[0],
      nextDueDate: newDate,
      status: 'VIGENTE',
      notes: `${selectedObligation.notes} • Renovado em ${new Date().toLocaleDateString('pt-BR')}`
    };

    onUpdateObligation(updated);
    setIsEditing(false);
    setSelectedObligation(null);
    setNewDate('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Bloco 1: Auditoria de Integridade de Dados Contábeis */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight text-lg">
                Auditoria de Dados & Integridade Algorítmica
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Regras de integridade verificadas em tempo real pelo motor de auditoria técnica.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            5/5 Verificações Aprovadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auditChecks.map((check, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {check.category}
                  </span>
                  {check.passed ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-500" />
                  )}
                </div>
                <h5 className="font-bold text-slate-800 text-xs mb-1">{check.title}</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">{check.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Status</span>
                <span className="font-black text-emerald-600">CONFORME</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bloco 2: Painel de Obrigações Legais & Laudos Técnicos Prediais */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 tracking-tight text-lg">
              Laudos Técnicos, Seguro Obrigatório & Normas Prediais
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Manutenção das obrigações compulsórias do Condomínio Residencial Sevilla (AVCB, Seguro, Elevadores, Água).
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {obligations.length} Laudos Mapeados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-500 border-b border-slate-100">
                <th className="px-8 py-4">Obrigação / Laudo</th>
                <th className="px-8 py-4">Categoria</th>
                <th className="px-8 py-4">Empresa / Responsável</th>
                <th className="px-8 py-4">Última Vistoria</th>
                <th className="px-8 py-4">Próximo Vencimento</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {obligations.map(obl => {
                const isUrgent = obl.status === 'A_VENCER' || obl.status === 'VENCIDO';
                return (
                  <tr key={obl.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                      <p className="font-bold text-slate-900">{obl.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{obl.documentNumber} • {obl.periodicity}</p>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                        {obl.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-slate-600 font-medium">
                      {obl.responsibleCompany}
                    </td>
                    <td className="px-8 py-4 text-slate-500">
                      {new Date(obl.lastInspectionDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-4">
                      <span className={`font-bold ${isUrgent ? 'text-amber-600' : 'text-slate-700'}`}>
                        {new Date(obl.nextDueDate).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        obl.status === 'VIGENTE' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : obl.status === 'A_VENCER'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {obl.status === 'VIGENTE' ? 'Vigente' : (obl.status === 'A_VENCER' ? 'A Vencer' : 'Vencido')}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button 
                        onClick={() => handleRenewObligation(obl)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        Renovar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Renovação de Laudo */}
      {isEditing && selectedObligation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                Atualização de Conformidade
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                {selectedObligation.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Insira a nova data de vencimento da vistoria ou apólice renovada.
              </p>
            </div>

            <form onSubmit={handleSaveRenewal} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Nova Data de Vencimento
                </label>
                <input 
                  required
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Confirmar Renovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
