import { useEffect } from 'react';

export const useBarcodeScanner = ({ inventory, addToCart, onScanError }) => {
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = 0;
    const TIMEOUT_LIMIT = 50; // Milisegundos entre teclas (un humano no escribe tan rápido)

    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;

      // 1. Si el usuario está escribiendo en un input normal (buscador, nombre, etc), ignorar.
      // Ignoramos si el foco está en un INPUT o TEXTAREA para no interferir con la escritura manual.
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      // 2. Detectar Enter (Fin del escaneo estándar)
      if (e.key === 'Enter') {
        // Mínimo 2 caracteres para considerar código válido y evitar disparos por errores
        if (barcodeBuffer.length > 2) { 
          
          // Buscar producto por código de barras (prioridad) o por ID
          // Convertimos a String para comparar sin errores de tipos
          const product = inventory.find(
            (p) => String(p.barcode) === barcodeBuffer || String(p.id) === barcodeBuffer
          );

          if (product) {
            addToCart(product);
          } else {
            if (onScanError) onScanError(barcodeBuffer);
          }
        }
        
        // Limpiar buffer siempre después de un Enter
        barcodeBuffer = '';
        return;
      }

      // 3. Acumular teclas numéricas y letras (algunos códigos son alfanuméricos)
      // Filtramos teclas de control (Shift, Alt, F1-F12, etc) asegurando que key sea de longitud 1
      if (e.key.length === 1) {
        // Si pasó mucho tiempo desde la última tecla, asumimos que es un humano escribiendo lento 
        // o un error de lectura -> Reiniciar buffer
        if (timeDiff > TIMEOUT_LIMIT) {
          barcodeBuffer = e.key; 
        } else {
          barcodeBuffer += e.key;
        }
      }

      lastKeyTime = currentTime;
    };

    // Agregar escucha global
    window.addEventListener('keydown', handleKeyDown);

    // Limpieza al desmontar el componente (para no duplicar escuchas)
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inventory, addToCart, onScanError]); // Se recrea si cambia el inventario o la función del carrito
};