import React from 'react';
import {
  X,
  DollarSign,
  Clock,
  Upload,
  Image as ImageIcon,
  FileText,
  Search,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ShoppingBag,
  Lock,
  Edit2
} from 'lucide-react';
import { PAYMENT_METHODS } from '../data';

// --- COMPONENTE INTERNO: SELECTOR MULTIPLE DE CATEGORIAS ---
export const CategoryMultiSelect = ({ allCategories, selectedCategories, onChange }) => {
  const safeSelected = Array.isArray(selectedCategories) ? selectedCategories : [];

  const handleAdd = (e) => {
    const val = e.target.value;
    if (val && !safeSelected.includes(val)) {
      onChange([...safeSelected, val]);
    }
    e.target.value = '';
  };

  const handleRemove = (catToRemove) => {
    onChange(safeSelected.filter((c) => c !== catToRemove));
  };

  const availableToAdd = allCategories.filter((c) => !safeSelected.includes(c));

  return (
    <div className="w-full">
      <div className="min-h-[42px] px-3 py-2 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-fuchsia-500 focus-within:border-fuchsia-500">
        <div className="flex flex-wrap gap-2 mb-1">
          {safeSelected.map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1 bg-fuchsia-100 text-fuchsia-700 text-xs font-bold px-2 py-1 rounded-md">
              {cat}
              <button type="button" onClick={() => handleRemove(cat)} className="hover:text-fuchsia-900 focus:outline-none">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <select className="w-full text-xs bg-transparent outline-none text-slate-500 cursor-pointer" onChange={handleAdd} value="">
          <option value="" disabled>
            {safeSelected.length === 0 ? 'Seleccionar categorías...' : '+ Agregar otra categoría'}
          </option>
          {availableToAdd.map((c) => (
            <option key={c} value={c} className="text-slate-800">{c}</option>
          ))}
        </select>
      </div>
      {safeSelected.length === 0 && <p className="text-[10px] text-red-400 mt-1 ml-1">* Debe seleccionar al menos una</p>}
    </div>
  );
};

// --- MODALES ---

export const OpeningBalanceModal = ({ isOpen, onClose, tempOpeningBalance, setTempOpeningBalance, tempClosingTime, setTempClosingTime, onSave }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <h3 className="font-bold text-lg">Apertura de Caja</h3>
          <p className="text-green-100 text-xs">Configure los datos para iniciar la jornada</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Monto Inicial en Caja</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="number" placeholder="0" className="w-full pl-10 pr-4 py-3 text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={tempOpeningBalance} onChange={(e) => setTempOpeningBalance(e.target.value)} autoFocus />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Horario de Cierre Programado</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="time" className="w-full pl-10 pr-4 py-3 text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={tempClosingTime} onChange={(e) => setTempClosingTime(e.target.value)} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">La caja se deberá cerrar a esta hora</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500 mb-2">Resumen de apertura:</p>
            <div className="flex justify-between text-sm"><span className="text-slate-600">Monto inicial:</span><span className="font-bold text-slate-800">${Number(tempOpeningBalance || 0).toLocaleString()}</span></div>
            <div className="flex justify-between text-sm mt-1"><span className="text-slate-600">Cierre programado:</span><span className="font-bold text-slate-800">{tempClosingTime || '--:--'}</span></div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button onClick={onSave} disabled={!tempOpeningBalance || !tempClosingTime} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed">Abrir Caja</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClosingTimeModal = ({ isOpen, onClose, closingTime, setClosingTime, onSave }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-5 text-center">
        <h3 className="font-bold text-slate-800 mb-4">Configurar Hora de Cierre</h3>
        <input type="time" className="w-full text-center text-2xl font-bold p-2 border rounded mb-4" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} />
        <button onClick={onSave} className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold">Guardar</button>
      </div>
    </div>
  );
};

