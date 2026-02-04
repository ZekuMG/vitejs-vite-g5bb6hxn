import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Package,
  X,
  SlidersHorizontal,
  ImageIcon,
  AlertTriangle,
  LayoutGrid,
  List,
  ScanBarcode
} from 'lucide-react';
import { PAYMENT_METHODS } from '../data';

export default function POSView({
  inventory,
  categories,
  addToCart,
  cart,
  removeFromCart,
  updateCartItemQty,
  selectedPayment,
  setSelectedPayment,
  installments,
  setInstallments,
  calculateTotal,
  handleCheckout,
  posSearch,
  setPosSearch
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // --- ESTADOS DE VISTA ---
  const [posViewMode, setPosViewMode] = useState('grid');
  const [gridColumns, setGridColumns] = useState(4); 
  const [showGridMenu, setShowGridMenu] = useState(false);

  // =====================================================
  // HELPER: Obtener stock efectivo (resta items en carrito)
  // =====================================================
  const getEffectiveStock = (productId, originalStock) => {
    const itemInCart = cart.find(item => item.id === productId);
    const qtyInCart = itemInCart ? itemInCart.quantity : 0;
    return originalStock - qtyInCart;
  };

  // Filtrado
  const filteredProducts = inventory.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(posSearch.toLowerCase()) ||
      String(product.id).includes(posSearch) ||
      (product.barcode && product.barcode.includes(posSearch));
    const matchesCategory =
      selectedCategory === 'Todas' ||
      (Array.isArray(product.categories)
        ? product.categories.includes(selectedCategory)
        : product.category === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((t, i) => t + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
  const total = calculateTotal();

  return (
    <div className="flex h-full overflow-hidden bg-slate-100">
      
      {/* ========================================== */}
      {/* COLUMNA IZQUIERDA: CATÁLOGO DE PRODUCTOS   */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header POS */}
        <div className="p-4 bg-white border-b shrink-0 flex gap-3 items-center z-30 relative">
          
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar producto o escanear..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-medium"
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Selector Categoría */}
          <div className="w-40 relative hidden sm:block">
            <select
              className="w-full px-3 py-3 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-fuchsia-500 appearance-none cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Todas">Categorías</option>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* 1. SLIDER (Solo en Grid) */}
            {posViewMode === 'grid' && (
              <div className="relative">
                <button
                  onClick={() => setShowGridMenu(!showGridMenu)}
                  className={`p-3 rounded-xl border transition-all ${showGridMenu ? 'bg-slate-100 ring-2 ring-slate-200' : 'bg-white hover:bg-slate-50'}`}
                  title="Ajustar tamaño"
                >
                  <SlidersHorizontal size={20} className="text-slate-600" />
                </button>

                {/* Popover Slider */}
                {showGridMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowGridMenu(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase">Tamaño de Tarjetas</span>
                        <span className="text-xs font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-1 rounded-md border border-fuchsia-100">
                          {gridColumns}x
                        </span>
                      </div>
                      
                      {/* Slider visual */}
                      <div className="relative h-6 flex items-center">
                        <input
                            type="range"
                            min="4"
                            max="10"
                            step="1"
                            value={gridColumns}
                            onChange={(e) => setGridColumns(Number(e.target.value))}
                            className="custom-range w-full"
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono uppercase">
                        <span>Grande</span>
                        <span>Compacto</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. SWITCH VISTA (Grid/List) */}
            <div className="flex bg-slate-100 p-1 rounded-xl border h-[46px] items-center">
              <button
                onClick={() => setPosViewMode('grid')}
                className={`p-2 rounded-lg transition-all h-full flex items-center ${
                  posViewMode === 'grid'
                    ? 'bg-white text-fuchsia-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setPosViewMode('list')}
                className={`p-2 rounded-lg transition-all h-full flex items-center ${
                  posViewMode === 'list'
                    ? 'bg-white text-fuchsia-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Vista Lista"
              >
                <List size={20} />
              </button>
            </div>

          </div>
        </div>

        {/* Área de Productos */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-100/50">
          
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-10">
              <Package size={48} className="mb-3 opacity-50" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <>
              {/* --- VISTA GRID --- */}
              {posViewMode === 'grid' ? (
                <div 
                  className="grid gap-3 transition-all duration-300"
                  style={{
                    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
                  }}
                >
                  {filteredProducts.map((product) => {
                    // ✅ STOCK EN TIEMPO REAL
                    const effectiveStock = getEffectiveStock(product.id, product.stock);
                    const isOutOfStock = effectiveStock <= 0;
                    
                    // Semáforo de stock (usa effectiveStock)
                    let stockBadgeClass = 'bg-white/90 text-slate-600';
                    if (effectiveStock > 10) stockBadgeClass = 'bg-green-100 text-green-700';
                    else if (effectiveStock > 5) stockBadgeClass = 'bg-amber-100 text-amber-700';
                    else if (effectiveStock > 0) stockBadgeClass = 'bg-red-100 text-red-700';
                    else stockBadgeClass = 'bg-slate-200 text-slate-500';

                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className={`group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all text-left flex flex-col relative ${isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-fuchsia-300 active:scale-[0.98]'}`}
                      >
                        {/* Imagen */}
                        <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden w-full">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200/50 p-2 text-center group-hover:bg-slate-200 transition-colors">
                              <span className={`font-bold text-slate-500 uppercase leading-tight ${gridColumns > 6 ? 'text-[10px]' : 'text-xs'}`}>
                                {product.title}
                              </span>
                            </div>
                          )}
                          {/* Badge Stock - USA effectiveStock */}
                          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm backdrop-blur-sm ${stockBadgeClass}`}>
                            {isOutOfStock ? 'SIN STOCK' : `${effectiveStock} u.`}
                          </div>
                        </div>

                        {/* Info */}
                        <div className={`flex flex-col flex-1 w-full ${gridColumns > 6 ? 'p-2' : 'p-3'}`}>
                          {gridColumns <= 7 && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 truncate block">
                              {Array.isArray(product.categories) ? product.categories[0] : product.category}
                            </span>
                          )}
                          <h3 className={`font-bold text-slate-800 leading-snug mb-1 line-clamp-2 ${gridColumns > 6 ? 'text-[11px]' : 'text-sm'}`}>
                            {product.title}
                          </h3>
                          <div className="mt-auto pt-2 flex items-end justify-between">
                            <span className={`font-bold text-fuchsia-600 ${gridColumns > 6 ? 'text-sm' : 'text-lg'}`}>
                              ${product.price}
                            </span>
                            <div className={`w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:bg-fuchsia-600 transition-colors ${gridColumns > 8 || isOutOfStock ? 'hidden' : 'flex'}`}>
                              <Plus size={12} />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* --- VISTA LISTA --- */
                <div className="flex flex-col gap-2">
                  {filteredProducts.map((product) => {
                    // ✅ STOCK EN TIEMPO REAL
                    const effectiveStock = getEffectiveStock(product.id, product.stock);
                    const isOutOfStock = effectiveStock <= 0;
                    
                    // Semáforo de stock (Texto) - usa effectiveStock
                    let stockClass = 'text-slate-500';
                    if (effectiveStock > 10) stockClass = 'text-green-600';
                    else if (effectiveStock > 5) stockClass = 'text-amber-600';
                    else if (effectiveStock > 0) stockClass = 'text-red-600';
                    else stockClass = 'text-slate-400';

                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className={`flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all text-left group ${
                          isOutOfStock 
                            ? 'opacity-60 grayscale cursor-not-allowed bg-slate-50' 
                            : 'hover:border-fuchsia-300 active:scale-[0.99]'
                        }`}
                      >
                        {/* Imagen Mini */}
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border relative">
                          {product.image ? (
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-[8px] font-bold text-slate-500 p-1 text-center leading-none">
                              {product.title.slice(0, 8)}..
                            </div>
                          )}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <X size={16} className="text-red-500"/>
                            </div>
                          )}
                        </div>

                        {/* Info Central */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{product.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold border border-slate-200">
                                {Array.isArray(product.categories) ? product.categories[0] : product.category}
                            </span>
                            {product.barcode && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                <ScanBarcode size={10} /> {product.barcode}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Precio y Stock - USA effectiveStock */}
                        <div className="text-right flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Stock</p>
                            <p className={`text-xs font-bold ${stockClass}`}>
                              {isOutOfStock ? 'AGOTADO' : `${effectiveStock} u.`}
                            </p>
                          </div>
                          
                          <div className="w-20 text-right">
                            <p className="font-bold text-lg text-fuchsia-600">${product.price}</p>
                          </div>

                          {/* Botón + */}
                          {!isOutOfStock && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                              <Plus size={16} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* COLUMNA DERECHA: CARRITO DE COMPRAS (FIJO) */}
      {/* ========================================== */}
      <div className="w-[380px] bg-white border-l flex flex-col shadow-2xl z-20 shrink-0">
        
        {/* Header Carrito */}
        <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-fuchsia-600" /> Pedido Actual
          </h2>
          <span className="bg-fuchsia-100 text-fuchsia-700 text-xs font-bold px-2 py-1 rounded-full">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} items
          </span>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <ShoppingCart size={64} className="mb-4 opacity-50" />
              <p className="font-medium text-slate-400">Carrito vacío</p>
              <p className="text-xs">Escanea o selecciona productos</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-white border rounded-xl shadow-sm hover:border-fuchsia-200 transition-colors group">
                {/* Imagen mini */}
                <div className="w-14 h-14 bg-slate-50 rounded-lg overflow-hidden shrink-0 border">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-400 text-center p-1 leading-none">
                        {item.title.slice(0,12)}..
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-1 leading-tight">{item.title}</h4>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-0.5 border">
                      <button onClick={() => updateCartItemQty(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-red-500 disabled:opacity-50" disabled={item.quantity <= 1}><Minus size={12} /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartItemQty(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-green-500"><Plus size={12} /></button>
                    </div>
                    <p className="font-bold text-slate-800">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totales y Pago */}
        <div className="p-5 bg-slate-50 border-t space-y-4">
          
          {/* Selector de Pago */}
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPayment === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-[10px] font-bold h-16 ${
                    isSelected
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {method.id === 'Efectivo' && <Banknote size={18} className="mb-1" />}
                  {method.id === 'MercadoPago' && <Smartphone size={18} className="mb-1" />}
                  {(method.id === 'Debito' || method.id === 'Credito') && <CreditCard size={18} className="mb-1" />}
                  <span className="text-center leading-tight">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cuotas (Solo Crédito) */}
          {selectedPayment === 'Credito' && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-2 rounded-lg animate-in fade-in slide-in-from-bottom-2">
              <span className="text-xs font-bold text-amber-700 whitespace-nowrap">Cuotas:</span>
              <select
                className="flex-1 bg-white border border-amber-200 text-xs rounded p-1 outline-none font-bold text-slate-700"
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
              >
                <option value={1}>1 pago (10%)</option>
                <option value={3}>3 cuotas</option>
                <option value={6}>6 cuotas</option>
                <option value={12}>12 cuotas</option>
              </select>
            </div>
          )}

          {/* Totales */}
          <div className="space-y-1 pt-2 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {selectedPayment === 'Credito' && (
              <div className="flex justify-between text-xs text-amber-600 font-bold">
                <span>Recargo (10%)</span>
                <span>+${(subtotal * 0.1).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2">
              <span className="text-sm font-bold text-slate-800 uppercase">Total a Pagar</span>
              <span className="text-3xl font-black text-slate-900">${total.toLocaleString()}</span>
            </div>
          </div>

          {/* Botón Cobrar */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            <CheckCircle className="group-hover:scale-110 transition-transform" />
            {cart.length === 0 ? 'CARRITO VACÍO' : 'COBRAR'}
          </button>
        </div>
      </div>
    </div>
  );
}