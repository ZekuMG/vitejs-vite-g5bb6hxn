import React from 'react';
import { PartyPopper, Lock, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { USERS } from './data';
import Sidebar from './components/Sidebar';

// Vistas
import DashboardView from './views/DashboardView';
import InventoryView from './views/InventoryView';
import POSView from './views/POSView';
import HistoryView from './views/HistoryView';
import LogsView from './views/LogsView';
import CategoryManagerView from './views/CategoryManagerView';

// Hook de Lógica
import { useAppLogic } from './hooks/useAppLogic';

// Importación CORREGIDA de Modales (para usar namespace Modals.*)
import * as Modals from './components/AppModals';

export default function PartySupplyApp() {
  // Extraemos TODO del hook
  const store = useAppLogic();
  const { 
    currentUser, activeTab, setActiveTab, currentTime, isRegisterClosed, closingTime, 
    transactions, dailyLogs, inventory, categories, 
    openingBalance, cart,
    modals, toggleModal 
  } = store;

  // Calculos derivados simples para el header/views
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const validTransactions = safeTransactions.filter((t) => t && t.status !== 'voided');
  const totalSales = validTransactions.reduce((acc, tx) => acc + (Number(tx.total) || 0), 0);
  const salesCount = validTransactions.length;

  // --- RENDERIZADO LOGIN ---
  if (!currentUser) {
    if (store.loginStep === 'select') {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-100">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center border">
            <div className="flex justify-center mb-4"><div className="p-3 bg-fuchsia-600 rounded-xl shadow-lg"><PartyPopper className="text-white" size={32} /></div></div>
            <h1 className="text-lg font-bold text-slate-800 mb-1">PartyManager</h1>
            <p className="text-slate-500 text-xs mb-6">Selecciona tu usuario</p>
            <div className="space-y-3">
              <button onClick={() => store.handleSelectRole('admin')} className="w-full flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">DU</div>
                <div className="text-left flex-1"><p className="font-bold text-slate-800 text-sm">Dueño</p></div><ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
              </button>
              <button onClick={() => store.handleSelectRole('seller')} className="w-full flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">VE</div>
                <div className="text-left flex-1"><p className="font-bold text-slate-800 text-sm">Vendedor</p></div><ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center border">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => store.setLoginStep('select')} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></button>
            <h1 className="text-lg font-bold text-slate-800">Iniciar Sesión</h1><div className="w-5"></div>
          </div>
          <div className="mb-6 flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${USERS[store.selectedRoleForLogin].role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{USERS[store.selectedRoleForLogin].avatar}</div>
            <p className="font-bold text-slate-700">{USERS[store.selectedRoleForLogin].name}</p>
          </div>
          <form onSubmit={store.handleSubmitLogin} className="space-y-4">
            <div><input autoFocus type="password" placeholder="Contraseña" className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-fuchsia-500 outline-none" value={store.passwordInput} onChange={(e) => store.setPasswordInput(e.target.value)} />{store.loginError && <p className="text-xs text-red-500 mt-2">{store.loginError}</p>}</div>
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 text-sm overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={store.handleLogout} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b h-14 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                {activeTab === 'pos' ? 'Punto de Venta' : activeTab === 'dashboard' ? 'Control de Caja' : activeTab === 'history' ? 'Historial' : activeTab === 'logs' ? 'Registro' : activeTab === 'categories' ? 'Categorías' : 'Stock'}
              </h2>
              <p className="text-[11px] text-slate-400">{currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • <span className="font-bold text-slate-500">{currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={currentUser.role === 'admin' ? store.toggleRegisterStatus : undefined} className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${isRegisterClosed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} ${currentUser.role === 'admin' ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}>
                <Lock size={14} /><span className="text-xs font-bold">{isRegisterClosed ? 'CAJA CERRADA' : 'CAJA ABIERTA'}</span>
              </button>
              {!isRegisterClosed && closingTime && <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-amber-700"><Clock size={12} /><span className="text-[10px] font-bold">Cierre: {closingTime}</span></div>}
            </div>
            <div className="text-right hidden sm:block"><p className="text-xs font-bold text-slate-700">{currentUser.name}</p><span className={`text-[10px] px-2 py-0.5 rounded font-bold ${currentUser.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{currentUser.role === 'admin' ? 'DUEÑO' : 'VENDEDOR'}</span></div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 bg-slate-100">
          {activeTab === 'dashboard' && <DashboardView openingBalance={openingBalance} totalSales={totalSales} salesCount={salesCount} currentUser={currentUser} setTempOpeningBalance={store.setTempOpeningBalance} setIsOpeningBalanceModalOpen={(v) => toggleModal('isOpeningBalanceModalOpen', v)} transactions={validTransactions} dailyLogs={dailyLogs} inventory={inventory} />}
          {activeTab === 'inventory' && <InventoryView inventory={inventory} categories={categories} currentUser={currentUser} inventoryViewMode={store.inventoryViewMode} setInventoryViewMode={store.setInventoryViewMode} inventorySearch={store.inventorySearch} setInventorySearch={store.setInventorySearch} inventoryCategoryFilter={store.inventoryCategoryFilter} setInventoryCategoryFilter={store.setInventoryCategoryFilter} setIsModalOpen={(v) => toggleModal('isModalOpen', v)} setEditingProduct={(prod) => { store.setEditingProduct(prod); store.setEditReason(''); }} handleDeleteProduct={(id) => { const p = inventory.find(x => x.id === id); store.setProductToDelete(p); store.setDeleteProductReason(''); toggleModal('isDeleteProductModalOpen', true); }} setSelectedImage={store.setSelectedImage} setIsImageModalOpen={(v) => toggleModal('isImageModalOpen', v)} />}
          {activeTab === 'pos' && (isRegisterClosed ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Lock size={64} className="mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-600">Caja Cerrada</h3>
                {currentUser.role === 'admin' ? <><p className="mb-6">Debes abrir la caja para realizar ventas.</p><button onClick={store.toggleRegisterStatus} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Abrir Caja</button></> : <p className="mb-6 text-center">El Dueño debe abrir la caja para realizar ventas.</p>}
              </div>
            ) : (
              <POSView inventory={inventory} categories={categories} addToCart={store.addToCart} cart={cart} removeFromCart={store.removeFromCart} updateCartItemQty={store.updateCartItemQty} selectedPayment={store.selectedPayment} setSelectedPayment={store.setSelectedPayment} installments={store.installments} setInstallments={store.setInstallments} calculateTotal={store.calculateTotal} handleCheckout={store.handleCheckout} posSearch={store.posSearch} setPosSearch={store.setPosSearch} />
            ))}
          {activeTab === 'history' && <HistoryView transactions={transactions} dailyLogs={dailyLogs} inventory={inventory} currentUser={currentUser} onDeleteTransaction={(tx) => { store.setTransactionToRefund(tx); store.setRefundReason(''); toggleModal('isRefundModalOpen', true); }} onEditTransaction={(tx) => { const safeTx = JSON.parse(JSON.stringify(tx)); safeTx.items = safeTx.items.map(i => ({...i, qty: Number(i.qty)||0, price: Number(i.price)||0})); store.setEditingTransaction(safeTx); store.setTransactionSearch(''); store.setEditReason(''); }} setTransactions={store.setTransactions} setDailyLogs={store.setDailyLogs} />}
          {activeTab === 'logs' && currentUser.role === 'admin' && <LogsView dailyLogs={dailyLogs} setDailyLogs={store.setDailyLogs} inventory={inventory} />}
          {activeTab === 'categories' && currentUser.role === 'admin' && <CategoryManagerView categories={categories} inventory={inventory} onAddCategory={store.handleAddCategoryFromView} onDeleteCategory={store.handleDeleteCategoryFromView} onEditCategory={(oldName, newName) => { if(newName && newName !== oldName && !categories.includes(newName)) { store.setCategories(categories.map(c => c === oldName ? newName : c)); store.setInventory(inventory.map(p => { let updatedCats = p.categories ? [...p.categories] : p.category ? [p.category] : []; if(updatedCats.includes(oldName)) updatedCats = updatedCats.map(c => c === oldName ? newName : c); return { ...p, category: p.category === oldName ? newName : p.category, categories: updatedCats }; })); store.addLog('Categoría', { name: newName, type: 'edit', oldName }); } }} onBatchUpdateProductCategory={(changes) => { if(!changes || changes.length === 0) return; let updatedInventory = [...inventory]; changes.forEach(({ productId, categoryName, action }) => { updatedInventory = updatedInventory.map(p => { if(p.id === productId) { const currentCats = Array.isArray(p.categories) ? [...p.categories] : p.category ? [p.category] : []; let newCats = [...currentCats]; if(action === 'add') { if(!newCats.includes(categoryName)) newCats.push(categoryName); } else if(action === 'remove') { newCats = newCats.filter(c => c !== categoryName); } return { ...p, categories: newCats, category: newCats.length > 0 ? newCats[0] : '' }; } return p; }); }); store.setInventory(updatedInventory); store.addLog('Edición Masiva Categorías', { count: changes.length }); }} onUpdateProductCategory={() => {}} />}
        </main>
      </div>

      {/* --- MODALES INYECTADOS --- */}
      <Modals.OpeningBalanceModal isOpen={modals.isOpeningBalanceModalOpen} onClose={() => toggleModal('isOpeningBalanceModalOpen', false)} tempOpeningBalance={store.tempOpeningBalance} setTempOpeningBalance={store.setTempOpeningBalance} tempClosingTime={store.tempClosingTime} setTempClosingTime={store.setTempClosingTime} onSave={store.handleSaveOpeningBalance} />
      <Modals.ClosingTimeModal isOpen={modals.isClosingTimeModalOpen} onClose={() => toggleModal('isClosingTimeModalOpen', false)} closingTime={closingTime} setClosingTime={store.setClosingTime} onSave={() => { store.addLog('Horario Modificado', `Nueva hora: ${closingTime}`); toggleModal('isClosingTimeModalOpen', false); }} />
      <Modals.AddProductModal isOpen={modals.isModalOpen} onClose={() => toggleModal('isModalOpen', false)} newItem={store.newItem} setNewItem={store.setNewItem} categories={categories} onImageUpload={store.handleImageUpload} onAdd={store.handleAddItem} />
      <Modals.EditProductModal product={store.editingProduct} onClose={() => store.setEditingProduct(null)} setEditingProduct={store.setEditingProduct} categories={categories} onImageUpload={store.handleImageUpload} editReason={store.editReason} setEditReason={store.setEditReason} onSave={store.saveEditProduct} />
      <Modals.EditTransactionModal transaction={store.editingTransaction} onClose={() => store.setEditingTransaction(null)} inventory={inventory} setEditingTransaction={store.setEditingTransaction} transactionSearch={store.transactionSearch} setTransactionSearch={store.setTransactionSearch} addTxItem={() => {}} removeTxItem={() => {}} setTxItemQty={() => {}} handlePaymentChange={() => {}} editReason={store.editReason} setEditReason={store.setEditReason} onSave={() => {}} />
      <Modals.ImageModal isOpen={modals.isImageModalOpen} image={store.selectedImage} onClose={() => toggleModal('isImageModalOpen', false)} />
      <Modals.RefundModal transaction={store.transactionToRefund} onClose={() => toggleModal('isRefundModalOpen', false)} refundReason={store.refundReason} setRefundReason={store.setRefundReason} onConfirm={store.handleConfirmRefund} />
      <Modals.CloseCashModal isOpen={modals.isClosingCashModalOpen} onClose={() => toggleModal('isClosingCashModalOpen', false)} salesCount={salesCount} totalSales={totalSales} openingBalance={openingBalance} onConfirm={() => store.executeRegisterClose(false)} />
      <Modals.SaleSuccessModal transaction={store.saleSuccessModal} onClose={() => store.setSaleSuccessModal(null)} />
      <Modals.AutoCloseAlertModal isOpen={modals.isAutoCloseAlertOpen} onClose={() => toggleModal('isAutoCloseAlertOpen', false)} closingTime={closingTime} />
      <Modals.DeleteProductModal product={store.productToDelete} onClose={() => toggleModal('isDeleteProductModalOpen', false)} reason={store.deleteProductReason} setReason={store.setDeleteProductReason} onConfirm={store.confirmDeleteProduct} />
    </div>
  );
}