export const AddProductModal = ({ isOpen, onClose, newItem, setNewItem, categories, onImageUpload, onAdd }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-800">Nuevo Producto</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={onAdd} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nombre</label>
            <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-500 outline-none" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo ($)</label>
              <input required type="number" className="w-full px-3 py-2 border rounded-lg" value={newItem.purchasePrice} onChange={(e) => setNewItem({ ...newItem, purchasePrice: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Precio ($)</label>
              <input required type="number" className="w-full px-3 py-2 border rounded-lg font-bold text-slate-800" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Stock</label>
              <input required type="number" className="w-full px-3 py-2 border rounded-lg" value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Categoría(s)</label>
              <CategoryMultiSelect allCategories={categories} selectedCategories={newItem.categories} onChange={(newCats) => setNewItem({ ...newItem, categories: newCats })} />
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex items-center gap-1"><ImageIcon size={12} /> Imagen del producto</label>
            <div className="mb-3">
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50">
                <div className="flex flex-col items-center justify-center pt-2 pb-2"><Upload size={20} className="text-slate-400 mb-1" /><p className="text-[10px] text-slate-500">Click para subir imagen</p></div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, false)} />
              </label>
            </div>
            <div><input type="text" placeholder="O pega una URL aquí..." className="w-full px-3 py-2 border rounded-lg text-xs" value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} /></div>
            {newItem.image && (<div className="mt-3 flex justify-center"><img src={newItem.image} alt="Preview" className="h-20 w-20 object-cover rounded border shadow-sm" /></div>)}
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800">Agregar</button>
        </form>
      </div>
    </div>
  );
};

