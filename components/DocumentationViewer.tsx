import React, { useState } from 'react';
import { 
  FileText, Search, Download, Copy, Check, Plus, 
  Calendar, Tag, ShieldCheck
} from 'lucide-react';
import { CondoDocument } from '../types';
import { generateAuditDocumentPDF } from '../services/pdfService';

interface DocumentationViewerProps {
  documents: CondoDocument[];
  onAddDocument: (doc: CondoDocument) => void;
}

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({
  documents,
  onAddDocument
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // Formulário de novo documento
  const [newDoc, setNewDoc] = useState<Partial<CondoDocument>>({
    title: '',
    category: 'ATA_ASSEMBLEIA',
    version: '1.0',
    author: 'Síndico-Programador Sênior',
    summary: '',
    fullText: '',
    tags: []
  });

  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const currentDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const handleCopyText = () => {
    if (!currentDoc) return;
    navigator.clipboard.writeText(currentDoc.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!currentDoc) return;
    generateAuditDocumentPDF(currentDoc.title, currentDoc.fullText);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.fullText) return;
    const docToAdd: CondoDocument = {
      id: `doc-${Date.now()}`,
      title: newDoc.title,
      category: (newDoc.category as any) || 'ATA_ASSEMBLEIA',
      date: new Date().toISOString().split('T')[0],
      version: newDoc.version || '1.0',
      author: newDoc.author || 'Síndico',
      summary: newDoc.summary || newDoc.title,
      fullText: newDoc.fullText,
      tags: newDoc.tags?.length ? newDoc.tags : ['Assembleia', 'Oficial']
    };
    onAddDocument(docToAdd);
    setSelectedDocId(docToAdd.id);
    setIsAddingDoc(false);
    setNewDoc({ title: '', category: 'ATA_ASSEMBLEIA', fullText: '', summary: '' });
  };

  return (
    <div className="space-y-6">
      {/* Topo: Busca, Filtros e Ação */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar em convenção, regimento, atas e laudos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="ALL">Todas Categorias ({documents.length})</option>
            <option value="AUDITORIA_POSSE">Auditoria de Posse</option>
            <option value="REGIMENTO">Regimento Interno</option>
            <option value="CONVENCAO">Convenção Condominial</option>
            <option value="ATA_ASSEMBLEIA">Atas de Assembleia</option>
            <option value="MANUAL_SISTEMA">Manual & Arquitetura</option>
          </select>
        </div>

        <button 
          onClick={() => setIsAddingDoc(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
        >
          <Plus size={16} />
          Nova Ata / Comunicado
        </button>
      </div>

      {/* Layout Split: Lista de Documentos à esquerda, Leitor à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Lista Lateral de Documentos */}
        <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
          {filteredDocs.map(doc => {
            const isSelected = doc.id === currentDoc?.id;
            return (
              <div 
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {doc.category.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    v{doc.version} • {new Date(doc.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h4 className={`text-xs sm:text-sm font-bold tracking-tight mb-1 line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {doc.title}
                </h4>
                <p className={`text-[11px] sm:text-xs line-clamp-2 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {doc.summary}
                </p>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Nenhum documento encontrado com os termos pesquisados.
            </div>
          )}
        </div>

        {/* Leitor Completo do Documento Selecionado */}
        <div className="lg:col-span-8">
          {currentDoc ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Barra de Ações do Documento */}
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/70">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                      {currentDoc.category}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                      {new Date(currentDoc.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {currentDoc.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 pt-1 sm:pt-0">
                  <button 
                    onClick={handleCopyText}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button 
                    onClick={handleExportPDF}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <Download size={14} />
                    <span>Baixar PDF</span>
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 flex items-center gap-1.5 sm:gap-2 flex-wrap bg-white">
                <Tag size={12} className="text-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
                {currentDoc.tags.map(tag => (
                  <span key={tag} className="text-[9px] sm:text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Corpo do Documento */}
              <div className="p-4 sm:p-6 sm:p-8 max-h-[500px] sm:max-h-[600px] overflow-y-auto font-mono text-[11px] sm:text-xs text-slate-700 leading-relaxed bg-slate-50/30 whitespace-pre-wrap select-text">
                {currentDoc.fullText}
              </div>

              {/* Rodapé de Autenticidade do Síndico */}
              <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[10px] sm:text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600 shrink-0" />
                  <span>Documento Oficial Certificado pelo Síndico • Condomínio Residencial Sevilla</span>
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] text-slate-400">HASH: SHA256-VALIDATED</span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              Selecione um documento na barra lateral para visualizar.
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Ata / Comunicado */}
      {isAddingDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight">
                Registrar Documento / Ata Oficial
              </h3>
              <button onClick={() => setIsAddingDoc(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Título do Documento</label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: Ata da Assembleia Geral Extraordinária - Obras Fachada"
                  value={newDoc.title}
                  onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Categoria</label>
                  <select 
                    value={newDoc.category}
                    onChange={e => setNewDoc({...newDoc, category: e.target.value as any})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ATA_ASSEMBLEIA">Ata de Assembleia</option>
                    <option value="AUDITORIA_POSSE">Auditoria de Posse</option>
                    <option value="REGIMENTO">Regimento Interno</option>
                    <option value="CONVENCAO">Convenção Condominial</option>
                    <option value="MANUAL_SISTEMA">Manual Técnico</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Versão / Edição</label>
                  <input 
                    type="text"
                    placeholder="1.0"
                    value={newDoc.version}
                    onChange={e => setNewDoc({...newDoc, version: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Resumo Executivo</label>
                <input 
                  type="text"
                  placeholder="Síntese das deliberações em 1 ou 2 frases"
                  value={newDoc.summary}
                  onChange={e => setNewDoc({...newDoc, summary: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Texto Integral</label>
                <textarea 
                  required
                  rows={7}
                  placeholder="Cole aqui o texto completo da ata, deliberações, quórum de votação e assinaturas..."
                  value={newDoc.fullText}
                  onChange={e => setNewDoc({...newDoc, fullText: e.target.value})}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="w-full sm:flex-1 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Salvar e Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
