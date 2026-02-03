import React from 'react';

export const TicketPrintLayout = ({ transaction }) => {
  if (!transaction) return null;

  // Formatear ID a 6 dígitos (Ej: 1 -> 000001)
  const formattedId = String(transaction.id).padStart(6, '0');

  // Calcular valores (Placeholder para descuentos futuros)
  const subtotal = transaction.total; 
  const discount = 0; 
  
  return (
    <div id="printable-ticket" className="hidden-on-screen">
      <style>{`
        @media screen {
          .hidden-on-screen { display: none; }
        }
        @media print {
          /* 1. RESETEO TOTAL DE LA PÁGINA */
          @page {
            size: 58mm auto;   /* Definimos el ancho del papel */
            margin: 0 !important; /* Intentamos borrar márgenes */
          }
          
          /* 2. FORZAR AL BODY A OCUPAR TODO */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 58mm !important;
            background-color: white;
          }

          /* 3. CONTENEDOR PRINCIPAL CON AJUSTE NEGATIVO */
          #printable-ticket {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            
            /* TRUCO: Usar un ancho un poco mayor y margen negativo 
               para "comerse" el borde blanco izquierdo que pone Windows por defecto */
            width: 58mm !important; 
            margin-left: -1mm !important; /* Mueve todo a la izquierda */
            padding-left: 0 !important;
            padding-right: 2mm !important; /* Espacio a la derecha para no cortar */
            
            /* TIPOGRAFÍA: Arial, Negrita, Tamaño 11px (legible en térmica) */
            font-family: Arial, Helvetica, sans-serif !important;
            font-weight: 700 !important;
            font-size: 11px !important;
            line-height: 1.1;
            color: #000 !important;
          }

          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }

          /* UTILIDADES */
          .ticket-centered { text-align: center; width: 100%; }
          .ticket-divider { border-top: 1px dashed #000; margin: 3px 0; display: block; width: 100%; }
          .ticket-row { display: flex; justify-content: space-between; width: 100%; }
          .ticket-title { font-size: 14px !important; font-weight: 900 !important; }
          .ticket-big { font-size: 12px !important; font-weight: 900 !important; }
        }
      `}</style>

      {/* --- CONTENIDO DEL TICKET --- */}
      <div className="ticket-centered ticket-title">COTILLON REBU</div>
      <div className="ticket-centered">Articulos para Fiestas</div>
      <div className="ticket-divider"></div>
      
      <div className="ticket-centered">Direccion: Calle 158 4440, Platanos.</div>
      <div className="ticket-centered">Tel: 11-5483-0409</div>
      <div className="ticket-centered">Instagram: @rebucotillon</div>
      <div className="ticket-divider"></div>

      <div>Fecha: {transaction.date?.split(',')[0]}</div>
      <div>Hora: {transaction.time || transaction.timestamp}</div>
      <div className="ticket-big">Compra N°: {formattedId}</div>
      <div className="ticket-divider"></div>

      <div style={{ marginBottom: '5px', width: '100%' }}>
        {(transaction.items || []).map((item, idx) => (
          <div key={idx} className="ticket-row">
            <span style={{ maxWidth: '65%', textAlign: 'left', wordWrap: 'break-word' }}>
              {item.title} {(item.qty > 1) ? `(x${item.qty})` : ''}
            </span>
            <span style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
              $ {((item.qty || 1) * (item.price || 0)).toLocaleString('es-AR')}
            </span>
          </div>
        ))}
      </div>
      <div className="ticket-divider"></div>

      <div className="ticket-row">
        <span>Subtotal:</span>
        <span>$ {subtotal?.toLocaleString('es-AR')}</span>
      </div>
      <div className="ticket-row">
        <span>Descuento:</span>
        <span>$ {discount.toLocaleString('es-AR')}</span>
      </div>
      <div className="ticket-divider"></div>
      
      <div className="ticket-row ticket-title">
        <span>TOTAL:</span>
        <span>$ {transaction.total?.toLocaleString('es-AR')}</span>
      </div>
      <div className="ticket-divider"></div>

      <div>Pago: {transaction.payment?.toUpperCase()}</div>
      <div className="ticket-divider"></div>

      <br />
      <div className="ticket-centered ticket-big">¡Gracias por tu compra!</div>
      <div className="ticket-centered">Volve pronto :D</div>
      <br />
      <div className="ticket-centered" style={{ fontSize: '10px' }}>.</div>
    </div>
  );
};