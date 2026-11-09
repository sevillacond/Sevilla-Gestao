import React, { useState } from 'react';
import { CheckCircle2, Clock, User, Car, ArrowUpRight, Phone, MessageSquare } from 'lucide-react';
import { UnitId, Transaction, TransactionType, UnitDetails } from '../types';
import { UNITS, DEFAULT_UNITS_DATA } from '../constants';
import { UnitDetailModal } from './UnitDetailModal';

interface UnitGridProps {
  transactions: Transaction[];
  monthlyFee: number;
  unitsData?: Record<UnitId, UnitDetails>;
  onRegisterPayment?: (unitId: UnitId, amount: number) => void;
}

export const UnitGrid: React.FC<UnitGridProps> = ({ 
  transactions, 
  monthlyFee,
  unitsData = DEFAULT_UNITS_DATA,
  onRegisterPayment = (_unitId: UnitId, _amount: number) => {}
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitDetails | null>(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const isPaid = (unitId: UnitId) => {
    return transactions.some(t => {
      const tDate = new Date(t.date);
      return (
        t.unitId === unitId && 
        t.type === TransactionType.REVENUE &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    });
  };

  // Agrupamento por pavimento para representação arquitetônica do condomínio de 12 unidades
  const floors = [
    { name: '3º Pavimento (Coberturas & Andar Alto)', units: ['301', '302', '303', '304'] as UnitId[] },
    { name: '2º Pavimento (Andar Intermediário)', units: ['201', '202', '203', '204'] as UnitId[] },
    { name: '1º Pavimento (Térreo Elevado / Andar Baixo)', units: ['101', '102', '103', '104'] as UnitId[] },
  ];

  const paidCount = UNITS.filter(u => isPaid(u)).length;
  const pendingCount = 12 - paidCount;

  return (
    <div className="space-y-6">
      {/* Barra de Status Sintético da Edificação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-700">Quitados: {paidCount} / 12</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold text-slate-700">Pendentes: {pendingCount} / 12</span>
          </div>
        </div>
        <div className="text-[11px] font-semibold text-slate-500">
          Cota Ordinária: R$ 380,00 + Fundo Reserva: R$ 40,00 = <strong className="text-slate-800">R$ {monthlyFee.toFixed(2)}</strong>/mês
        </div>
      </div>

      {/* Renderização Arquitetônica por Pavimento */}
      <div className="space-y-6">
        {floors.map(floor => (
          <div key={floor.name} className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {floor.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Fração: 4 x 8,333% = 33,33%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {floor.units.map(unitId => {
                const paid = isPaid(unitId);
                const info = unitsData[unitId] || DEFAULT_UNITS_DATA[unitId];
                const isOverdueMulti = unitId === '203' && !paid;

                return (
                  <div 
                    key={unitId}
                    onClick={() => setSelectedUnit(info)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      paid 
                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 hover:shadow-md' 
                        : isOverdueMulti
                          ? 'bg-rose-50/50 border-rose-300 hover:border-rose-400 hover:shadow-md'
                          : 'bg-amber-50/40 border-amber-200 hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                            paid 
                              ? 'bg-emerald-600 text-white' 
                              : isOverdueMulti
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-600 text-white'
                          }`}>
                            {unitId}
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-tight">
                              Apto {unitId}
                            </span>
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">
                              {info?.residentName.split(' ')[0]} {info?.residentName.split(' ')[1] || ''}
                            </span>
                          </div>
                        </div>

                        <div className="p-1 rounded-lg bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight size={14} className="text-slate-600" />
                        </div>
                      </div>

                      <div className="space-y-1 mb-4 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Car size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{info?.parkingSpot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                        paid 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isOverdueMulti
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {paid ? 'Quitado' : (isOverdueMulti ? '2 Meses Pend.' : 'Aguardando')}
                      </span>

                      <span className="text-xs font-extrabold text-slate-700">
                        R$ {monthlyFee.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detalhado da Unidade Selecionada */}
      {selectedUnit && (
        <UnitDetailModal
          unit={selectedUnit}
          transactions={transactions}
          monthlyFee={monthlyFee}
          onClose={() => setSelectedUnit(null)}
          onRegisterPayment={(unitId, amount) => {
            onRegisterPayment(unitId, amount);
            setSelectedUnit(null);
          }}
        />
      )}
    </div>
  );
};
