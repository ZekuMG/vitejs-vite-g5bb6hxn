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
import ClientsView from './views/ClientsView';
import HistoryView from './views/HistoryView';
import LogsView from './views/LogsView';
import CategoryManagerView from './views/CategoryManagerView';

// Modales (UI separada)
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
  TicketModal,
  BarcodeNotFoundModal,
  BarcodeDuplicateModal,
  ClientSelectionModal
} from './components/AppModals';

// Layout de Impresión (Invisible)
import { TicketPrintLayout } from './components/TicketPrintLayout';

// Hooks
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { useClients } from './hooks/useClients';

export default function PartySupplyApp() {
  // ==========================================
  // 1. ESTADOS DE DATOS (Persistentes)
  // ==========================================
  const [inventory, setInventory] = useState(() => {
    const data = getInitialState('party_inventory', INITIAL_INVENTORY);
    return data.map((item) => ({
      ...item,
      categories:
        Array.isArray(item.categories) && item.categories.length > 0
          ? item.categories
          : item.category
          ? [item.category]
          : [],
    }));
  });

  const [categories, setCategories] = useState(() =>
    getInitialState('party_categories', INITIAL_CATEGORIES)
  );
  const [transactions, setTransactions] = useState(() =>
    getInitialState('party_transactions', INITIAL_TRANSACTIONS)
  );
  const [dailyLogs, setDailyLogs] = useState(() =>
    getInitialState('party_logs', INITIAL_LOGS)
  );
  const [openingBalance, setOpeningBalance] = useState(() =>
    getInitialState('party_openingBalance', 25000)
  );
  const [isRegisterClosed, setIsRegisterClosed] = useState(() =>
    getInitialState('party_isRegisterClosed', false)
  );
  const [closingTime, setClosingTime] = useState(() =>
    getInitialState('party_closingTime', '21:00')
  );

  // --- LOGGING CENTRALIZADO (Definido antes para usarse en wrappers) ---
  const addLog = (action, details, reason = '') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      date: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      action,
      user: currentUser?.name || 'Sistema',
      details,
      reason,
    };
    setDailyLogs((prev) => [newLog, ...prev]);
  };

  // --- HOOK DE SOCIOS ---
  const { members, addMember, updateMember, deleteMember, addPoints } = useClients();

  // --- WRAPPERS PARA LOGS DE SOCIOS (Intermediarios para registrar acciones) ---
  
  const handleAddMemberWithLog = (data) => {
    const newMember = addMember(data);
    if (newMember) {
      addLog('Nuevo Socio', { 
        name: newMember.name, 
        number: newMember.memberNumber,
        initialPoints: newMember.points 
      }, 'Registro manual de socio');
    }
  };

  const handleUpdateMemberWithLog = (id, updates) => {
    const currentMember = members.find(m => m.id === id);
    if (!currentMember) return;

    // 1. Detectar cambio de Puntos (Log específico)
    if (updates.points !== undefined && Number(updates.points) !== currentMember.points) {
      addLog('Edición de Puntos', {
        member: currentMember.name,
        previous: currentMember.points,
        new: Number(updates.points),
        diff: Number(updates.points) - currentMember.points
      }, 'Ajuste manual de saldo');
    }

    // 2. Detectar otros cambios de datos (Log general)
    const dataChanged = Object.keys(updates).some(k => 
      k !== 'points' && k !== 'id' && updates[k] !== currentMember[k]
    );
    
    if (dataChanged) {
       addLog('Edición de Socio', {
         member: currentMember.name,
         updates: Object.keys(updates).filter(k => k !== 'points' && k !== 'id' && updates[k] !== currentMember[k])
       }, 'Actualización de datos personales');
    }

    // Aplicar cambio en el hook
    updateMember(id, updates);
  };

  const handleDeleteMemberWithLog = (id) => {
    const member = members.find(m => m.id === id);
    if (member) {
      addLog('Baja de Socio', {
        name: member.name,
        number: member.memberNumber
      }, 'Eliminación definitiva');
    }
    deleteMember(id);
  };

  // ==========================================
  // 2. ESTADOS DE SESIÓN Y UI
  // ==========================================
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);

  // Login
  const [loginStep, setLoginStep] = useState('select');
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // ==========================================
  // 3. ESTADOS PARA MODALES
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isClosingTimeModalOpen, setIsClosingTimeModalOpen] = useState(false);
  const [isClosingCashModalOpen, setIsClosingCashModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [saleSuccessModal, setSaleSuccessModal] = useState(null);
  const [isAutoCloseAlertOpen, setIsAutoCloseAlertOpen] = useState(false);
  
  // Estado para el Ticket que se está visualizando
  const [ticketToView, setTicketToView] = useState(null);

  // Eliminar producto
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteProductReason, setDeleteProductReason] = useState('');

  // Editar producto
  const [editingProduct, setEditingProduct] = useState(null);
  const [editReason, setEditReason] = useState('');

  // Editar transacción / Devolución
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [transactionToRefund, setTransactionToRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  // Estados para el Escáner de Código de Barras
  const [barcodeNotFoundModal, setBarcodeNotFoundModal] = useState({ isOpen: false, code: '' });
  const [barcodeDuplicateModal, setBarcodeDuplicateModal] = useState({ isOpen: false, existingProduct: null, newBarcode: '' });
  const [pendingBarcodeForNewProduct, setPendingBarcodeForNewProduct] = useState('');

  // --- NUEVOS ESTADOS: CLIENTE EN POS ---
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [posSelectedClient, setPosSelectedClient] = useState(null);

  // Inputs temporales
  const [newItem, setNewItem] = useState({
    title: '',
    brand: '',
    price: '',
    purchasePrice: '',
    stock: '',
    categories: [],
    image: '',
    barcode: ''
  });
  const [tempOpeningBalance, setTempOpeningBalance] = useState('');
  const [tempClosingTime, setTempClosingTime] = useState('21:00');

  // Filtros POS e Inventario
  const [selectedPayment, setSelectedPayment] = useState('Efectivo');
  const [installments, setInstallments] = useState(1);
  const [inventoryViewMode, setInventoryViewMode] = useState('grid');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('Todas');
  const [inventorySearch, setInventorySearch] = useState('');
  const [posSearch, setPosSearch] = useState('');
  
  // -- NUEVOS ESTADOS PERSISTENTES PARA POS --
  const [posSelectedCategory, setPosSelectedCategory] = useState('Todas');
  const [posViewMode, setPosViewMode] = useState('grid');
  const [posGridColumns, setPosGridColumns] = useState(4);

  // -- NUEVOS ESTADOS PERSISTENTES PARA INVENTARIO --
  const [inventoryGridColumns, setInventoryGridColumns] = useState(5);

  // ==========================================
  // 4. SISTEMA DE NOTIFICACIONES
  // ==========================================
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // ==========================================
  // 5. FUNCIÓN DE SONIDO BEEP
  // ==========================================
  const playBeep = (success = true) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = success ? 1200 : 400;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // ==========================================
  // 6. CÁLCULOS Y EFECTOS
  // ==========================================
  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (t, i) => t + (Number(i.price) || 0) * (Number(i.quantity) || 0),
      0
    );
    if (selectedPayment === 'Credito') {
      return subtotal * 1.1;
    }
    return subtotal;
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const validTransactions = safeTransactions.filter(
    (t) => t && t.status !== 'voided'
  );

  const totalSales = validTransactions.reduce(
    (acc, tx) => acc + (Number(tx.total) || 0),
    0
  );
  const salesCount = validTransactions.length;

  // Persistencia
  useEffect(() => { window.localStorage.setItem('party_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { window.localStorage.setItem('party_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { window.localStorage.setItem('party_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { window.localStorage.setItem('party_logs', JSON.stringify(dailyLogs)); }, [dailyLogs]);
  useEffect(() => { window.localStorage.setItem('party_openingBalance', JSON.stringify(openingBalance)); }, [openingBalance]);
  useEffect(() => { window.localStorage.setItem('party_isRegisterClosed', JSON.stringify(isRegisterClosed)); }, [isRegisterClosed]);
  useEffect(() => { window.localStorage.setItem('party_closingTime', JSON.stringify(closingTime)); }, [closingTime]);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); 
    return () => clearInterval(timer);
  }, []);

  // Monitor Cierre Automático
  useEffect(() => {
    if (!isRegisterClosed && closingTime) {
      const nowStr = currentTime.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      if (nowStr === closingTime) {
        executeRegisterClose(true);
      }
    }
  }, [currentTime, closingTime, isRegisterClosed]);

  // ==========================================
  // 7. LÓGICA DE NEGOCIO
  // ==========================================

  const addToCart = (item) => {
    if (item.stock === 0) return;
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      if (existing.quantity >= item.stock) {
        showNotification('error', 'Stock Insuficiente', 'No quedan más unidades de este producto.');
        return;
      }
      setCart(cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handleBarcodeScan = (scannedCode, wasInInput) => {
    const product = inventory.find(
      (p) => String(p.barcode) === scannedCode
    );

    if (activeTab === 'pos' && !isRegisterClosed) {
      if (product) {
        if (product.stock === 0) {
          playBeep(false);
          showNotification('error', 'Sin Stock', `"${product.title}" está agotado.`);
          return;
        }
        
        const inCart = cart.find(c => c.id === product.id);
        if (inCart && inCart.quantity >= product.stock) {
          playBeep(false);
          showNotification('error', 'Stock Insuficiente', `No quedan más unidades de "${product.title}".`);
          return;
        }
        
        playBeep(true);
        addToCart(product);
        showNotification('success', 'Producto Escaneado', `${product.title} agregado al carrito.`);
      } else {
        playBeep(false);
        setBarcodeNotFoundModal({ isOpen: true, code: scannedCode });
      }
    } else if (activeTab === 'inventory') {
      playBeep(true);
      setInventorySearch(scannedCode);
      
      if (!product) {
        setTimeout(() => {
          setBarcodeNotFoundModal({ isOpen: true, code: scannedCode });
        }, 300);
      }
    }
  };

  const handleInputScan = (scannedCode) => {
    if (activeTab === 'pos') {
      setPosSearch(''); 
    }
  };

  useBarcodeScanner({
    isEnabled: (activeTab === 'pos' && !isRegisterClosed) || activeTab === 'inventory',
    onScan: handleBarcodeScan,
    onInputScan: handleInputScan
  });

  const handleAddProductFromBarcode = (barcode) => {
    setBarcodeNotFoundModal({ isOpen: false, code: '' });
    setPendingBarcodeForNewProduct(barcode);
    setNewItem({
      title: '',
      brand: '',
      price: '',
      purchasePrice: '',
      stock: '',
      categories: [],
      image: '',
      barcode: barcode
    });
    setIsModalOpen(true);
  };

  const handleDuplicateBarcodeDetected = (existingProduct, newBarcode) => {
    setBarcodeDuplicateModal({
      isOpen: true,
      existingProduct,
      newBarcode
    });
  };

  const handleReplaceDuplicateBarcode = () => {
    const { existingProduct } = barcodeDuplicateModal;
    setInventory(inventory.map(p => 
      p.id === existingProduct.id ? { ...p, barcode: '' } : p
    ));
    setBarcodeDuplicateModal({ isOpen: false, existingProduct: null, newBarcode: '' });
    showNotification('info', 'Código Reemplazado', `Se quitó el código de "${existingProduct.title}".`);
  };

  // (La función addLog se movió arriba para ser accesible por los wrappers)

  const handleLogin = (role) => {
    setCurrentUser(USERS[role]);
    setActiveTab(role === 'admin' ? 'dashboard' : 'pos');
    if (dailyLogs.length === 0) {
      addLog('Sistema Iniciado', 'Carga de datos desde memoria');
    }
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

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setPosSelectedClient(null);
  };

  const handleImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        showNotification('error', 'Error de Imagen', 'La imagen es muy pesada (>500KB).');
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

  // Helper Centralizado para abrir modal de Edición/Ver Detalles de Transacción
  const handleEditTransactionRequest = (tx) => {
    const safeTx = JSON.parse(JSON.stringify(tx));
    safeTx.items = safeTx.items.map((i) => ({
      ...i,
      qty: Number(i.qty) || 0,
      price: Number(i.price) || 0,
    }));
    setEditingTransaction(safeTx);
    setTransactionSearch('');
    setEditReason('');
  };

  const handleViewTicket = (tx) => {
    setTicketToView(tx);
  };

  const handlePrintTicket = () => {
    if (window.electronAPI && window.electronAPI.printSilent) {
      window.electronAPI.printSilent();
      showNotification('success', 'Imprimiendo...', 'El ticket se envió a la impresora.');
    } else {
      window.print();
    }
  };

  // --- CAJA ---
  const toggleRegisterStatus = () => {
    if (isRegisterClosed) {
      setTempOpeningBalance('');
      setTempClosingTime('21:00');
      setIsOpeningBalanceModalOpen(true);
    } else {
      setIsClosingCashModalOpen(true);
    }
  };

  const executeRegisterClose = (isAuto = false) => {
    setIsRegisterClosed(true);
    addLog(
      'Cierre de Caja',
      {
        salesCount: salesCount,
        totalSales: totalSales,
        openingBalance: openingBalance,
        finalBalance: openingBalance + totalSales,
        closingTime: new Date().toLocaleTimeString('es-AR'),
        scheduledClosingTime: closingTime,
        type: isAuto ? 'automatic' : 'manual'
      },
      isAuto ? 'Cierre Automático por Horario' : 'Cierre de jornada'
    );
    setTransactions([]);
    setIsClosingCashModalOpen(false);
    if (isAuto) {
      setIsAutoCloseAlertOpen(true);
    }
  };

  const handleConfirmCloseCash = () => executeRegisterClose(false);

  const handleSaveOpeningBalance = () => {
    const value = Number(tempOpeningBalance);
    if (!isNaN(value) && value >= 0 && tempClosingTime) {
      setOpeningBalance(value);
      setClosingTime(tempClosingTime);
      setIsRegisterClosed(false);
      addLog(
        'Apertura de Caja',
        {
          amount: value,
          scheduledClosingTime: tempClosingTime,
        },
        'Inicio de operaciones'
      );
      setIsOpeningBalanceModalOpen(false);
    }
  };

  const handleSaveClosingTime = () => {
    addLog('Horario Modificado', `Nueva hora de cierre: ${closingTime}`, 'Ajuste de horario');
    setIsClosingTimeModalOpen(false);
    showNotification('success', 'Horario Guardado', 'La hora de cierre se ha actualizado.');
  };

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
    const inUse = inventory.some((p) =>
      Array.isArray(p.categories) ? p.categories.includes(name) : p.category === name
    );

    if (inUse) {
      showNotification('error', 'No se puede eliminar', 'Hay productos que utilizan esta categoría.');
      return;
    }
    if (window.confirm(`¿Eliminar categoría "${name}"?`)) {
      setCategories(categories.filter((c) => c !== name));
      addLog('Categoría', { name, type: 'delete' });
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.categories.length === 0) {
      showNotification('warning', 'Faltan datos', 'Por favor selecciona al menos una categoría.');
      return;
    }
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
      barcode: newItem.barcode || '',
    };
    setInventory([...inventory, item]);
    addLog('Alta de Producto', item, 'Producto Nuevo');
    setNewItem({
      title: '',
      brand: '',
      price: '',
      purchasePrice: '',
      stock: '',
      categories: [],
      image: '',
      barcode: '',
    });
    setIsModalOpen(false);
    setPendingBarcodeForNewProduct('');
    showNotification('success', 'Producto Agregado', 'El producto se guardó en el inventario.');
  };

  const saveEditProduct = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (
      !editingProduct.categories ||
      (Array.isArray(editingProduct.categories) && editingProduct.categories.length === 0)
    ) {
      showNotification('warning', 'Faltan datos', 'El producto debe tener al menos una categoría.');
      return;
    }

    const original = inventory.find((p) => p.id === editingProduct.id);
    const changes = {};
    if (original) {
      const newPrice = Number(editingProduct.price) || 0;
      const newStock = Number(editingProduct.stock) || 0;
      const newCost = Number(editingProduct.purchasePrice) || 0;
      const newCat = editingProduct.categories[0];

      if (original.price !== newPrice) changes.price = { old: original.price, new: newPrice };
      if (original.stock !== newStock) changes.stock = { old: original.stock, new: newStock };
      if (original.purchasePrice !== newCost) changes.purchasePrice = { old: original.purchasePrice, new: newCost };
      if (original.category !== newCat) changes.category = { old: original.category, new: newCat };
      if (original.title !== editingProduct.title) changes.title = { old: original.title, new: editingProduct.title };
    }

    setInventory(
      inventory.map((p) =>
        p.id === editingProduct.id
          ? {
              ...editingProduct,
              price: Number(editingProduct.price) || 0,
              purchasePrice: Number(editingProduct.purchasePrice) || 0,
              stock: Number(editingProduct.stock) || 0,
              category: editingProduct.categories[0],
            }
          : p
      )
    );
    
    addLog(
      'Edición Producto', 
      { 
        productId: editingProduct.id, 
        title: editingProduct.title,
        changes: changes
      }, 
      editReason
    );

    setEditingProduct(null);
    setEditReason('');
    showNotification('success', 'Producto Editado', 'Los cambios se guardaron correctamente.');
  };

  const handleDeleteProductRequest = (id) => {
    const product = inventory.find(p => p.id === id);
    if (product) {
      setProductToDelete(product);
      setDeleteProductReason('');
      setIsDeleteProductModalOpen(true);
    }
  };

  const confirmDeleteProduct = (e) => {
    e.preventDefault();
    if (productToDelete) {
      setInventory(inventory.filter((x) => x.id !== productToDelete.id));
      addLog('Baja Producto', productToDelete, deleteProductReason || 'Sin motivo');
      setIsDeleteProductModalOpen(false);
      setProductToDelete(null);
      showNotification('success', 'Producto Eliminado', 'Se quitó el producto del inventario.');
    }
  };

  const updateCartItemQty = (id, newQty) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 1) return;
    const itemInStock = inventory.find((i) => i.id === id);
    if (qty > itemInStock.stock) {
      showNotification('error', 'Stock Insuficiente', `Máximo disponible: ${itemInStock.stock}`);
      return;
    }
    setCart(cart.map((c) => (c.id === id ? { ...c, quantity: qty } : c)));
  };
  const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));

  // --- CHECKOUT PRINCIPAL (Modificado para soportar flujo de invitado) ---
  const handleCheckout = () => {
    const total = calculateTotal();
    
    const stockIssues = cart.filter((cartItem) => {
      const invItem = inventory.find((i) => i.id === cartItem.id);
      return !invItem || invItem.stock < cartItem.quantity;
    });
    if (stockIssues.length > 0) {
      showNotification('error', 'Error de Stock', 'Algunos productos superan el stock disponible.');
      return;
    }

    setInventory(
      inventory.map((p) => {
        const c = cart.find((x) => x.id === p.id);
        return c ? { ...p, stock: p.stock - c.quantity } : p;
      })
    );
    
    // --- ID GENERATOR ---
    const validIds = transactions
      .map((t) => (typeof t.id === 'number' ? t.id : null))
      .filter((id) => id !== null);

    const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;
    const nextId = maxId + 1;
    
    // --- FIDELIZACIÓN ---
    let pointsEarned = 0;
    let clientSnapshot = null;

    if (posSelectedClient) {
      // Sumamos puntos y obtenemos el nuevo total (podría venir del hook o recalcularse)
      // Nota: addPoints actualiza el estado 'members'. Para el snapshot usamos el dato actualizado en teoría.
      // Simplificación: Ejecutamos addPoints, y asumimos que el nuevo saldo es points + ganados.
      pointsEarned = addPoints(posSelectedClient.id, total, nextId); // Pasamos nextId como orderId
      
      clientSnapshot = {
        id: posSelectedClient.id,
        memberNumber: posSelectedClient.memberNumber, // Guardamos el N° Socio
        name: posSelectedClient.name,
        identifier: posSelectedClient.dni || posSelectedClient.phone, // Para imprimir en ticket viejo si hace falta
        currentPoints: (posSelectedClient.points || 0) + pointsEarned
      };
    }

    const tx = {
      id: nextId,
      date: new Date().toLocaleDateString('es-AR'),
      time: new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      user: currentUser.name,
      total,
      subtotal: total,
      payment: selectedPayment,
      installments: selectedPayment === 'Credito' ? installments : 0,
      items: cart.map((i) => ({
        ...i,
        price: Number(i.price) || 0,
        qty: Number(i.quantity) || 0,
      })),
      status: 'completed',
      client: clientSnapshot, // Guardamos socio
      pointsEarned: pointsEarned
    };
    
    setTransactions([tx, ...transactions]);
    
    addLog(
      'Venta Realizada',
      { 
        transactionId: tx.id, 
        total: total,
        items: tx.items, 
        payment: selectedPayment,
        client: clientSnapshot ? clientSnapshot.name : 'Invitado'
      },
      'Venta regular'
    );

    setSaleSuccessModal(tx);
    setCart([]);
    setInstallments(1);
    setPosSearch('');
    setPosSelectedClient(null); // Limpiar cliente seleccionado
  };

  const handleDeleteTransaction = (tx) => {
    setTransactionToRefund(tx);
    setRefundReason('');
    setIsRefundModalOpen(true);
  };

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
        if (itemInTx) {
          return { ...prod, stock: prod.stock + (Number(itemInTx.qty) || 0) };
        }
        return prod;
      });
      setInventory(newInventory);
      setTransactions(
        transactions.map((t) =>
          t.id === tx.id ? { ...t, status: 'voided' } : t
        )
      );
      addLog(
        'Venta Anulada',
        { 
          transactionId: tx.id, 
          originalTotal: tx.total,
          itemsReturned: tx.items 
        },
        refundReason
      );
      showNotification('warning', 'Venta Anulada', 'Se anuló la venta y se devolvió el stock.');
    }
    setIsRefundModalOpen(false);
    setTransactionToRefund(null);
  };

  const addTxItem = (product) => {
    if (!editingTransaction) return;
    const existingItemIndex = editingTransaction.items.findIndex(
      (i) => i.productId === product.id || (i.id === product.id && !i.productId)
    );
    let updatedItems;
    if (existingItemIndex !== -1) {
      updatedItems = editingTransaction.items.map((i, idx) =>
        idx === existingItemIndex ? { ...i, qty: (Number(i.qty) || 0) + 1 } : i
      );
    } else {
      const maxUniqueId = Math.max(0, ...editingTransaction.items.map((i) => i.uniqueId || 0));
      updatedItems = [
        ...editingTransaction.items,
        {
          uniqueId: maxUniqueId + 1,
          productId: product.id,
          id: product.id,
          title: product.title,
          price: Number(product.price) || 0,
          qty: 1,
        },
      ];
    }
    const subtotal = updatedItems.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0),
      0
    );
    const newTotal = editingTransaction.payment === 'Credito' ? subtotal * 1.1 : subtotal;
    setEditingTransaction({ ...editingTransaction, items: updatedItems, total: newTotal });
    setTransactionSearch('');
  };

  const removeTxItem = (itemIndex) => {
    if (!editingTransaction) return;
    const updatedItems = editingTransaction.items.filter((item, idx) => idx !== itemIndex);
    if (updatedItems.length === 0) {
      showNotification('warning', 'Operación Inválida', 'No puedes dejar la orden vacía.');
      return;
    }
    const subtotal = updatedItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const newTotal = editingTransaction.payment === 'Credito' ? subtotal * 1.1 : subtotal;
    setEditingTransaction({ ...editingTransaction, items: updatedItems, total: newTotal });
  };

  const setTxItemQty = (itemIndex, val) => {
    if (!editingTransaction) return;
    const qty = parseInt(val);
    if (isNaN(qty) || qty < 1) return;
    const updatedItems = editingTransaction.items.map((item, idx) => {
      if (idx === itemIndex) {
        return { ...item, qty: qty };
      }
      return item;
    });
    const subtotal = updatedItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const newTotal = editingTransaction.payment === 'Credito' ? subtotal * 1.1 : subtotal;
    setEditingTransaction({ ...editingTransaction, items: updatedItems, total: newTotal });
  };

  const handleEditTxPaymentChange = (newPayment) => {
    if (!editingTransaction) return;
    const subtotal = editingTransaction.items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const newTotal = newPayment === 'Credito' ? subtotal * 1.1 : subtotal;
    setEditingTransaction({
      ...editingTransaction,
      payment: newPayment,
      total: newTotal,
      installments: newPayment === 'Credito' ? 1 : 0,
    });
  };

  const handleSaveEditedTransaction = (e) => {
    e.preventDefault();
    if (!editingTransaction) return;
    
    const originalTx = transactions.find((t) => t.id === editingTransaction.id);
    if (!originalTx) return;

    const changes = {};
    if (originalTx.total !== editingTransaction.total) {
        changes.total = { old: originalTx.total, new: editingTransaction.total };
    }
    if (originalTx.payment !== editingTransaction.payment) {
        changes.payment = { old: originalTx.payment, new: editingTransaction.payment };
    }

    const productChanges = [];
    const oldItemsMap = new Map(originalTx.items.map(i => [i.id || i.productId, i]));
    
    editingTransaction.items.forEach(newItem => {
        const itemId = newItem.id || newItem.productId;
        const oldItem = oldItemsMap.get(itemId);
        
        if (!oldItem) {
            productChanges.push({
                title: newItem.title,
                oldQty: 0,
                newQty: newItem.qty,
                diff: newItem.qty
            });
        } else if (oldItem.qty !== newItem.qty) {
            productChanges.push({
                title: newItem.title,
                oldQty: oldItem.qty,
                newQty: newItem.qty,
                diff: newItem.qty - oldItem.qty
            });
        }
        if (oldItem) oldItemsMap.delete(itemId);
    });

    oldItemsMap.forEach(oldItem => {
        productChanges.push({
            title: oldItem.title,
            oldQty: oldItem.qty,
            newQty: 0,
            diff: -oldItem.qty
        });
    });

    let tempInventory = [...inventory];
    tempInventory = tempInventory.map((prod) => {
      const originalItem = originalTx.items.find((i) => i.id === prod.id);
      return originalItem ? { ...prod, stock: prod.stock + (Number(originalItem.qty) || 0) } : prod;
    });
    const stockErrors = [];
    editingTransaction.items.forEach((newItem) => {
      const prod = tempInventory.find((p) => p.id === newItem.id);
      if (!prod || prod.stock < (Number(newItem.qty) || 0)) {
        stockErrors.push(newItem.title);
      }
    });
    if (stockErrors.length > 0) {
      showNotification('error', 'Stock Insuficiente', `Error con: ${stockErrors.join('\n- ')}`);
      return;
    }
    tempInventory = tempInventory.map((prod) => {
      const newItem = editingTransaction.items.find((i) => i.id === prod.id);
      return newItem ? { ...prod, stock: prod.stock - (Number(newItem.qty) || 0) } : prod;
    });

    setInventory(tempInventory);
    setTransactions(
      transactions.map((t) => (t.id === editingTransaction.id ? editingTransaction : t))
    );

    addLog(
      'Modificación Pedido', 
      { 
        transactionId: editingTransaction.id,
        changes: changes,
        productChanges: productChanges,
        itemsSnapshot: editingTransaction.items
      }, 
      editReason
    );

    setEditingTransaction(null);
    setEditReason('');
    showNotification('success', 'Pedido Actualizado', 'La transacción fue modificada con éxito.');
  };

  // --- RENDERIZADO LOGIN ---
  if (!currentUser) {
    if (loginStep === 'select') {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-100">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xs text-center border">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-fuchsia-600 rounded-xl shadow-lg">
                <PartyPopper className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-lg font-bold text-slate-800 mb-1">PartyManager</h1>
            <p className="text-slate-500 text-xs mb-6">Selecciona tu usuario</p>
            <div className="space-y-3">
              <button onClick={() => handleSelectRole('admin')} className="w-full flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">DU</div>
                <div className="text-left flex-1"><p className="font-bold text-slate-800 text-sm">Dueño</p></div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
              </button>
              <button onClick={() => handleSelectRole('seller')} className="w-full flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">VE</div>
                <div className="text-left flex-1"><p className="font-bold text-slate-800 text-sm">Vendedor</p></div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
              </button>
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
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setLoginStep('select')} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></button>
              <h1 className="text-lg font-bold text-slate-800">Iniciar Sesión</h1>
              <div className="w-5"></div>
            </div>
            <div className="mb-6 flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${user.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{user.avatar}</div>
              <p className="font-bold text-slate-700">{user.name}</p>
            </div>
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              <div>
                <input autoFocus type="password" placeholder="Contraseña" className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none bg-white text-slate-800 placeholder:text-slate-400" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                {loginError && (<p className="text-xs text-red-500 mt-2">{loginError}</p>)}
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Ingresar</button>
            </form>
          </div>
        </div>
      );
    }
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 text-sm overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b h-14 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                {activeTab === 'pos' ? 'Punto de Venta' : activeTab === 'dashboard' ? 'Control de Caja' : activeTab === 'clients' ? 'Gestión de Socios' : activeTab === 'history' ? 'Historial de Transacciones' : activeTab === 'logs' ? 'Registro de Acciones' : activeTab === 'categories' ? 'Categorías' : 'Gestión de Stock'}
              </h2>
              <p className="text-[11px] text-slate-400">{currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • <span className="font-bold text-slate-500">{currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} hs</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={currentUser.role === 'admin' ? toggleRegisterStatus : undefined} className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${isRegisterClosed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} ${currentUser.role === 'admin' ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`} title={currentUser.role !== 'admin' ? 'Solo el Dueño puede cambiar el estado de la caja' : ''}><Lock size={14} /><span className="text-xs font-bold">{isRegisterClosed ? 'CAJA CERRADA' : 'CAJA ABIERTA'}</span></button>
              {!isRegisterClosed && closingTime && (<div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-amber-700"><Clock size={12} /><span className="text-[10px] font-bold">Cierre: {closingTime}</span></div>)}
            </div>
            <div className="text-right hidden sm:block"><p className="text-xs font-bold text-slate-700">{currentUser.name}</p><span className={`text-[10px] px-2 py-0.5 rounded font-bold ${currentUser.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{currentUser.role === 'admin' ? 'DUEÑO' : 'VENDEDOR'}</span></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 bg-slate-100">
          {activeTab === 'dashboard' && (<DashboardView openingBalance={openingBalance} totalSales={totalSales} salesCount={salesCount} currentUser={currentUser} setTempOpeningBalance={setTempOpeningBalance} setIsOpeningBalanceModalOpen={setIsOpeningBalanceModalOpen} transactions={validTransactions} dailyLogs={dailyLogs} inventory={inventory} />)}
          {activeTab === 'inventory' && (<InventoryView inventory={inventory} categories={categories} currentUser={currentUser} inventoryViewMode={inventoryViewMode} setInventoryViewMode={setInventoryViewMode} gridColumns={inventoryGridColumns} setGridColumns={setInventoryGridColumns} inventorySearch={inventorySearch} setInventorySearch={setInventorySearch} inventoryCategoryFilter={inventoryCategoryFilter} setInventoryCategoryFilter={setInventoryCategoryFilter} setIsModalOpen={setIsModalOpen} setEditingProduct={(prod) => { setEditingProduct(prod); setEditReason(''); }} handleDeleteProduct={handleDeleteProductRequest} setSelectedImage={setSelectedImage} setIsImageModalOpen={setIsImageModalOpen} />)}
          {activeTab === 'pos' && (isRegisterClosed ? (<div className="h-full flex flex-col items-center justify-center text-slate-400"><Lock size={64} className="mb-4 text-slate-300" /><h3 className="text-xl font-bold text-slate-600">Caja Cerrada</h3>{currentUser.role === 'admin' ? (<><p className="mb-6">Debes abrir la caja para realizar ventas.</p><button onClick={toggleRegisterStatus} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Abrir Caja</button></>) : (<p className="mb-6 text-center">El Dueño debe abrir la caja para realizar ventas.</p>)}</div>) : (<POSView inventory={inventory} categories={categories} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} updateCartItemQty={updateCartItemQty} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} installments={installments} setInstallments={setInstallments} calculateTotal={calculateTotal} handleCheckout={handleCheckout} posSearch={posSearch} setPosSearch={setPosSearch} selectedCategory={posSelectedCategory} setSelectedCategory={setPosSelectedCategory} posViewMode={posViewMode} setPosViewMode={setPosViewMode} gridColumns={posGridColumns} setGridColumns={setPosGridColumns} selectedClient={posSelectedClient} setSelectedClient={setPosSelectedClient} onOpenClientModal={() => setIsClientModalOpen(true)} />))}
          
          {/* CLIENTES (SOCIOS) */}
          {activeTab === 'clients' && (
            <ClientsView 
              members={members} 
              // Usamos los WRAPPERS en lugar de las funciones directas
              addMember={handleAddMemberWithLog} 
              updateMember={handleUpdateMemberWithLog}
              deleteMember={handleDeleteMemberWithLog}
              
              currentUser={currentUser}
              onViewTicket={handleViewTicket}
              onEditTransaction={handleEditTransactionRequest}
              onDeleteTransaction={handleDeleteTransaction}
              transactions={transactions}
            />
          )}

          {/* HISTORIAL */}
          {activeTab === 'history' && (<HistoryView transactions={transactions} dailyLogs={dailyLogs} inventory={inventory} currentUser={currentUser} showNotification={showNotification} onViewTicket={handleViewTicket} onDeleteTransaction={handleDeleteTransaction} onEditTransaction={handleEditTransactionRequest} setTransactions={setTransactions} setDailyLogs={setDailyLogs} />)}
          
          {activeTab === 'logs' && currentUser.role === 'admin' && (<LogsView dailyLogs={dailyLogs} setDailyLogs={setDailyLogs} inventory={inventory} />)}
          {activeTab === 'categories' && currentUser.role === 'admin' && (<CategoryManagerView categories={categories} inventory={inventory} onAddCategory={handleAddCategoryFromView} onDeleteCategory={handleDeleteCategoryFromView} onEditCategory={(oldName, newName) => { if (newName && newName !== oldName && !categories.includes(newName)) { setCategories(categories.map((c) => (c === oldName ? newName : c))); setInventory(inventory.map((p) => { let updatedCats = p.categories ? [...p.categories] : p.category ? [p.category] : []; if (updatedCats.includes(oldName)) { updatedCats = updatedCats.map((c) => c === oldName ? newName : c); } const updatedCat = p.category === oldName ? newName : p.category; return { ...p, category: updatedCat, categories: updatedCats, }; })); addLog('Categoría', { name: newName, type: 'edit', oldName: oldName, }); showNotification('success', 'Categoría Editada', 'Nombre actualizado correctamente.'); } }} onBatchUpdateProductCategory={(changes) => { if (!changes || changes.length === 0) return; let updatedInventory = [...inventory]; const logDetails = []; changes.forEach(({ productId, categoryName, action }) => { updatedInventory = updatedInventory.map((p) => { if (p.id === productId) { const currentCats = Array.isArray(p.categories) ? [...p.categories] : p.category ? [p.category] : []; let newCats = [...currentCats]; if (action === 'add') { if (!newCats.includes(categoryName)) newCats.push(categoryName); } else if (action === 'remove') { newCats = newCats.filter((c) => c !== categoryName); } return { ...p, categories: newCats, category: newCats.length > 0 ? newCats[0] : '', }; } return p; }); logDetails.push(`${action === 'add' ? 'Agregado a' : 'Quitado de'} ${categoryName} (Prod: ${productId})`); }); setInventory(updatedInventory); addLog('Edición Masiva Categorías', { count: changes.length, details: logDetails, }); showNotification('success', 'Edición Masiva', `Se actualizaron ${changes.length} productos.`); }} onUpdateProductCategory={() => {}} />)}
        </main>
      </div>

      {/* --- MODALES --- */}
      <TicketPrintLayout transaction={ticketToView || saleSuccessModal} />
      <NotificationModal isOpen={notification.isOpen} onClose={closeNotification} type={notification.type} title={notification.title} message={notification.message} />
      <OpeningBalanceModal isOpen={isOpeningBalanceModalOpen} onClose={() => setIsOpeningBalanceModalOpen(false)} tempOpeningBalance={tempOpeningBalance} setTempOpeningBalance={setTempOpeningBalance} tempClosingTime={tempClosingTime} setTempClosingTime={setTempClosingTime} onSave={handleSaveOpeningBalance} />
      <ClosingTimeModal isOpen={isClosingTimeModalOpen} onClose={() => setIsClosingTimeModalOpen(false)} closingTime={closingTime} setClosingTime={setClosingTime} onSave={handleSaveClosingTime} />
      <AddProductModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setPendingBarcodeForNewProduct(''); }} newItem={newItem} setNewItem={setNewItem} categories={categories} onImageUpload={handleImageUpload} onAdd={handleAddItem} inventory={inventory} onDuplicateBarcode={handleDuplicateBarcodeDetected} />
      <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} setEditingProduct={setEditingProduct} categories={categories} onImageUpload={handleImageUpload} editReason={editReason} setEditReason={setEditReason} onSave={saveEditProduct} inventory={inventory} onDuplicateBarcode={handleDuplicateBarcodeDetected} />
      <EditTransactionModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} inventory={inventory} setEditingTransaction={setEditingTransaction} transactionSearch={transactionSearch} setTransactionSearch={setTransactionSearch} addTxItem={addTxItem} removeTxItem={removeTxItem} setTxItemQty={setTxItemQty} handlePaymentChange={handleEditTxPaymentChange} editReason={editReason} setEditReason={setEditReason} onSave={handleSaveEditedTransaction} />
      <ImageModal isOpen={isImageModalOpen} image={selectedImage} onClose={() => setIsImageModalOpen(false)} />
      <RefundModal transaction={transactionToRefund} onClose={() => setIsRefundModalOpen(false)} refundReason={refundReason} setRefundReason={setRefundReason} onConfirm={handleConfirmRefund} />
      <CloseCashModal isOpen={isClosingCashModalOpen} onClose={() => setIsClosingCashModalOpen(false)} salesCount={salesCount} totalSales={totalSales} openingBalance={openingBalance} onConfirm={handleConfirmCloseCash} />
      <SaleSuccessModal transaction={saleSuccessModal} onClose={() => setSaleSuccessModal(null)} onViewTicket={() => handleViewTicket(saleSuccessModal)} />
      <TicketModal transaction={ticketToView} onClose={() => setTicketToView(null)} onPrint={handlePrintTicket} />
      <AutoCloseAlertModal isOpen={isAutoCloseAlertOpen} onClose={() => setIsAutoCloseAlertOpen(false)} closingTime={closingTime} />
      <DeleteProductModal product={productToDelete} onClose={() => setIsDeleteProductModalOpen(false)} reason={deleteProductReason} setReason={setDeleteProductReason} onConfirm={confirmDeleteProduct} />
      <BarcodeNotFoundModal isOpen={barcodeNotFoundModal.isOpen} scannedCode={barcodeNotFoundModal.code} onClose={() => setBarcodeNotFoundModal({ isOpen: false, code: '' })} onAddProduct={handleAddProductFromBarcode} />
      <BarcodeDuplicateModal isOpen={barcodeDuplicateModal.isOpen} existingProduct={barcodeDuplicateModal.existingProduct} onClose={() => setBarcodeDuplicateModal({ isOpen: false, existingProduct: null, newBarcode: '' })} onKeepExisting={() => setBarcodeDuplicateModal({ isOpen: false, existingProduct: null, newBarcode: '' })} onReplaceBarcode={handleReplaceDuplicateBarcode} />
      
      {/* NUEVO MODAL DE SELECCIÓN DE SOCIO */}
      <ClientSelectionModal 
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clients={members} 
        addClient={handleAddMemberWithLog} // Usamos el wrapper aquí también
        onSelectClient={(client, mode) => {
          setPosSelectedClient(client);
        }}
        // Callback para continuar compra sin socio
        onCancelFlow={() => {
          handleCheckout();
        }}
      />
    </div>
  );
}