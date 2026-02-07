import React, { useState } from 'react';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  DollarSign,
  ChevronRight,
  TrendingUp,
  User
} from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { DailyReportModal } from '../components/modals/DailyReportModal';

export default function ReportsHistoryView({ pastClosures }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Ordenar reportes: El más reciente primero
  const sortedClosures = [...(pastClosures || [])].sort((a, b) => {
    // Asumiendo formato DD/MM/AAAA, convertimos a Date para ordenar
    const dateA = a.date.split('/').reverse().join('-');
    const dateB = b.date.split('/').reverse().join('-');
    // Si la fecha es igual, comparar por ID (que tiene timestamp)
    if (dateA === dateB) {
        // Extraer timestamp del ID si es posible (id: "rep-12345678")
        const timeA = parseInt(a.id.split('-')[1]) || 0;
        const timeB = parseInt(b.id.split('-')[1]) || 0;
        return timeB - timeA;
    }
    return new Date(dateB) - new Date(dateA);
  });

  // Filtrado simple por fecha o usuario
  const filteredClosures = sortedClosures.filter(report => 
    report.date.includes(searchTerm) || 
    report.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 relative">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FileText className="text-fuchsia-600" /> Registro de Cierres
           </h1>
           <p className="text-sm text-slate-500 mt-1">Historial de reportes diarios y balances de caja.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por fecha (DD/MM/AAAA)..."
            className="w-full rounded-xl border border-gray-200 pl-10 p-2.5 bg-white focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTA DE REPORTES */}
      <div className="flex-1 overflow-y-auto">
        {filteredClosures.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <FileText size={64} className="mb-4" />
            <p>No hay reportes registrados aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClosures.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="bg-white border border-gray-200 rounded-xl p-0 hover:shadow-lg hover:border-fuchsia-300 transition-all text-left group overflow-hidden flex flex-col"
              >
                {/* Header Card: Fecha y Usuario */}
                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 text-fuchsia-700 font-bold mb-1">
                      <Calendar size={16} />
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={12} />
                      <span>{report.openTime} - {report.closeTime}</span>
                    </div>
                  </div>
                  <div className="bg-slate-200 text-slate-600 p-1.5 rounded-lg">
                    <FileText size={18} />
                  </div>
                </div>

                {/* Body Card: Métricas Clave */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Ventas</span>
                    <span className="text-xl font-black text-slate-800">${formatPrice(report.totalSales)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-gray-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Operaciones</p>
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-600">
                        <TrendingUp size={12} /> {report.salesCount}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Ganancia Neta</p>
                      <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                        <DollarSign size={12} /> ${formatPrice(report.netProfit)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Card: Responsable */}
                <div className="px-4 py-3 bg-slate-50 border-t border-gray-100 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <User size={12} />
                    {report.user}
                  </div>
                  <span className="text-fuchsia-600 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver Detalle <ChevronRight size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DETALLE (VISOR TIPO PDF) */}
      <DailyReportModal 
        isOpen={!!selectedReport} 
        onClose={() => setSelectedReport(null)} 
        report={selectedReport} 
      />

    </div>
  );
}