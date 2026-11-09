import { jsPDF } from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';
import { 
  Transaction, 
  TransactionType, 
  UnitId, 
  SimulationParams, 
  MonthSimulationItem,
  DebtAgreementParams
} from '../types';
import { CONDO_INFO, UNITS } from '../constants';

// Garantir vinculação do plugin no protótipo do jsPDF
try {
  applyPlugin(jsPDF);
} catch {
  // Ignorar caso já esteja registrado
}

// Polyfill defensivo: caso o protótipo não tenha sido estendido no ambiente Vite/Rollup
if (typeof jsPDF !== 'undefined' && jsPDF.prototype && !(jsPDF.prototype as any).autoTable) {
  (jsPDF.prototype as any).autoTable = function(options: any) {
    return autoTable(this, options);
  };
}

export const generateFinancialReport = (
  transactions: Transaction[], 
  reportTitle: string = 'Balancete de Prestação de Contas'
) => {
  const doc = new jsPDF();
  if (!(doc as any).autoTable) {
    (doc as any).autoTable = (options: any) => autoTable(doc, options);
  }
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
  autoTable(doc, {
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

  autoTable(doc, {
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

  autoTable(doc, {
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

export const generateLateFeeSimulationPDF = (
  params: SimulationParams,
  items: MonthSimulationItem[]
) => {
  const doc = new jsPDF();
  if (!(doc as any).autoTable) {
    (doc as any).autoTable = (options: any) => autoTable(doc, options);
  }
  const selectedItems = items.filter(it => it.selected);

  // Totais
  const totalOriginal = selectedItems.reduce((acc, curr) => acc + curr.originalValue, 0);
  const totalMultas = selectedItems.reduce((acc, curr) => acc + curr.fineValue, 0);
  const totalJuros = selectedItems.reduce((acc, curr) => acc + curr.interestValue, 0);
  const totalGeral = selectedItems.reduce((acc, curr) => acc + curr.totalValue, 0);

  // Formatar data de cálculo para DD/MM/AAAA
  const formatDateBR = (isoDateStr: string) => {
    if (!isoDateStr) return new Date().toLocaleDateString('pt-BR');
    const [y, m, d] = isoDateStr.split('-');
    if (y && m && d) return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    return new Date(isoDateStr).toLocaleDateString('pt-BR');
  };

  const dataCalculoFormatada = formatDateBR(params.calculationDate);
  const dataEmissaoFormatada = new Date().toLocaleDateString('pt-BR');

  // Cores institucionais
  const navyColor = [21, 46, 100]; // #152e64

  // Função auxiliar para desenhar o cabeçalho superior na página 1
  const drawTopHeader = () => {
    // Barra superior azul marinho
    doc.setFillColor(21, 46, 100);
    doc.rect(0, 0, 210, 23, 'F');

    // Emblema estilizado Sevilla no canto superior esquerdo
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 3, 24, 17, 2, 2, 'F');

    // Desenho do sol/arcos dourados
    doc.setFillColor(245, 158, 11); // amber-500
    doc.circle(26, 7.5, 3, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.6);
    doc.line(22, 10, 30, 10);

    // Texto Sevilla no logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(21, 46, 100);
    doc.text('Sevilla', 26, 14, { align: 'center' });
    doc.setFontSize(3.2);
    doc.setFont('helvetica', 'normal');
    doc.text('CONDOMÍNIO RESIDENCIAL', 26, 17.5, { align: 'center' });

    // Nome oficial do Condomínio
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('CONDOMÍNIO RESIDENCIAL SEVILLA', 42, 14);

    // Lado direito: DEMONSTRATIVO & Data de Emissão
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('DEMONSTRATIVO', 196, 11, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(219, 234, 254); // blue-100
    doc.text(`Emissão: ${dataEmissaoFormatada}`, 196, 17, { align: 'right' });
  };

  // Desenhar cabeçalho da página 1
  drawTopHeader();

  // Título do Demonstrativo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(21, 46, 100);
  doc.text('DEMONSTRATIVO DE TAXAS EM ATRASO', 14, 32);
  doc.setDrawColor(21, 46, 100);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  // SEÇÃO: DADOS DO MORADOR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 46, 100);
  doc.text('DADOS DO MORADOR', 14, 40);
  doc.setLineWidth(0.3);
  doc.line(14, 41.5, 196, 41.5);

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Linha 1 Dados Morador
  doc.setFont('helvetica', 'bold');
  doc.text('Nome:', 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(params.residentName.toUpperCase(), 25, 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Apartamento:', 125, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(params.unitId || '304', 146, 46);

  // Linha 2 Dados Morador
  doc.setFont('helvetica', 'bold');
  doc.text('CPF:', 14, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(params.cpf || 'Não informado', 23, 51);

  doc.setFont('helvetica', 'bold');
  doc.text('Telefone:', 125, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(params.phone || 'Não informado', 139, 51);

  // Linha 3 Dados Morador
  doc.setFont('helvetica', 'bold');
  doc.text('E-mail:', 14, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(params.email || 'sevillacond@gmail.com', 25, 56);

  // SEÇÃO: PARÂMETROS DO CÁLCULO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 46, 100);
  doc.text('PARÂMETROS DO CÁLCULO', 14, 64);
  doc.setLineWidth(0.3);
  doc.line(14, 65.5, 196, 65.5);

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Linha 1 Parâmetros
  doc.setFont('helvetica', 'bold');
  doc.text('Valor da Taxa:', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`R$ ${params.monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 36, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Multa:', 70, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.finePercent}%`, 80, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Juros:', 110, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.monthlyInterestPercent}% a.m.`, 120, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Data Cálculo:', 152, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(dataCalculoFormatada, 172, 70);

  // Linha 2 Parâmetros
  doc.setFont('helvetica', 'bold');
  doc.text('Dia Vencimento:', 14, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.dueDay}`, 39, 75);

  doc.setFont('helvetica', 'bold');
  doc.text('Meses selecionados:', 70, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(`${selectedItems.length}`, 103, 75);

  // SEÇÃO: DETALHAMENTO POR COMPETÊNCIA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 46, 100);
  doc.text('DETALHAMENTO POR COMPETÊNCIA', 14, 83);
  doc.setLineWidth(0.3);
  doc.line(14, 84.5, 196, 84.5);

  // Tabela com dados
  const tableRows = selectedItems.map(item => [
    item.competence,
    item.dueDate,
    item.daysLate.toString(),
    `R$ ${item.originalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${item.fineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${item.interestValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: 87,
    margin: { left: 14, right: 14, top: 26, bottom: 18 },
    head: [['Competência', 'Vencimento', 'Dias Atraso', 'Valor Original', 'Multa', 'Juros', 'Total']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [21, 46, 100], // #152e64
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 28, halign: 'left' },
      1: { cellWidth: 26, halign: 'center' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
    }
  });

  // Posição final após a tabela
  let finalY = (doc as any).lastAutoTable.finalY || 100;

  // Se não couber o resumo e as notas, criar uma nova página
  if (finalY > 215) {
    doc.addPage();
    finalY = 28;
  } else {
    finalY += 8;
  }

  // QUADRO: RESUMO FINANCEIRO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(21, 46, 100);
  doc.text('RESUMO FINANCEIRO', 14, finalY);
  doc.setLineWidth(0.4);
  doc.line(14, finalY + 1.5, 196, finalY + 1.5);

  // Caixa de Resumo
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, finalY + 4, 182, 38, 2, 2, 'S');

  // Linhas do Resumo
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Total Original
  doc.setFont('helvetica', 'normal');
  doc.text('Total Original:', 20, finalY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${totalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, finalY + 12, { align: 'right' });

  // Total Multas
  doc.setFont('helvetica', 'normal');
  doc.text('Total Multas:', 20, finalY + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${totalMultas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, finalY + 19, { align: 'right' });

  // Total Juros
  doc.setFont('helvetica', 'normal');
  doc.text('Total Juros:', 20, finalY + 26);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, finalY + 26, { align: 'right' });

  // Linha Verde divisória
  doc.setDrawColor(22, 163, 74); // green-600
  doc.setLineWidth(0.5);
  doc.line(20, finalY + 29.5, 190, finalY + 29.5);

  // TOTAL GERAL
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text('TOTAL GERAL:', 20, finalY + 36);
  doc.text(`R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 190, finalY + 36, { align: 'right' });

  // SEÇÃO: INFORMAÇÕES IMPORTANTES
  const infoY = finalY + 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(21, 46, 100);
  doc.text('INFORMAÇÕES IMPORTANTES', 14, infoY);
  doc.setLineWidth(0.3);
  doc.line(14, infoY + 1.5, 196, infoY + 1.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600

  const bulletPoints = [
    '• Multa aplicada uma única vez por taxa. Juros calculados proporcionalmente aos dias de atraso.',
    `• Síndico(a): ${params.sindicoName || 'Gestor & Síndico Técnico (Eng. de Software)'}`,
    `• Documento gerado em ${dataEmissaoFormatada}. Este documento não possui valor fiscal.`,
    `• Em caso de dúvidas, entre em contato com a administração do condomínio (${CONDO_INFO.email}).`
  ];

  let currentInfoY = infoY + 7;
  bulletPoints.forEach(point => {
    doc.text(point, 14, currentInfoY);
    currentInfoY += 4.5;
  });

  // Inserir rodapé azul marinho em todas as páginas com numeração "Página X de Y"
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Se não for a página 1, desenhar cabeçalho simplificado no topo
    if (i > 1) {
      doc.setFillColor(21, 46, 100);
      doc.rect(0, 0, 210, 16, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('CONDOMÍNIO RESIDENCIAL SEVILLA', 14, 11);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(219, 234, 254);
      doc.text(`DEMONSTRATIVO DE TAXAS EM ATRASO — Apto ${params.unitId || '304'}`, 196, 11, { align: 'right' });
    }

    // Barra de rodapé azul marinho
    doc.setFillColor(21, 46, 100);
    doc.rect(0, 288, 210, 9, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Condomínio Residencial Sevilla', 105, 293.5, { align: 'center' });
    doc.text(`Página ${i} de ${totalPages}`, 196, 293.5, { align: 'right' });
  }

  // Salvar PDF com nome padronizado
  const cleanResidentName = params.residentName
    ? params.residentName.trim().replace(/\s+/g, '_').toUpperCase()
    : 'DEMONSTRATIVO';
  const fileName = `Taxas_Atraso_${cleanResidentName}_Apto_${params.unitId || '304'}.pdf`;
  doc.save(fileName);
};

/**
 * Gera o Termo Formal de Confissão e Parcelamento de Dívida Condominial
 * Fundamentado no Art. 1.336 do Código Civil e Art. 784, X do Código de Processo Civil.
 */
export const generateDebtAgreementPDF = (
  params: SimulationParams,
  agreement: DebtAgreementParams
) => {
  const doc = new jsPDF();
  if (!(doc as any).autoTable) {
    (doc as any).autoTable = (options: any) => autoTable(doc, options);
  }
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const [calcY, calcM, calcD] = params.calculationDate.split('-');
  const formattedCalcDate = `${calcD}/${calcM}/${calcY}`;
  const [dueY, dueM, dueD] = agreement.firstDueDate.split('-');
  const formattedFirstDueDate = `${dueD}/${dueM}/${dueY}`;

  // Cabeçalho Oficial Navy
  doc.setFillColor(21, 46, 100);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('CONDOMÍNIO RESIDENCIAL SEVILLA', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(219, 234, 254);
  doc.text(`CNPJ: ${CONDO_INFO.cnpj} • 12 Unidades (101 a 304) • ${CONDO_INFO.email}`, 14, 20);
  doc.text(`Portal: https://sevilla-silk.vercel.app • Síndico Responsável: ${params.sindicoName || CONDO_INFO.sindico.name}`, 14, 26);

  // Título do Instrumento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(21, 46, 100);
  doc.text('TERMO DE CONFISSÃO E PARCELAMENTO DE DÍVIDA CONDOMINIAL', 14, 43);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Título Executivo Extrajudicial — Art. 784, incisos III e X da Lei Federal nº 13.105/2015 (CPC)', 14, 49);

  // Caixa de Qualificação das Partes
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 53, 182, 34, 2.5, 2.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 53, 182, 34, 2.5, 2.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CREDOR:', 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`CONDOMÍNIO RESIDENCIAL SEVILLA, CNPJ nº ${CONDO_INFO.cnpj}, representado por seu Síndico.`, 36, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('DEVEDOR(A):', 18, 68);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.residentName || 'NOME DO CONDÔMINO'}`, 41, 68);

  doc.setFont('helvetica', 'bold');
  doc.text('UNIDADE:', 18, 76);
  doc.setFont('helvetica', 'normal');
  doc.text(`Apartamento ${params.unitId || '304'} (Fração Ideal: 8,333%)`, 36, 76);

  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTO / CPF:', 105, 76);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.cpf || 'Não informado'}`, 139, 76);

  doc.setFont('helvetica', 'bold');
  doc.text('CONTATO:', 18, 83);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.phone || '-'} | ${params.email || '-'}`, 36, 83);

  // Cláusulas Contratuais
  let curY = 94;

  const addClause = (title: string, text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 46, 100);
    doc.text(title, 14, curY);
    curY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(text, 182);
    doc.text(lines, 14, curY);
    curY += (lines.length * 4) + 3;
  };

  addClause(
    'CLÁUSULA PRIMEIRA – DA ORIGEM E CONFISSÃO DA DÍVIDA:',
    `O(A) DEVEDOR(A) reconhece, confessa e declara ser devedor(a) legítimo(a), certo(a), líquido(a) e exigível da quantia apurada na data base de ${formattedCalcDate}, referente a contribuições condominiais ordinárias, fundos de reserva e encargos legais moratórios devidos ao CONDOMÍNIO RESIDENCIAL SEVILLA.`
  );

  // Tabela de Valores
  autoTable(doc, {
    startY: curY,
    head: [['Discriminação do Débito', 'Composição Financeira (R$)']],
    body: [
      ['Total das Cotas Originais Pendentes', `R$ ${agreement.totalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Multa Moratória Legal (2% - Art. 1.336, § 1º CC)', `R$ ${agreement.totalMultas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Juros Moratórios (1% a.m. pro rata die)', `R$ ${agreement.totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ...(agreement.discountAmount > 0 ? [
        [`Desconto Especial sobre Encargos (${agreement.discountJurosPercent}% sobre Juros)`, `- R$ ${agreement.discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]
      ] : []),
      ['VALOR CONSOLIDADO DO ACORDO', `R$ ${agreement.effectiveTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Entrada Inicial Acordada', `R$ ${agreement.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Saldo Remanescente Parcelado', `R$ ${(agreement.effectiveTotal - agreement.downPayment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Condição de Pagamento', `${agreement.installmentsCount} parcela(s) mensais de R$ ${agreement.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com 1º vencimento em ${formattedFirstDueDate}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [21, 46, 100], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 120 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 62 }
    },
    margin: { left: 14, right: 14 }
  });

  curY = (doc as any).lastAutoTable.finalY + 6;

  addClause(
    'CLÁUSULA SEGUNDA – DA FORMA DE LIQUIDAÇÃO E CONTA OFICIAL:',
    `Os pagamentos da entrada e das parcelas subsequentes deverão ser realizados impreterivelmente até as datas de vencimento através de Pix ou transferência para a conta oficial do condomínio (Chave Pix E-mail: ${CONDO_INFO.email}), devendo o comprovante ser remetido imediatamente à Administração para baixa e conciliação bancária.`
  );

  addClause(
    'CLÁUSULA TERCEIRA – DA PONTUALIDADE DAS COTAS CONDOMINIAIS VINCENDAS:',
    'A formalização do presente parcelamento não exime o(a) DEVEDOR(A) de efetuar pontualmente o pagamento das cotas condominiais ordinárias e extraordinárias que vencerem a partir desta data, as quais deverão ser adimplidas de forma concomitante no dia 10 de cada mês.'
  );

  addClause(
    'CLÁUSULA QUARTA – DO INADIMPLEMENTO E VENCIMENTO ANTECIPADO:',
    'O atraso superior a 10 (dez) dias corridos no pagamento de qualquer parcela do acordo ou de cota mensal ordinária vincenda importará na rescisão de pleno direito do presente termo, com o VENCIMENTO ANTECIPADO de todas as parcelas vincendas, perda automática de qualquer eventual abatimento ou desconto concedido, e incidência de multa de 10% (dez por cento) sobre o saldo devedor remanescente, autorizando a imediata propositura de Execução de Título Extrajudicial (Art. 784, III e X do CPC).'
  );

  addClause(
    'CLÁUSULA QUINTA – DO FORO:',
    'As partes elegem o foro da Comarca da situação do imóvel com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir eventuais controvérsias decorrentes deste instrumento.'
  );

  curY += 4;

  // Local, data e assinaturas
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`São Luís - MA, ${dateStr}.`, 14, curY);

  curY += 16;

  // Linhas de assinatura lado a lado
  doc.setDrawColor(148, 163, 184);
  doc.line(14, curY, 95, curY);
  doc.line(115, curY, 196, curY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CONDOMÍNIO RESIDENCIAL SEVILLA', 54.5, curY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Síndico: ${params.sindicoName || CONDO_INFO.sindico.name}`, 54.5, curY + 8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(params.residentName || 'DEVEDOR(A) / CONDÔMINO', 155.5, curY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Apartamento ${params.unitId || '304'} • CPF: ${params.cpf || '-'}`, 155.5, curY + 8, { align: 'center' });

  curY += 16;
  doc.line(14, curY, 95, curY);
  doc.line(115, curY, 196, curY);
  doc.setFont('helvetica', 'normal');
  doc.text('Testemunha 1 (Nome / CPF):', 14, curY + 4);
  doc.text('Testemunha 2 (Nome / CPF):', 115, curY + 4);

  // Rodapé
  doc.setFillColor(21, 46, 100);
  doc.rect(0, 288, 210, 9, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Condomínio Residencial Sevilla • Termo de Confissão de Dívida', 105, 293.5, { align: 'center' });
  doc.text('Página 1 de 1', 196, 293.5, { align: 'right' });

  // Salvar
  const cleanResident = params.residentName ? params.residentName.trim().replace(/\s+/g, '_').toUpperCase() : 'ACORDO';
  doc.save(`Termo_Acordo_${cleanResident}_Apto_${params.unitId || '304'}.pdf`);
};

