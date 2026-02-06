// src/views/DashboardView.jsx
// ♻️ REFACTOR: Lógica de cálculo extraída a hooks/useDashboardData.js
//              Widgets extraídos a components/dashboard/
//              Este archivo conserva: estado UI, drag-and-drop, persistencia de layout

import React, { useState, useEffect } from 'react';
import { GripVertical, Lock } from 'lucide-react';

import useDashboardData from '../hooks/useDashboardData';
import {
  KpiCard,
  SalesChart,
  PaymentBreakdown,
  TopRanking,
  LowStockAlert,
  GlobalTimeSwitch,
  LayoutManagerControls,
} from '../components/dashboard';

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
  const isAdmin = currentUser?.role === 'admin';

  // Filtro global de período
  const [globalFilter, setGlobalFilter] = useState('day');

  // Switch Productos / Categorías
  const [rankingMode, setRankingMode] = useState('products');

  // --- GESTIÓN DE ORDEN Y PERSISTENCIA ---
  const [widgetOrder, setWidgetOrder] = useState(() => {
    const saved = localStorage.getItem('party_dashboard_order_bottom');
    return saved ? JSON.parse(saved) : DEFAULT_BOTTOM_ORDER;
  });

  const [topWidgetOrder, setTopWidgetOrder] = useState(() => {
    const saved = localStorage.getItem('party_dashboard_order_top');
    return saved ? JSON.parse(saved) : DEFAULT_TOP_ORDER;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedTopItem, setDraggedTopItem] = useState(null);

  // Detectar cambios sin guardar
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

  const handleSaveLayout = () => {
    localStorage.setItem('party_dashboard_order_bottom', JSON.stringify(widgetOrder));
    localStorage.setItem('party_dashboard_order_top', JSON.stringify(topWidgetOrder));
    setHasUnsavedChanges(false);
  };

  const handleRestoreLayout = () => {
    const savedBottom = localStorage.getItem('party_dashboard_order_bottom');
    const savedTop = localStorage.getItem('party_dashboard_order_top');
    setWidgetOrder(savedBottom ? JSON.parse(savedBottom) : DEFAULT_BOTTOM_ORDER);
    setTopWidgetOrder(savedTop ? JSON.parse(savedTop) : DEFAULT_TOP_ORDER);
  };

  // =====================================================
  // 2. DATOS CALCULADOS (via custom hook)
  // =====================================================
  const {
    kpiStats,
    averageTicket,
    chartData,
    maxSales,
    paymentStats,
    rankingStats,
    lowStockProducts,
    getEmptyStateMessage,
  } = useDashboardData({ transactions, dailyLogs, inventory, globalFilter, rankingMode });

  // =====================================================
  // 3. RENDERIZADORES DE WIDGETS
  // =====================================================
  const renderWidget = (widgetKey) => {
    switch (widgetKey) {
      case 'chart':
        return (
          <SalesChart
            chartData={chartData}
            maxSales={maxSales}
            globalFilter={globalFilter}
            getEmptyStateMessage={getEmptyStateMessage}
          />
        );
      case 'payments':
        return (
          <PaymentBreakdown
            paymentStats={paymentStats}
            totalGross={kpiStats.gross}
            globalFilter={globalFilter}
          />
        );
      case 'topProducts':
        return (
          <TopRanking
            rankingStats={rankingStats}
            rankingMode={rankingMode}
            setRankingMode={setRankingMode}
            getEmptyStateMessage={getEmptyStateMessage}
          />
        );
      case 'lowStock':
        return <LowStockAlert lowStockProducts={lowStockProducts} />;
      default:
        return null;
    }
  };

  // =====================================================
  // 4. RENDER PRINCIPAL
  // =====================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* HEADER & CONTROLES */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
          <p className="text-xs text-slate-400">Resumen de operaciones en tiempo real</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LayoutManagerControls
            isAdmin={isAdmin}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSaveLayout}
            onRestore={handleRestoreLayout}
          />
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          <GlobalTimeSwitch globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </div>
      </div>

      {/* Tarjetas principales (KPIs) - Draggable condicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {topWidgetOrder.map((widgetKey, index) => (
          <div
            key={widgetKey}
            draggable={isAdmin}
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
              {isAdmin && (
                <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 bg-white/80 p-1 rounded backdrop-blur-sm">
                  <GripVertical size={14} />
                </div>
              )}
              <KpiCard
                widgetKey={widgetKey}
                kpiStats={kpiStats}
                averageTicket={averageTicket}
                openingBalance={openingBalance}
                currentUser={currentUser}
                setTempOpeningBalance={setTempOpeningBalance}
                setIsOpeningBalanceModalOpen={setIsOpeningBalanceModalOpen}
                globalFilter={globalFilter}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos y Widgets Inferiores - Draggable condicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {widgetOrder.map((widgetKey, index) => (
          <div
            key={widgetKey}
            draggable={isAdmin}
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
              {isAdmin ? (
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 bg-white/80 p-1 rounded backdrop-blur-sm">
                  <GripVertical size={16} />
                </div>
              ) : (
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
