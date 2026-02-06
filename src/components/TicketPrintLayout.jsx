import React from 'react';
// ♻️ REFACTOR: Importar funciones desde helpers.js en lugar de definirlas localmente
import { formatPrice, formatTime24 } from '../utils/helpers';

export const TicketPrintLayout = ({ transaction }) => {
  if (!transaction) return null;

  // --- ESTILOS CSS ---
  const cssStyles = `
    /* ESTILOS BASE (Pantalla e Impresión) */
    #printable-ticket {
      width: 58mm;
      box-sizing: border-box;
      padding: 2mm 3.5mm;
      background-color: white;
      margin: 30px auto; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #eee;
      font-family: Arial, sans-serif;
      font-size: 10px;
      font-weight: bold;
      line-height: 1.2;
      color: #000;
    }
    .ticket-header { text-align: center; font-size: 12px !important; font-weight: 900 !important; margin-bottom: 2mm; text-transform: uppercase; }
    .ticket-subheader { text-align: center; font-size: 10px !important; font-weight: bold !important; margin-bottom: 0.5mm; }
    .ticket-divider { border: none; border-top: 1px dashed #000; margin: 1.5mm 0; }
    .ticket-info { font-size: 10px !important; font-weight: bold !important; margin: 0.5mm 0; display: flex; justify-content: space-between; align-items: flex-start; }
    .ticket-centered { justify-content: center; display: block; text-align: center; }
    .ticket-item { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin: 0.8mm 0; font-size: 10px !important; font-weight: bold !important; }
    .ticket-item-name { flex: 1; padding-right: 1mm; text-align: left; word-break: break-word; }
    .ticket-item-price { text-align: right; white-space: nowrap; min-width: 15mm; }
    .ticket-total-row { display: flex; justify-content: space-between; width: 100%; margin: 0.5mm 0; font-size: 10px !important; font-weight: bold !important; }
    .ticket-grand-total { font-size: 14px !important; font-weight: 900 !important; margin: 2mm 0; }
    .ticket-footer { text-align: center; font-size: 10px !important; font-weight: bold !important; margin-top: 3mm; }

    @media print {
      @page { size: 58mm auto; margin: 0 !important; }
      html, body { margin: 0 !important; padding: 0 !important; width: 58mm !important; background-color: white; }
      body * { visibility: hidden; }
      #printable-ticket, #printable-ticket * { visibility: visible; }
      #printable-ticket { position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
    }
  `;

  // CASO A: SOLO SALDO
  if (transaction.isPointsTicket) {
    return (
      <div id="printable-ticket">
        <style>{cssStyles}</style>
        <div className="ticket-header">COTILLON REBU</div>
        <div className="ticket-subheader">Articulos para Fiestas</div>
        <hr className="ticket-divider" />
        <div className="ticket-info ticket-centered">Direccion: Calle 158 4440,Platanos.</div>
        <div className="ticket-info ticket-centered">Tel: 11-5483-0409</div>
        <div className="ticket-info ticket-centered">Instagram: @rebucotillon</div>
        <hr className="ticket-divider" />
        <div className="ticket-info"><span>Fecha:</span><span>{transaction.date}</span></div>
        <div className="ticket-info"><span>Hora:</span><span>{transaction.time}</span></div>
        <hr className="ticket-divider" />
        <div className="ticket-info"><span>Socio (N°):</span><span style={{textAlign: 'right'}}>{transaction.client?.name} [#{String(transaction.id).padStart(4, '0')}]</span></div>
        <div className="ticket-info"><span>Puntos Totales:</span><span>{transaction.client?.points || 0}</span></div>
        <hr className="ticket-divider" />
        <div className="ticket-subheader" style={{marginTop: '3mm'}}>Volve pronto :D</div>
        <br /><hr className="ticket-divider" />
      </div>
    );
  }

  // CASO B: VENTA
  const formattedId = String(transaction.id).padStart(6, '0');
  const timeFormatted = formatTime24(transaction.time || transaction.timestamp);

  const itemsSubtotal = (transaction.items || []).reduce((acc, item) => {
    // Para canjes de tipo descuento, NO restan al subtotal visual, se muestran después
    if (item.type === 'discount') return acc;
    // Productos gratis (isReward=true) suman 0
    return acc + (Number(item.price) * Number(item.qty));
  }, 0);

  // Filtramos descuentos explícitos de canje para mostrarlos abajo
  const redemptionDiscounts = (transaction.items || []).filter(i => i.type === 'discount');
  const totalRedemptionDiscount = redemptionDiscounts.reduce((acc, i) => acc + Math.abs(i.price), 0);

  let surcharge = 0;
  // Calculamos recargo sobre el total real final
  if (transaction.total > (itemsSubtotal - totalRedemptionDiscount) + 0.1) {
    surcharge = transaction.total - (itemsSubtotal - totalRedemptionDiscount);
  }

  return (
    <div id="printable-ticket">
      <style>{cssStyles}</style>
      <div className="ticket-header">COTILLON REBU</div>
      <div className="ticket-subheader">Articulos para Fiestas</div>
      <hr className="ticket-divider" />
      <div className="ticket-info ticket-centered">Direccion: Calle 158 4440</div>
      <div className="ticket-info ticket-centered">Tel: 11-5483-0409</div>
      <div className="ticket-info ticket-centered">Instagram: @rebucotillon</div>
      <hr className="ticket-divider" />
      <div className="ticket-info"><span>Fecha:</span><span>{transaction.date?.split(',')[0]}</span></div>
      <div className="ticket-info"><span>Hora:</span><span>{timeFormatted}</span></div>
      <div className="ticket-info"><span>Compra N°:</span><span>{formattedId}</span></div>
      <hr className="ticket-divider" />

      {transaction.client && (
        <>
          <div className="ticket-info"><span>Socio (N°):</span><span style={{textAlign: 'right'}}>{transaction.client.name} [#{String(transaction.client.memberNumber || transaction.client.id).padStart(4,'0')}]</span></div>
          {/* Mostramos Puntos Gastados si hubo canje */}
          {transaction.pointsSpent > 0 && (
             <div className="ticket-info"><span>Puntos Canjeados:</span><span>-{transaction.pointsSpent}</span></div>
          )}
          {/* Mostramos Puntos Ganados solo si son positivos */}
          {transaction.pointsGainedReal > 0 && (
             <div className="ticket-info"><span>Puntos Ganados:</span><span>+{transaction.pointsGainedReal}</span></div>
          )}
          {transaction.client.currentPoints !== undefined && (
             <div className="ticket-info"><span>Puntos Totales:</span><span>{transaction.client.currentPoints}</span></div>
          )}
          <hr className="ticket-divider" />
        </>
      )}

      <div style={{ marginBottom: '1mm' }}>
        {(transaction.items || []).map((item, idx) => {
          if (item.type === 'discount') return null; // Los descuentos van al final
          
          const qty = item.qty || item.quantity || 1;
          const price = Number(item.price);
          const lineTotal = qty * price;
          
          return (
            <div key={idx} className="ticket-item">
              <span className="ticket-item-name">{qty > 1 ? `(${qty}) ` : ''}{item.title}</span>
              <span className="ticket-item-price">
                {item.isReward ? 'GRATIS' : `$ ${formatPrice(lineTotal)}`}
              </span>
            </div>
          );
        })}
      </div>
      <hr className="ticket-divider" />

      <div className="ticket-total-row"><span>Subtotal:</span><span>$ {formatPrice(itemsSubtotal)}</span></div>
      
      {/* DESCUENTOS POR CANJE */}
      {redemptionDiscounts.map((disc, idx) => (
        <div key={`d-${idx}`} className="ticket-total-row">
          <span>Descuento ({disc.title}):</span>
          <span>-$ {formatPrice(Math.abs(disc.price))}</span>
        </div>
      ))}

      {surcharge > 0 && (
        <div className="ticket-total-row"><span>Recargo (10%):</span><span>$ {formatPrice(surcharge)}</span></div>
      )}

      <hr className="ticket-divider" />
      <div className="ticket-total-row ticket-grand-total"><span>TOTAL:</span><span>$ {formatPrice(transaction.total)}</span></div>
      <hr className="ticket-divider" />
      <div className="ticket-info"><span>Pago:</span><span>{transaction.payment?.toUpperCase()}</span></div>
      {transaction.installments > 1 && (<div className="ticket-info"><span>Cuotas:</span><span>{transaction.installments}</span></div>)}
      <hr className="ticket-divider" />
      <div className="ticket-footer">¡Gracias por tu compra!</div>
      <div className="ticket-subheader" style={{marginTop: '1mm'}}>Volve pronto :D</div>
      <br /><hr className="ticket-divider" />
    </div>
  );
};