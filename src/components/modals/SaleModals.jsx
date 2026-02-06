// src/components/modals/SaleModals.jsx
// ♻️ REFACTOR: Extraído de AppModals.jsx — Modales de venta exitosa, ticket e imagen

import React from 'react';
import {
  X,
  CheckCircle,
  Printer,
  FileOutput,
} from 'lucide-react';
import { formatPrice, formatTime24 } from '../../utils/helpers';

export const ImageModal = ({ isOpen, image, onClose }) => {
  if (!isOpen || !image) return null;
  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 cursor-pointer" onClick={onClose}>
      <img src={image} alt="Zoom" className="max-w-full max-h-full rounded-lg shadow-2xl" />
      <button className="absolute top-5 right-5 text-white/70 hover:text-white"><X size={32} /></button>
    </div>
  );
};

export const SaleSuccessModal = ({ transaction, onClose, onViewTicket }) => {
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
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-400 uppercase font-bold">Número de Compra</p>
            <p className="text-3xl font-bold text-slate-800">#{String(transaction.id).padStart(6, '0')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-blue-400 uppercase">Vendedor</p><p className="font-bold text-blue-700">{transaction.user}</p></div>
            <div className="bg-fuchsia-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-fuchsia-400 uppercase">Método de Pago</p><p className="font-bold text-fuchsia-700">{transaction.payment}{transaction.installments > 1 && ` (${transaction.installments} cuotas)`}</p></div>
          </div>
          <div className="border-t pt-3 flex justify-between items-end"><span className="font-bold text-slate-600">TOTAL</span><span className="text-2xl font-bold text-green-600">${formatPrice(transaction.total)}</span></div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex gap-3">
          <button onClick={onViewTicket} className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition flex items-center justify-center gap-2"><FileOutput size={18} /> Ver Ticket</button>
          <button onClick={onClose} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"><CheckCircle size={18} /> Continuar</button>
        </div>
      </div>
    </div>
  );
};

export const TicketModal = ({ transaction, onClose, onPrint }) => {
  if (!transaction) return null;
  const formattedId = String(transaction.id).padStart(6, '0');

  // ♻️ REFACTOR: formatTime24 importado desde helpers.js
  const timeFormatted = formatTime24(transaction.time || transaction.timestamp);

  // --- LÓGICA DE RECARGO PARA VISTA PREVIA ---
  const itemsSubtotal = (transaction.items || []).reduce((acc, item) => {
    const p = Number(item.price) || 0;
    const q = Number(item.qty || item.quantity) || 1;
    return acc + (p * q);
  }, 0);

  let surcharge = 0;
  if (transaction.total > itemsSubtotal + 0.1) {
    surcharge = transaction.total - itemsSubtotal;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden w-full max-w-sm">
        <div className="p-4 bg-slate-100 border-b flex justify-between items-center shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileOutput size={18} /> Visualización Ticket</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-6 bg-slate-200 flex justify-center">
          {/* VISTA PREVIA ESTILO TICKET */}
          <div 
            className="bg-white shadow-lg p-5 w-[280px] text-slate-900 leading-tight select-none"
            style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: 'bold' }}
          >
            {/* Header */}
            <div className="text-center text-sm font-black mb-1">COTILLON REBU</div>
            <div className="text-center text-[10px] mb-2">Articulos para Fiestas</div>
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Info Negocio */}
            <div className="text-center">Direccion: Calle 158 4440</div>
            <div className="text-center">Tel: 11-5483-0409</div>
            <div className="text-center">Instagram: @rebucotillon</div>
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Info Venta */}
            <div className="flex justify-between"><span>Fecha:</span><span>{transaction.date?.split(',')[0]}</span></div>
            <div className="flex justify-between"><span>Hora:</span><span>{timeFormatted}</span></div>
            <div className="font-black mt-1">Compra N°: {formattedId}</div>
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Fidelización */}
            {transaction.client ? (
              <>
                <div className="flex justify-between"><span>Nº Socio:</span><span>#{String(transaction.client.identifier || transaction.client.memberNumber).padStart(4,'0')}</span></div>
                <div className="flex justify-between"><span>Puntos Sumados:</span><span>+{transaction.pointsEarned || 0}</span></div>
                <div className="flex justify-between"><span>Puntos Total:</span><span>{transaction.client.currentPoints}</span></div>
                <div className="border-t border-dashed border-slate-400 my-2"></div>
              </>
            ) : (
              <>
                <div className="flex justify-between"><span>Nº Cliente:</span><span></span></div>
                <div className="flex justify-between"><span>Puntos Sumados:</span><span></span></div>
                <div className="flex justify-between"><span>Puntos Total:</span><span></span></div>
                <div className="border-t border-dashed border-slate-400 my-2"></div>
              </>
            )}

            {/* Items */}
            <div className="space-y-1">
              {(transaction.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <span className="flex-1 pr-2">
                    {item.qty > 1 ? `(${item.qty}) ` : ''}{item.title}
                  </span>
                  <span>$ {formatPrice((item.qty || 1) * (item.price || 0))}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Totales */}
            <div className="flex justify-between"><span>Subtotal:</span><span>$ {formatPrice(itemsSubtotal)}</span></div>
            
            {surcharge > 0 && (
              <div className="flex justify-between"><span>Recargo (10%):</span><span>$ {formatPrice(surcharge)}</span></div>
            )}
            
            <div className="flex justify-between"><span>Descuento:</span><span>$ 0</span></div>
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            <div className="flex justify-between font-black text-sm"><span>TOTAL:</span><span>$ {formatPrice(transaction.total)}</span></div>
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Pago */}
            <div>Pago: {transaction.payment?.toUpperCase()}</div>
            {transaction.installments > 1 && (
               <div>Cuotas: {transaction.installments}</div>
            )}
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Footer */}
            <div className="text-center mt-3">¡Gracias por tu compra!</div>
            <div className="text-center text-[10px] mt-1">Volve pronto :D</div>
            <br />
            <div className="border-t border-dashed border-slate-400 my-1"></div>
          </div>
        </div>

        <div className="p-4 border-t bg-white shrink-0">
          <button onClick={onPrint} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg">
            <Printer size={20} /> Imprimir Ahora
          </button>
        </div>
      </div>
    </div>
  );
};
