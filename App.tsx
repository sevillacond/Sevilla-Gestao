import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Receipt, UserCheck, FileText, 
  ShieldCheck, Sparkles, PlusCircle, RefreshCcw, Trash2, 
  CheckCircle2, Info, Filter, Calendar, Search, XCircle,
  Building2, Coins, ArrowUpRight, Download, CreditCard, ChevronRight,
  Menu, X
} from 'lucide-react';
import { 
  Transaction, TransactionType, CondoState, UnitId, 
  LegalObligation, CondoDocument, AccountType 
} from './types';
import { SummaryCard } from './components/SummaryCard';
import { UnitGrid } from './components/UnitGrid';
import { AuditAlertsBanner } from './components/AuditAlertsBanner';
import { AuditInspectionPanel } from './components/AuditInspectionPanel';
import { DocumentationViewer } from './components/DocumentationViewer';
import { 
  REVENUE_CATEGORIES, EXPENSE_CATEGORIES, UNITS, 
  CONDO_INFO, INITIAL_CONDO_STATE 
} from './constants';
import { generateFinancialReport } from './services/pdfService';
import { analyzeFinances } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<CondoState>(() => {
    try {
      const saved = localStorage.getItem('condo_sevilla_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.units && parsed.legalObligations && parsed.documents) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Recarregando estado inicial padrão", e);
    }
    return INITIAL_CONDO_STATE;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'units' | 'transactions' | 'audit' | 'documents' | 'reports'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Filtros da aba de relatórios / lançamentos
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '' as TransactionType | '',
    unitId: '' as UnitId | '',
    category: '',
    account: '' as AccountType | ''
  });

  // Salvar estado no localStorage
  useEffect(() => {
    localStorage.setItem('condo_sevilla_state', JSON.stringify(state));
  }, [state]);

  // Temporizador do Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fechar menu mobile ao trocar de aba
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Estado do formulário de novo lançamento
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    category: EXPENSE_CATEGORIES[0],
    account: 'ORDINARIA',
    receiptNumber: '',
    isReconciled: true
  });

  // Filtro de lançamentos
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      const dateMatch = (!filters.startDate || t.date >= filters.startDate) && 
                        (!filters.endDate || t.date <= filters.endDate);
      const typeMatch = !filters.type || t.type === filters.type;
      const unitMatch = !filters.unitId || t.unitId === filters.unitId;
      const categoryMatch = !filters.category || t.category === filters.category;
      const accountMatch = !filters.account || t.account === filters.account;
      return dateMatch && typeMatch && unitMatch && categoryMatch && accountMatch;
    });
  }, [state.transactions, filters]);

  // Métricas financeiras consolidadas
  const totalRevenues = useMemo(() => 
    state.transactions.filter(t => t.type === TransactionType.REVENUE).reduce((sum, t) => sum + t.amount, 0)
  , [state.transactions]);

  const totalExpenses = useMemo(() => 
    state.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0)
  , [state.transactions]);

  const reserveFundBalance = useMemo(() => 
    state.transactions
      .filter(t => t.type === TransactionType.REVENUE && (t.account === 'FUNDO_RESERVA' || t.category.includes('Reserva')))
      .reduce((sum, t) => sum + t.amount, 0) + state.bankReserveBalance
  , [state.transactions, state.bankReserveBalance]);

  const ordinaryCashBalance = useMemo(() => {
    const ordinaryRevenues = state.transactions
      .filter(t => t.type === TransactionType.REVENUE && t.account !== 'FUNDO_RESERVA')
      .reduce((sum, t) => sum + t.amount, 0);
    const ordinaryExpenses = state.transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.account !== 'FUNDO_RESERVA')
      .reduce((sum, t) => sum + t.amount, 0);
    return state.bankOrdinaryBalance + ordinaryRevenues - ordinaryExpenses;
  }, [state.transactions, state.bankOrdinaryBalance]);

  // Lógica de Registro de Nova Transação
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount) return;
    
    const transaction: Transaction = {
      id: `tx-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      description: newTransaction.description,
      amount: Number(newTransaction.amount),
      type: newTransaction.type as TransactionType,
      unitId: newTransaction.unitId as UnitId | undefined,
      category: newTransaction.category || (newTransaction.type === TransactionType.REVENUE ? REVENUE_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
      account: (newTransaction.account as AccountType) || 'ORDINARIA',
      receiptNumber: newTransaction.receiptNumber || `DOC-${Date.now().toString().slice(-4)}`,
      isReconciled: true
    };

    setState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions]
    }));

    setIsAdding(false);
    setToast({ message: 'Lançamento registrado e conciliado com sucesso!', type: 'success' });
    setNewTransaction({
      type: TransactionType.EXPENSE,
      date: new Date().toISOString().split('T')[0],
      category: EXPENSE_CATEGORIES[0],
      account: 'ORDINARIA',
      receiptNumber: '',
      isReconciled: true
    });
  };

  // Quitar débito ou registrar pagamento de cota diretamente de uma unidade
  const handleRegisterUnitPayment = (unitId: UnitId, amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: `rev-cota-${unitId}-${Date.now()}`,
      date: today,
      description: `Quitação Cota Condominial - Apto ${unitId}`,
      amount: amount,
      type: TransactionType.REVENUE,
      unitId: unitId,
      category: 'Taxa Condominial Ordinária',
      account: 'ORDINARIA',
      receiptNumber: `PIX-CONC-${unitId}-${Date.now().toString().slice(-4)}`,
      isReconciled: true
    };

    setState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));

    setToast({ message: `Pagamento da Unidade ${unitId} registrado via Pix!`, type: 'success' });
  };

  // Executar auditoria de inteligência artificial
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeFinances(state.transactions);
    setAiAnalysis(result);
    setIsAnalyzing(false);
    setToast({ message: 'Auditoria contábil do Síndico concluída!', type: 'info' });
  };

  // Excluir lançamento
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Confirma a anulação contábil desta transação?')) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }));
      setToast({ message: 'Lançamento estornado.', type: 'info' });
    }
  };

  // Atualizar laudo de inspeção predial
  const handleUpdateObligation = (updated: LegalObligation) => {
    setState(prev => ({
      ...prev,
      legalObligations: prev.legalObligations.map(o => o.id === updated.id ? updated : o)
    }));
    setToast({ message: `Laudo "${updated.name}" atualizado e em dia!`, type: 'success' });
  };

  // Adicionar novo documento/ata
  const handleAddDocument = (newDoc: CondoDocument) => {
    setState(prev => ({
      ...prev,
      documents: [newDoc, ...prev.documents]
    }));
    setToast({ message: `Documento "${newDoc.title}" registrado no dossiê oficial!`, type: 'success' });
  };

  // Restaurar dados padrão de auditoria
  const handleResetData = () => {
    if (window.confirm('Deseja recarregar a base auditada do Condomínio Residencial Sevilla (12 unidades)?')) {
      setState(INITIAL_CONDO_STATE);
      setAiAnalysis(null);
      setToast({ message: 'Dados do Condomínio Residencial Sevilla recarregados!', type: 'success' });
    }
  };

  interface NavItem {
    id: 'dashboard' | 'units' | 'transactions' | 'audit' | 'documents' | 'reports';
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'units', label: '12 Unidades', icon: UserCheck, badge: '101..304' },
    { id: 'transactions', label: 'Lançamentos', icon: Receipt },
    { id: 'audit', label: 'Auditoria & Laudos', icon: ShieldCheck, badge: '6 Laudos' },
    { id: 'documents', label: 'Dossiê & Atas', icon: FileText },
    { id: 'reports', label: 'Prestação (PDF)', icon: Coins }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-['Inter']">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] animate-in slide-in-from-right duration-300 max-w-sm">
          <div className={`px-4 sm:px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 sm:gap-3 border ${
            toast.type === 'success' 
              ? 'bg-emerald-700 border-emerald-600 text-white' 
              : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <Info size={18} className="shrink-0" />}
            <span className="font-semibold text-xs leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER MOBILE (Aparece apenas em telas < md) */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg">
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-white font-black text-sm tracking-tight leading-tight">
                Residencial Sevilla
              </h1>
              <p className="text-[9px] text-indigo-400 uppercase tracking-wider font-extrabold">
                12 Unidades • Síndico Tech
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(true)}
              className="p-2 bg-indigo-600 text-white rounded-xl shadow-md active:scale-95"
              title="Novo Lançamento"
            >
              <PlusCircle size={17} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
              title="Abrir Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Barra de Navegação Horizontal com Pílulas Deslizáveis no Mobile */}
        <div className="flex overflow-x-auto scrollbar-none px-3 py-2 gap-1.5 border-t border-slate-800/80 bg-slate-950/70">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Mobile Expandido quando Hamburger é ativado */}
        {mobileMenuOpen && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3 animate-in slide-in-from-top-4 duration-200">
            <div className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Pix: <strong className="text-slate-200">{CONDO_INFO.email}</strong></span>
              <button
                onClick={handleResetData}
                className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-bold shrink-0"
              >
                <RefreshCcw size={12} />
                Resetar Base
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Lateral Desktop (hidden em telas < md) */}
      <aside className="hidden md:flex md:w-72 bg-slate-900 text-slate-300 flex-col sticky top-0 h-screen z-20 shadow-2xl shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-white font-black leading-tight text-base tracking-tight">
                Residencial Sevilla
              </h1>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold mt-0.5">
                12 Unidades • Síndico Tech
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">Pix: <strong className="text-slate-300">{CONDO_INFO.email}</strong></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Auditoria Ativa"></span>
          </div>
        </div>

        {/* Navegação Desktop */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Gestão & Auditoria
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' 
                    : 'hover:bg-slate-800/80 text-slate-400 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-xs">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Controles do Sistema
            </div>

            <button 
              onClick={handleResetData}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/40 text-xs font-semibold transition-all group"
            >
              <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500 shrink-0" />
              <span>Recarregar Base Auditada</span>
            </button>
          </div>
        </nav>

        {/* Identificação do Síndico */}
        <div className="p-4 m-3 rounded-2xl bg-slate-800/60 border border-slate-800 text-[11px]">
          <p className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">Síndico Responsável</p>
          <p className="font-bold text-white mt-0.5 truncate">{state.sindico.name}</p>
          <p className="text-slate-400 text-[10px] truncate">{state.sindico.role}</p>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 pb-24 min-w-0">
        {/* Top Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-5 sm:mb-6 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] sm:text-[10px] font-black uppercase">
                Edifício Residencial Sevilla
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400">
                12 Frações (8,333%)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {activeTab === 'dashboard' && 'Painel Geral de Governança'}
              {activeTab === 'units' && 'Mapa das 12 Unidades & Cobrança'}
              {activeTab === 'transactions' && 'Extrato & Conciliação'}
              {activeTab === 'audit' && 'Auditoria & Compliance Predial'}
              {activeTab === 'documents' && 'Dossiê, Regimento & Atas'}
              {activeTab === 'reports' && 'Relatórios & Balancete PDF'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 sm:gap-3">
            <button 
              onClick={() => generateFinancialReport(state.transactions, 'Balancete Oficial de Prestação de Contas')}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Download size={15} />
              <span>Exportar Balancete PDF</span>
            </button>

            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <PlusCircle size={15} />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </header>

        {/* Banner de Status e Auditoria Rápida */}
        <AuditAlertsBanner 
          transactions={state.transactions}
          obligations={state.legalObligations}
          onNavigateToTab={handleTabChange}
        />

        {/* ABA: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* 4 Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              <SummaryCard 
                title="Arrecadação Total" 
                value={totalRevenues} 
                type="positive" 
                icon={<Coins size={20} />} 
                subtitle="Cotas + Fundo Reserva"
                badge="Entradas"
              />
              <SummaryCard 
                title="Despesas Operacionais" 
                value={totalExpenses} 
                type="negative" 
                icon={<Receipt size={20} />} 
                subtitle="Sabesp, Enel, Elevadores"
                badge="Saídas"
              />
              <SummaryCard 
                title="Conta Fundo de Reserva" 
                value={reserveFundBalance} 
                type="reserve" 
                icon={<ShieldCheck size={20} />} 
                subtitle="100% CDI Liquidez"
                badge="Segregado"
              />
              <SummaryCard 
                title="Saldo Caixa Operacional" 
                value={ordinaryCashBalance} 
                type="neutral" 
                icon={<Building2 size={20} />} 
                subtitle="Conta Corrente Ordinária"
                badge="Disponível"
              />
            </div>

            {/* Grid 2 colunas: Mapa das 12 unidades & Consultor de IA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              
              {/* Coluna Esquerda: Visão Rápida dos 3 Pavimentos (101 a 304) */}
              <div className="lg:col-span-7 bg-white p-4 sm:p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase text-xs">
                      <UserCheck size={18} className="text-indigo-600" />
                      Status dos 3 Pavimentos (12 Unidades)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      Toque em qualquer unidade para ficha, multas e chave Pix.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTabChange('units')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                  >
                    Ver Tudo <ChevronRight size={14} />
                  </button>
                </div>

                <UnitGrid 
                  transactions={state.transactions} 
                  monthlyFee={state.monthlyFee}
                  unitsData={state.units}
                  onRegisterPayment={handleRegisterUnitPayment}
                />
              </div>

              {/* Coluna Direita: Parecer de IA do Síndico-Auditor */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-indigo-950 p-5 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-300">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="font-bold text-sm tracking-tight">
                        Auditoria de Gestão com IA (Gemini)
                      </h3>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 rounded-md text-indigo-300">
                      Síndico Tech
                    </span>
                  </div>

                  {aiAnalysis ? (
                    <div className="flex-1 overflow-y-auto max-h-80 sm:max-h-96 pr-2 text-xs text-slate-300 leading-relaxed space-y-3 font-sans">
                      {aiAnalysis.split('\n\n').map((paragraph, idx) => (
                        <div key={idx} className="whitespace-pre-wrap">{paragraph}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 sm:py-12 flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 sm:mb-4">
                        <Sparkles size={26} />
                      </div>
                      <h4 className="font-bold text-sm text-white mb-1">
                        Auditoria Financeira Autônoma
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs mb-5 sm:mb-6">
                        Gere parecer técnico especializado analisando os 12 apartamentos, maiores ofensores de custo e saúde do Fundo de Reserva.
                      </p>
                      <button 
                        disabled={isAnalyzing}
                        onClick={handleRunAnalysis}
                        className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        {isAnalyzing ? <RefreshCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        <span>Emitir Parecer do Síndico</span>
                      </button>
                    </div>
                  )}

                  {aiAnalysis && (
                    <div className="pt-3.5 border-t border-slate-800 mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Modelo: Gemini 3.8 Flash</span>
                      <button 
                        onClick={handleRunAnalysis}
                        disabled={isAnalyzing}
                        className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1"
                      >
                        <RefreshCcw size={12} className={isAnalyzing ? 'animate-spin' : ''} />
                        Reanalisar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: 12 UNIDADES & COBRANÇA */}
        {activeTab === 'units' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div className="bg-white p-4 sm:p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Controle de Frações & Adimplência das 12 Unidades
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Gestão individualizada dos apartamentos 101 a 304 com cálculo legal de juros/multa e chave Pix oficial.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl truncate">
                    Chave Pix: <strong className="text-indigo-600">{CONDO_INFO.email}</strong>
                  </span>
                </div>
              </div>

              <UnitGrid 
                transactions={state.transactions}
                monthlyFee={state.monthlyFee}
                unitsData={state.units}
                onRegisterPayment={handleRegisterUnitPayment}
              />
            </div>
          </div>
        )}

        {/* ABA: LANÇAMENTOS & CAIXA */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight">
                    Livro Caixa & Movimentações
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {state.transactions.length} registros auditados e vinculados a contas correntes.
                  </p>
                </div>
                <div>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all"
                  >
                    <PlusCircle size={15} />
                    Adicionar Registro
                  </button>
                </div>
              </div>

              {/* Tabela para Telas Médias e Grandes */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-500 border-b border-slate-100">
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Descrição do Lançamento</th>
                      <th className="px-6 py-4">Unidade</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4">Conta</th>
                      <th className="px-6 py-4 text-right">Valor</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {state.transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {t.description}
                          {t.receiptNumber && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Doc: {t.receiptNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {t.unitId ? (
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black">
                              Apto {t.unitId}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {t.category}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            t.account === 'FUNDO_RESERVA' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {t.account === 'FUNDO_RESERVA' ? 'Fundo Reserva' : 'Ordinária'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-black ${
                          t.type === TransactionType.REVENUE ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {t.type === TransactionType.REVENUE ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                            title="Estornar lançamento"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Nativos para Smartphones (< md) */}
              <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
                {state.transactions.map(t => (
                  <div key={t.id} className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-medium text-slate-400">
                            {new Date(t.date).toLocaleDateString('pt-BR')}
                          </span>
                          {t.unitId && (
                            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded text-[9px] font-black">
                              Apto {t.unitId}
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
                          {t.description}
                        </h5>
                      </div>
                      <span className={`text-xs font-black shrink-0 ${
                        t.type === TransactionType.REVENUE ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.type === TransactionType.REVENUE ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span className="truncate">{t.category}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                          t.account === 'FUNDO_RESERVA' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {t.account === 'FUNDO_RESERVA' ? 'F.R.' : 'Ord.'}
                        </span>
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: AUDITORIA & LAUDOS */}
        {activeTab === 'audit' && (
          <AuditInspectionPanel 
            obligations={state.legalObligations}
            transactions={state.transactions}
            onUpdateObligation={handleUpdateObligation}
          />
        )}

        {/* ABA: DOSSIÊ, REGIMENTO & ATAS */}
        {activeTab === 'documents' && (
          <DocumentationViewer 
            documents={state.documents}
            onAddDocument={handleAddDocument}
          />
        )}

        {/* ABA: RELATÓRIOS & FILTROS & BALANCETE PDF */}
        {activeTab === 'reports' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Filtros de Pesquisa Contábil */}
            <div className="bg-white p-4 sm:p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <Filter size={17} className="text-indigo-600" />
                  <h3 className="font-black uppercase tracking-tight text-xs">
                    Filtros de Auditoria & Período
                  </h3>
                </div>
                <button 
                  onClick={() => setFilters({ startDate: '', endDate: '', type: '', unitId: '', category: '', account: '' })}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <XCircle size={14} /> Limpar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">De</label>
                  <input 
                    type="date"
                    value={filters.startDate}
                    onChange={e => setFilters({...filters, startDate: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Até</label>
                  <input 
                    type="date"
                    value={filters.endDate}
                    onChange={e => setFilters({...filters, endDate: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Tipo</label>
                  <select 
                    value={filters.type}
                    onChange={e => setFilters({...filters, type: e.target.value as any})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="">Todas</option>
                    <option value={TransactionType.REVENUE}>Apenas Receitas</option>
                    <option value={TransactionType.EXPENSE}>Apenas Despesas</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Unidade</label>
                  <select 
                    value={filters.unitId}
                    onChange={e => setFilters({...filters, unitId: e.target.value as any})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="">Todas 12 Unidades</option>
                    {UNITS.map(u => <option key={u} value={u}>Apto {u}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => generateFinancialReport(filteredTransactions, 'Balancete do Recorte Selecionado')}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
                  >
                    <FileText size={15} />
                    Exportar PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Tabela do Recorte Filtrado */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-xs sm:text-sm uppercase">
                  Registros Selecionados ({filteredTransactions.length})
                </h4>
              </div>

              {/* Visualização Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-500 border-b border-slate-100">
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Unidade</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{t.description}</td>
                        <td className="px-6 py-4">{t.unitId ? `Apto ${t.unitId}` : '-'}</td>
                        <td className="px-6 py-4 text-slate-500">{t.category}</td>
                        <td className={`px-6 py-4 text-right font-black ${t.type === TransactionType.REVENUE ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === TransactionType.REVENUE ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Visualização Mobile */}
              <div className="md:hidden divide-y divide-slate-100 p-3 space-y-2">
                {filteredTransactions.map(t => (
                  <div key={t.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">{t.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(t.date).toLocaleDateString('pt-BR')} {t.unitId ? `• Apto ${t.unitId}` : ''}
                      </p>
                    </div>
                    <span className={`font-black whitespace-nowrap text-xs ${t.type === TransactionType.REVENUE ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === TransactionType.REVENUE ? '+' : '-'} R$ {t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Novo Lançamento */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight">
                Registrar Movimento Contábil
              </h3>
              <button onClick={() => setIsAdding(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Seletor Tipo: Entrada vs Saída */}
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button 
                  type="button" 
                  onClick={() => setNewTransaction({
                    ...newTransaction, 
                    type: TransactionType.EXPENSE, 
                    category: EXPENSE_CATEGORIES[0]
                  })}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    newTransaction.type === TransactionType.EXPENSE 
                      ? 'bg-white text-rose-600 shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  Despesa / Saída
                </button>
                <button 
                  type="button" 
                  onClick={() => setNewTransaction({
                    ...newTransaction, 
                    type: TransactionType.REVENUE, 
                    category: REVENUE_CATEGORIES[0]
                  })}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                    newTransaction.type === TransactionType.REVENUE 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  Receita / Entrada
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Descrição</label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: Sabesp, Manutenção Elevador, Taxa Apto 101..."
                  value={newTransaction.description || ''}
                  onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Valor (R$)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTransaction.amount || ''}
                    onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Data</label>
                  <input 
                    required
                    type="date"
                    value={newTransaction.date}
                    onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Categoria</label>
                  <select 
                    value={newTransaction.category}
                    onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    {(newTransaction.type === TransactionType.REVENUE ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Conta Bancária</label>
                  <select 
                    value={newTransaction.account}
                    onChange={e => setNewTransaction({...newTransaction, account: e.target.value as any})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ORDINARIA">Conta Ordinária</option>
                    <option value="FUNDO_RESERVA">Conta Fundo de Reserva</option>
                    <option value="FUNDO_OBRAS">Conta Fundo de Obras</option>
                  </select>
                </div>
              </div>

              {newTransaction.type === TransactionType.REVENUE && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Apartamento Vinculado</label>
                  <select 
                    value={newTransaction.unitId || ''}
                    onChange={e => setNewTransaction({...newTransaction, unitId: e.target.value as any})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="">Lançamento Geral (Sem Unidade)</option>
                    {UNITS.map(u => <option key={u} value={u}>Apartamento {u}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Comprovante / NF (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Ex: NF-e 4921 / TED 10293"
                  value={newTransaction.receiptNumber || ''}
                  onChange={e => setNewTransaction({...newTransaction, receiptNumber: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-full sm:flex-1 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl"
                >
                  Descartar
                </button>
                <button 
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Salvar e Conciliar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
