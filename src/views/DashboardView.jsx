import React, { useMemo, useState, useEffect } from 'react';
import {
  TrendingUp,
  Edit2,
  DollarSign,
  Package,
  BarChart3,
  Calendar,
  CalendarRange,
  Clock,
  GripVertical,
  Info,
  Percent,
  Layers,
  Save,       // Icono Guardar
  RotateCcw,  // Icono Restaurar
  Lock        // Icono Bloqueo (visual)
} from 'lucide-react';
import { PAYMENT_METHODS } from '../data';

// Órdenes por defecto (Constantes)
const DEFAULT_BOTTOM_ORDER = ['chart', 'payments', 'topProducts', 'lowStock'];
const DEFAULT_TOP_ORDER = ['sales', 'revenue', 'net', 'opening', 'average', 'placeholder'];

export default function DashboardView({
  openingBalance,
  totalSales,
  salesCount,
  currentUser,
  setTempOpeningBalance,
  setIsOpeningBalanceModalOpen,
  transactions,
  dailyLogs,
  inventory,
}) {
  // =====================================================
  // 1. ESTADOS Y PERMISOS
  // =====================================================
  
  // Verificación de Rol
  const isAdmin = currentUser?.role === 'admin';

  // FILTRO GLOBAL UNIFICADO
  const [globalFilter, setGlobalFilter] = useState('day'); 

  // Switch Productos / Categorías
  const [rankingMode, setRankingMode] = useState('products');

  // Estado para Tooltip del Gráfico
  const [hoveredChartIndex, setHoveredChartIndex] = useState(null);

  // --- GESTIÓN DE ORDEN Y PERSISTENCIA ---

  // Inicializar estado leyendo de LocalStorage o usando Default
  const [widgetOrder, setWidgetOrder] = useState(() => {
    const saved = localStorage.getItem('party_dashboard_order_bottom');
    return saved ? JSON.parse(saved) : DEFAULT_BOTTOM_ORDER;
  });

  const [topWidgetOrder, setTopWidgetOrder] = useState(() => {
    const saved = localStorage.getItem('party_dashboard_order_top');
    return saved ? JSON.parse(saved) : DEFAULT_TOP_ORDER;
  });

  // Estado para detectar cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Items arrastrados
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedTopItem, setDraggedTopItem] = useState(null);

  // Efecto para detectar si hay cambios respecto a lo guardado
  useEffect(() => {
    const savedBottom = localStorage.getItem('party_dashboard_order_bottom');
    const savedTop = localStorage.getItem('party_dashboard_order_top');
    
    const currentBottomStr = JSON.stringify(widgetOrder);
    const currentTopStr = JSON.stringify(topWidgetOrder);

    const savedBottomStr = savedBottom || JSON.stringify(DEFAULT_BOTTOM_ORDER);
    const savedTopStr = savedTop || JSON.stringify(DEFAULT_TOP_ORDER);

    if (currentBottomStr !== savedBottomStr || currentTopStr !== savedTopStr) {
        setHasUnsavedChanges(true);
    } else {
        setHasUnsavedChanges(false);
    }
  }, [widgetOrder, topWidgetOrder]);

  // Funciones de Guardado y Restauración
  const handleSaveLayout = () => {
    localStorage.setItem('party_dashboard_order_bottom', JSON.stringify(widgetOrder));
    localStorage.setItem('party_dashboard_order_top', JSON.stringify(topWidgetOrder));
    setHasUnsavedChanges(false);
    // Feedback visual simple (alert o toast custom)
    // alert("Distribución guardada correctamente"); 
  };

  const handleRestoreLayout = () => {
    // Restaurar a lo último guardado en LS, o al default si no hay nada
    const savedBottom = localStorage.getItem('party_dashboard_order_bottom');
    const savedTop = localStorage.getItem('party_dashboard_order_top');
    
    setWidgetOrder(savedBottom ? JSON.parse(savedBottom) : DEFAULT_BOTTOM_ORDER);
    setTopWidgetOrder(savedTop ? JSON.parse(savedTop) : DEFAULT_TOP_ORDER);
  };

  // =====================================================
  // 2. LOGICA CENTRALIZADA DE DATOS (CORE)
  // =====================================================

  const todayStr = useMemo(() => new Date().toLocaleDateString('es-AR'), []);
  const currentHour = new Date().getHours();

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const cleanDate = dateStr.split(',')[0].trim(); 
    const [day, month, year] = cleanDate.split('/').map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  const isVentaLog = (log) => {
    const action = log.action || '';
    return action === 'Venta Realizada' || action === 'Nueva Venta';
  };

  const getProductCost = (productId) => {
    if (!inventory) return 0;
    const product = inventory.find(p => p.id === productId);
    return product ? (Number(product.purchasePrice) || 0) : 0;
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const isInRange = (dateObj) => {
      if (!dateObj) return false;
      const dateStr = dateObj.toLocaleDateString('es-AR');
      
      if (globalFilter === 'day') {
        return dateStr === todayStr;
      }
      if (globalFilter === 'week') {
        const diffTime = now - dateObj;
        const diffDays = Math.floor(diffTime / oneDay);
        return diffDays >= 0 && diffDays < 7;
      }
      if (globalFilter === 'month') {
        return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
      }
      return false;
    };

    const validTransactions = [];
    const processedTxIds = new Set();

    (transactions || []).forEach(tx => {
      if (tx.status === 'voided') return;
      const txDate = parseDate(tx.date);
      if (isInRange(txDate)) {
        validTransactions.push({
          source: 'tx',
          id: tx.id,
          date: txDate,
          time: tx.time,
          total: Number(tx.total) || 0,
          payment: tx.payment,
          items: tx.items || []
        });
        processedTxIds.add(tx.id);
      }
    });

    (dailyLogs || []).forEach(log => {
      if (isVentaLog(log) && log.details) {
        const txId = log.details.transactionId;
        if (!processedTxIds.has(txId)) {
          const logDate = parseDate(log.date);
          if (isInRange(logDate)) {
            let timeStr = "00:00";
            if (log.timestamp) timeStr = log.timestamp;
            
            validTransactions.push({
              source: 'log',
              id: txId || log.id,
              date: logDate,
              time: timeStr,
              total: Number(log.details.total) || 0,
              payment: log.details.payment || 'Efectivo',
              items: log.details.items || []
            });
          }
        }
      }
    });

    return validTransactions;
  }, [globalFilter, transactions, dailyLogs, todayStr]);

  // =====================================================
  // 3. CÁLCULO DE ESTADÍSTICAS DERIVADAS
  // =====================================================

  const kpiStats = useMemo(() => {
    let gross = 0;
    let net = 0;
    let count = filteredData.length;

    filteredData.forEach(tx => {
      gross += tx.total;
      
      let cost = 0;
      tx.items.forEach(item => {
        const qty = Number(item.qty) || Number(item.quantity) || 0;
        const pCost = getProductCost(item.id || item.productId);
        cost += pCost * qty;
      });
      net += (tx.total - cost);
    });

    return { gross, net, count };
  }, [filteredData, inventory]);

  const averageTicket = kpiStats.count > 0 ? kpiStats.gross / kpiStats.count : 0;

  const chartData = useMemo(() => {
    if (globalFilter === 'day') {
      const ranges = [
        { label: '9-12', start: 9, end: 12, sales: 0, count: 0 },
        { label: '12-14', start: 12, end: 14, sales: 0, count: 0 },
        { label: '14-17', start: 14, end: 17, sales: 0, count: 0 },
        { label: '17-21', start: 17, end: 21, sales: 0, count: 0 },
        { label: '21+', start: 21, end: 24, sales: 0, count: 0 },
      ];

      filteredData.forEach(tx => {
        if (!tx.time) return;
        const hour = parseInt(tx.time.split(':')[0], 10);
        const range = ranges.find(r => hour >= r.start && hour < r.end);
        if (range) {
          range.sales += tx.total;
          range.count += 1;
        }
      });

      return ranges.map(r => ({ ...r, isCurrent: currentHour >= r.start && currentHour < r.end }));
    }

    const daysMap = new Map();
    const now = new Date();
    const daysToShow = globalFilter === 'week' ? 7 : 30;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-AR');
      const label = `${d.getDate()}/${d.getMonth()+1}`;
      const dayName = d.toLocaleDateString('es-AR', { weekday: 'short' });
      
      daysMap.set(key, { 
        label, 
        dayName, 
        sales: 0, 
        count: 0, 
        fullDate: key,
        isToday: i === 0 
      });
    }

    filteredData.forEach(tx => {
      const key = tx.date.toLocaleDateString('es-AR');
      if (daysMap.has(key)) {
        const entry = daysMap.get(key);
        entry.sales += tx.total;
        entry.count += 1;
      }
    });

    const dayArray = Array.from(daysMap.values());
    
    if (globalFilter === 'month') {
        const weeks = [
            { label: 'Sem 1', sales: 0, count: 0, isCurrent: false },
            { label: 'Sem 2', sales: 0, count: 0, isCurrent: false },
            { label: 'Sem 3', sales: 0, count: 0, isCurrent: false },
            { label: 'Sem 4+', sales: 0, count: 0, isCurrent: true },
        ];
        
        dayArray.forEach((d, idx) => {
            const weekIdx = Math.min(Math.floor(idx / 7), 3);
            weeks[weekIdx].sales += d.sales;
            weeks[weekIdx].count += d.count;
        });
        return weeks;
    }

    return dayArray;
  }, [globalFilter, filteredData, currentHour]);

  const maxSales = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.sales));
    return max > 0 ? max : 1;
  }, [chartData]);

  const paymentStats = useMemo(() => {
    return PAYMENT_METHODS.map(method => {
      const total = filteredData
        .filter(tx => tx.payment === method.id)
        .reduce((sum, tx) => sum + tx.total, 0);
      return { ...method, total };
    });
  }, [filteredData]);

  const rankingStats = useMemo(() => {
    const statsMap = {}; 

    filteredData.forEach(tx => {
      tx.items.forEach(item => {
        const qty = Number(item.qty) || Number(item.quantity) || 0;
        const revenue = (Number(item.price) || 0) * qty;

        if (rankingMode === 'products') {
            const key = item.title || 'Desconocido';
            if (!statsMap[key]) statsMap[key] = { name: key, qty: 0, revenue: 0 };
            statsMap[key].qty += qty;
            statsMap[key].revenue += revenue;
          } else {
              // LÓGICA CORREGIDA: Priorizar datos del inventario actual
              let cats = [];
              
              // 1. Buscar producto actualizado en inventario (para corregir bugs históricos)
              const liveProduct = inventory ? inventory.find(p => p.id === item.id) : null;
              
              if (liveProduct) {
                  if (Array.isArray(liveProduct.categories) && liveProduct.categories.length > 0) {
                      cats = liveProduct.categories;
                  } else if (liveProduct.category) {
                      cats = [liveProduct.category];
                  }
              }

              // 2. Si no se encontró (producto borrado), usar dato histórico de la venta
              if (cats.length === 0) {
                  if (Array.isArray(item.categories) && item.categories.length > 0) {
                      cats = item.categories;
                  } else if (item.category) {
                      cats = [item.category];
                  }
              }

              // 3. Fallback final
              if (cats.length === 0) {
                  cats = ['Sin Categoría'];
              }

              cats.forEach(cat => {
                  if (!statsMap[cat]) statsMap[cat] = { name: cat, qty: 0, revenue: 0 };
                  statsMap[cat].qty += qty;
                  statsMap[cat].revenue += revenue;
              });
          }
        });
      });

    return Object.values(statsMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
  }, [filteredData, rankingMode, inventory]); // Agregado inventory a dependencias

  const lowStockProducts = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((p) => p.stock < 10).sort((a,b) => a.stock - b.stock).slice(0, 5);
  }, [inventory]);

  // =====================================================
  // 4. RENDERIZADORES
  // =====================================================
  
  const getEmptyStateMessage = () => {
    switch (globalFilter) {
      case 'day': return 'Sin ventas hoy';
      case 'week': return 'Sin ventas esta semana';
      case 'month': return 'Sin ventas este mes';
      default: return 'Sin datos';
    }
  };

  const GlobalTimeSwitch = () => (
    <div className="flex gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
      {[
        { id: 'day', label: 'Diario' },
        { id: 'week', label: 'Semanal' },
        { id: 'month', label: 'Mensual' }
      ].map((opt) => (
        <button
          key={opt.id}
          onClick={() => setGlobalFilter(opt.id)}
          className={`text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
            globalFilter === opt.id
              ? 'bg-slate-800 text-white font-bold shadow-md'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          {opt.id === 'day' && <Clock size={12} />}
          {opt.id === 'week' && <Calendar size={12} />}
          {opt.id === 'month' && <CalendarRange size={12} />}
          {opt.label}
        </button>
      ))}
    </div>
  );

  // --- BOTONERA DE GESTIÓN DE LAYOUT (Solo Admin) ---
  const LayoutManagerControls = () => {
    if (!isAdmin || !hasUnsavedChanges) return null;

    return (
      <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
          {/* Botón Restaurar: Blanco/Gris */}
          <button
              onClick={handleRestoreLayout}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition-all"
              title="Deshacer cambios (Restaurar)"
          >
              <RotateCcw size={16} />
          </button>

          {/* Botón Guardar: Azul Sólido */}
          <button
              onClick={handleSaveLayout}
              className="p-2 rounded-lg bg-blue-600 text-white border border-blue-600 shadow-md hover:bg-blue-700 transition-all"
              title="Guardar nueva distribución"
          >
              <Save size={16} />
          </button>
      </div>
  );
};

  const renderTopWidget = (key) => {
    const getPeriodText = (prefix) => {
        if (globalFilter === 'day') return `${prefix} del Dia`;
        if (globalFilter === 'week') return `${prefix} Semanal`;
        return `${prefix} Mensual`;
    };

    switch (key) {
      case 'sales':
        return (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="flex justify-between items-start z-10">
              <span className="text-[15px] font-bold text-blue-400 uppercase">{getPeriodText('Ventas')}</span>
              <Package size={14} className="text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-blue-600 z-10">{kpiStats.count}</span>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-400"></div>
          </div>
        );
      case 'revenue':
        return (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-fuchsia-100 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="flex justify-between items-start z-10">
              <span className="text-[15px] font-bold text-fuchsia-400 uppercase">{getPeriodText('Ingreso')}</span>
              <TrendingUp size={14} className="text-fuchsia-500" />
            </div>
            <span className="text-2xl font-bold text-fuchsia-600 z-10">${kpiStats.gross.toLocaleString()}</span>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-400 to-fuchsia-600"></div>
          </div>
        );
      case 'net':
        return (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="flex justify-between items-start z-10">
              <span className="text-[15px] font-bold text-emerald-500 uppercase">Ganancia Neta</span>
              <DollarSign size={14} className="text-emerald-500" />
            </div>
            <span className="text-2xl font-bold text-emerald-600 z-10">${kpiStats.net.toLocaleString()}</span>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-400"></div>
          </div>
        );
      case 'opening':
        return (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="flex justify-between items-start mb-1 z-10">
              <span className="text-[15px] font-bold text-slate-400 uppercase">Caja Inicial</span>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    setTempOpeningBalance(String(openingBalance));
                    setIsOpeningBalanceModalOpen(true);
                  }}
                  className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-1 rounded transition"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
            <span className="text-2xl font-bold text-slate-800 z-10">${openingBalance.toLocaleString()}</span>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-300"></div>
          </div>
        );
      case 'average':
        return (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="flex justify-between items-start z-10">
              <span className="text-[15px] font-bold text-indigo-400 uppercase">Ticket Promedio</span>
              <Percent size={14} className="text-indigo-500" />
            </div>
            <span className="text-2xl font-bold text-indigo-600 z-10">${Math.round(averageTicket).toLocaleString()}</span>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400"></div>
          </div>
        );
      case 'placeholder':
        return (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-dashed border-slate-300 relative overflow-hidden flex flex-col justify-center items-center text-slate-300 h-32">
            <Info size={24} className="mb-2 opacity-50"/>
            <span className="text-xs text-center font-medium">Espacio Disponible</span>
          </div>
        );
      default: return null;
    }
  };

  const renderWidget = (widgetKey) => {
    switch(widgetKey) {
      case 'chart':
        return (
          <div className="bg-white p-5 rounded-xl shadow-sm border h-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={18} className="text-fuchsia-500" />
                  Evolución de Ventas
                </h3>
                <span className="text-xs text-slate-400">
                    {globalFilter === 'day' ? 'Por horario' : globalFilter === 'week' ? 'Últimos 7 días' : 'Por semana'}
                </span>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex flex-col justify-between pr-2 py-1 text-right" style={{ height: '180px', minWidth: '50px' }}>
                <span className="text-[9px] text-slate-400">${maxSales.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400">${Math.round(maxSales/2).toLocaleString()}</span>
                <span className="text-[9px] text-slate-400">$0</span>
              </div>
              
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '180px' }}>
                  <div className="border-t border-slate-100"></div>
                  <div className="border-t border-dashed border-slate-100"></div>
                  <div className="border-t border-slate-200"></div>
                </div>
                
                {!chartData.some(d => d.sales > 0) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/60 backdrop-blur-[1px]">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-white px-2 py-1 rounded border">
                      {getEmptyStateMessage()}
                    </span>
                  </div>
                )}

                <div className="flex items-end justify-around gap-2 relative" style={{ height: '180px' }}>
                  {chartData.map((item, idx) => {
                    const heightPercent = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
                    const isHovered = hoveredChartIndex === idx;

                    return (
                      <div 
                        key={idx} 
                        className="flex-1 h-full flex flex-col items-center justify-end relative group"
                        onMouseEnter={() => setHoveredChartIndex(idx)}
                        onMouseLeave={() => setHoveredChartIndex(null)}
                      >
                        <div 
                          className={`absolute -top-10 left-1/2 -translate-x-1/2 transition-all duration-200 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-30 shadow-lg pointer-events-none ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        >
                          <p className="font-bold">${item.sales.toLocaleString()}</p>
                          <p className="text-slate-300">{item.count} ops</p>
                        </div>
                        
                        <div 
                            className={`w-full max-w-[40px] rounded-t transition-all duration-500 ${
                              item.isCurrent ? 'bg-fuchsia-500' : item.sales > 0 ? 'bg-fuchsia-300' : 'bg-slate-100'
                            } group-hover:bg-fuchsia-400`} 
                            style={{ height: item.sales > 0 ? `${Math.max(heightPercent, 5)}%` : '4px' }} 
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-around gap-2 mt-2 pt-2 border-t border-slate-200">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <p className={`text-[9px] font-bold ${item.isCurrent ? 'text-fuchsia-600' : 'text-slate-500'}`}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="bg-white p-5 rounded-xl shadow-sm border h-full">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <DollarSign size={18} className="text-green-500" />
              Pagos ({globalFilter === 'day' ? 'Hoy' : globalFilter === 'week' ? 'Semana' : 'Mes'})
            </h3>
            <div className="space-y-3">
              {paymentStats.map((m) => {
                const totalFiltered = kpiStats.gross;
                const percent = totalFiltered > 0 ? (m.total / totalFiltered) * 100 : 0;
                
                return (
                  <div key={m.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-600 flex items-center gap-2">
                        {m.label}
                        {m.total > 0 && <span className="text-[9px] text-slate-400">({Math.round(percent)}%)</span>}
                      </span>
                      <span className={`font-bold ${m.total > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                        ${m.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ${m.total > 0 ? 'bg-green-500' : 'bg-transparent'}`} 
                        style={{ width: `${percent}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {kpiStats.gross === 0 && (
                <p className="text-center text-xs text-slate-400 mt-6 italic">No hay pagos registrados en este período</p>
            )}
          </div>
        );

      case 'topProducts':
        return (
          <div className="bg-white p-5 rounded-xl shadow-sm border h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {rankingMode === 'products' ? <TrendingUp size={18} className="text-amber-500" /> : <Layers size={18} className="text-indigo-500" />}
                Más Vendidos
              </h3>
              
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                 <button 
                    onClick={() => setRankingMode('products')}
                    className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${rankingMode === 'products' ? 'bg-white shadow text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    Productos
                 </button>
                 <button 
                    onClick={() => setRankingMode('categories')}
                    className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${rankingMode === 'categories' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    Categorias
                 </button>
              </div>
            </div>

            {rankingStats.length > 0 ? (
              <div className="space-y-2">
                {rankingStats.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        idx === 1 ? 'bg-slate-200 text-slate-600' : 
                        idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700 truncate">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-800">{item.qty} un.</p>
                      <p className="text-[9px] text-slate-400">${item.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <Package size={32} className="text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">{getEmptyStateMessage()}</p>
              </div>
            )}
          </div>
        );

      case 'lowStock':
        return (
          <div className="bg-white p-5 rounded-xl shadow-sm border h-full">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Package size={18} className="text-red-500" />
              Alerta de Stock
              {lowStockProducts.length > 0 && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">{lowStockProducts.length}</span>}
            </h3>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  return (
                    <div key={product.id} className={`flex items-center justify-between p-2 rounded-lg border ${isOutOfStock ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{product.title}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isOutOfStock ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                        {isOutOfStock ? 'AGOTADO' : `${product.stock} un.`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Package size={20} className="text-green-600" />
                 </div>
                 <p className="text-xs font-bold text-green-700">Stock Saludable</p>
                 <p className="text-[10px] text-green-600">No hay productos críticos</p>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  // =====================================================
  // 5. RENDER PRINCIPAL
  // =====================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* HEADER & CONTROLES */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
            <p className="text-xs text-slate-400">Resumen de operaciones en tiempo real</p>
        </div>
        
        {/* Controles Agrupados */}
        <div className="flex flex-wrap items-center gap-3">
             <LayoutManagerControls />
             <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
             <GlobalTimeSwitch />
        </div>
      </div>

      {/* Tarjetas principales (KPIs) - Draggable condicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {topWidgetOrder.map((widgetKey, index) => (
          <div
            key={widgetKey}
            draggable={isAdmin} // Solo admin puede arrastrar
            onDragStart={(e) => {
                if (!isAdmin) return;
                setDraggedTopItem(widgetKey);
                e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
                e.preventDefault();
                if (!isAdmin || draggedTopItem === widgetKey) return;
                const currentIdx = topWidgetOrder.indexOf(draggedTopItem);
                if (currentIdx !== -1 && currentIdx !== index) {
                     const newOrder = [...topWidgetOrder];
                     newOrder.splice(currentIdx, 1);
                     newOrder.splice(index, 0, draggedTopItem);
                     setTopWidgetOrder(newOrder);
                }
            }}
            onDrop={(e) => {
                e.preventDefault();
                setDraggedTopItem(null);
            }}
            className={`transition-all duration-200 ${
              draggedTopItem === widgetKey ? 'opacity-40 scale-95' : 'opacity-100'
            }`}
          >
             <div className="group relative h-full">
                {/* Drag Handle Top - Solo visible para admin en hover */}
                {isAdmin && (
                    <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 bg-white/80 p-1 rounded backdrop-blur-sm">
                        <GripVertical size={14} />
                    </div>
                )}
                {renderTopWidget(widgetKey)}
             </div>
          </div>
        ))}
      </div>

      {/* Gráficos y Widgets Inferiores - Draggable condicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {widgetOrder.map((widgetKey, index) => (
          <div
            key={widgetKey}
            draggable={isAdmin} // Solo admin puede arrastrar
            onDragStart={(e) => {
                if (!isAdmin) return;
                setDraggedItem(widgetKey);
                e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
                e.preventDefault();
                if (!isAdmin || draggedItem === widgetKey) return;
                 const currentIdx = widgetOrder.indexOf(draggedItem);
                 if (currentIdx !== -1 && currentIdx !== index) {
                     const newOrder = [...widgetOrder];
                     newOrder.splice(currentIdx, 1);
                     newOrder.splice(index, 0, draggedItem);
                     setWidgetOrder(newOrder);
                 }
            }}
            onDrop={(e) => {
                e.preventDefault();
                setDraggedItem(null);
            }}
            className={`transition-all duration-200 h-full ${
              draggedItem === widgetKey ? 'opacity-40 scale-95 border-dashed border-2 border-slate-300 rounded-xl' : ''
            }`}
          >
            <div className="group relative h-full">
              {/* Drag Handle Bottom - Solo visible para admin */}
              {isAdmin ? (
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 bg-white/80 p-1 rounded backdrop-blur-sm">
                    <GripVertical size={16} />
                </div>
              ) : (
                // Indicador visual opcional para vendedor (bloqueo)
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-50 transition-opacity text-slate-200 pointer-events-none">
                    <Lock size={16} />
                </div>
              )}
              {renderWidget(widgetKey)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}