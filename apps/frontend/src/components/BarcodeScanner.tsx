import React, { useRef, useState } from 'react';
import { Button, Modal } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  buttonText?: string;
  disabled?: boolean;
}

// ID estático único por instancia de componente para evitar colisiones
let scannerInstanceCount = 0;

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  buttonText = 'Escanear QR',
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ID estático generado una sola vez por instancia del componente
  const scannerIdRef = useRef(`barcode-scanner-${++scannerInstanceCount}`);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Esta función se llama SOLO cuando el Modal terminó de abrirse (después de la animación)
  const handleAfterOpenChange = (open: boolean) => {
    if (open) {
      setError(null);
      try {
        // Verificar que el elemento DOM existe antes de instanciar
        const element = document.getElementById(scannerIdRef.current);
        if (!element) {
          setError('No se pudo inicializar la cámara. Intente de nuevo.');
          return;
        }
        const scanner = new Html5Qrcode(scannerIdRef.current);
        html5QrCodeRef.current = scanner;

        scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            stopScanner();
            onScan(decodedText);
            setIsModalVisible(false);
          },
          () => {
            // Ignorar errores de escaneo continuos (cuando no hay QR visible)
          }
        ).catch((err) => {
          console.error('Camera error:', err);
          setError('No se pudo acceder a la cámara. Use un lector USB o de código de barras.');
        });
      } catch (e) {
        console.error('Scanner init error:', e);
        setError('Error al inicializar el escáner.');
      }
    } else {
      stopScanner();
    }
  };

  const stopScanner = () => {
    const scanner = html5QrCodeRef.current;
    if (scanner) {
      if (scanner.isScanning) {
        scanner.stop()
          .then(() => scanner.clear())
          .catch((err) => console.error('Error stopping scanner', err));
      }
      html5QrCodeRef.current = null;
    }
  };

  const handleCancel = () => {
    stopScanner();
    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        icon={<CameraOutlined />}
        onClick={() => setIsModalVisible(true)}
        disabled={disabled}
      >
        {buttonText}
      </Button>

      <Modal
        title="Escanear Código de Barras / QR"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        afterOpenChange={handleAfterOpenChange}
      >
        {error ? (
          <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        ) : (
          // El div debe existir SIEMPRE en el DOM cuando el modal está abierto
          <div id={scannerIdRef.current} style={{ width: '100%', minHeight: 300 }} />
        )}
      </Modal>
    </>
  );
};
