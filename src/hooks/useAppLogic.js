import { useState, useEffect } from 'react';
import {
  USERS,
  INITIAL_CATEGORIES,
  INITIAL_INVENTORY,
  INITIAL_TRANSACTIONS,
  INITIAL_LOGS,
  getInitialState,
} from '../data';

export function useAppLogic() {
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

  // --- ESTADOS DE UI/SESIÓN ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  
  // Login
  const [loginStep, setLoginStep] = useState('select');
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados Temporales para Modales
  const [tempOpeningBalance, setTempOpeningBalance] = useState('');
  const [tempClosingTime, setTempClosingTime] = useState('21:00');
  const [newItem, setNewItem] = useState({ title: '', brand: '', price: '', purchasePrice: '', stock: '', categories: [], image: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editReason, setEditReason] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionToRefund, setTransactionToRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteProductReason, setDeleteProductReason] = useState('');

  // POS Filtros
  const [selectedPayment, setSelectedPayment] = useState('Efectivo');
  const [installments, setInstallments] = useState(1);
  const [inventoryViewMode, setInventoryViewMode] = useState('grid');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('Todas');
  const [inventorySearch, setInventorySearch] = useState('');
  const [posSearch, setPosSearch] = useState('');

  // Control de Modales (Flags)
  const [modals, setModals] = useState({
    isModalOpen: false,
    isOpeningBalanceModalOpen: false,
    isImageModalOpen: false,
    isClosingTimeModalOpen: false,
    isClosingCashModalOpen: false,
    isAutoCloseAlertOpen: false,
    isDeleteProductModalOpen: false,
    isRefundModalOpen: false,
  });
  const [selectedImage, setSelectedImage] = useState('');
  const [saleSuccessModal, setSaleSuccessModal] = useState(null);

  // Helper para actualizar flags de modales
  const toggleModal = (modalName, value) => {
    setModals(prev => ({ ...prev, [modalName]: value }));
  };

  // --- EFECTOS (Persistencia y Reloj) ---
  useEffect(() => { window.localStorage.setItem('party_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { window.localStorage.setItem('party_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { window.localStorage.setItem('party_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { window.localStorage.setItem('party_logs', JSON.stringify(dailyLogs)); }, [dailyLogs]);
  useEffect(() => { window.localStorage.setItem('party_openingBalance', JSON.stringify(openingBalance)); }, [openingBalance]);
  useEffect(() => { window.localStorage.setItem('party_isRegisterClosed', JSON.stringify(isRegisterClosed)); }, [isRegisterClosed]);
  useEffect(() => { window.localStorage.setItem('party_closingTime', JSON.stringify(closingTime)); }, [closingTime]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- LÓGICA DE NEGOCIO ---

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

  // Login System
  const handleLogin = (role) => {
    setCurrentUser(USERS[role]);
    setActiveTab(role === 'admin' ? 'dashboard' : 'pos');
    if (dailyLogs.length === 0) addLog('Sistema Iniciado', 'Carga de datos desde memoria');
  };
  
  const handleSelectRole = (role) => {
    setSelectedRoleForLogin(role);
    setLoginStep('password');
    setPasswordInput('');
    setLoginError('');
  };

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

  // Caja y Cierre
  const toggleRegisterStatus = () => {
    if (isRegisterClosed) {
      setTempOpeningBalance('');
      setTempClosingTime('21:00');
      toggleModal('isOpeningBalanceModalOpen', true);
    } else {
      toggleModal('isClosingCashModalOpen', true);
    }
  };

  const executeRegisterClose = (isAuto = false) => {
    setIsRegisterClosed(true);
    const totalSales = transactions.filter(t => t.status !== 'voided').reduce((acc, tx) => acc + (Number(tx.total) || 0), 0);
    const salesCount = transactions.filter(t => t.status !== 'voided').length;
    
    addLog('Cierre de Caja', {
        salesCount,
        totalSales,
        openingBalance,
        finalBalance: openingBalance + totalSales,
        closingTime: new Date().toLocaleTimeString('es-AR'),
        scheduledClosingTime: closingTime,
        type: isAuto ? 'automatic' : 'manual'
      }, isAuto ? 'Cierre Automático por Horario' : 'Cierre de jornada');
    
    setTransactions([]);
    toggleModal('isClosingCashModalOpen', false);
    if (isAuto) toggleModal('isAutoCloseAlertOpen', true);
  };

  const handleSaveOpeningBalance = () => {
    const value = Number(tempOpeningBalance);
    if (!isNaN(value) && value >= 0 && tempClosingTime) {
      setOpeningBalance(value);
      setClosingTime(tempClosingTime);
      setIsRegisterClosed(false);
      addLog('Apertura de Caja', { amount: value, scheduledClosingTime: tempClosingTime }, 'Inicio de operaciones');
      toggleModal('isOpeningBalanceModalOpen', false);
    }
  };

  // Monitor Cierre Automático
  useEffect(() => {
    if (!isRegisterClosed && closingTime) {
      const nowStr = currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (nowStr === closingTime) executeRegisterClose(true);
    }
  }, [currentTime, closingTime, isRegisterClosed]); 

  // Productos
  const handleImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert('Imagen muy pesada (>500KB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing) {
          setEditingProduct({ ...editingProduct, image: reader.result });
        } else {
          setNewItem({ ...newItem, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.categories.length === 0) { alert('Selecciona al menos una categoría.'); return; }
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
    toggleModal('isModalOpen', false);
  };

  const saveEditProduct = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.categories || (Array.isArray(editingProduct.categories) && editingProduct.categories.length === 0)) {
        alert('El producto debe tener al menos una categoría.'); return;
    }
    setInventory(inventory.map((p) => p.id === editingProduct.id ? editingProduct : p));
    addLog('Edición Producto', { productId: editingProduct.id, title: editingProduct.title }, editReason);
    setEditingProduct(null);
    setEditReason('');
  };

  const confirmDeleteProduct = (e) => {
    e.preventDefault();
    if (productToDelete) {
      setInventory(inventory.filter((x) => x.id !== productToDelete.id));
      addLog('Baja Producto', productToDelete, deleteProductReason || 'Sin motivo');
      toggleModal('isDeleteProductModalOpen', false);
      setProductToDelete(null);
    }
  };

  // Ventas y Carrito
  const calculateTotal = () => {
    const subtotal = cart.reduce((t, i) => t + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
    return selectedPayment === 'Credito' ? subtotal * 1.1 : subtotal;
  };

  const addToCart = (item) => {
    if (item.stock === 0) return;
    const existing = cart.find((c) => c.id === item.id);
    if (existing && existing.quantity >= item.stock) { alert(`Stock insuficiente.`); return; }
    existing ? setCart(cart.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)) : setCart([...cart, { ...item, quantity: 1 }]);
  };

  const updateCartItemQty = (id, newQty) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 1) return;
    const itemInStock = inventory.find((i) => i.id === id);
    if (qty > itemInStock.stock) { alert(`Stock insuficiente. Máximo: ${itemInStock.stock}`); return; }
    setCart(cart.map((c) => (c.id === id ? { ...c, quantity: qty } : c)));
  };

  const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));

  const handleCheckout = () => {
    const total = calculateTotal();
    const subtotal = cart.reduce((t, i) => t + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
    // Validación de stock... (simplificada aquí, ya validamos al agregar)
    setInventory(inventory.map((p) => {
        const c = cart.find((x) => x.id === p.id);
        return c ? { ...p, stock: p.stock - c.quantity } : p;
    }));
    
    // Generación de ID
    const validIds = transactions.map((t) => {
        if (typeof t.id === 'number') return t.id;
        const num = parseInt(String(t.id).replace(/\D/g, ''), 10);
        return !isNaN(num) && num >= 1001 && num <= 9999 ? num : null;
    }).filter((id) => id !== null);
    const maxId = validIds.length > 0 ? Math.max(...validIds) : 1000;

    const tx = {
      id: maxId + 1,
      date: new Date().toLocaleString(),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.name,
      total, subtotal, payment: selectedPayment,
      installments: selectedPayment === 'Credito' ? installments : 0,
      items: cart.map((i) => ({ ...i, price: Number(i.price) || 0, qty: Number(i.quantity) || 0 })),
      status: 'completed',
    };
    setTransactions([tx, ...transactions]);
    addLog('Venta Realizada', { transactionId: tx.id, total, payment: selectedPayment, items: tx.items }, 'Venta regular');
    setSaleSuccessModal(tx);
    setCart([]); setInstallments(1); setPosSearch('');
  };

  // Transacciones (Editar/Borrar)
  const handleConfirmRefund = (e) => {
    e.preventDefault();
    if (!transactionToRefund) return;
    if (transactionToRefund.status === 'voided') {
      setTransactions(transactions.filter((t) => t.id !== transactionToRefund.id));
      addLog('Borrado Permanente', `Transacción: ${transactionToRefund.id}`, refundReason);
    } else {
      const newInventory = inventory.map((prod) => {
        const itemInTx = transactionToRefund.items.find((i) => i.id === prod.id);
        return itemInTx ? { ...prod, stock: prod.stock + (Number(itemInTx.qty) || 0) } : prod;
      });
      setInventory(newInventory);
      setTransactions(transactions.map((t) => t.id === transactionToRefund.id ? { ...t, status: 'voided' } : t));
      addLog('Venta Anulada', { transactionId: transactionToRefund.id }, refundReason);
    }
    toggleModal('isRefundModalOpen', false);
    setTransactionToRefund(null);
  };

  // Retornamos TODO lo que la UI necesita
  return {
    // Data
    inventory, setInventory, categories, setCategories, transactions, setTransactions, dailyLogs, setDailyLogs,
    openingBalance, setOpeningBalance, isRegisterClosed, closingTime,
    // UI State
    currentTime, currentUser, activeTab, setActiveTab, cart, loginStep, setLoginStep,
    selectedRoleForLogin, handleSelectRole, passwordInput, setPasswordInput, loginError, handleSubmitLogin, handleLogout,
    // Modales y Forms States
    modals, toggleModal,
    tempOpeningBalance, setTempOpeningBalance, tempClosingTime, setTempClosingTime,
    newItem, setNewItem, editingProduct, setEditingProduct, editReason, setEditReason,
    selectedImage, setSelectedImage, saleSuccessModal, setSaleSuccessModal,
    productToDelete, setProductToDelete, deleteProductReason, setDeleteProductReason,
    editingTransaction, setEditingTransaction, transactionSearch, setTransactionSearch,
    transactionToRefund, setTransactionToRefund, refundReason, setRefundReason,
    // POS States
    selectedPayment, setSelectedPayment, installments, setInstallments,
    inventoryViewMode, setInventoryViewMode, inventoryCategoryFilter, setInventoryCategoryFilter,
    inventorySearch, setInventorySearch, posSearch, setPosSearch,
    // Actions
    addLog, handleAddItem, saveEditProduct, confirmDeleteProduct, handleImageUpload,
    addToCart, updateCartItemQty, removeFromCart, handleCheckout, calculateTotal,
    handleConfirmRefund, executeRegisterClose, handleSaveOpeningBalance, toggleRegisterStatus
  };
}