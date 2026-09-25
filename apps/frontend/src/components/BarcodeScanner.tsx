import React, { useEffect, useState, useId } from 'react';
import { Button, Modal, message } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  buttonText?: string;
  disabled?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  buttonText = 'Escanear QR',
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerId = useId().replace(/:/g, ''); // html5-qrcode necesita un ID sin caracteres especiales

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    if (isModalVisible) {
      setError(null);
      html5QrCode = new Html5Qrcode(scannerId);
      
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          onScan(decodedText);
          setIsModalVisible(false);
        },
        (errorMessage) => {
          // ignore scan errors, they happen continuously when no QR is in sight
        }
      ).catch((err) => {
        console.error("Camera error:", err);
        setError('No se pudo acceder a la cámara. Use un lector USB.');
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        }).catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, [isModalVisible, scannerId, onScan]);

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
        title="Escanear Código"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        {error ? (
          <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        ) : (
          <div id={scannerId} style={{ width: '100%' }}></div>
        )}
      </Modal>
    </>
  );
};
