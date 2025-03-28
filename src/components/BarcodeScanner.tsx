import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Definir tipos para las propiedades del componente
interface BarcodeScannerProps {
  onCodeScanned?: (value: string) => void;
  onClose?: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onCodeScanned = () => {},
  onClose = () => {},
}) => {
  // Estado para almacenar el estado de los permisos de la cámara
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanned, setIsScanned] = useState(false);
  
  // Obtener dispositivos de cámara disponibles
  const devices = useCameraDevices();
  const device = devices.back;
  
  // Configurar escáner de códigos de barras
  const [frameProcessor, barcodes] = useScanBarcodes([
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_128,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
  ], {
    checkInverted: true,
  });
  
  // Solicitar permisos de cámara al cargar el componente
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted' || status === 'authorized');
    })();
  }, []);
  
  // Procesar códigos detectados
  useEffect(() => {
    if (barcodes.length > 0 && !isScanned) {
      const barcode = barcodes[0];
      if (barcode.rawValue) {
        setIsScanned(true);
        onCodeScanned(barcode.rawValue);
      }
    }
  }, [barcodes, isScanned, onCodeScanned]);

  // Renderizar estado de espera si los permisos no se han resuelto
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.text}>Verificando permisos de cámara...</Text>
      </View>
    );
  }
  
  // Renderizar mensaje de error si no hay permisos
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Icon name="no-photography" size={64} color="#FFFFFF" />
        <Text style={styles.errorText}>
          Se requiere acceso a la cámara para escanear códigos de barras.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Camera.requestCameraPermission();
          }}
        >
          <Text style={styles.buttonText}>Conceder Permisos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFFFFF' }]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Renderizar mensaje de error si no hay cámara trasera
  if (!device) {
    return (
      <View style={styles.container}>
        <Icon name="error-outline" size={64} color="#FFFFFF" />
        <Text style={styles.errorText}>
          No se pudo acceder a la cámara trasera.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFFFFF' }]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      
      {/* Encabezado con título y botón de cerrar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Escanear Código</Text>
      </View>
      
      {/* Overlay con área de escaneo */}
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>
      
      {/* Pie de página con instrucciones */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Coloca el código de barras dentro del recuadro
        </Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BarcodeScanner; 