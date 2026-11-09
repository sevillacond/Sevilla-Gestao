import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number;
  type: 'neutral' | 'positive' | 'negative' | 'reserve';
  icon: React.ReactNode;
  subtitle?: string;
  badge?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  type, 
  icon,
  subtitle,
  badge
}) => {
  const colorClass = 
    type === 'positive' ? 'text-emerald-700 bg-white border-emerald-200 shadow-sm' :
    type === 'negative' ? 'text-rose-700 bg-white border-rose-200 shadow-sm' :
    type === 'reserve' ? 'text-indigo-700 bg-white border-indigo-200 shadow-sm' :
    'text-slate-800 bg-white border-slate-200 shadow-sm';

  const iconBg = 
    type === 'positive' ? 'bg-emerald-50 text-emerald-600' :
    type === 'negative' ? 'bg-rose-50 text-rose-600' :
    type === 'reserve' ? 'bg-indigo-50 text-indigo-600' :
    'bg-slate-100 text-slate-600';

  return (
    <div className={`p-6 rounded-3xl border ${colorClass} transition-all hover:shadow-md flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className={`p-2.5 rounded-2xl ${iconBg}`}>
            {icon}
          </div>
        </div>

        <div className="text-2xl font-black tracking-tight text-slate-900">
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {badge && (
            <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
              type === 'positive' ? 'bg-emerald-50 text-emerald-700' :
              type === 'negative' ? 'bg-rose-50 text-rose-700' :
              type === 'reserve' ? 'bg-indigo-50 text-indigo-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
