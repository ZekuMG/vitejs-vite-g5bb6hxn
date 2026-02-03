import React from 'react';

export const TicketPrintLayout = ({ transaction }) => {
  if (!transaction) return null;

  // Formatear ID a 6 dígitos (Ej: 1 -> 000001)
  const formattedId = String(transaction.id).padStart(6, '0');

  // Calcular valores
  const subtotal = transaction.total; // Por ahora igual al total
  const discount = 0; // Placeholder para futuro
  
  return (
    <div id="printable-ticket" className="hidden-on-screen">
      <style>{`
        @media screen {
          .hidden-on-screen { display: none; }
        }
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm; /* Ancho estándar 58mm */
            font-family: 'Courier New', Courier, monospace; /* Fuente monoespaciada */
            font-size: 11px; /* Letra un poco más chica para que entre la dirección */
            color: black;
            background: white;
            padding-right: 2mm;
          }
          .ticket-centered { text-align: center; }
          /* Línea divisoria punteada */
          .ticket-divider { border-top: 1px dashed #000; margin: 5px 0; }
          .ticket-row { display: flex; justify-content: space-between; }
          .ticket-bold { font-weight: bold; }
          .ticket-big { font-size: 14px; }
        }
      `}</style>

      {/* --- ENCABEZADO --- */}
      <div className="ticket-centered ticket-bold ticket-big">COTILLON REBU</div>
      <div className="ticket-centered">Articulos para Fiestas</div>
      <div></div>
      <div className="ticket-divider"></div>
      
      {/* --- DATOS LOCAL --- */}
      <div>Direccion: Calle 158 4440,Platanos.</div>
      <div>Tel: 11-5483-0409</div>
      <div>Instagram: @rebucotillon</div>
      <div className="ticket-divider"></div>

      {/* --- DATOS VENTA --- */}
      <div>Fecha: {transaction.date?.split(',')[0]}</div>
      <div>Hora: {transaction.time || transaction.timestamp}</div>
      <div className="ticket-bold">Compra N°: {formattedId}</div>
      <div className="ticket-divider"></div>

      {/* --- ITEMS --- */}
      <div style={{ marginBottom: '5px' }}>
        {(transaction.items || []).map((item, idx) => (
          <div key={idx} className="ticket-row">
            <span style={{ maxWidth: '65%' }}>
              {item.title} {(item.qty > 1) ? `x${item.qty}` : ''}
            </span>
            <span>$ {((item.qty || 1) * (item.price || 0)).toLocaleString('es-AR')}</span>
          </div>
        ))}
      </div>
      <div className="ticket-divider"></div>

      {/* --- TOTALES --- */}
      <div className="ticket-row">
        <span>Subtotal:</span>
        <span>$ {subtotal?.toLocaleString('es-AR')}</span>
      </div>
      <div className="ticket-row">
        <span>Descuento:</span>
        <span>$ {discount.toLocaleString('es-AR')}</span>
      </div>
      <div className="ticket-divider"></div>
      
      <div className="ticket-row ticket-bold ticket-big">
        <span>TOTAL:</span>
        <span>$ {transaction.total?.toLocaleString('es-AR')}</span>
      </div>
      <div className="ticket-divider"></div>

      {/* --- PAGO --- */}
      <div>Pago: {transaction.payment?.toUpperCase()}</div>
      <div className="ticket-divider"></div>

      {/* --- PIE DE PAGINA --- */}
      <br />
      <div className="ticket-centered">¡Gracias por tu compra!</div>
      <div className="ticket-centered">Volve pronto :D</div>
      <br />
      <div className="ticket-divider"></div>
      <div className="ticket-centered" style={{ fontSize: '10px', marginTop: '5px' }}>.</div>
    </div>
  );
};