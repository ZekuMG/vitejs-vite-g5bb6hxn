import React from 'react';

export const TicketPrintLayout = ({ transaction }) => {
  if (!transaction) return null;

  // Formatear ID a 6 dígitos (Ej: 1 -> 000001)
  const formattedId = String(transaction.id).padStart(6, '0');

  // Calcular valores
  const subtotal = transaction.total; 
  const discount = 0; 
  
  return (
    <div id="printable-ticket" className="hidden-on-screen">
      <style>{`
        @media screen {
          .hidden-on-screen { display: none; }
        }
        @media print {
          /* 1. RESETEO TOTAL PARA EVITAR MÁRGENES DEL NAVEGADOR */
          @page {
            margin: 0;
            size: auto; /* O size: 58mm auto; si el navegador lo permite */
          }
          
          body {
            margin: 0;
            padding: 0;
            /* Forzar blanco y negro puro para evitar grises/borrosos */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* 2. CONFIGURACIÓN EXACTA DE FUENTE */
          #printable-ticket {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            
            /* Ancho seguro para 58mm (generalmente 48mm imprimibles) */
            width: 48mm; 
            margin-left: 1mm; /* Pequeño margen izquierdo */
            
            /* ARIAL, NEGRITA, TAMAÑO PEQUEÑO */
            font-family: Arial, Helvetica, sans-serif !important;
            font-weight: 900 !important; /* Negrita extra fuerte */
            font-size: 10px !important; /* Equivalente legible a tamaño 8 en ticket */
            line-height: 1.2; /* Líneas más juntas */
            
            color: #000000 !important; /* Negro absoluto */
            background: white;
            
            /* Trucos para mejorar nitidez en térmicas */
            text-rendering: geometricPrecision;
            -webkit-font-smoothing: none;
          }

          /* CLASES UTILITARIAS */
          .ticket-centered { text-align: center; }
          
          /* Línea divisoria sólida para mayor contraste */
          .ticket-divider { 
            border-top: 2px solid #000; 
            margin: 4px 0; 
            display: block;
          }
          
          .ticket-row { 
            display: flex; 
            justify-content: space-between; 
            width: 100%;
          }
          
          /* Encabezado más grande pero misma fuente */
          .ticket-title { 
            font-size: 14px !important; 
            font-weight: 900 !important;
          }
          
          /* Total gigante */
          .ticket-total { 
            font-size: 14px !important; 
            font-weight: 900 !important;
          }

          /* Ocultar todo lo demás */
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
        }
      `}</style>

      {/* --- ENCABEZADO --- */}
      <div className="ticket-centered ticket-title">COTILLON REBU</div>
      <div className="ticket-centered">Articulos para Fiestas</div>
      <div className="ticket-divider"></div>
      
      {/* --- DATOS LOCAL --- */}
      <div className="ticket-centered">Direccion: Calle 158 4440, Platanos</div>
      <div className="ticket-centered">Tel: 11-5483-0409</div>
      <div className="ticket-centered">IG: @rebucotillon</div>
      <div className="ticket-divider"></div>

      {/* --- DATOS VENTA --- */}
      <div>Fecha: {transaction.date?.split(',')[0]}</div>
      <div>Hora: {transaction.time || transaction.timestamp}</div>
      <div>Compra N°: {formattedId}</div>
      <div className="ticket-divider"></div>

      {/* --- ITEMS --- */}
      <div style={{ marginBottom: '5px' }}>
        {(transaction.items || []).map((item, idx) => (
          <div key={idx} className="ticket-row">
            <span style={{ maxWidth: '70%', textAlign: 'left' }}>
              {item.title} {(item.qty > 1) ? `(x${item.qty})` : ''}
            </span>
            <span style={{ whiteSpace: 'nowrap' }}>
              $ {((item.qty || 1) * (item.price || 0)).toLocaleString('es-AR')}
            </span>
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
      
      <div className="ticket-row ticket-total">
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
      <div className="ticket-centered" style={{ fontSize: '10px' }}>.</div>
    </div>
  );
};