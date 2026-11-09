# 🛠️ Manual de Governança Técnica & Engenharia do Sistema
**CondoTech Sevilla — Documentação de Engenharia**  
*Autor: Síndico-Programador Sênior*  
*Versão: 3.0 | Atualizado: Novembro/2026*

---

## 1. Princípios de Engenharia de Software Aplicados à Sindicatura
Como profissional de tecnologia assumindo a liderança do condomínio, este sistema foi concebido sobre quatro pilares:
1. **Determinismo Contábil:** Toda transação financeira é imutável e categorizada. Não há lançamentos orfãos ou saldos fictícios.
2. **Dupla Segregação de Contas:** Separação entre caixa ordinário e poupança de fundo de reserva a nível de esquema de dados.
3. **Auditabilidade em Tempo Real:** Motor de validação que checa o quórum de 12 frações (1/12 cada), notas fiscais vinculadas e status de conciliação.
4. **Resguardo de Privacidade (LGPD):** Nenhum dado pessoal sensível dos condôminos é exposto em telas ou relatórios públicos.

---

## 2. Especificação do Modelo de Dados (`types.ts`)

### Unidades Autônomas (`UnitDetails`)
```typescript
export type UnitId = 
  | '101' | '102' | '103' | '104'
  | '201' | '202' | '203' | '204'
  | '301' | '302' | '303' | '304';

export interface UnitDetails {
  id: UnitId;
  floor: number;
  residentName: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  idealFraction: number; // 8.333%
  parkingSpot: string;
  notes?: string;
}
```

### Transações e Contas Vinculadas (`Transaction`)
```typescript
export type AccountType = 'ORDINARIA' | 'FUNDO_RESERVA' | 'FUNDO_OBRAS';

export interface Transaction {
  id: string;
  date: string; // ISO 8601 YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType; // REVENUE | EXPENSE
  unitId?: UnitId;
  category: string;
  account: AccountType;
  receiptNumber?: string;
  isReconciled?: boolean;
}
```

---

## 3. Algoritmo de Cálculo Moratório (Código Civil Art. 1.336)
Quando uma unidade encontra-se pendente após o vencimento no dia 10:
```typescript
const principalTotal = pendingMonths * monthlyFee;
const fineAmount = principalTotal * 0.02; // Multa legal de 2%
const interestAmount = pendingMonths > 1 
  ? principalTotal * 0.01 * pendingMonths 
  : 0; // Juros moratórios de 1% a.m. pro rata die
const totalDue = principalTotal + fineAmount + interestAmount;
```

---

## 4. Integração com Gemini 3.8 Flash (`@google/genai`)
O módulo de IA opera como auditor independente. Ele recebe o resumo analítico de receitas e despesas e gera:
1. Avaliação do custo médio por unidade ($\text{Despesas Totais} / 12$).
2. Detecção de desvios e anomalias de consumo em água e energia.
3. Conformidade do provisionamento de 10% do fundo de reserva.
4. Recomendações acionáveis para pauta da próxima assembleia.

---

## 5. Checklist de Auditoria Predial Automatizado
O módulo `AuditInspectionPanel` verifica:
* Validade da apólice de seguro contra incêndio e danos (Art. 1.346 CC);
* Auto de Vistoria do Corpo de Bombeiros (AVCB);
* Certificado semestral de limpeza de caixas d'água;
* Relatório de Inspeção Anual (RIA) do elevador Atlas Schindler;
* Laudo de medição ôhmica do para-raios (SPDA ABNT NBR 5419).
