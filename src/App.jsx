import React, { useState, useEffect } from 'react';
import {
  PartyPopper,
  Lock,
  Clock,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

import {
  USERS,
  INITIAL_CATEGORIES,
  INITIAL_INVENTORY,
  INITIAL_TRANSACTIONS,
  INITIAL_LOGS,
  PAYMENT_METHODS,
  getInitialState,
} from './data';
import Sidebar from './components/Sidebar';

// Vistas
import DashboardView from './views/DashboardView';
import InventoryView from './views/InventoryView';
import POSView from './views/POSView';
import HistoryView from './views/HistoryView';
import LogsView from './views/LogsView';
import CategoryManagerView from './views/CategoryManagerView';

// Modales
import {
  OpeningBalanceModal,
  ClosingTimeModal,
  AddProductModal,
  EditProductModal,
  EditTransactionModal,
  ImageModal,
  RefundModal,
  CloseCashModal,
  SaleSuccessModal,
  AutoCloseAlertModal,
  DeleteProductModal,
  NotificationModal,
  TicketModal // IMPORTADO EL MODAL DE TICKET
} from './components/AppModals';

// Ticket Layout (Diseño Invisible de Impresión)
import { TicketPrintLayout } from './components/TicketPrintLayout';

export default function PartySupplyApp() {
  // --- ESTADOS DE DATOS ---
  const [inventory, setInventory] = useState(() => {
    const data = getInitialState('party_inventory', INITIAL_INVENTORY);
    return data.map((item) => ({
      ...item,
      categories: Array.isArray(item.categories) && item.categories.length > 0 ? item.categories : item.category ? [item.category] : [],
    }));
  });
  const [categories, setCategories] = useState(() => getInitialState('party_categories', INITIAL_CATEGORIES));
  const [transactions, setTransactions] = useState(() => getInitialState('party_transactions', INITIAL_TRANSACTIONS));
  const [dailyLogs, setDailyLogs] = useState(() => getInitialState('party_logs', INITIAL_LOGS));
  const [openingBalance, setOpeningBalance] = useState(() => getInitialState('party_openingBalance', 25000));
  const [isRegisterClosed, setIsRegisterClosed] = useState(() => getInitialState('party_isRegisterClosed', false));
  const [closingTime, setClosingTime] = useState(() => getInitialState('party_closingTime', '21:00'));

  // --- ESTADOS DE SESIÓN Y UI ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);

  // Login
  const [loginStep, setLoginStep] = useState('select');
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Modales Flags
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isClosingTimeModalOpen, setIsClosingTimeModalOpen] = useState(false);
  const [isClosingCashModalOpen, setIsClosingCashModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [saleSuccessModal, setSaleSuccessModal] = useState(null);
  const [isAutoCloseAlertOpen, setIsAutoCloseAlertOpen] = useState(false);
  
  // Estados para Ticket y Visualización
  const [ticketToView, setTicketToView] = useState(null);

  // Modal de eliminación de producto
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteProductReason, setDeleteProductReason] = useState('');

  // Edición
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [editReason, setEditReason] = useState('');

  // Devolución
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [transactionToRefund, setTransactionToRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  // Inputs
  const [newItem, setNewItem] = useState({ title: '', brand: '', price: '', purchasePrice: '', stock: '', categories: [], image: '' });
  const [tempOpeningBalance, setTempOpeningBalance] = useState('');
  const [tempClosingTime, setTempClosingTime] = useState('21:00');

  // POS
  const [selectedPayment, setSelectedPayment] = useState('Efectivo');
  const [installments, setInstallments] = useState(1);
  const [inventoryViewMode, setInventoryViewMode] = useState('grid');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('Todas');
  const [inventorySearch, setInventorySearch] = useState('');
  const [posSearch, setPosSearch] = useState('');

  // --- NUEVO: SISTEMA DE NOTIFICACIONES ---
  const [notification, setNotification] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const showNotification = (type, title, message) => { setNotification({ isOpen: true, type, title, message }); };
  const closeNotification = () => { setNotification(prev => ({ ...prev, isOpen: false })); };

  // Cálculos Protegidos
  const calculateTotal = () => {
    const subtotal = cart.reduce((t, i) => t + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
    if (selectedPayment === 'Credito') return subtotal * 1.1;
    return subtotal;
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const validTransactions = safeTransactions.filter((t) => t && t.status !== 'voided');
  const totalSales = validTransactions.reduce((acc, tx) => acc + (Number(tx.total) || 0), 0);
  const salesCount = validTransactions.length;

  // Efectos
  useEffect(() => { window.localStorage.setItem('party_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { window.localStorage.setItem('party_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { window.localStorage.setItem('party_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { window.localStorage.setItem('party_logs', JSON.stringify(dailyLogs)); }, [dailyLogs]);
  useEffect(() => { window.localStorage.setItem('party_openingBalance', JSON.stringify(openingBalance)); }, [openingBalance]);
  useEffect(() => { window.localStorage.setItem('party_isRegisterClosed', JSON.stringify(isRegisterClosed)); }, [isRegisterClosed]);
  useEffect(() => { window.localStorage.setItem('party_closingTime', JSON.stringify(closingTime)); }, [closingTime]);

  // Actualizar reloj cada minuto
  useEffect(() => { const timer = setInterval(() => { setCurrentTime(new Date()); }, 60000); return () => clearInterval(timer); }, []);

  // Monitor Cierre Automático
  useEffect(() => {
    if (!isRegisterClosed && closingTime) {
      const nowStr = currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (nowStr === closingTime) executeRegisterClose(true);
    }
  }, [currentTime, closingTime, isRegisterClosed]); 

  // Lógica
  const addLog = (action, details, reason = '') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      action,
      user: currentUser?.name || 'Sistema',
      details,
      reason,
    };
    setDailyLogs((prev) => [newLog, ...prev]);
  };

  const handleLogin = (role) => {
    setCurrentUser(USERS[role]);
    setActiveTab(role === 'admin' ? 'dashboard' : 'pos');
    if (dailyLogs.length === 0) addLog('Sistema Iniciado', 'Carga de datos desde memoria');
  };

  const handleSelectRole = (role) => { setSelectedRoleForLogin(role); setLoginStep('password'); setPasswordInput(''); setLoginError(''); };

  const handleSubmitLogin = (e) => {
    e.preventDefault();
    const user = USERS[selectedRoleForLogin];
    if (user && passwordInput === user.password) {
      setCurrentUser(user);
      setActiveTab(user.role === 'admin' ? 'dashboard' : 'pos');
      setLoginStep('select');
      setPasswordInput('');
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => { setCurrentUser(null); setCart([]); };

  const handleImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        showNotification('error', 'Error de Imagen', 'La imagen es muy pesada (>500KB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing) setEditingProduct({ ...editingProduct, image: reader.result });
        else setNewItem({ ...newItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- FUNCIONES DE IMPRESIÓN Y VISUALIZACIÓN ---
  const handleViewTicket = (tx) => {
    setTicketToView(tx);
  };

  const handlePrintTicket = () => {
    // 1. Detección de entorno Electron (Futuro)
    if (window.electronAPI && window.electronAPI.printSilent) {
      window.electronAPI.printSilent();
      showNotification('success', 'Imprimiendo...', 'El ticket se envió a la impresora.');
    } else {
      // 2. Web estándar
      window.print();
    }
  };

  // --- CAJA ---
  const toggleRegisterStatus = () => {
    if (isRegisterClosed) { setTempOpeningBalance(''); setTempClosingTime('21:00'); setIsOpeningBalanceModalOpen(true); } 
    else { setIsClosingCashModalOpen(true); }
  };

  const executeRegisterClose = (isAuto = false) => {
    setIsRegisterClosed(true);
    addLog('Cierre de Caja', { salesCount, totalSales, openingBalance, finalBalance: openingBalance + totalSales, closingTime: new Date().toLocaleTimeString('es-AR'), scheduledClosingTime: closingTime, type: isAuto ? 'automatic' : 'manual' }, isAuto ? 'Cierre Automático por Horario' : 'Cierre de jornada');
    setTransactions([]);
    setIsClosingCashModalOpen(false);
    if (isAuto) setIsAutoCloseAlertOpen(true);
  };

  const handleConfirmCloseCash = () => executeRegisterClose(false);

  const handleSaveOpeningBalance = () => {
    const value = Number(tempOpeningBalance);
    if (!isNaN(value) && value >= 0 && tempClosingTime) {
      setOpeningBalance(value); setClosingTime(tempClosingTime); setIsRegisterClosed(false);
      addLog('Apertura de Caja', { amount: value, scheduledClosingTime: tempClosingTime }, 'Inicio de operaciones');
      setIsOpeningBalanceModalOpen(false);
    }
  };

  const handleSaveClosingTime = () => {
    addLog('Horario Modificado', `Nueva hora de cierre: ${closingTime}`, 'Ajuste de horario');
    setIsClosingTimeModalOpen(false);
    showNotification('success', 'Horario Guardado', 'La hora de cierre se ha actualizado.');
  };

  // Categorías
  const handleAddCategoryFromView = (name) => {
    if (name && !categories.includes(name)) {
      setCategories([...categories, name]);
      addLog('Categoría', { name, type: 'create' });
      showNotification('success', 'Categoría Creada', `Se agregó "${name}" correctamente.`);
    } else {
      showNotification('warning', 'Atención', 'La categoría ya existe o es inválida.');
    }
  };

  const handleDeleteCategoryFromView = (name) => {
    const inUse = inventory.some((p) => Array.isArray(p.categories) ? p.categories.includes(name) : p.category === name);
    if (inUse) { showNotification('error', 'No se puede eliminar', 'Hay productos que utilizan esta categoría.'); return; }
    if (window.confirm(`¿Eliminar categoría "${name}"?`)) { setCategories(categories.filter((c) => c !== name)); addLog('Categoría', { name, type: 'delete' }); }
  };

  // CRUD Productos
  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.categories.length === 0) { showNotification('warning', 'Faltan datos', 'Por favor selecciona al menos una categoría.'); return; }
    const item = {
      id: Date.now(),
      title: newItem.title,
      brand: newItem.brand,
      price: Number(newItem.price) || 0,
      purchasePrice: Number(newItem.purchasePrice) || 0,
      stock: Number(newItem.stock) || 0,
      category: newItem.categories[0],
      categories: newItem.categories,
      image: newItem.image || '',
    };
    setInventory([...inventory, item]);
    addLog('Alta de Producto', item, 'Producto Nuevo');
    setNewItem({ title: '', brand: '', price: '', purchasePrice: '', stock: '', categories: [], image: '' });
    setIsModalOpen(false);
    showNotification('success', 'Producto Agregado', 'El producto se guardó en el inventario.');
  };

  const saveEditProduct = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.categories || (Array.isArray(editingProduct.categories) && editingProduct.categories.length === 0)) {
      showNotification('warning', 'Faltan datos', 'El producto debe tener al menos una categoría.'); return;
    }
    setInventory(inventory.map((p) => p.id === editingProduct.id ? editingProduct : p));
    addLog('Edición Producto', { productId: editingProduct.id, title: editingProduct.title }, editReason);
    setEditingProduct(null);
    setEditReason('');
    showNotification('success', 'Producto Editado', 'Los cambios se guardaron correctamente.');
  };

  const handleDeleteProductRequest = (id) => { const product = inventory.find(p => p.id === id); if (product) { setProductToDelete(product); setDeleteProductReason(''); setIsDeleteProductModalOpen(true); } };

  const confirmDeleteProduct = (e) => {
    e.preventDefault();
    if (productToDelete) {
      setInventory(inventory.filter((x) => x.id !== productToDelete.id));
      addLog('Baja Producto', productToDelete, deleteProductReason || 'Sin motivo');
      setIsDeleteProductModalOpen(false); setProductToDelete(null);
      showNotification('success', 'Producto Eliminado', 'Se quitó el producto del inventario.');
    }
  };

  // Ventas
  const addToCart = (item) => {
    if (item.stock === 0) return;
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      if (existing.quantity >= item.stock) { showNotification('error', 'Stock Insuficiente', 'No quedan más unidades de este producto.'); return; }
      setCart(cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };
  const updateCartItemQty = (id, newQty) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 1) return;
    const itemInStock = inventory.find((i) => i.id === id);
    if (qty > itemInStock.stock) { showNotification('error', 'Stock Insuficiente', `Máximo disponible: ${itemInStock.stock}`); return; }
    setCart(cart.map((c) => (c.id === id ? { ...c, quantity: qty } : c)));
  };
  const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));

  const handleCheckout = () => {
    const total = calculateTotal();
    const stockIssues = cart.filter((cartItem) => { const invItem = inventory.find((i) => i.id === cartItem.id); return !invItem || invItem.stock < cartItem.quantity; });
    if (stockIssues.length > 0) { showNotification('error', 'Error de Stock', 'Algunos productos superan el stock disponible.'); return; }
    
    setInventory(inventory.map((p) => { const c = cart.find((x) => x.id === p.id); return c ? { ...p, stock: p.stock - c.quantity } : p; }));
    
    // GENERACIÓN DE ID CORREGIDA (Empieza en 1 y se ve como 000001)
    const validIds = transactions.map((t) => (typeof t.id === 'number' ? t.id : null)).filter((id) => id !== null);
    const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;
    
    const tx = {
      id: maxId + 1, // ID Secuencial desde 1
      date: new Date().toLocaleDateString('es-AR'),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.name,
      total, subtotal: total, payment: selectedPayment,
      installments: selectedPayment === 'Credito' ? installments : 0,
      items: cart.map((i) => ({ ...i, price: Number(i.price) || 0, qty: Number(i.quantity) || 0 })),
      status: 'completed',
    };
    setTransactions([tx, ...transactions]);
    addLog('Venta Realizada', { transactionId: tx.id, total }, 'Venta regular');
    setSaleSuccessModal(tx);
    setCart([]); setInstallments(1); setPosSearch('');
  };

  const handleDeleteTransaction = (tx) => { setTransactionToRefund(tx); setRefundReason(''); setIsRefundModalOpen(true); };

  const handleConfirmRefund = (e) => {
    e.preventDefault();
    const tx = transactionToRefund;
    if (!tx) return;
    if (tx.status === 'voided') {
      setTransactions(transactions.filter((t) => t.id !== tx.id));
      addLog('Borrado Permanente', `Transacción: ${tx.id}`, refundReason);
      showNotification('success', 'Registro Borrado', 'La transacción fue eliminada permanentemente.');
    } else {
      const newInventory = inventory.map((prod) => {
        const itemInTx = tx.items.find((i) => i.id === prod.id);
        return itemInTx ? { ...prod, stock: prod.stock + (Number(itemInTx.qty) || 0) } : prod;
      });
      setInventory(newInventory);
      setTransactions(transactions.map((t) => t.id === tx.id ? { ...t, status: 'voided' } : t));
      addLog('Venta Anulada', { transactionId: tx.id }, refundReason);
      showNotification('warning', 'Venta Anulada', 'Se anuló la venta y se devolvió el stock.');
    }
    setIsRefundModalOpen(false); setTransactionToRefund(null);
  };

  // Helper para modificar transacciones
  const addTxItem = (product) => {
    if (!editingTransaction) return;
    const existingItemIndex = editingTransaction.items.findIndex((i) => i.id === product.id);
    let updatedItems;
    if (existingItemIndex !== -1) { updatedItems = editingTransaction.items.map((i, idx) => idx === existingItemIndex ? { ...i, qty: (Number(i.qty) || 0) + 1 } : i); } 
    else { updatedItems = [...editingTransaction.items, { id: product.id, title: product.title, price: Number(product.price) || 0, qty: 1 }]; }
    const subtotal = updatedItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const newTotal = editingTransaction.payment === 'Credito' ? subtotal * 1.1 : subtotal;
    setEditingTransaction({ ...editingTransaction, items: updatedItems, total: newTotal });
    setTransactionSearch('');
  };

  const removeTxItem = (itemIndex) => {
    if (!editingTransaction) return;
    const updatedItems = editingTransaction.items.filter((item, idx) => idx !== itemIndex);
    if (updatedItems.length === 0) { showNotification('warning', 'Operación Inválida', 'No puedes dejar la orden vacía.'); return; }
    const subtotal = updatedItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const newTotal = editingTransaction.payment === 'Credito' ? subtotal * 1.1 : subtotal;
    setEditingTransaction({ ...editingTransaction, items: updatedItems, total: newTotal });
  };

  const setTxItemQty = (itemIndex, val) => {
    if (!editingTransaction) return;
    const qty = parseInt(val);
    if (isNaN(qty) || qty < 1) return;
    const updatedItems = editingTransaction.items.map((item, idx) => idx === itemIndex ? { ...item, qty: qty } : item);
    const subtotal = updatedItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const newTotal = editingTransaction.payment === 'Credito' ? subtotal * 1.1 : subtotal;
    setEditingTransaction({ ...editingTransaction, items: updatedItems, total: newTotal });
  };

  const handleEditTxPaymentChange = (newPayment) => {
    if (!editingTransaction) return;
    const subtotal = editingTransaction.items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const newTotal = newPayment === 'Credito' ? subtotal * 1.1 : subtotal;
    setEditingTransaction({ ...editingTransaction, payment: newPayment, total: newTotal, installments: newPayment === 'Credito' ? 1 : 0 });
  };

  const handleSaveEditedTransaction = (e) => {
    e.preventDefault();
    if (!editingTransaction) return;
    const originalTx = transactions.find((t) => t.id === editingTransaction.id);
    if (!originalTx) return;

    let tempInventory = [...inventory];
    tempInventory = tempInventory.map((prod) => {
      const originalItem = originalTx.items.find((i) => i.id === prod.id);
      return originalItem ? { ...prod, stock: prod.stock + (Number(originalItem.qty) || 0) } : prod;
    });
    const stockErrors = [];
    editingTransaction.items.forEach((newItem) => {
      const prod = tempInventory.find((p) => p.id === newItem.id);
      if (!prod || prod.stock < (Number(newItem.qty) || 0)) stockErrors.push(newItem.title);
    });
    if (stockErrors.length > 0) { showNotification('error', 'Stock Insuficiente', `Error con: ${stockErrors.join('\n- ')}`); return; }
    tempInventory = tempInventory.map((prod) => {
      const newItem = editingTransaction.items.find((i) => i.id === prod.id);
      return newItem ? { ...prod, stock: prod.stock - (Number(newItem.qty) || 0) } : prod;
    });

    setInventory(tempInventory);
    setTransactions(transactions.map((t) => (t.id === editingTransaction.id ? editingTransaction : t)));
    addLog('Modificación Pedido', { transactionId: editingTransaction.id }, editReason);
    setEditingTransaction(null); setEditReason('');
    showNotification('success', 'Pedido Actualizado', 'La transacción fue modificada con éxito.');
  };

  // Render Login
  if (!currentUser) {
    if (loginStep === 'select') {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-100">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center border">
            <div className="flex justify-center mb-4"><div className="p-3 bg-fuchsia-600 rounded-xl shadow-lg"><PartyPopper className="text-white" size={32} /></div></div>
            <h1 className="text-lg font-bold text-slate-800 mb-1">PartyManager</h1>
            <p className="text-slate-500 text-xs mb-6">Selecciona tu usuario</p>
            <div className="space-y-3">
              <button onClick={() => handleSelectRole('admin')} className="w-full flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 transition-colors group"><div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">DU</div><div className="text-left flex-1"><p className="font-bold text-slate-800 text-sm">Dueño</p></div><ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" /></button>
              <button onClick={() => handleSelectRole('seller')} className="w-full flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 transition-colors group"><div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">VE</div><div className="text-left flex-1"><p className="font-bold text-slate-800 text-sm">Vendedor</p></div><ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" /></button>
            </div>
          </div>
        </div>
      );
    }
    if (loginStep === 'password') {
      const user = USERS[selectedRoleForLogin];
      return (
        <div className="flex h-screen items-center justify-center bg-slate-100">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center border">
            <div className="flex justify-between items-center mb-6"><button onClick={() => setLoginStep('select')} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></button><h1 className="text-lg font-bold text-slate-800">Iniciar Sesión</h1><div className="w-5"></div></div>
            <div className="mb-6 flex flex-col items-center"><div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${user.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{user.avatar}</div><p className="font-bold text-slate-700">{user.name}</p></div>
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              <div><input autoFocus type="password" placeholder="Contraseña" className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-fuchsia-500 outline-none" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />{loginError && <p className="text-xs text-red-500 mt-2">{loginError}</p>}</div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Ingresar</button>
            </form>
          </div>
        </div>
      );
    }
  }

  // Render Principal
  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 text-sm overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b h-14 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div><h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">{activeTab === 'pos' ? 'Punto de Venta' : activeTab === 'dashboard' ? 'Control de Caja' : activeTab === 'history' ? 'Historial' : activeTab === 'logs' ? 'Registro' : activeTab === 'categories' ? 'Categorías' : 'Stock'}</h2><p className="text-[11px] text-slate-400">{currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • <span className="font-bold text-slate-500">{currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span></p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={currentUser.role === 'admin' ? toggleRegisterStatus : undefined} className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${isRegisterClosed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} ${currentUser.role === 'admin' ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}><Lock size={14} /><span className="text-xs font-bold">{isRegisterClosed ? 'CAJA CERRADA' : 'CAJA ABIERTA'}</span></button>
              {!isRegisterClosed && closingTime && <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-amber-700"><Clock size={12} /><span className="text-[10px] font-bold">Cierre: {closingTime}</span></div>}
            </div>
            <div className="text-right hidden sm:block"><p className="text-xs font-bold text-slate-700">{currentUser.name}</p><span className={`text-[10px] px-2 py-0.5 rounded font-bold ${currentUser.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{currentUser.role === 'admin' ? 'DUEÑO' : 'VENDEDOR'}</span></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 bg-slate-100">
          {activeTab === 'dashboard' && <DashboardView openingBalance={openingBalance} totalSales={totalSales} salesCount={salesCount} currentUser={currentUser} setTempOpeningBalance={setTempOpeningBalance} setIsOpeningBalanceModalOpen={setIsOpeningBalanceModalOpen} transactions={validTransactions} dailyLogs={dailyLogs} inventory={inventory} />}
          {activeTab === 'inventory' && <InventoryView inventory={inventory} categories={categories} currentUser={currentUser} inventoryViewMode={inventoryViewMode} setInventoryViewMode={setInventoryViewMode} inventorySearch={inventorySearch} setInventorySearch={setInventorySearch} inventoryCategoryFilter={inventoryCategoryFilter} setInventoryCategoryFilter={setInventoryCategoryFilter} setIsModalOpen={setIsModalOpen} setEditingProduct={(prod) => { setEditingProduct(prod); setEditReason(''); }} handleDeleteProduct={handleDeleteProductRequest} setSelectedImage={setSelectedImage} setIsImageModalOpen={setIsImageModalOpen} />}
          {activeTab === 'pos' && (isRegisterClosed ? (<div className="h-full flex flex-col items-center justify-center text-slate-400"><Lock size={64} className="mb-4 text-slate-300" /><h3 className="text-xl font-bold text-slate-600">Caja Cerrada</h3>{currentUser.role === 'admin' ? <><p className="mb-6">Debes abrir la caja para realizar ventas.</p><button onClick={toggleRegisterStatus} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Abrir Caja</button></> : <p className="mb-6 text-center">El Dueño debe abrir la caja para realizar ventas.</p>}</div>) : (<POSView inventory={inventory} categories={categories} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} updateCartItemQty={updateCartItemQty} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} installments={installments} setInstallments={setInstallments} calculateTotal={calculateTotal} handleCheckout={handleCheckout} posSearch={posSearch} setPosSearch={setPosSearch} />))}
          {activeTab === 'history' && <HistoryView transactions={transactions} dailyLogs={dailyLogs} inventory={inventory} currentUser={currentUser} showNotification={showNotification} onViewTicket={handleViewTicket} onDeleteTransaction={handleDeleteTransaction} onEditTransaction={(tx) => { const safeTx = JSON.parse(JSON.stringify(tx)); safeTx.items = safeTx.items.map((i) => ({ ...i, qty: Number(i.qty) || 0, price: Number(i.price) || 0 })); setEditingTransaction(safeTx); setTransactionSearch(''); setEditReason(''); }} setTransactions={setTransactions} setDailyLogs={setDailyLogs} />}
          {activeTab === 'logs' && currentUser.role === 'admin' && <LogsView dailyLogs={dailyLogs} setDailyLogs={setDailyLogs} inventory={inventory} />}
          {activeTab === 'categories' && currentUser.role === 'admin' && <CategoryManagerView categories={categories} inventory={inventory} onAddCategory={handleAddCategoryFromView} onDeleteCategory={handleDeleteCategoryFromView} onEditCategory={(oldName, newName) => { if (newName && newName !== oldName && !categories.includes(newName)) { setCategories(categories.map((c) => (c === oldName ? newName : c))); setInventory(inventory.map((p) => { let updatedCats = p.categories ? [...p.categories] : p.category ? [p.category] : []; if (updatedCats.includes(oldName)) { updatedCats = updatedCats.map((c) => c === oldName ? newName : c); } return { ...p, category: p.category === oldName ? newName : p.category, categories: updatedCats }; })); addLog('Categoría', { name: newName, type: 'edit', oldName }); showNotification('success', 'Categoría Editada', 'Nombre actualizado correctamente.'); } }} onBatchUpdateProductCategory={(changes) => { if (!changes || changes.length === 0) return; let updatedInventory = [...inventory]; changes.forEach(({ productId, categoryName, action }) => { updatedInventory = updatedInventory.map((p) => { if (p.id === productId) { const currentCats = Array.isArray(p.categories) ? [...p.categories] : p.category ? [p.category] : []; let newCats = [...currentCats]; if (action === 'add') { if (!newCats.includes(categoryName)) newCats.push(categoryName); } else if (action === 'remove') { newCats = newCats.filter((c) => c !== categoryName); } return { ...p, categories: newCats, category: newCats.length > 0 ? newCats[0] : '' }; } return p; }); }); setInventory(updatedInventory); addLog('Edición Masiva Categorías', { count: changes.length }); showNotification('success', 'Edición Masiva', `Se actualizaron ${changes.length} productos.`); }} onUpdateProductCategory={() => {}} />}
        </main>
      </div>

      {/* --- SECCIÓN DE MODALES --- */}
      
      {/* 1. Modal de Impresión (Invisible) */}
      <TicketPrintLayout transaction={ticketToView || saleSuccessModal} />

      {/* 2. Modal de Notificación */}
      <NotificationModal isOpen={notification.isOpen} onClose={closeNotification} type={notification.type} title={notification.title} message={notification.message} />

      {/* 3. Modales de Negocio */}
      <OpeningBalanceModal isOpen={isOpeningBalanceModalOpen} onClose={() => setIsOpeningBalanceModalOpen(false)} tempOpeningBalance={tempOpeningBalance} setTempOpeningBalance={setTempOpeningBalance} tempClosingTime={tempClosingTime} setTempClosingTime={setTempClosingTime} onSave={handleSaveOpeningBalance} />
      <ClosingTimeModal isOpen={isClosingTimeModalOpen} onClose={() => setIsClosingTimeModalOpen(false)} closingTime={closingTime} setClosingTime={setClosingTime} onSave={handleSaveClosingTime} />
      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} newItem={newItem} setNewItem={setNewItem} categories={categories} onImageUpload={handleImageUpload} onAdd={handleAddItem} />
      <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} setEditingProduct={setEditingProduct} categories={categories} onImageUpload={handleImageUpload} editReason={editReason} setEditReason={setEditReason} onSave={saveEditProduct} />
      <EditTransactionModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} inventory={inventory} setEditingTransaction={setEditingTransaction} transactionSearch={transactionSearch} setTransactionSearch={setTransactionSearch} addTxItem={addTxItem} removeTxItem={removeTxItem} setTxItemQty={setTxItemQty} handlePaymentChange={handleEditTxPaymentChange} editReason={editReason} setEditReason={setEditReason} onSave={handleSaveEditedTransaction} />
      <ImageModal isOpen={isImageModalOpen} image={selectedImage} onClose={() => setIsImageModalOpen(false)} />
      <RefundModal transaction={transactionToRefund} onClose={() => setIsRefundModalOpen(false)} refundReason={refundReason} setRefundReason={setRefundReason} onConfirm={handleConfirmRefund} />
      <CloseCashModal isOpen={isClosingCashModalOpen} onClose={() => setIsClosingCashModalOpen(false)} salesCount={salesCount} totalSales={totalSales} openingBalance={openingBalance} onConfirm={handleConfirmCloseCash} />
      
      {/* Modales de Ticket y Venta Exitosa */}
      <SaleSuccessModal transaction={saleSuccessModal} onClose={() => setSaleSuccessModal(null)} onViewTicket={() => handleViewTicket(saleSuccessModal)} />
      <TicketModal transaction={ticketToView} onClose={() => setTicketToView(null)} onPrint={handlePrintTicket} />

      <AutoCloseAlertModal isOpen={isAutoCloseAlertOpen} onClose={() => setIsAutoCloseAlertOpen(false)} closingTime={closingTime} />
      <DeleteProductModal product={productToDelete} onClose={() => setIsDeleteProductModalOpen(false)} reason={deleteProductReason} setReason={setDeleteProductReason} onConfirm={confirmDeleteProduct} />
    </div>
  );
}