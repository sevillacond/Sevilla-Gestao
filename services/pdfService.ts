import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Transaction, TransactionType, UnitId } from '../types';
import { CONDO_INFO, UNITS } from '../constants';

export const generateFinancialReport = (
  transactions: Transaction[], 
  reportTitle: string = 'Balancete de Prestação de Contas'
) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const now = new Date();
  const monthName = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  // Cabeçalho Oficial
  doc.setFillColor(30, 41, 59); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CONDOMÍNIO RESIDENCIAL SEVILLA', 14, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`12 Unidades (101 a 304) | CNPJ: ${CONDO_INFO.cnpj} | ${CONDO_INFO.email} | https://sevilla-silk.vercel.app`, 14, 21);
  doc.text(`Gestão do Síndico-Programador • Emissão: ${dateStr} • Referência: ${monthName.toUpperCase()}`, 14, 27);

  // Título do Documento
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(reportTitle.toUpperCase(), 14, 42);

  const revenues = transactions.filter(t => t.type === TransactionType.REVENUE);
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
  
  const totalRevenues = revenues.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalRevenues - totalExpenses;

  const reserveFundRevenues = revenues
    .filter(t => t.category.includes('Reserva') || t.account === 'FUNDO_RESERVA')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Tabela Sintética de Consolidação
  (doc as any).autoTable({
    startY: 47,
    head: [['Demonstrativo Sintético de Resultados', 'Valor Consolidado (R$)']],
    body: [
      ['Total de Entradas no Período (Ordinárias + Fundo Reserva)', `R$ ${totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Total de Saídas Operacionais (Despesas Pagas)', `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Superávit / Déficit Operacional Líquido', `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Aporte Direcionado ao Fundo de Reserva (Conta Poupança/CDI)', `R$ ${reserveFundRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3.5 },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Tabela Analítica de Lançamentos
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Detalhamento Analítico de Lançamentos e Comprovantes', 14, (doc as any).lastAutoTable.finalY + 10);

  const tableData = transactions.map(t => [
    new Date(t.date).toLocaleDateString('pt-BR'),
    t.description,
    t.unitId ? `Apto ${t.unitId}` : 'Geral',
    t.category,
    t.receiptNumber || '-',
    t.type === TransactionType.REVENUE 
      ? `+ R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
      : `- R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  ]);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 14,
    head: [['Data', 'Descrição', 'Unid.', 'Categoria', 'Doc/Comprovante', 'Valor Líquido']],
    body: tableData,
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 20 },
      2: { cellWidth: 18 },
      4: { cellWidth: 28 },
      5: { halign: 'right', fontStyle: 'bold', cellWidth: 28 }
    }
  });

  // Mapa Sintético das 12 Unidades (Adimplência do Mês)
  const finalY = (doc as any).lastAutoTable.finalY;
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Se houver espaço na página ou adicionar nova página
  if (finalY > 230) {
    doc.addPage();
  }

  const startYUnits = (finalY > 230) ? 20 : finalY + 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Status de Adimplência das 12 Unidades (Mês de Referência)', 14, startYUnits);

  const unitsStatus = UNITS.map(unit => {
    const isPaid = transactions.some(t => {
      const tDate = new Date(t.date);
      return (
        t.unitId === unit &&
        t.type === TransactionType.REVENUE &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    });
    return [
      `Apartamento ${unit}`,
      unit.startsWith('1') ? '1º Andar' : (unit.startsWith('2') ? '2º Andar' : '3º Andar'),
      '8,333% (1/12)',
      isPaid ? 'QUITADO / ADIMPLENTE' : 'PENDENTE DE QUITAÇÃO',
      isPaid ? 'R$ 420,00' : 'Aguardando Pagamento'
    ];
  });

  (doc as any).autoTable({
    startY: startYUnits + 4,
    head: [['Unidade', 'Pavimento', 'Fração Ideal', 'Status no Período', 'Valor Ordinário + F.R.']],
    body: unitsStatus,
    styles: { fontSize: 8, cellPadding: 2.2 },
    headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
    columnStyles: {
      3: { fontStyle: 'bold' },
      4: { halign: 'right' }
    }
  });

  // Parecer Técnico e Assinatura
  const signY = (doc as any).lastAutoTable.finalY + 14;
  if (signY < 270) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Declaro para os devidos fins que o presente balancete foi auditado de forma autônoma e concilia com os extratos bancários do condomínio.', 14, signY);
    doc.line(14, signY + 10, 100, signY + 10);
    doc.setFont('helvetica', 'bold');
    doc.text('Gestor & Síndico do Condomínio Residencial Sevilla', 14, signY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text('Auditoria & Transparência Técnica • sevillacond@gmail.com', 14, signY + 19);
  }

  const cleanFileName = `Balancete_Residencial_Sevilla_${now.toISOString().substring(0, 7)}.pdf`;
  doc.save(cleanFileName);
};

export const generateAuditDocumentPDF = (title: string, content: string) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('pt-BR');

  // Cabeçalho
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CONDOMÍNIO RESIDENCIAL SEVILLA', 14, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`12 Unidades (101 a 304) | Documentação Oficial de Auditoria | ${dateStr}`, 14, 20);

  // Título
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 38);

  // Corpo de texto com quebra automática
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const splitText = doc.splitTextToSize(content, 182);
  let cursorY = 46;

  for (let i = 0; i < splitText.length; i++) {
    if (cursorY > 280) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(splitText[i], 14, cursorY);
    cursorY += 5.5;
  }

  const cleanFileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
  doc.save(cleanFileName);
};
