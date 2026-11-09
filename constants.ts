import { UnitId, UnitDetails, Transaction, TransactionType, LegalObligation, CondoDocument } from './types';

export const UNITS: UnitId[] = [
  '101', '102', '103', '104',
  '201', '202', '203', '204',
  '301', '302', '303', '304'
];

export const CONDO_INFO = {
  name: 'Condomínio Residencial Sevilla',
  email: 'sevillacond@gmail.com',
  cnpj: '34.821.904/0001-52',
  address: 'Rua das Camélias, 240 - Bairro Jardim América, São Paulo - SP, CEP 01416-000',
  monthlyFee: 420.00, // R$ 380,00 Ordinária + R$ 40,00 Fundo de Reserva
  reservePercentage: 10,
  sindico: {
    name: 'Gestor & Síndico Técnico (Eng. de Software)',
    role: 'Síndico Eleito • Gestão 2026/2028',
    contactEmail: 'sevillacond@gmail.com',
    termStart: '2026-01-15',
    termEnd: '2028-01-15',
    status: 'Mandato Ativo • Auditoria de Posse Concluída'
  }
};

export const DEFAULT_UNITS_DATA: Record<UnitId, UnitDetails> = {
  '101': { id: '101', floor: 1, residentName: 'Carlos Eduardo Mendes', ownerName: 'Carlos Eduardo Mendes', contactEmail: 'carlos.mendes@email.com', contactPhone: '(11) 98111-1001', idealFraction: 8.333, parkingSpot: 'Vaga 01 (Subsolo)' },
  '102': { id: '102', floor: 1, residentName: 'Mariana Lima Silveira', ownerName: 'Mariana Lima Silveira', contactEmail: 'mariana.silveira@email.com', contactPhone: '(11) 98222-1002', idealFraction: 8.333, parkingSpot: 'Vaga 02 (Subsolo)' },
  '103': { id: '103', floor: 1, residentName: 'Fernando Rocha Santos', ownerName: 'Rocha Participações Ltda', contactEmail: 'fernando.rocha@email.com', contactPhone: '(11) 98333-1003', idealFraction: 8.333, parkingSpot: 'Vaga 03 (Subsolo)' },
  '104': { id: '104', floor: 1, residentName: 'Dra. Beatriz Albuquerque', ownerName: 'Dra. Beatriz Albuquerque', contactEmail: 'beatriz.albuq@email.com', contactPhone: '(11) 98444-1004', idealFraction: 8.333, parkingSpot: 'Vaga 04 (Subsolo)' },

  '201': { id: '201', floor: 2, residentName: 'Lucas Fontana Ribeiro', ownerName: 'Lucas Fontana Ribeiro', contactEmail: 'lucas.fontana@email.com', contactPhone: '(11) 98555-2001', idealFraction: 8.333, parkingSpot: 'Vaga 05 (Térreo)' },
  '202': { id: '202', floor: 2, residentName: 'Juliana P. Nogueira', ownerName: 'Juliana P. Nogueira', contactEmail: 'juliana.nogueira@email.com', contactPhone: '(11) 98666-2002', idealFraction: 8.333, parkingSpot: 'Vaga 06 (Térreo)' },
  '203': { id: '203', floor: 2, residentName: 'Roberto Vasconcellos', ownerName: 'Roberto Vasconcellos', contactEmail: 'roberto.vasc@email.com', contactPhone: '(11) 98777-2003', idealFraction: 8.333, parkingSpot: 'Vaga 07 (Térreo)', notes: 'Acordo amigável de quitação em andamento' },
  '204': { id: '204', floor: 2, residentName: 'Patrícia & André Neves', ownerName: 'Patrícia Neves', contactEmail: 'patricia.neves@email.com', contactPhone: '(11) 98888-2004', idealFraction: 8.333, parkingSpot: 'Vaga 08 (Térreo)' },

  '301': { id: '301', floor: 3, residentName: 'Marcio Azevedo Cruz', ownerName: 'Marcio Azevedo Cruz', contactEmail: 'marcio.cruz@email.com', contactPhone: '(11) 98999-3001', idealFraction: 8.333, parkingSpot: 'Vaga 09 (Coberta)' },
  '302': { id: '302', floor: 3, residentName: 'Helena Carvalho Dias', ownerName: 'Helena Carvalho Dias', contactEmail: 'helena.dias@email.com', contactPhone: '(11) 99111-3002', idealFraction: 8.333, parkingSpot: 'Vaga 10 (Coberta)' },
  '303': { id: '303', floor: 3, residentName: 'Thiago Guimarães Leal', ownerName: 'Imobiliária Jardins (Locatário Thiago)', contactEmail: 'thiago.leal@email.com', contactPhone: '(11) 99222-3003', idealFraction: 8.333, parkingSpot: 'Vaga 11 (Coberta)', notes: 'Boleto do mês enviado para a administradora' },
  '304': { id: '304', floor: 3, residentName: 'Sofia Ramos Vianna', ownerName: 'Sofia Ramos Vianna', contactEmail: 'sofia.vianna@email.com', contactPhone: '(11) 99333-3004', idealFraction: 8.333, parkingSpot: 'Vaga 12 (Coberta)' },
};

