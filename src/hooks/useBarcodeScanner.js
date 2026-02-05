import { useEffect, useCallback } from 'react';

export const useBarcodeScanner = ({ 
  isEnabled = true,        // Activar/desactivar el escáner
  onScan,                  // Callback cuando se escanea (recibe el código)
  ignoreInputs = true      // Ignorar cuando el foco está en inputs
}) => {
  
  const handleScan = useCallback((code) => {
    if (onScan && code) {
      onScan(code);
    }
  }, [onScan]);

  useEffect(() => {
    if (!isEnabled) return;

    let barcodeBuffer = '';
    let lastKeyTime = 0;
    const TIMEOUT_LIMIT = 50; // ms entre teclas (escáner es muy rápido)

    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;

      // Ignorar si está escribiendo en un input/textarea (opcional)
      if (ignoreInputs && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      // Enter = fin del escaneo
      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) { // Mínimo 3 caracteres
          handleScan(barcodeBuffer);
        }
        barcodeBuffer = '';
        return;
      }

      // Acumular solo caracteres imprimibles
      if (e.key.length === 1) {
        if (timeDiff > TIMEOUT_LIMIT) {
          barcodeBuffer = e.key;
        } else {
          barcodeBuffer += e.key;
        }
      }

      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, handleScan, ignoreInputs]);
};