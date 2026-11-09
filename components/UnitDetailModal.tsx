import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, Car, Shield, CheckCircle2, 
  AlertCircle, Copy, MessageCircle, Receipt, Calendar
} from 'lucide-react';
import { UnitId, UnitDetails, Transaction, TransactionType } from '../types';
import { CONDO_INFO } from '../constants';

interface UnitDetailModalProps {
  unit: UnitDetails;
  transactions: Transaction[];
  monthlyFee: number;
  onClose: () => void;
  onRegisterPayment: (unitId: UnitId, amount: number) => void;
}

export const UnitDetailModal: React.FC<UnitDetailModalProps> = ({
  unit,
  transactions,
  monthlyFee,
  onClose,
  onRegisterPayment
}) => {
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Transações vinculadas a esta unidade
  const unitTransactions = transactions
    .filter(t => t.unitId === unit.id && t.type === TransactionType.REVENUE)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Verificar pagamento do mês atual
  const isCurrentMonthPaid = unitTransactions.some(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  // Verificar pendências conhecidas
  const isUnit203Overdue = unit.id === '203';
  const pendingMonths = isCurrentMonthPaid ? 0 : (isUnit203Overdue ? 2 : 1);

  // Cálculo moratório conforme Art. 1.336 do Código Civil:
  const principalTotal = pendingMonths * monthlyFee;
  const fineAmount = principalTotal * 0.02; // 2%
  const interestAmount = pendingMonths > 1 ? principalTotal * 0.01 * pendingMonths : 0; // 1% ao mês
  const totalDue = principalTotal + fineAmount + interestAmount;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(CONDO_INFO.email);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyWhatsAppMessage = () => {
    const msg = `Olá, ${unit.residentName}! 
Aqui é a administração do Condomínio Residencial Sevilla (Síndico).

Informamos o status da cota condominial do Apartamento ${unit.id}:
- Vencimento de Referência: Dia 10
- Cota Ordinária + Fundo de Reserva: R$ ${monthlyFee.toFixed(2)}
${pendingMonths > 1 ? `- Meses em Aberto: ${pendingMonths} meses\n- Encargos Legais (Multa 2% + Juros 1% a.m.): R$ ${(fineAmount + interestAmount).toFixed(2)}\n- Total Atualizado: R$ ${totalDue.toFixed(2)}` : ''}

Dados para Pagamento via Pix:
🔑 Chave Pix (E-mail oficial): ${CONDO_INFO.email}
Favorecido: Condomínio Residencial Sevilla
CNPJ: ${CONDO_INFO.cnpj}

Após o envio, o comprovante pode ser remetido para este contato para baixa automática no sistema de conciliação. Agradecemos a cooperação!`;

    navigator.clipboard.writeText(msg);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 flex flex-col items-center justify-center text-white font-black shadow-lg shadow-indigo-600/30 shrink-0">
              <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-bold text-indigo-200">APTO</span>
              <span className="text-lg sm:text-xl leading-none">{unit.id}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  {unit.floor}º Pavimento • Fração 8,333% (1/12)
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                {unit.residentName}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 sm:p-8 space-y-5 sm:space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Financeiro da Unidade */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
            isCurrentMonthPaid 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              {isCurrentMonthPaid ? (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle size={22} />
                </div>
              )}
              <div>
                <p className="font-black text-xs sm:text-sm uppercase tracking-wide">
                  {isCurrentMonthPaid ? 'Situação: Adimplente' : `Situação: ${pendingMonths} Cota(s) Pendente(s)`}
                </p>
                <p className="text-[11px] sm:text-xs opacity-80 mt-0.5">
                  {isCurrentMonthPaid 
                    ? 'A cota ordinária e o fundo de reserva foram liquidados.' 
                    : `Cota mensal no valor de R$ ${monthlyFee.toFixed(2)} aguarda conciliação.`}
                </p>
              </div>
            </div>

            {!isCurrentMonthPaid && (
              <button 
                onClick={() => onRegisterPayment(unit.id, totalDue)}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all shrink-0 active:scale-95 text-center"
              >
                Quitar Débito
              </button>
            )}
          </div>

          {/* Se houver pendência: Caixa de Cobrança com Cálculo do Código Civil */}
          {!isCurrentMonthPaid && (
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                  <Receipt size={15} className="text-indigo-600" />
                  Cálculo Legal (Art. 1.336 CC)
                </h4>
                <span className="text-[9px] font-bold text-slate-500 uppercase bg-slate-200 px-2 py-0.5 rounded">
                  Pro Rata Die
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Cota Base</p>
                  <p className="font-black text-slate-800 text-xs sm:text-sm mt-0.5">R$ {principalTotal.toFixed(2)}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Multa (2%)</p>
                  <p className="font-black text-slate-800 text-xs sm:text-sm mt-0.5">R$ {fineAmount.toFixed(2)}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Juros (1% a.m.)</p>
                  <p className="font-black text-slate-800 text-xs sm:text-sm mt-0.5">R$ {interestAmount.toFixed(2)}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-[9px] sm:text-[10px] text-indigo-600 font-black uppercase">Total Devido</p>
                  <p className="font-black text-indigo-700 text-xs sm:text-sm mt-0.5">R$ {totalDue.toFixed(2)}</p>
                </div>
              </div>

              {/* Ações de Notificação Rápida */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
                <button 
                  onClick={handleCopyWhatsAppMessage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95"
                >
                  <MessageCircle size={15} />
                  <span>{copiedMessage ? 'Copiado!' : 'Copiar WhatsApp'}</span>
                </button>
                <button 
                  onClick={handleCopyPix}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95"
                >
                  <Copy size={15} />
                  <span>{copiedPix ? 'Chave Copiada!' : `Pix Oficial (${CONDO_INFO.email})`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Ficha Cadastral do Imóvel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 sm:space-y-2">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Dados do Condômino</span>
              <div className="space-y-1.5 text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <User size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">Morador: <strong>{unit.residentName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">Proprietário: {unit.ownerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">Garagem: {unit.parkingSpot}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 sm:space-y-2">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Canais de Contato</span>
              <div className="space-y-1.5 text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <a href={`mailto:${unit.contactEmail}`} className="text-indigo-600 hover:underline truncate">{unit.contactEmail}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{unit.contactPhone}</span>
                </div>
                {unit.notes && (
                  <p className="text-[10px] sm:text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Nota: {unit.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Histórico Recente de Pagamentos da Unidade */}
          <div>
            <h4 className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Calendar size={14} className="text-indigo-600" />
              Histórico de Lançamentos ({unitTransactions.length})
            </h4>

            {unitTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 sm:p-4 bg-slate-50 rounded-xl text-center">
                Nenhum pagamento registrado no período selecionado.
              </p>
            ) : (
              <div className="space-y-1.5 sm:space-y-2 max-h-40 overflow-y-auto pr-1">
                {unitTransactions.map(t => (
                  <div key={t.id} className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-800 truncate">{t.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(t.date).toLocaleDateString('pt-BR')} • {t.receiptNumber || 'Conciliado'}
                      </p>
                    </div>
                    <span className="font-black text-emerald-600 whitespace-nowrap">
                      R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