export const REVENUE_CATEGORIES = [
  'Taxa Condominial Ordinária',
  'Fundo de Reserva (10%)',
  'Multas & Juros Moratórios',
  'Fundo de Obras / Chamada Extra',
  'Ressarcimento de Danos / Outros'
];

export const EXPENSE_CATEGORIES = [
  'Água & Esgoto (Sabesp Central)',
  'Energia Elétrica (Enel Áreas Comuns)',
  'Manutenção Preventiva de Elevador',
  'Limpeza, Portaria & Conservação',
  'Seguro Predial Obrigatório',
  'Assessoria Contábil & Sistema',
  'Manutenção de Portão & Interfonia',
  'Dedetização & Limpeza de Caixas d’Água',
  'Fundo de Obras & Manutenção Predial',
  'Tarifas Bancárias & Boletos'
];

export const LEGAL_OBLIGATIONS_DATA: LegalObligation[] = [
  {
    id: 'obl-1',
    name: 'Seguro Predial Obrigatório da Edificação',
    category: 'Legal & Fiscal',
    lastInspectionDate: '2026-03-10',
    nextDueDate: '2027-03-10',
    status: 'VIGENTE',
    responsibleCompany: 'Porto Seguro Seguros S/A',
    documentNumber: 'Apólice Nº 0531-992144-8',
    periodicity: 'Anual (Art. 1.346 do Código Civil)',
    notes: 'Cobertura completa contra incêndio, raio, explosão, responsabilidade civil do condomínio e portão automático.'
  },
  {
    id: 'obl-2',
    name: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
    category: 'Segurança & Incêndio',
    lastInspectionDate: '2024-12-05',
    nextDueDate: '2026-12-05',
    status: 'A_VENCER',
    responsibleCompany: 'Corpo de Bombeiros Militar de SP / Engenharia FireSafe',
    documentNumber: 'AVCB Protocolo Nº 89432/26',
    periodicity: 'A cada 2 anos',
    notes: 'Vistoria e recarga de extintores já agendada para renovação periódica sem descontinuidade.'
  },
  {
    id: 'obl-3',
    name: 'Limpeza e Desinfecção das Caixas d’Água',
    category: 'Sanitária',
    lastInspectionDate: '2026-08-14',
    nextDueDate: '2027-02-14',
    status: 'VIGENTE',
    responsibleCompany: 'BioClean Soluções Ambientais',
    documentNumber: 'Certificado Sanitário Nº 4410/26',
    periodicity: 'Semestral (Conforme Portaria CVS-SP)',
    notes: 'Reservatório inferior (15.000L) e superior (10.000L) higienizados e com teste de potabilidade aprovado.'
  },
  {
    id: 'obl-4',
    name: 'Manutenção Mensal & RIA dos Elevadores',
    category: 'Manutenção Predial',
    lastInspectionDate: '2026-10-28',
    nextDueDate: '2026-11-28',
    status: 'VIGENTE',
    responsibleCompany: 'Atlas Schindler Elevadores',
    documentNumber: 'Contrato de Conservação Nº 12.809',
    periodicity: 'Mensal (Inspeção Técnica) + RIA Anual',
    notes: 'Elevador social inspecionado, cabos de tração e freios em perfeito estado operacional.'
  },
  {
    id: 'obl-5',
    name: 'Dedetização, Desratização & Controle de Pragas',
    category: 'Sanitária',
    lastInspectionDate: '2026-09-02',
    nextDueDate: '2027-03-02',
    status: 'VIGENTE',
    responsibleCompany: 'PragaZero Saúde Ambiental',
    documentNumber: 'Laudo Técnico Nº 7819-A',
    periodicity: 'Semestral',
    notes: 'Aplicação em todas as áreas comuns, lixeiras, garagem e caixas de gordura.'
  },
  {
    id: 'obl-6',
    name: 'SPDA - Laudo Técnico do Para-Raios',
    category: 'Segurança & Incêndio',
    lastInspectionDate: '2026-02-18',
    nextDueDate: '2027-02-18',
    status: 'VIGENTE',
    responsibleCompany: 'EletroEng Perícias e Projetos',
    documentNumber: 'ART CREA-SP Nº 2026/09941',
    periodicity: 'Anual (Norma ABNT NBR 5419)',
    notes: 'Medição ôhmica da malha de aterramento: 4,8 Ohms (dentro do padrão de segurança < 10 Ohms).'
  }
];