export const EditProductModal = ({ product, onClose, setEditingProduct, categories, onImageUpload, editReason, setEditReason, onSave }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-800">Editar Producto</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={onSave} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nombre</label>
            <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={product.title} onChange={(e) => setEditingProduct({ ...product, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo ($)</label>
              <input required type="number" className="w-full px-3 py-2 border rounded-lg" value={product.purchasePrice} onChange={(e) => setEditingProduct({ ...product, purchasePrice: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Precio ($)</label>
              <input required type="number" className="w-full px-3 py-2 border rounded-lg font-bold" value={product.price} onChange={(e) => setEditingProduct({ ...product, price: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Stock</label>
              <input required type="number" className="w-full px-3 py-2 border rounded-lg" value={product.stock} onChange={(e) => setEditingProduct({ ...product, stock: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Categoría(s)</label>
              <CategoryMultiSelect allCategories={categories} selectedCategories={product.categories || []} onChange={(newCats) => setEditingProduct({ ...product, categories: newCats })} />
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex items-center gap-1"><ImageIcon size={12} /> Imagen del producto</label>
            <div className="mb-3">
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50">
                <div className="flex flex-col items-center justify-center pt-2 pb-2"><Upload size={20} className="text-slate-400 mb-1" /><p className="text-[10px] text-slate-500">Click para cambiar imagen</p></div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, true)} />
              </label>
            </div>
            <div><input type="text" className="w-full px-3 py-2 border rounded-lg text-xs" value={product.image} onChange={(e) => setEditingProduct({ ...product, image: e.target.value })} /></div>
            {product.image && (<div className="mt-3 flex justify-center"><img src={product.image} alt="Preview" className="h-20 w-20 object-cover rounded border shadow-sm" /></div>)}
          </div>
          <div>
            <label className="text-xs font-bold text-amber-600 uppercase block mb-1 flex items-center gap-1"><FileText size={12} /> Motivo del cambio (Opcional)</label>
            <textarea className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-amber-50 focus:ring-2 focus:ring-amber-500 outline-none" rows="2" placeholder="¿Por qué realizas este cambio?" value={editReason} onChange={(e) => setEditReason(e.target.value)}></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Guardar Cambios</button>
        </form>
      </div>
    </div>
  );
};

export const EditTransactionModal = ({ transaction, onClose, inventory, setEditingTransaction, transactionSearch, setTransactionSearch, addTxItem, removeTxItem, setTxItemQty, handlePaymentChange, editReason, setEditReason, onSave }) => {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <div><h3 className="font-bold text-slate-800">Modificar Pedido #{transaction.id}</h3><p className="text-[10px] text-slate-400">Cambiar cantidades recalcula stock y total</p></div>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="mb-3 relative">
            <div className="flex items-center border rounded-lg px-2 bg-slate-50"><Search size={14} className="text-slate-400" /><input type="text" placeholder="Buscar producto para agregar..." className="w-full p-2 bg-transparent text-xs outline-none" value={transactionSearch} onChange={(e) => setTransactionSearch(e.target.value)} /></div>
            {transactionSearch && (
              <div className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded-b-lg max-h-40 overflow-y-auto z-10">
                {inventory.filter((p) => p.title.toLowerCase().includes(transactionSearch.toLowerCase())).map((p) => (
                  <button key={p.id} onClick={() => addTxItem(p)} className="w-full text-left p-2 hover:bg-fuchsia-50 text-xs flex justify-between items-center border-b"><span>{p.title}</span><span className="font-bold">${p.price}</span></button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            {transaction.items.map((item, itemIndex) => (
              <div key={`item-${itemIndex}-${item.title}`} className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                <div className="flex-1"><p className="text-xs font-bold text-slate-700">{item.title}</p><p className="text-[10px] text-slate-500">${(Number(item.price) || 0).toLocaleString()}</p></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white border rounded"><input type="number" min="1" className="w-12 p-1 text-xs border rounded text-center font-bold bg-white focus:ring-2 focus:ring-fuchsia-500 outline-none" value={item.qty} onChange={(e) => setTxItemQty(itemIndex, e.target.value)} /></div>
                  <button onClick={() => removeTxItem(itemIndex)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={onSave} className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Método de Pago</label>
              <select className="w-full px-2 py-2 border rounded-lg bg-white text-xs" value={transaction.payment} onChange={(e) => handlePaymentChange(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (<option key={m.id} value={m.id}>{m.label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Total ($)</label>
              <input readOnly type="text" className="w-full px-2 py-2 border rounded-lg font-bold text-slate-700 bg-slate-100 text-xs" value={(Number(transaction.total) || 0).toLocaleString()} />
            </div>
          </div>
          {transaction.payment === 'Credito' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 p-2 rounded border border-amber-200 text-xs"><AlertCircle size={14} /><span className="font-bold">10% de recargo aplicado al total</span></div>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                <span className="text-xs font-bold text-slate-600">Cuotas</span>
                <select className="text-xs p-1.5 rounded border bg-white" value={transaction.installments || 1} onChange={(e) => setEditingTransaction({ ...transaction, installments: Number(e.target.value) })}>
                  <option value={1}>1 pago</option><option value={3}>3 cuotas</option><option value={6}>6 cuotas</option><option value={12}>12 cuotas</option>
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-amber-600 uppercase block mb-1 flex items-center gap-1"><FileText size={12} /> Motivo del cambio (Opcional)</label>
            <textarea className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-amber-50 focus:ring-2 focus:ring-amber-500 outline-none" rows="2" placeholder="¿Por qué modificas el pedido?" value={editReason} onChange={(e) => setEditReason(e.target.value)}></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Confirmar Cambios</button>
        </form>
      </div>
    </div>
  );
};

export const ImageModal = ({ isOpen, image, onClose }) => {
  if (!isOpen || !image) return null;
  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 cursor-pointer" onClick={onClose}>
      <img src={image} alt="Zoom" className="max-w-full max-h-full rounded-lg shadow-2xl" />
      <button className="absolute top-5 right-5 text-white/70 hover:text-white"><X size={32} /></button>
    </div>
  );
};

export const RefundModal = ({ transaction, onClose, refundReason, setRefundReason, onConfirm }) => {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
          <h3 className="font-bold text-red-800 flex items-center gap-2"><AlertTriangle size={18} /> {transaction.status === 'voided' ? 'Eliminar Registro' : 'Anular Venta'}</h3>
          <button onClick={onClose}><X size={18} className="text-red-400 hover:text-red-600" /></button>
        </div>
        <form onSubmit={onConfirm} className="p-5">
          <p className="text-sm text-slate-600 mb-4">{transaction.status === 'voided' ? 'Esta acción borrará definitivamente el registro del historial. No se puede deshacer.' : `Se marcará la venta #${transaction.id} como anulada y se devolverá el stock al inventario.`}</p>
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Motivo (Opcional)</label>
            <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none" rows="3" placeholder="Ej: Cliente devolvió los productos..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} autoFocus></textarea>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">{transaction.status === 'voided' ? 'Borrar Definitivamente' : 'Confirmar Anulación'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CloseCashModal = ({ isOpen, onClose, salesCount, totalSales, openingBalance, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
          <h3 className="font-bold text-lg flex items-center gap-2"><Lock size={20} /> Cerrar Caja</h3>
          <p className="text-slate-300 text-sm">Resumen del día</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100"><p className="text-[10px] font-bold text-blue-500 uppercase">Ventas Realizadas</p><p className="text-2xl font-bold text-blue-700">{salesCount}</p></div>
            <div className="bg-fuchsia-50 p-3 rounded-lg border border-fuchsia-100"><p className="text-[10px] font-bold text-fuchsia-500 uppercase">Total Vendido</p><p className="text-2xl font-bold text-fuchsia-700">${totalSales.toLocaleString()}</p></div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border space-y-2">
            <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Caja Inicial</span><span className="font-bold text-slate-700">${openingBalance.toLocaleString()}</span></div>
            <div className="flex justify-between items-center text-sm"><span className="text-slate-500">+ Ventas del día</span><span className="font-bold text-fuchsia-600">+${totalSales.toLocaleString()}</span></div>
            <div className="border-t pt-2 flex justify-between items-center"><span className="font-bold text-slate-700">Total en Caja</span><span className="text-xl font-bold text-green-600">${(openingBalance + totalSales).toLocaleString()}</span></div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700"><p className="font-bold flex items-center gap-2"><AlertTriangle size={16} /> Atención</p><p className="text-xs mt-1">Esta acción reiniciará las transacciones del día. Asegurate de haber revisado el resumen.</p></div>
        </div>
        <div className="p-4 bg-slate-50 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition">Cancelar</button>
          <button onClick={onConfirm} className="px-6 py-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition flex items-center gap-2"><Lock size={14} /> Confirmar Cierre</button>
        </div>
      </div>
    </div>
  );
};

export const SaleSuccessModal = ({ transaction, onClose }) => {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"><CheckCircle size={40} className="text-green-500" /></div>
          <h3 className="text-xl font-bold text-white">¡Venta Exitosa!</h3>
          <p className="text-green-100 text-sm">La transacción se ha registrado correctamente</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 text-center"><p className="text-xs text-slate-400 uppercase font-bold">Número de Pedido</p><p className="text-3xl font-bold text-slate-800">#{transaction.id}</p></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-blue-400 uppercase">Vendedor</p><p className="font-bold text-blue-700">{transaction.user}</p></div>
            <div className="bg-fuchsia-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-fuchsia-400 uppercase">Método de Pago</p><p className="font-bold text-fuchsia-700">{transaction.payment === 'MercadoPago' ? 'Mercado Pago' : transaction.payment}{transaction.installments > 1 && ` (${transaction.installments} cuotas)`}</p></div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><ShoppingBag size={12} /> Productos ({transaction.items?.length || 0})</p>
            <div className="bg-slate-50 rounded-lg divide-y max-h-32 overflow-y-auto">
              {(transaction.items || []).map((item, idx) => (
                <div key={idx} className="p-2 flex justify-between items-center text-sm">
                  <div className="flex-1 min-w-0"><p className="font-medium text-slate-700 truncate">{item.title}</p><p className="text-[10px] text-slate-400">{item.qty} x ${item.price?.toLocaleString()}</p></div>
                  <span className="font-bold text-slate-800 shrink-0 ml-2">${((item.qty || 0) * (item.price || 0)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-3">
            {transaction.payment === 'Credito' && transaction.subtotal && (
              <><div className="flex justify-between text-sm text-slate-500 mb-1"><span>Subtotal</span><span>${transaction.subtotal?.toLocaleString()}</span></div><div className="flex justify-between text-sm text-amber-600 mb-2"><span>Recargo (10%)</span><span>+${Math.round(transaction.subtotal * 0.1).toLocaleString()}</span></div></>
            )}
            <div className="flex justify-between items-end"><span className="font-bold text-slate-600">TOTAL</span><span className="text-2xl font-bold text-green-600">${transaction.total?.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t"><button onClick={onClose} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"><CheckCircle size={18} /> Continuar</button></div>
      </div>
    </div>
  );
};

export const AutoCloseAlertModal = ({ isOpen, onClose, closingTime }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><Clock size={32} className="text-amber-600" /></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Cierre Automático</h3>
          <p className="text-slate-500 text-sm mb-6">Se ha cumplido el horario de cierre programado ({closingTime} hs).<br />La caja se ha cerrado y el resumen se guardó en el historial.</p>
          <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Entendido</button>
        </div>
      </div>
    </div>
  );
};

export const DeleteProductModal = ({ product, onClose, reason, setReason, onConfirm }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
          <h3 className="font-bold text-red-800 flex items-center gap-2"><Trash2 size={18} /> Eliminar Producto</h3>
          <button onClick={onClose}><X size={18} className="text-red-400 hover:text-red-600" /></button>
        </div>
        <div className="p-6">
          <div className="flex gap-4 items-start mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle size={24} className="text-red-600" /></div>
            <div><p className="text-slate-700 font-bold text-lg leading-tight mb-1">¿Estás seguro?</p><p className="text-slate-500 text-sm">Vas a eliminar <span className="font-bold text-slate-800">"{product.title}"</span> del inventario.</p></div>
          </div>
          <div className="mb-4">
             <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Motivo (Opcional)</label>
             <input type="text" placeholder="Ej: Producto discontinuado" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors">Sí, Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
};