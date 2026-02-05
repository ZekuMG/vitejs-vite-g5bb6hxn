import React from 'react';

export const TicketPrintLayout = ({ transaction }) => {
  if (!transaction) return null;

  // Formatear ID a 6 dígitos
  const formattedId = String(transaction.id).padStart(6, '0');

  // Formatear hora a 24hrs
  const formatTime24 = (timeStr) => {
    if (!timeStr) return '--:--';
    if (/^\d{1,2}:\d{2}$/.test(timeStr) && !timeStr.toLowerCase().includes('m')) {
      return timeStr;
    }
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3]?.toLowerCase().replace(/[\s.]/g, '') || '';
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    return timeStr;
  };

  // Formatear precio
  const formatPrice = (value) => {
    const num = Number(value) || 0;
    return num % 1 === 0 ? num.toLocaleString('es-AR') : num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const timeFormatted = formatTime24(transaction.time || transaction.timestamp);

  // --- LÓGICA DE RECARGO ---
  // 1. Calcular subtotal real sumando los items (precio base)
  const itemsSubtotal = (transaction.items || []).reduce((acc, item) => {
    const p = Number(item.price) || 0;
    const q = Number(item.qty || item.quantity) || 1;
    return acc + (p * q);
  }, 0);

  // 2. Calcular diferencia (Recargo)
  // Usamos un pequeño umbral (0.1) para evitar mostrar cosas por errores de redondeo infinitesimales
  let surcharge = 0;
  if (transaction.total > itemsSubtotal + 0.1) {
    surcharge = transaction.total - itemsSubtotal;
  }

  // 3. Descuento (Placeholder logic, si existiera en el futuro)
  const discount = 0; 

  return (
    <div id="printable-ticket" className="hidden-on-screen">
      <style>{`
        @media screen {
          .hidden-on-screen { display: none !important; }
        }
        @media print {
          @page {
            size: 58mm auto;
            margin: 0 !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 58mm !important;
            background-color: white;
          }

          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }

          #printable-ticket {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 2mm 3.5mm !important;
            
            font-family: Arial, sans-serif !important; 
            font-size: 10px !important;
            font-weight: bold !important;
            line-height: 1.2;
            color: #000 !important;
          }

          .ticket-header {
            text-align: center;
            font-size: 12px !important;
            font-weight: 900 !important;
            margin-bottom: 2mm;
            text-transform: uppercase;
          }
          
          .ticket-subheader {
            text-align: center;
            font-size: 10px !important;
            font-weight: bold !important;
            margin-bottom: 0.5mm;
          }

          .ticket-divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 1.5mm 0;
          }

          .ticket-info {
            font-size: 10px !important;
            font-weight: bold !important;
            margin: 0.5mm 0;
            display: flex;
            justify-content: space-between;
          }

          .ticket-info span:first-child {
            margin-right: 2mm;
          }

          .ticket-section-title {
             font-size: 11px !important;
             font-weight: 900 !important;
             text-transform: uppercase;
             margin: 1mm 0;
          }

          .ticket-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
            margin: 0.8mm 0;
            font-size: 10px !important;
            font-weight: bold !important;
          }

          .ticket-item-name {
            flex: 1;
            padding-right: 1mm;
            text-align: left;
            word-break: break-word;
          }

          .ticket-item-price {
            text-align: right;
            white-space: nowrap;
            min-width: 15mm;
          }

          .ticket-total-row {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin: 0.5mm 0;
            font-size: 10px !important;
            font-weight: bold !important;
          }

          .ticket-grand-total {
            font-size: 14px !important;
            font-weight: 900 !important;
            margin: 2mm 0;
          }

          .ticket-footer {
            text-align: center;
            font-size: 10px !important;
            font-weight: bold !important;
            margin-top: 3mm;
          }
        }
      `}</style>

      {/* --- HEADER --- */}
      <div className="ticket-header">COTILLON REBU</div>
      <div className="ticket-subheader">Articulos para Fiestas</div>
      <hr className="ticket-divider" />
      
      {/* --- DATOS NEGOCIO --- */}
      <div className="ticket-info" style={{justifyContent: 'center', display: 'block', textAlign: 'center'}}>
        Direccion: Calle 158 4440
      </div>
      <div className="ticket-info" style={{justifyContent: 'center', display: 'block', textAlign: 'center'}}>
        Tel: 11-5483-0409
      </div>
      <div className="ticket-info" style={{justifyContent: 'center', display: 'block', textAlign: 'center'}}>
        Instagram: @rebucotillon
      </div>
      <hr className="ticket-divider" />

      {/* --- DATOS VENTA --- */}
      <div className="ticket-info">
        <span>Fecha:</span>
        <span>{transaction.date?.split(',')[0]}</span>
      </div>
      <div className="ticket-info">
        <span>Hora:</span>
        <span>{timeFormatted}</span>
      </div>
      <div className="ticket-info">
        <span>Compra N°:</span>
        <span>{formattedId}</span>
      </div>
      <hr className="ticket-divider" />

      {/* --- FIDELIZACIÓN --- */}
      <div className="ticket-info">
        <span>Nº Cliente:</span>
        <span></span>
      </div>
      <div className="ticket-info">
        <span>Puntos Sumados:</span>
        <span></span>
      </div>
      <div className="ticket-info">
        <span>Puntos Total:</span>
        <span></span>
      </div>
      <hr className="ticket-divider" />

      {/* --- PRODUCTOS --- */}
      <div style={{ marginBottom: '1mm' }}>
        {(transaction.items || []).map((item, idx) => {
          const qty = item.qty || item.quantity || 1;
          const price = Number(item.price) || 0;
          const lineTotal = qty * price;
          
          return (
            <div key={idx} className="ticket-item">
              <span className="ticket-item-name">
                {qty > 1 ? `(${qty}) ` : ''}{item.title}
              </span>
              <span className="ticket-item-price">
                $ {formatPrice(lineTotal)}
              </span>
            </div>
          );
        })}
      </div>
      <hr className="ticket-divider" />

      {/* --- TOTALES --- */}
      <div className="ticket-total-row">
        <span>Subtotal:</span>
        {/* Mostramos el subtotal REAL (suma de items) */}
        <span>$ {formatPrice(itemsSubtotal)}</span>
      </div>
      
      {/* SECCIÓN RECARGO */}
      {surcharge > 0 && (
        <div className="ticket-total-row">
          <span>Recargo (10%):</span>
          <span>$ {formatPrice(surcharge)}</span>
        </div>
      )}

      {discount > 0 && (
        <div className="ticket-total-row">
          <span>Descuento:</span>
          <span>-$ {formatPrice(discount)}</span>
        </div>
      )}
      <hr className="ticket-divider" />
      
      <div className="ticket-total-row ticket-grand-total">
        <span>TOTAL:</span>
        <span>$ {formatPrice(transaction.total)}</span>
      </div>
      <hr className="ticket-divider" />

      {/* --- PAGO --- */}
      <div className="ticket-info">
        <span>Pago:</span>
        <span>{transaction.payment?.toUpperCase()}</span>
      </div>
      {transaction.installments > 1 && (
        <div className="ticket-info">
          <span>Cuotas:</span>
          <span>{transaction.installments}</span>
        </div>
      )}
      <hr className="ticket-divider" />
      
      {/* --- FOOTER --- */}
      <div className="ticket-footer">¡Gracias por tu compra!</div>
      <div className="ticket-subheader" style={{marginTop: '1mm'}}>Volve pronto :D</div>
      <br />
      <hr className="ticket-divider" />
    </div>
  );
};