export const CONDO_DOCUMENTS_DATA: CondoDocument[] = [
  {
    id: 'doc-audit-posse',
    title: 'Relatório de Auditoria de Posse e Transição do Síndico',
    category: 'AUDITORIA_POSSE',
    date: '2026-01-20',
    version: '1.0 (Oficial)',
    author: 'Síndico-Programador Sênior (Gestão Residencial Sevilla)',
    summary: 'Diagnóstico contábil completo de entrada, inventário de ativos, conciliação bancária de abertura e plano de ação dos 100 dias com foco em transparência e eficiência.',
    tags: ['Auditoria', 'Posse', 'Transição', 'Governança', 'Plano 100 Dias'],
    fullText: `RELATÓRIO DE AUDITORIA DE POSSE & TRANSIÇÃO DE GESTÃO
CONDOMÍNIO RESIDENCIAL SEVILLA • 12 UNIDADES AUTÔNOMAS
CNPJ: 34.821.904/0001-52 | Contato Oficial: sevillacond@gmail.com

1. INTRODUÇÃO E ESCOPO DA AUDITORIA
Ao assumir as funções de Síndico do Condomínio Residencial Sevilla para o biênio 2026/2028, aplicou-se metodologia formal de auditoria técnica e contábil inspirada nas melhores práticas de engenharia de software e compliance financeiro.
O objetivo primordial é assegurar rastreabilidade absoluta de cada centavo arrecadado, conformidade com os artigos 1.331 a 1.358 do Código Civil Brasileiro e estabelecer um padrão inquestionável de transparência para os 12 condôminos.

2. DIAGNÓSTICO DAS CONTAS E CONCILIAÇÃO DE ABERTURA
- Saldo Inicial em Conta Corrente Operacional: R$ 8.420,00
- Saldo Inicial em Conta Fundo de Reserva: R$ 14.850,00
- Total de Ativos Líquidos: R$ 23.270,00
- Não foram identificados passivos trabalhistas diretos (serviços terceirizados via contrato PJ).
- As contas de consumo (Sabesp e Enel) encontram-se rigorosamente em dia, sem débitos anteriores.
- Verificou-se necessidade de formalizar a segregação bancária entre Conta Ordinária e Fundo de Reserva, evitando contaminação de receitas.

3. MAPA DE FRAÇÃO IDEAL DAS 12 UNIDADES
Conforme Convenção Condominial, o edifício conta com 12 apartamentos de metragem idêntica distribuídos em 3 pavimentos (1º andar: 101 a 104; 2º andar: 201 a 204; 3º andar: 301 a 304).
A fração ideal de cada unidade é rigorosamente 1/12 (8,33333%), perfazendo 100% do condomínio.
Taxa condominial ordinária fixada em R$ 380,00 + Fundo de Reserva de 10% (R$ 40,00) = R$ 420,00 por unidade/mês.
Previsão orçamentária mensal de arrecadação: 12 x R$ 420,00 = R$ 5.040,00/mês.

4. REVISÃO DE SEGURANÇA E CONFORMIDADE PREDIAL
- Seguro Predial Obrigatório (Art. 1.346 CC): Vigente junto à Porto Seguro até Março/2027.
- AVCB (Corpo de Bombeiros): Validade até Dezembro/2026; processo de vistoria preventiva programado.
- Manutenção de Elevador Atlas Schindler: Contrato preventivo ativo com vistorias mensais.
- Caixas d'Água: Limpeza semestral em conformidade com as normas sanitárias de SP.

5. PLANO DE AÇÃO DOS PRIMEIROS 100 DIAS
- Meta 1: Implementação do Painel Digital de Gestão e Auditoria CondoTech, eliminando impressões desnecessárias e permitindo consulta transparente por qualquer morador.
- Meta 2: Negociação do contrato de interfonia e telefonia do elevador, com redução estimada de 15% nos custos mensais.
- Meta 3: Cobrança ativa e cordial das pendências de condomínio, oferecendo chave Pix oficial (sevillacond@gmail.com) e conciliação em tempo real.
- Meta 4: Revisão e disponibilização digital do Regimento Interno e Convenção a todos os condôminos.`
  },
  {
    id: 'doc-regimento',
    title: 'Regimento Interno Consolidado do Residencial Sevilla',
    category: 'REGIMENTO',
    date: '2026-02-01',
    version: '2.1',
    author: 'Assembleia Geral / Assessoria do Síndico',
    summary: 'Normas de convivência, horários de silêncio (22h às 08h), utilização das 12 vagas de garagem, descarte de lixo, mudanças e animais domésticos.',
    tags: ['Regimento', 'Convivência', 'Garagem', 'Silêncio', 'Mudanças'],
    fullText: `REGIMENTO INTERNO CONSOLIDADO
CONDOMÍNIO RESIDENCIAL SEVILLA
Normas aprovadas em Assembleia Geral para harmonia dos 12 moradores:

CAPÍTULO I - DO SILÊNCIO E TRANQUILIDADE
Art. 1º - O horário de silêncio vigora das 22h00 às 08h00 nos dias úteis, e até às 09h00 aos sábados, domingos e feriados.
Art. 2º - Sons de aparelhos eletrônicos, instrumentos musicais e conversas em áreas comuns devem ser mantidos em volume moderado em qualquer horário.

CAPÍTULO II - DAS VAGAS DE GARAGEM
Art. 3º - Cada unidade autônoma possui direito exclusivo a 1 (uma) vaga de garagem demarcada (Vagas 01 a 12), correspondente ao seu número de matrícula.
Art. 4º - É proibido utilizar a vaga como depósito de entulho, móveis ou materiais inflamáveis. Velocidade máxima na rampa: 10 km/h.

CAPÍTULO III - DAS MUDANÇAS E REFORMAS
Art. 5º - Mudanças e obras barulhentas somente poderão ocorrer de segunda a sexta-feira, das 08h30 às 17h30, e aos sábados das 09h00 às 13h00, mediante prévio agendamento de 48h junto à administração via sevillacond@gmail.com.
Art. 6º - Qualquer intervenção estrutural exige Anotação de Responsabilidade Técnica (ART/RRT) assinada por engenheiro/arquiteto conforme ABNT NBR 16.280.

CAPÍTULO IV - DO DESCARTE DE LIXO
Art. 7º - O lixo doméstico deve ser devidamente ensacado sem vazamento e descartado na lixeira central nas lixeiras identificadas (Orgânico e Reciclável).`
  },
  {
    id: 'doc-convencao',
    title: 'Convenção Condominial - Estatuto e Frações Ideais',
    category: 'CONVENCAO',
    date: '2025-06-10',
    version: '1.0 Registrada',
    author: 'Cartório de Registro de Imóveis / Condomínio Sevilla',
    summary: 'Estatuto legal de constituição do edifício, fração ideal igualitária de 1/12 por unidade, responsabilidades do síndico e conselho fiscal.',
    tags: ['Convenção', 'Código Civil', 'Fração Ideal', 'Competências'],
    fullText: `CONVENÇÃO CONDOMINIAL DO CONDOMÍNIO RESIDENCIAL SEVILLA
Composta por 12 unidades habitacionais autônomas:

CLÁUSULA PRIMEIRA - DA DESTINAÇÃO:
O condomínio destina-se exclusivamente para fins residenciais familiares, sendo vedada qualquer atividade comercial ruidosa ou que comprometa a segurança dos moradores.

CLÁUSULA SEGUNDA - DA FRAÇÃO IDEAL E RATEIO DE DESPESAS:
Todas as 12 unidades possuem áreas privativas equivalentes, cabendo a cada uma a fração ideal de 8,3333% (1/12) das áreas comuns e do terreno.
O rateio das despesas ordinárias e extraordinárias aprovadas em assembleia será feito rigorosamente na proporção de sua fração ideal.

CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES FINANCEIRAS & INADIMPLÊNCIA:
O pagamento da cota condominial vence no dia 10 (dez) de cada mês.
Em caso de atraso, incidirá:
a) Multa moratória legal de 2% (dois por cento) sobre o valor do débito (Código Civil, Art. 1.336, § 1º);
b) Juros moratórios de 1% (um por cento) ao mês, calculados pro rata die;
c) Correção monetária pelo índice IPCA/IBGE a partir do vencimento.

CLÁUSULA QUARTA - DO FUNDO DE RESERVA:
Fica instituído o Fundo de Reserva obrigatório, fixado em 10% (dez por cento) sobre o valor da taxa ordinária, destinado a despesas imprevistas e urgentes de conservação do patrimônio comum.`
  },
  {
    id: 'doc-manual-tecnico',
    title: 'Manual de Governança Técnica & Arquitetura do Sistema',
    category: 'MANUAL_SISTEMA',
    date: '2026-11-09',
    version: '3.0 (Engenharia Síndico)',
    author: 'Síndico-Programador Sênior',
    summary: 'Documentação da arquitetura técnica do sistema CondoTech Sevilla: modelo de dados, conciliação contábil, cálculos moratórios determinísticos e integração com IA Gemini.',
    tags: ['Arquitetura', 'Documentação Técnica', 'LGPD', 'Engenharia', 'Segurança'],
    fullText: `MANUAL TÉCNICO DE ENGENHARIA & GOVERNANÇA DO SISTEMA
SISTEMA DE GESTÃO DO CONDOMÍNIO RESIDENCIAL SEVILLA

1. VISÃO GERAL DA ARQUITETURA
Desenvolvido sob o paradigma de robustez contábil e transparência de código. A plataforma utiliza TypeScript com tipagem estrita, persistência imutável de transações com controle de versão e geração de documentos em tempo real.

2. ESPECIFICAÇÃO DAS REGRAS DE NEGÓCIO FINANCEIRAS
- Unidades Autônomas Mapeadas: 12 unidades distribuídas em 3 andares (101 a 104, 201 a 204, 301 a 304).
- Cota Ordinária Mensal: R$ 380,00 por unidade.
- Fundo de Reserva: R$ 40,00 por unidade (10% sobre arrecadação base).
- Fórmulas de Inadimplência:
  * Valor Principal = Meses Pendentes * Taxa Mensal
  * Multa Moratória = Valor Principal * 0.02 (Art. 1.336 CC)
  * Juros Moratórios = Valor Principal * (0.01 / 30) * Dias de Atraso
  * Total Devido = Valor Principal + Multa + Juros

3. CONCILIAÇÃO BANCÁRIA & DUPLA ENTRADA
O sistema opera com duas contas distintas:
- Conta Corrente Ordinária: Recebimento de cotas ordinárias e pagamento de fornecedores (Sabesp, Enel, elevadores, faxina).
- Conta Investimento Fundo de Reserva: Aplicação automática com rendimento CDI para emergências e obras estruturais.

4. POLÍTICA DE PRIVACIDADE E LGPD CONDOMINIAL
Os dados dos condôminos (contatos, e-mails e telefones) são de acesso estrito da administração do síndico. Demonstrativos públicos e balancetes fixados em áreas comuns são anonimizados nos termos da LGPD (Lei nº 13.709/2018), exibindo apenas a identificação da unidade e status de quitação.

5. INTEGRAÇÃO COM INTELIGÊNCIA ARTIFICIAL (GEMINI 3.8 FLASH)
O módulo de IA opera como um Auditor Contábil Externo autônomo, processando os lançamentos de fluxo de caixa, calculando tendências sazonais de água/energia e sugerindo economias antes das assembleias gerais.`
  }
];

