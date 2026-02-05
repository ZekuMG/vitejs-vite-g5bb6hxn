import React from 'react';

export const TicketPrintLayout = ({ transaction }) => {
  if (!transaction) return null;

  // Formatear ID a 6 dígitos (Ej: 1 -> 000001)
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
            size: 58mm auto; /* Ajuste para impresora térmica */
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
            
            /* -- EDICIÓN QUIRÚRGICA: FUENTE ARIAL, TAMAÑO 8, NEGRITA -- */
            font-family: Arial, sans-serif !important; 
            font-size: 8px !important;
            font-weight: bold !important;
            
            line-height: 1.2;
            color: #000 !important;
          }

          .ticket-header {
            text-align: center;
            font-size: 10px !important; /* Un poco más grande para el título */
            font-weight: 900 !important; /* Extra bold */
            margin-bottom: 2mm;
            text-transform: uppercase;
          }
          
          .ticket-subheader {
            text-align: center;
            font-size: 8px !important;
            font-weight: bold !important;
            margin-bottom: 0.5mm;
          }

          .ticket-divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 1.5mm 0;
          }

          .ticket-info {
            font-size: 8px !important;
            font-weight: bold !important;
            margin: 0.5mm 0;
          }

          /* Títulos de sección destacados */
          .ticket-section-title {
             font-size: 9px !important;
             font-weight: 900 !important;
             text-transform: uppercase;
             margin: 1mm 0;
          }

          .ticket-item {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin: 0.5mm 0;
            font-size: 8px !important;
            font-weight: bold !important;
          }

          .ticket-item-name {
            flex: 1;
            padding-right: 1mm;
            text-align: left;
            word-break: break-all; /* Evita desbordes */
          }

          .ticket-item-price {
            text-align: right;
            white-space: nowrap;
          }

          .ticket-total-row {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin: 0.5mm 0;
            font-size: 8px !important;
            font-weight: bold !important;
          }

          .ticket-grand-total {
            font-size: 12px !important; /* Total bien visible */
            font-weight: 900 !important;
            margin: 2mm 0;
          }

          .ticket-footer {
            text-align: center;
            font-size: 9px !important;
            font-weight: bold !important;
            margin-top: 3mm;
            text-transform: uppercase;
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

      <div className="ticket-info">FECHA: {transaction.date?.split(',')[0]}</div>
      <div className="ticket-info">HORA: {timeFormatted}</div>
      <div className="ticket-section-title">COMPRA N°: {formattedId}</div>
      <hr className="ticket-divider" />

      {/* ITEMS */}
      <div style={{ marginBottom: '1mm' }}>
        {(transaction.items || []).map((item, idx) => {
          const qty = item.qty || item.quantity || 1;
          const price = Number(item.price) || 0;
          const lineTotal = qty * price;
          
          return (
            <div key={idx} className="ticket-item">
              <span className="ticket-item-name">
                {qty > 1 ? `(${qty}) ` : ''}{item.title.toUpperCase()}
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
        <span>SUBTOTAL:</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      
      {discount > 0 && (
        <div className="ticket-total-row">
          <span>DESCUENTO:</span>
          <span>-${formatPrice(discount)}</span>
        </div>
      )}
      <hr className="ticket-divider" />
      
      <div className="ticket-total-row ticket-grand-total">
        <span>TOTAL:</span>
        <span>${formatPrice(transaction.total)}</span>
      </div>
      <hr className="ticket-divider" />

      <div className="ticket-info">PAGO: {transaction.payment?.toUpperCase()}</div>
      {transaction.installments > 1 && (
        <div className="ticket-info">CUOTAS: {transaction.installments}</div>
      )}
      
      <div className="ticket-footer">¡GRACIAS POR SU COMPRA!</div>
      <div className="ticket-subheader" style={{marginTop: '1mm'}}>VOLVE PRONTO :D</div>
      <br />
    </div>
  );
};