import React from 'react';

export const TicketPrintLayout = ({ transaction }) => {
  if (!transaction) return null;

  // Formatear ID a 6 dígitos (Ej: 1 -> 000001)
  const formattedId = String(transaction.id).padStart(6, '0');

  // Formatear hora a 24hrs (por si viene en AM/PM)
  const formatTime24 = (timeStr) => {
    if (!timeStr) return '--:--';
    
    // Si ya está en formato 24h (ej: "16:45"), devolverlo
    if (/^\d{1,2}:\d{2}$/.test(timeStr) && !timeStr.toLowerCase().includes('m')) {
      return timeStr;
    }
    
    // Convertir AM/PM a 24h
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

  // Formatear precio sin decimales innecesarios
  const formatPrice = (value) => {
    const num = Number(value) || 0;
    return num % 1 === 0 ? num.toLocaleString('es-AR') : num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calcular valores
  const subtotal = transaction.total; 
  const discount = 0;
  const timeFormatted = formatTime24(transaction.time || transaction.timestamp);
  
  return (
    <div id="printable-ticket" className="hidden-on-screen">
      <style>{`
        @media screen {
          .hidden-on-screen { display: none !important; }
        }
        @media print {
          @page {
            size: 58mm auto;
            margin: 0mm 1mm !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 56mm !important;
            background-color: white;
          }

          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }

          #printable-ticket {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 54mm !important;
            padding: 2mm !important;
            font-family: 'Courier New', monospace !important;
            font-size: 11px !important;
            line-height: 1.3;
            color: #000 !important;
          }

          .ticket-header {
            text-align: center;
            font-weight: bold;
            font-size: 13px !important;
            margin-bottom: 2mm;
          }
          
          .ticket-subheader {
            text-align: center;
            font-size: 10px !important;
            margin-bottom: 1mm;
          }

          .ticket-divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 2mm 0;
          }

          .ticket-info {
            font-size: 10px !important;
            margin: 1mm 0;
          }

          .ticket-info-bold {
            font-size: 11px !important;
            font-weight: bold;
            margin: 1mm 0;
          }

          .ticket-item {
            display: table;
            width: 100%;
            margin: 1mm 0;
            font-size: 10px !important;
          }

          .ticket-item-name {
            display: table-cell;
            width: 70%;
            word-wrap: break-word;
            padding-right: 2mm;
          }

          .ticket-item-price {
            display: table-cell;
            width: 30%;
            text-align: right;
            white-space: nowrap;
            font-weight: bold;
          }

          .ticket-total-row {
            display: table;
            width: 100%;
            margin: 1mm 0;
            font-size: 10px !important;
          }

          .ticket-total-label {
            display: table-cell;
            width: 50%;
          }

          .ticket-total-value {
            display: table-cell;
            width: 50%;
            text-align: right;
            font-weight: bold;
          }

          .ticket-grand-total {
            font-size: 14px !important;
            font-weight: bold;
            margin: 2mm 0;
          }

          .ticket-footer {
            text-align: center;
            font-size: 11px !important;
            font-weight: bold;
            margin-top: 3mm;
          }

          .ticket-footer-small {
            text-align: center;
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* --- CONTENIDO DEL TICKET --- */}
      <div className="ticket-header">COTILLON REBU</div>
      <div className="ticket-subheader">Articulos para Fiestas</div>
      <hr className="ticket-divider" />
      
      <div className="ticket-subheader">Calle 158 N°4440, Platanos</div>
      <div className="ticket-subheader">Tel: 11-5483-0409</div>
      <div className="ticket-subheader">IG: @rebucotillon</div>
      <hr className="ticket-divider" />

      <div className="ticket-info">Fecha: {transaction.date?.split(',')[0]}</div>
      <div className="ticket-info">Hora: {timeFormatted}</div>
      <div className="ticket-info-bold">Compra N°: {formattedId}</div>
      <hr className="ticket-divider" />

      {/* ITEMS */}
      <div style={{ marginBottom: '2mm' }}>
        {(transaction.items || []).map((item, idx) => {
          const qty = item.qty || item.quantity || 1;
          const price = Number(item.price) || 0;
          const lineTotal = qty * price;
          
          return (
            <div key={idx} className="ticket-item">
              <span className="ticket-item-name">
                {qty > 1 ? `${qty}x ` : ''}{item.title}
              </span>
              <span className="ticket-item-price">
                ${formatPrice(lineTotal)}
              </span>
            </div>
          );
        })}
      </div>
      <hr className="ticket-divider" />

      {/* TOTALES */}
      <div className="ticket-total-row">
        <span className="ticket-total-label">Subtotal:</span>
        <span className="ticket-total-value">${formatPrice(subtotal)}</span>
      </div>
      
      {discount > 0 && (
        <div className="ticket-total-row">
          <span className="ticket-total-label">Descuento:</span>
          <span className="ticket-total-value">-${formatPrice(discount)}</span>
        </div>
      )}
      <hr className="ticket-divider" />
      
      <div className="ticket-total-row ticket-grand-total">
        <span className="ticket-total-label">TOTAL:</span>
        <span className="ticket-total-value">${formatPrice(transaction.total)}</span>
      </div>
      <hr className="ticket-divider" />

      <div className="ticket-info-bold">Pago: {transaction.payment?.toUpperCase()}</div>
      {transaction.installments > 1 && (
        <div className="ticket-info">Cuotas: {transaction.installments}</div>
      )}
      <hr className="ticket-divider" />

      <div className="ticket-footer">¡Gracias por tu compra!</div>
      <div className="ticket-footer-small">Volve pronto :D</div>
      <br />
    </div>
  );
};