export const generateSeedData = (): Transaction[] => {
  const transactions: Transaction[] = [];
  
  // Vamos gerar dados consistentes para os últimos 3 meses:
  // Outubro/2026, Setembro/2026 e Novembro/2026 (mês atual)
  const months = ['2026-09', '2026-10', '2026-11'];
  
  months.forEach((monthStr, mIndex) => {
    // Despesas fixas mensais de cada mês
    transactions.push(
      {
        id: `exp-sabesp-${monthStr}`,
        date: `${monthStr}-05`,
        description: `Sabesp - Fornecimento de Água e Esgoto Central`,
        amount: mIndex === 2 ? 1340.50 : (mIndex === 1 ? 1410.20 : 1290.80),
        type: TransactionType.EXPENSE,
        category: 'Água & Esgoto (Sabesp Central)',
        account: 'ORDINARIA',
        receiptNumber: `NF-${monthStr}-01`,
        isReconciled: true
      },
      {
        id: `exp-enel-${monthStr}`,
        date: `${monthStr}-07`,
        description: `Enel - Energia Elétrica Áreas Comuns e Elevador`,
        amount: mIndex === 2 ? 580.40 : (mIndex === 1 ? 615.10 : 590.30),
        type: TransactionType.EXPENSE,
        category: 'Energia Elétrica (Enel Áreas Comuns)',
        account: 'ORDINARIA',
        receiptNumber: `NF-${monthStr}-02`,
        isReconciled: true
      },
      {
        id: `exp-atlas-${monthStr}`,
        date: `${monthStr}-10`,
        description: `Atlas Schindler - Manutenção Mensal Preventiva Elevador`,
        amount: 850.00,
        type: TransactionType.EXPENSE,
        category: 'Manutenção Preventiva de Elevador',
        account: 'ORDINARIA',
        receiptNumber: `NF-SCHIN-${monthStr}`,
        isReconciled: true
      },
      {
        id: `exp-limpeza-${monthStr}`,
        date: `${monthStr}-15`,
        description: `Serviço Terceirizado de Limpeza e Conservação Predial`,
        amount: 1100.00,
        type: TransactionType.EXPENSE,
        category: 'Limpeza, Portaria & Conservação',
        account: 'ORDINARIA',
        receiptNumber: `RPA-${monthStr}-04`,
        isReconciled: true
      },
      {
        id: `exp-contabil-${monthStr}`,
        date: `${monthStr}-18`,
        description: `Assessoria Contábil & Emissão de Boletos Bancários`,
        amount: 320.00,
        type: TransactionType.EXPENSE,
        category: 'Assessoria Contábil & Sistema',
        account: 'ORDINARIA',
        receiptNumber: `NF-CONT-${monthStr}`,
        isReconciled: true
      },
      {
        id: `exp-banco-${monthStr}`,
        date: `${monthStr}-28`,
        description: `Tarifas de Manutenção de Conta e Liquidação Pix/Boletos`,
        amount: 45.90,
        type: TransactionType.EXPENSE,
        category: 'Tarifas Bancárias & Boletos',
        account: 'ORDINARIA',
        receiptNumber: `DEB-AUTO-${monthStr}`,
        isReconciled: true
      }
    );

    // Despesas extraordinárias pontuais
    if (mIndex === 0) {
      transactions.push({
        id: `exp-dedetiza-${monthStr}`,
        date: `${monthStr}-02`,
        description: `PragaZero - Dedetização Semestral de Pragas Urbanas`,
        amount: 480.00,
        type: TransactionType.EXPENSE,
        category: 'Dedetização & Limpeza de Caixas d’Água',
        account: 'ORDINARIA',
        receiptNumber: `NF-PRAGA-7819`,
        isReconciled: true
      });
    }

    if (mIndex === 1) {
      transactions.push({
        id: `exp-portao-${monthStr}`,
        date: `${monthStr}-22`,
        description: `Substituição de Fita de LED e Manutenção Motor Portão Garagem`,
        amount: 380.00,
        type: TransactionType.EXPENSE,
        category: 'Manutenção de Portão & Interfonia',
        account: 'ORDINARIA',
        receiptNumber: `REC-PORTAO-102`,
        isReconciled: true
      });
    }

    // Aporte do Fundo de Reserva do Mês (10% sobre arrecadação)
    transactions.push({
      id: `rev-fr-${monthStr}`,
      date: `${monthStr}-12`,
      description: `Transferência para Conta Fundo de Reserva - Mês ${monthStr}`,
      amount: 480.00,
      type: TransactionType.REVENUE,
      category: 'Fundo de Reserva (10%)',
      account: 'FUNDO_RESERVA',
      receiptNumber: `TED-FR-${monthStr}`,
      isReconciled: true
    });

    // Pagamento das Cotas Condominiais pelas 12 Unidades
    // Para criar cenário de auditoria realista e prático:
    // Mês 0 (Setembro): Todas pagaram, exceto 203 (1 pendência acumulada)
    // Mês 1 (Outubro): Todas pagaram, exceto 203 (2 pendências acumuladas)
    // Mês 2 (Novembro - Corrente): 10 unidades pagas, 203 e 303 pendentes
    UNITS.forEach((unit, uIdx) => {
      let shouldPay = true;
      if (unit === '203') {
        // Unidade 203 está inadimplente nos meses 1 e 2
        if (mIndex >= 1) shouldPay = false;
      }
      if (unit === '303') {
        // Unidade 303 está pendente apenas no mês corrente (Novembro)
        if (mIndex === 2) shouldPay = false;
      }

      if (shouldPay) {
        const dayStr = (10 + (uIdx % 4) - 2).toString().padStart(2, '0');
        transactions.push({
          id: `rev-cota-${unit}-${monthStr}`,
          date: `${monthStr}-${dayStr}`,
          description: `Taxa Condominial Ordinária - Unidade ${unit}`,
          amount: 420.00,
          type: TransactionType.REVENUE,
          unitId: unit,
          category: 'Taxa Condominial Ordinária',
          account: 'ORDINARIA',
          receiptNumber: `PIX-REC-${unit}-${monthStr}`,
          isReconciled: true
        });
      }
    });
  });

  return transactions;
};

export const INITIAL_CONDO_STATE = {
  condoName: CONDO_INFO.name,
  condoEmail: CONDO_INFO.email,
  cnpj: CONDO_INFO.cnpj,
  address: CONDO_INFO.address,
  monthlyFee: CONDO_INFO.monthlyFee,
  reserveFundPercentage: CONDO_INFO.reservePercentage,
  bankOrdinaryBalance: 8420.00,
  bankReserveBalance: 14850.00,
  transactions: generateSeedData(),
  units: DEFAULT_UNITS_DATA,
  legalObligations: LEGAL_OBLIGATIONS_DATA,
  documents: CONDO_DOCUMENTS_DATA,
  sindico: CONDO_INFO.sindico
};
