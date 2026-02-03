import React from 'react';

export const TicketPrintLayout = ({ transaction }) => {
  if (!transaction) return null;

  // Formatear ID a 6 dígitos (Ej: 1 -> 000001)
  const formattedId = String(transaction.id).padStart(6, '0');

  // Calcular valores (El descuento es placeholder por ahora)
  const subtotal = transaction.total; 
  const discount = 0; 
  
  return (
    <div id="printable-ticket" className="hidden-on-screen">
      <style>{`
        @media screen {
          .hidden-on-screen { display: none; }
        }
        @media print {
          /* 1. ELIMINAR MÁRGENES DEL NAVEGADOR */
          @page {
            margin: 0;
            size: auto; 
          }
          
          body {
            margin: 0;
            padding: 0;
            background-color: white;
          }

          /* 2. CONFIGURACIÓN DEL CONTENEDOR */
          #printable-ticket {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            
            /* ANCHO EFECTIVO: 48mm es seguro para papel de 58mm 
               sin que se corte el texto en los bordes físicos. */
            width: 48mm; 
            
            /* Padding mínimo para que no se pegue al borde del papel */
            padding-left: 1mm;
            padding-right: 1mm;
            
            /* FUENTE NÍTIDA Y GRANDE PARA IMPRESORA TÉRMICA */
            font-family: Arial, Helvetica, sans-serif !important;
            font-weight: 700 !important; /* Negrita fuerte */
            font-size: 11px !important; 
            line-height: 1.1; 
            color: #000 !important; /* Negro puro */
          }

          /* Ocultar todo lo demás de la app */
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }

          /* UTILIDADES */
          .ticket-centered { 
            text-align: center; 
            width: 100%;
          }
          
          /* LINEA SEPARADORA */
          .ticket-divider { 
            border-top: 1px dashed #000; 
            margin: 3px 0; 
            display: block;
            width: 100%;
          }
          
          /* FILAS DE PRODUCTOS/TOTALES */
          .ticket-row { 
            display: flex; 
            justify-content: space-between; 
            width: 100%; 
          }
          
          /* Textos más grandes para títulos y totales */
          .ticket-title { font-size: 14px !important; font-weight: 900 !important; }
          .ticket-big { font-size: 12px !important; font-weight: 900 !important; }
        }
      `}</style>

      {/* --- ENCABEZADO --- */}
      <div className="ticket-centered ticket-title">COTILLON REBU</div>
      <div className="ticket-centered">Articulos para Fiestas</div>
      <div className="ticket-divider"></div>
      
      {/* --- DATOS LOCAL --- */}
      <div className="ticket-centered">Direccion: Calle 158 4440, Platanos.</div>
      <div className="ticket-centered">Tel: 11-5483-0409</div>
      <div className="ticket-centered">Instagram: @rebucotillon</div>
      <div className="ticket-divider"></div>

      {/* --- DATOS VENTA --- */}
      {/* Usamos split para asegurar que no salga la hora en la fecha si viene pegada */}
      <div>Fecha: {transaction.date?.split(',')[0]}</div>
      <div>Hora: {transaction.time || transaction.timestamp}</div>
      <div className="ticket-big">Compra N°: {formattedId}</div>
      <div className="ticket-divider"></div>

      {/* --- ITEMS --- */}
      <div style={{ marginBottom: '5px', width: '100%' }}>
        {(transaction.items || []).map((item, idx) => (
          <div key={idx} className="ticket-row">
            {/* Descripción */}
            <span style={{ maxWidth: '65%', textAlign: 'left', wordWrap: 'break-word' }}>
              {item.title} {(item.qty > 1) ? `(x${item.qty})` : ''}
            </span>
            {/* Precio */}
            <span style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
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
      
      <div className="ticket-row ticket-title">
        <span>TOTAL:</span>
        <span>$ {transaction.total?.toLocaleString('es-AR')}</span>
      </div>
      <div className="ticket-divider"></div>

      {/* --- PAGO --- */}
      <div>Pago: {transaction.payment?.toUpperCase()}</div>
      <div className="ticket-divider"></div>

      {/* --- PIE DE PAGINA --- */}
      <br />
      <div className="ticket-centered ticket-big">¡Gracias por tu compra!</div>
      <div className="ticket-centered">Volve pronto :D</div>
      <br />
      <div className="ticket-centered" style={{ fontSize: '10px' }}>.</div>
    </div>
  );
};