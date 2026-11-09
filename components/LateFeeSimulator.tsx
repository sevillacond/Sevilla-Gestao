import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, Download, Copy, Check, RefreshCcw, 
  User, Calendar, Coins, ShieldAlert, Sparkles, MessageCircle, FileText, CheckCircle2,
  Handshake, ShieldCheck, Percent, FileCheck
} from 'lucide-react';
import { MonthSimulationItem, SimulationParams, UnitId, UnitDetails, DebtAgreementParams } from '../types';
import { CONDO_INFO, DEFAULT_UNITS_DATA, UNITS } from '../constants';
import { generateLateFeeSimulationPDF, generateDebtAgreementPDF } from '../services/pdfService';

interface LateFeeSimulatorProps {
  unitsData?: Record<UnitId, UnitDetails>;
  targetUnitId?: UnitId | null;
  onResetTargetUnit?: () => void;
}

// Nomes dos meses em português
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const LateFeeSimulator: React.FC<LateFeeSimulatorProps> = ({
  unitsData = DEFAULT_UNITS_DATA,
  targetUnitId = null,
  onResetTargetUnit
}) => {
  // Parâmetros do morador e cálculo
  const [params, setParams] = useState<SimulationParams>({
    residentName: 'CAROLINE RABELO BRANDAO ARAGAO DE AGUIAR',
    unitId: '304',
    cpf: '708.596.392-15',
    phone: '(98) 99114-9904',
    email: 'caragaoaguiar@gmail.com',
    monthlyFee: 365.66,
    finePercent: 2,
    monthlyInterestPercent: 1,
    dueDay: 10,
    calculationDate: '2026-03-05',
    sindicoName: CONDO_INFO.sindico.name
  });

  // Estado para negociação de Acordo e Parcelamento
  const [showAgreement, setShowAgreement] = useState(false);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [installmentsCount, setInstallmentsCount] = useState<number>(6);
  const [discountJurosPercent, setDiscountJurosPercent] = useState<number>(0);
  const [firstDueDate, setFirstDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [copiedAgreement, setCopiedAgreement] = useState(false);
  const [agreementPdfGenerating, setAgreementPdfGenerating] = useState(false);

  // Configuração de intervalo de competências
  // Default: Março/2021 a Fevereiro/2026 (60 meses exatos como no anexo)
  const [startMonth, setStartMonth] = useState(3); // Março
  const [startYear, setStartYear] = useState(2021);
  const [endMonth, setEndMonth] = useState(2); // Fevereiro
  const [endYear, setEndYear] = useState(2026);

  // Seleção individual de meses
  const [unselectedIds, setUnselectedIds] = useState<Set<string>>(new Set());

  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Gerar a lista de meses com base no intervalo
  const simulationItems: MonthSimulationItem[] = useMemo(() => {
    const items: MonthSimulationItem[] = [];
    
    // Obter data base do cálculo
    const [calcY, calcM, calcD] = params.calculationDate.split('-').map(Number);
    const calcDate = new Date(calcY, calcM - 1, calcD);

    // Iterar ano a ano e mês a mês
    let curY = startYear;
    let curM = startMonth;

    while (curY < endYear || (curY === endYear && curM <= endMonth)) {
      const id = `${curY}-${curM.toString().padStart(2, '0')}`;
      const competence = `${MONTH_NAMES[curM - 1]}/${curY}`;
      
      // Data de vencimento no dia especificado
      const dueDate = new Date(curY, curM - 1, params.dueDay);
      const dueDateFormatted = `${params.dueDay.toString().padStart(2, '0')}/${curM.toString().padStart(2, '0')}/${curY}`;

      // Calcular diferença de dias exata
      const diffTime = calcDate.getTime() - dueDate.getTime();
      const daysLate = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      // Valores
      const originalValue = Number(params.monthlyFee) || 0;
      
      // Multa legal de 2% (arredondada a 2 casas)
      const fineValue = Number((originalValue * (params.finePercent / 100)).toFixed(2));

      // Juros de 1% a.m. pro rata die: Valor * (1% / 30) * dias
      const interestValue = daysLate > 0 
        ? Number((originalValue * ((params.monthlyInterestPercent / 100) / 30) * daysLate).toFixed(2))
        : 0;

      const totalValue = Number((originalValue + fineValue + interestValue).toFixed(2));

      items.push({
        id,
        competence,
        dueDate: dueDateFormatted,
        daysLate,
        originalValue,
        fineValue,
        interestValue,
        totalValue,
        selected: !unselectedIds.has(id)
      });

      // Avançar mês
      curM++;
      if (curM > 12) {
        curM = 1;
        curY++;
      }
    }

    return items;
  }, [
    startMonth, startYear, endMonth, endYear, 
    params.calculationDate, params.monthlyFee, params.finePercent, 
    params.monthlyInterestPercent, params.dueDay, unselectedIds
  ]);

  // Totais consolidados dos meses selecionados
  const totals = useMemo(() => {
    const selected = simulationItems.filter(i => i.selected);
    const totalOriginal = selected.reduce((acc, curr) => acc + curr.originalValue, 0);
    const totalMultas = selected.reduce((acc, curr) => acc + curr.fineValue, 0);
    const totalJuros = selected.reduce((acc, curr) => acc + curr.interestValue, 0);
    const totalGeral = selected.reduce((acc, curr) => acc + curr.totalValue, 0);

    return {
      count: selected.length,
      totalOriginal,
      totalMultas,
      totalJuros,
      totalGeral
    };
  }, [simulationItems]);

  // Alternar seleção de um mês
  const toggleItemSelection = (id: string) => {
    setUnselectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Selecionar/deselecionar todos
  const toggleSelectAll = () => {
    if (unselectedIds.size === 0) {
      // Deselecionar todos
      const allIds = new Set(simulationItems.map(i => i.id));
      setUnselectedIds(allIds);
    } else {
      // Selecionar todos
      setUnselectedIds(new Set());
    }
  };

  // Carregar preset de referência (Apto 304 - Caroline Rabelo - 60 Meses)
  const handleLoadReferencePreset = () => {
    setParams({
      residentName: 'CAROLINE RABELO BRANDAO ARAGAO DE AGUIAR',
      unitId: '304',
      cpf: '708.596.392-15',
      phone: '(98) 99114-9904',
      email: 'caragaoaguiar@gmail.com',
      monthlyFee: 365.66,
      finePercent: 2,
      monthlyInterestPercent: 1,
      dueDay: 10,
      calculationDate: '2026-03-05',
      sindicoName: CONDO_INFO.sindico.name
    });
    setStartMonth(3);
    setStartYear(2021);
    setEndMonth(2);
    setEndYear(2026);
    setUnselectedIds(new Set());
  };

  // Carregar dados de um apartamento do condomínio (101 a 304)
  const handleSelectUnit = (unitId: UnitId) => {
    const unit = unitsData[unitId] || DEFAULT_UNITS_DATA[unitId];
    if (!unit) return;

    setParams(prev => ({
      ...prev,
      residentName: unit.residentName.toUpperCase(),
      unitId: unit.id,
      phone: unit.contactPhone,
      email: unit.contactEmail,
      monthlyFee: CONDO_INFO.monthlyFee,
      calculationDate: new Date().toISOString().split('T')[0]
    }));
  };

  useEffect(() => {
    if (targetUnitId) {
      handleSelectUnit(targetUnitId);
      onResetTargetUnit?.();
    }
  }, [targetUnitId]);

  // Presets rápidos de período
  const applyPresetPeriod = (monthsBack: number) => {
    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1; // 1-12

    // Calcular mês inicial
    let sM = curM - monthsBack + 1;
    let sY = curY;
    while (sM <= 0) {
      sM += 12;
      sY -= 1;
    }

    setStartMonth(sM);
    setStartYear(sY);
    setEndMonth(curM);
    setEndYear(curY);
    setUnselectedIds(new Set());
  };

  // Cálculo de Acordo e Parcelamento
  const agreementData = useMemo<DebtAgreementParams>(() => {
    const totalOriginal = totals.totalOriginal;
    const totalMultas = totals.totalMultas;
    const totalJuros = totals.totalJuros;
    const totalGeral = totals.totalGeral;
    const discountAmount = Number((totalJuros * (discountJurosPercent / 100)).toFixed(2));
    const effectiveTotal = Math.max(0, Number((totalGeral - discountAmount).toFixed(2)));
    const effectiveDownPayment = Math.min(effectiveTotal, Math.max(0, Number(downPayment) || 0));
    const remainingToInstall = Math.max(0, Number((effectiveTotal - effectiveDownPayment).toFixed(2)));
    const installmentValue = installmentsCount > 0 ? Number((remainingToInstall / installmentsCount).toFixed(2)) : 0;

    return {
      totalOriginal,
      totalMultas,
      totalJuros,
      totalGeral,
      discountJurosPercent,
      discountAmount,
      effectiveTotal,
      downPayment: effectiveDownPayment,
      installmentsCount,
      installmentValue,
      firstDueDate
    };
  }, [totals, discountJurosPercent, downPayment, installmentsCount, firstDueDate]);

  // Exportar PDF do Demonstrativo
  const handleExportPDF = () => {
    setPdfGenerating(true);
    setTimeout(() => {
      try {
        generateLateFeeSimulationPDF(params, simulationItems);
      } finally {
        setPdfGenerating(false);
      }
    }, 100);
  };

  // Exportar Termo Formal de Acordo (PDF)
  const handleExportAgreementPDF = () => {
    setAgreementPdfGenerating(true);
    setTimeout(() => {
      try {
        generateDebtAgreementPDF(params, agreementData);
      } finally {
        setAgreementPdfGenerating(false);
      }
    }, 100);
  };

  // Copiar mensagem para WhatsApp
  const handleCopyWhatsApp = () => {
    const msg = `*CONDOMÍNIO RESIDENCIAL SEVILLA*
*DEMONSTRATIVO DE TAXAS CONDOMINIAIS EM ATRASO*

Morador: ${params.residentName}
Apartamento: ${params.unitId}
Data Base do Cálculo: ${params.calculationDate.split('-').reverse().join('/')}
Meses Selecionados: ${totals.count} competência(s)

*RESUMO FINANCEIRO:*
• Total Original das Cotas: R$ ${totals.totalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Total Multas (2%): R$ ${totals.totalMultas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Total Juros (1% a.m.): R$ ${totals.totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
-------------------------------------------
*TOTAL GERAL ATUALIZADO: R$ ${totals.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*

*DADOS PARA PAGAMENTO VIA PIX:*
🔑 Chave Pix Oficial (E-mail): ${CONDO_INFO.email}
Favorecido: Condomínio Residencial Sevilla
CNPJ: ${CONDO_INFO.cnpj}

Após a liquidação, favor encaminhar o comprovante para conciliação contábil imediata.`;

    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  // Copiar proposta de parcelamento para WhatsApp
  const handleCopyAgreementWhatsApp = () => {
    const [dY, dM, dD] = agreementData.firstDueDate.split('-');
    const formattedDue = `${dD}/${dM}/${dY}`;
    const msg = `*CONDOMÍNIO RESIDENCIAL SEVILLA*
*PROPOSTA DE ACORDO E PARCELAMENTO DE DÉBITO*
(Art. 1.336 CC e Art. 784, X do CPC)

Morador: ${params.residentName}
Unidade: Apartamento ${params.unitId}

*COMPOSIÇÃO DO DÉBITO:*
• Total Original: R$ ${agreementData.totalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Multas (2%): R$ ${agreementData.totalMultas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Juros Legais (1% a.m.): R$ ${agreementData.totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
${agreementData.discountAmount > 0 ? `• Desconto Especial de Juros (${agreementData.discountJurosPercent}%): - R$ ${agreementData.discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : ''}-------------------------------------------
*VALOR CONSOLIDADO DO ACORDO: R$ ${agreementData.effectiveTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*

*CONDIÇÃO PROPOSTA:*
${agreementData.downPayment > 0 ? `• Entrada Inicial: R$ ${agreementData.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : ''}• Saldo Remanescente: ${agreementData.installmentsCount}x de R$ ${agreementData.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• 1º Vencimento: ${formattedDue}

*DADOS PARA PAGAMENTO VIA PIX:*
🔑 Chave Pix: ${CONDO_INFO.email}
Favorecido: Condomínio Residencial Sevilla
CNPJ: ${CONDO_INFO.cnpj}

Após o aceite, emitiremos o Termo de Acordo Formal com valor de título executivo extrajudicial para assinatura.`;

    navigator.clipboard.writeText(msg);
    setCopiedAgreement(true);
    setTimeout(() => setCopiedAgreement(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Banner Superior & Ações Rápidas */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-7 rounded-3xl text-white border border-indigo-900/50 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
            <img 
              src={CONDO_INFO.logoPath} 
              alt="Logo Condomínio Residencial Sevilla" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Simulador Jurídico & Contábil
              </span>
              <span className="text-xs text-indigo-300 font-semibold">
                Art. 1.336 CC • 2% Multa + 1% Juros
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-white mt-1 tracking-tight">
              Demonstrativo de Taxas & Simulação de Atrasos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo retroativo mês a mês com exportação de PDF idêntico ao modelo oficial do condomínio.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handleLoadReferencePreset}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all active:scale-95"
            title="Carregar exemplo anexo da moradora Caroline (Apto 304 - 60 meses)"
          >
            <Sparkles size={14} />
            <span>Exemplo Anexo (Apto 304 • 60 Meses)</span>
          </button>

          <button 
            onClick={handleExportPDF}
            disabled={pdfGenerating || totals.count === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {pdfGenerating ? <RefreshCcw size={15} className="animate-spin" /> : <Download size={15} />}
            <span>Exportar Demonstrativo em PDF</span>
          </button>
        </div>
      </div>

      {/* Painel de Configurações e Parâmetros */}
      <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Seletor Rápido de Unidades do Condomínio */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User size={15} className="text-indigo-600" />
              Preencher com Unidade do Residencial Sevilla
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Clique em qualquer apartamento para puxar dados cadastrais do condomínio:
            </p>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {UNITS.map(unit => (
              <button
                key={unit}
                onClick={() => handleSelectUnit(unit)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  params.unitId === unit 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Formulário: Dados do Morador */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">
            1. Dados Cadastrais do Morador
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome Completo</label>
              <input 
                type="text"
                value={params.residentName}
                onChange={e => setParams({...params, residentName: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Apartamento</label>
              <input 
                type="text"
                value={params.unitId}
                onChange={e => setParams({...params, unitId: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CPF</label>
              <input 
                type="text"
                value={params.cpf}
                onChange={e => setParams({...params, cpf: e.target.value})}
                placeholder="000.000.000-00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Telefone</label>
              <input 
                type="text"
                value={params.phone}
                onChange={e => setParams({...params, phone: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Formulário: Parâmetros Financeiros do Cálculo */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">
            2. Parâmetros de Encargos & Data Base
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Valor da Taxa (R$)</label>
              <input 
                type="number"
                step="0.01"
                value={params.monthlyFee}
                onChange={e => setParams({...params, monthlyFee: Number(e.target.value)})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Multa Moratória (%)</label>
              <input 
                type="number"
                step="0.1"
                value={params.finePercent}
                onChange={e => setParams({...params, finePercent: Number(e.target.value)})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Juros (% a.m.)</label>
              <input 
                type="number"
                step="0.1"
                value={params.monthlyInterestPercent}
                onChange={e => setParams({...params, monthlyInterestPercent: Number(e.target.value)})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dia do Vencimento</label>
              <input 
                type="number"
                min="1"
                max="31"
                value={params.dueDay}
                onChange={e => setParams({...params, dueDay: Number(e.target.value)})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data Base do Cálculo</label>
              <input 
                type="date"
                value={params.calculationDate}
                onChange={e => setParams({...params, calculationDate: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Formulário: Período e Intervalo */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              3. Intervalo de Competências
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              <span className="text-slate-400 mr-1">Atalhos:</span>
              <button onClick={() => applyPresetPeriod(12)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700">Últimos 12m</button>
              <button onClick={() => applyPresetPeriod(24)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700">Últimos 24m</button>
              <button onClick={() => applyPresetPeriod(36)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700">Últimos 36m</button>
              <button onClick={handleLoadReferencePreset} className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-black">60m (Exemplo)</button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mês Início</label>
              <select 
                value={startMonth}
                onChange={e => setStartMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ano Início</label>
              <input 
                type="number"
                value={startYear}
                onChange={e => setStartYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mês Fim</label>
              <select 
                value={endMonth}
                onChange={e => setEndMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ano Fim</label>
              <input 
                type="number"
                value={endYear}
                onChange={e => setEndYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* QUADRO DE RESUMO FINANCEIRO (Idêntico ao Exemplo do PDF) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-900/20">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
              Demonstrativo Consolidado
            </span>
            <h4 className="text-base font-black text-slate-900">
              Resumo Financeiro da Simulação ({totals.count} meses selecionados)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              <MessageCircle size={14} />
              <span>{copiedMsg ? 'Copiado!' : 'Copiar WhatsApp'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Download size={14} />
              <span>Baixar PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Original</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              R$ {totals.totalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Multas ({params.finePercent}%)</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              R$ {totals.totalMultas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Juros ({params.monthlyInterestPercent}% a.m.)</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              R$ {totals.totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider">TOTAL GERAL ATUALIZADO</p>
            <p className="text-2xl font-black text-rose-700 mt-1">
              R$ {totals.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Botão de Expansão para Proposta de Acordo / Parcelamento */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => setShowAgreement(!showAgreement)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black transition-all"
          >
            <Handshake size={16} />
            <span>{showAgreement ? 'Ocultar Simulador de Acordo' : 'Abrir Simulador de Acordo & Parcelamento (Termo CPC)'}</span>
          </button>
          <span className="text-[11px] text-slate-500 font-medium">
            Permite negociar entrada, parcelas em até 36x e emitir termo com força de título executivo extrajudicial.
          </span>
        </div>

        {/* SEÇÃO EXPANSÍVEL: PROPOSTA DE ACORDO */}
        {showAgreement && (
          <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/40 rounded-2xl border border-indigo-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Handshake size={18} />
                </div>
                <div>
                  <h5 className="font-black text-slate-900 text-sm">
                    Termo de Acordo e Confissão de Dívida Condominial
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    Título Executivo Extrajudicial previsto no Art. 784, III e X do CPC
                  </p>
                </div>
              </div>

              {/* Botões Rápidos de Negociação */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDiscountJurosPercent(100);
                    setDownPayment(0);
                    setInstallmentsCount(1);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                >
                  À Vista (-100% Juros)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountJurosPercent(0);
                    setDownPayment(Number((totals.totalGeral * 0.2).toFixed(2)));
                    setInstallmentsCount(6);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                >
                  20% + 6x
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountJurosPercent(0);
                    setDownPayment(Number((totals.totalGeral * 0.1).toFixed(2)));
                    setInstallmentsCount(12);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                >
                  10% + 12x
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountJurosPercent(0);
                    setDownPayment(0);
                    setInstallmentsCount(24);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                >
                  24x Direto
                </button>
              </div>
            </div>

            {/* Parâmetros do Parcelamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Desconto em Juros Moratórios
                </label>
                <select
                  value={discountJurosPercent}
                  onChange={e => setDiscountJurosPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value={0}>Sem Desconto (0%)</option>
                  <option value={25}>25% sobre os juros</option>
                  <option value={50}>50% sobre os juros</option>
                  <option value={100}>100% sobre os juros (À Vista)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Valor da Entrada (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={downPayment || ''}
                  onChange={e => setDownPayment(Math.max(0, Number(e.target.value)))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Número de Parcelas
                </label>
                <select
                  value={installmentsCount}
                  onChange={e => setInstallmentsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 30, 36].map(num => (
                    <option key={num} value={num}>
                      {num}x {num === 1 ? '(Parcela Única)' : `mensais`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  1º Vencimento
                </label>
                <input
                  type="date"
                  value={firstDueDate}
                  onChange={e => setFirstDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Simulação Consolidada do Acordo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-indigo-100">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total do Acordo</span>
                <span className="text-sm sm:text-base font-black text-indigo-700">
                  R$ {agreementData.effectiveTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {agreementData.discountAmount > 0 && (
                  <span className="text-[9px] text-emerald-600 block font-semibold">
                    Economia: - R$ {agreementData.discountAmount.toFixed(2)}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Entrada Inicial</span>
                <span className="text-sm sm:text-base font-black text-slate-800">
                  R$ {agreementData.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 block font-semibold">
                  Via Pix oficial
                </span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Saldo a Parcelar</span>
                <span className="text-sm sm:text-base font-black text-slate-800">
                  R$ {(agreementData.effectiveTotal - agreementData.downPayment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 block font-semibold">
                  Em {agreementData.installmentsCount} vezes
                </span>
              </div>

              <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                <span className="text-[9px] font-black text-emerald-700 uppercase block">Valor por Parcela</span>
                <span className="text-base sm:text-lg font-black text-emerald-800">
                  R$ {agreementData.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-emerald-600 block font-semibold">
                  /mês fixo
                </span>
              </div>
            </div>

            {/* Ações da Negociação */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-500">
                O termo inclui cláusula de vencimento antecipado em caso de atraso superior a 10 dias.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyAgreementWhatsApp}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <MessageCircle size={14} />
                  <span>{copiedAgreement ? 'Copiado!' : 'Copiar Proposta WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportAgreementPDF}
                  disabled={agreementPdfGenerating}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                >
                  <FileCheck size={14} />
                  <span>{agreementPdfGenerating ? 'Gerando...' : 'Exportar Termo de Acordo (PDF)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TABELA DE DETALHAMENTO POR COMPETÊNCIA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight">
              Detalhamento por Competência ({simulationItems.length} meses gerados)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Você pode desmarcar meses específicos caso já tenham sido quitados pelo morador.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              {unselectedIds.size === 0 ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          </div>
        </div>

        {/* Tabela Formatada */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-900 text-white z-10 shadow-sm">
              <tr className="text-[10px] uppercase font-black tracking-wider">
                <th className="px-4 py-3.5 text-center w-10">
                  <input 
                    type="checkbox"
                    checked={unselectedIds.size === 0}
                    onChange={toggleSelectAll}
                    className="rounded text-indigo-600"
                  />
                </th>
                <th className="px-4 py-3.5">Competência</th>
                <th className="px-4 py-3.5 text-center">Vencimento</th>
                <th className="px-4 py-3.5 text-center">Dias Atraso</th>
                <th className="px-4 py-3.5 text-right">Valor Original</th>
                <th className="px-4 py-3.5 text-right">Multa</th>
                <th className="px-4 py-3.5 text-right">Juros</th>
                <th className="px-4 py-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {simulationItems.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`transition-colors ${
                    !item.selected 
                      ? 'bg-slate-50/50 opacity-40' 
                      : index % 2 === 0 ? 'bg-white hover:bg-indigo-50/20' : 'bg-slate-50/60 hover:bg-indigo-50/20'
                  }`}
                >
                  <td className="px-4 py-2.5 text-center">
                    <input 
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelection(item.id)}
                      className="rounded text-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-800 whitespace-nowrap">
                    {item.competence}
                  </td>
                  <td className="px-4 py-2.5 text-center text-slate-500 whitespace-nowrap">
                    {item.dueDate}
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-700">
                    {item.daysLate}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
                    R$ {item.originalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
                    R$ {item.fineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
                    R$ {item.interestValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right font-black text-slate-900 whitespace-nowrap">
                    R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
