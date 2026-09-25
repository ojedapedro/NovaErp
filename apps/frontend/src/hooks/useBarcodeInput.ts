import { useEffect, useRef } from 'react';

// Los lectores de código de barras USB/BT emulan teclado pero envían
// todos los caracteres muy rápido (< 50ms entre teclas) y terminan con Enter.
// Este hook detecta ese patrón y distingue un scan de escritura manual.

interface UseBarcodeInputOptions {
  onScan: (code: string) => void;
  enabled?: boolean;
  minLength?: number; // mínimo de chars para considerar un código válido (default: 3)
}

export function useBarcodeInput({ onScan, enabled = true, minLength = 3 }: UseBarcodeInputOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const SPEED_THRESHOLD_MS = 50; // lectores envían < 50ms entre teclas
    const BUFFER_CLEAR_MS = 200;   // limpiar buffer si no llega nada en 200ms

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está en un input de texto (excepto el del escáner)
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (isInputField && !(target as HTMLInputElement).dataset.barcodeInput) return;

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const code = bufferRef.current;
        bufferRef.current = '';
        if (code.length >= minLength) {
          onScan(code);
        }
        return;
      }

      // Si la tecla llega muy rápido o el buffer estaba vacío, acumular
      if (timeDiff < SPEED_THRESHOLD_MS || bufferRef.current === '') {
        bufferRef.current += e.key;
      } else {
        // Es escritura manual lenta, reiniciar buffer
        bufferRef.current = e.key;
      }

      // Auto-limpiar buffer si no llega nada
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, BUFFER_CLEAR_MS);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onScan, enabled, minLength]);
}
