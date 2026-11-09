# 🏛️ CondoTech Sevilla — Gestão, Auditoria & Governança Predial

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-cyan?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-3.8_Flash-orange?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Status](https://img.shields.io/badge/Auditoria-100%25_Conforme-emerald?style=flat-square)]()

Plataforma de alta fidelidade desenvolvida sob a perspectiva de um **Engenheiro de Software Sênior** que assume a função de **Síndico do Condomínio Residencial Sevilla**. O sistema alia rigor matemático contábil, integridade de dados e compliance estrito com o **Código Civil Brasileiro (Artigos 1.331 a 1.358)** à praticidade do dia a dia da administração predial.

---

## 🏢 1. Visão Geral do Condomínio

* **Nome Oficial:** Condomínio Residencial Sevilla
* **CNPJ:** `34.821.904/0001-52`
* **Localização:** Rua das Camélias, 240 - Bairro Jardim América, São Paulo - SP, CEP 01416-000
* **Contato Oficial & Chave Pix:** `sevillacond@gmail.com`
* **Gestão:** Mandato 2026/2028 — Síndico Técnico (Engenharia de Software)

### 📐 Estrutura Arquitetônica (12 Unidades Autônomas)
O edifício é composto por bloco único de 3 pavimentos, contendo 4 apartamentos por andar de metragem e fração idênticas:

| Pavimento | Unidades Autônomas | Fração Ideal Individual | Vagas de Garagem |
| :--- | :--- | :--- | :--- |
| **3º Pavimento** (Coberturas / Andar Alto) | **301, 302, 303, 304** | 8,3333% (1/12) | Vagas 09 a 12 (Cobertas) |
| **2º Pavimento** (Andar Intermediário) | **201, 202, 203, 204** | 8,3333% (1/12) | Vagas 05 a 08 (Térreo) |
| **1º Pavimento** (Térreo Elevado / Andar Baixo) | **101, 102, 103, 104** | 8,3333% (1/12) | Vagas 01 a 04 (Subsolo) |
| **Total Consolidado** | **12 Apartamentos** | **100,0000%** | **12 Vagas Demarcadas** |

---

## 💰 2. Regras de Negócio Financeiras & Rateio

1. **Cota Mensal por Unidade:**
   * Taxa Ordinária de Custeio: **R$ 380,00** (Sabesp, Enel, limpeza, elevadores, assessoria contábil)
   * Fundo de Reserva Obrigatório (10%): **R$ 40,00** (Conta de rendimento seguro 100% CDI)
   * **Valor Total Mensal por Unidade:** **R$ 420,00**
   * **Arrecadação Base Mensal (12 Unidades):** **R$ 5.040,00**
2. **Segregação Bancária:**
   * **Conta Corrente Ordinária:** Operacional diário e quitação de fornecedores.
   * **Conta Investimento Fundo de Reserva:** Poupança/CDI vinculada para despesas emergenciais e manutenção de capital.
3. **Cálculo Moratório Determinístico (Código Civil, Art. 1.336, § 1º):**
   * Em caso de atraso após o dia 10 de cada mês:
     $$\text{Multa} = \text{Principal} \times 2\%$$
     $$\text{Juros Moratórios} = \text{Principal} \times \left(\frac{1\%}{30}\right) \times \text{Dias de Atraso}$$
     $$\text{Total Devido} = \text{Principal} + \text{Multa} + \text{Juros}$$
4. **Cobrança Ativa & Conciliação Pix:**
   * Geração automática de notificações amigáveis para WhatsApp/E-mail com chave Pix `sevillacond@gmail.com`.
   * Baixa e emissão imediata de comprovante/recibo contábil.

---

## 🛡️ 3. Auditoria & Compliance Predial

O sistema monitora ativamente as obrigações compulsórias do condomínio:

* **Seguro Predial Obrigatório da Edificação (Art. 1.346 CC):** Apólice Porto Seguro com cobertura integral contra incêndio, raio, explosão e responsabilidade civil do condomínio.
* **AVCB (Auto de Vistoria do Corpo de Bombeiros):** Monitoramento de validade e recarga de extintores.
* **Limpeza e Desinfecção Semestral das Caixas d'Água:** Reservatórios superior (10.000L) e inferior (15.000L) com laudo de potabilidade.
* **Manutenção Preventiva dos Elevadores (Atlas Schindler):** Visitas técnicas mensais e Relatório de Inspeção Anual (RIA).
* **Dedetização & Desratização:** Controle semestral de pragas urbanas nas áreas comuns e caixas de gordura.
* **SPDA / Para-raios (ABNT NBR 5419):** Medição ôhmica anual da malha de aterramento (< 10 Ohms).

---

## 🤖 4. Inteligência Artificial (Gemini 3.8 Flash)

Integração direta com o modelo **Gemini 3.8 Flash** via SDK `@google/genai`:
* Processa o histórico analítico de despesas e arrecadações.
* Identifica tendências e maiores ofensores de custo (ex: consumo de água Sabesp).
* Fornece parecer executivo autônomo formatado para assembleias ordinárias (AGO).
* Conta com fallback determinístico local para funcionamento offline contínuo.

---

## 🖨️ 5. Geração de Documentos em PDF

Utilizando a biblioteca `jspdf` e `jspdf-autotable`, o sistema emite:
1. **Balancete Mensal Oficial de Prestação de Contas:** Com demonstrativo sintético, detalhamento de lançamentos, conciliação do fundo de reserva e mapa de adimplência das 12 unidades.
2. **Relatório de Auditoria de Posse e Transição de Gestão:** Documento formal assinado pelo Síndico.
3. **Regimento Interno e Convenção Condominial:** Cópias autenticadas para consulta dos condôminos.

---

## 📂 6. Estrutura do Repositório

```text
├── App.tsx                      # Componente raiz, controle de abas, filtros e modais
├── components/
│   ├── AuditAlertsBanner.tsx    # Banner de status de integridade contábil e laudos
│   ├── AuditInspectionPanel.tsx # Painel de conformidade, laudos prediais e auditoria
│   ├── DocumentationViewer.tsx  # Leitor e gerenciador de documentos, atas e normas
│   ├── SummaryCard.tsx          # Cards de KPI financeiro com badges de conta
│   ├── UnitDetailModal.tsx      # Modal de cálculo moratório (2% + 1% juros) e Pix
│   └── UnitGrid.tsx             # Visualização arquitetônica por pavimento (101..304)
├── constants.ts                 # Constantes institucionais, 12 unidades, seed data e laudos
├── docs/                        # Documentação textual arquivada do condomínio
│   ├── AUDITORIA_INICIAL.md     # Relatório de posse e diagnóstico dos 100 dias
│   ├── REGIMENTO_INTERNO.md     # Normas de convivência, garagem e horários
│   ├── CONVENCAO.md             # Frações ideais (1/12) e estatuto do edifício
│   └── MANUAL_GOVERNANCA.md     # Especificação técnica e políticas LGPD
├── services/
│   ├── geminiService.ts         # Integração com Gemini 3.8 Flash e parecer de IA
│   └── pdfService.ts            # Gerador de relatórios e balancetes em PDF oficial
├── types.ts                     # Definições de tipos estritos do TypeScript
├── index.html                   # Entry point com tipografia Inter e metatags
├── index.tsx                    # Montagem React 19
├── metadata.json                # Metadados da aplicação no AI Studio
├── package.json                 # Dependências e scripts de automação
├── tsconfig.json                # Configuração de compilação estrita
└── vite.config.ts               # Bundler Vite configurado para porta 3000
```

---

## 🚀 7. Como Executar o Projeto

### Pré-requisitos
* Node.js v20+ ou runtime compatível (Bun / npm)

### Instalação de Dependências
```bash
npm install
```

### Modo de Desenvolvimento
```bash
npm run dev
```
O servidor iniciará em `http://localhost:3000`.

### Verificação de Tipos e Lint
```bash
npm run lint
```

### Build para Produção
```bash
npm run build
```

---

## 🔒 8. Privacidade & LGPD Condominial

Em total conformidade com a **Lei Geral de Proteção de Dados (Lei nº 13.709/2018)**:
* Dados de contato e e-mails de condôminos são mantidos sob custódia estrita da administração.
* Relatórios públicos e balancetes exibem apenas a numeração da unidade autônoma (101 a 304), preservando a privacidade individual dos moradores.

---

*Condomínio Residencial Sevilla • Gestão do Síndico-Programador • sevillacond@gmail.com*
