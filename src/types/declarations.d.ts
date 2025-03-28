// Declaración de tipos para el módulo vision-camera-code-scanner
declare module 'vision-camera-code-scanner' {
  import type { FrameProcessor } from 'react-native-vision-camera';
  
  export enum BarcodeFormat {
    UNKNOWN = 0,
    ALL_FORMATS = 0,
    CODE_128 = 1,
    CODE_39 = 2,
    CODE_93 = 4,
    CODABAR = 8,
    DATA_MATRIX = 16,
    EAN_13 = 32,
    EAN_8 = 64,
    ITF = 128,
    QR_CODE = 256,
    UPC_A = 512,
    UPC_E = 1024,
    PDF417 = 2048,
    AZTEC = 4096,
  }
  
  export interface Barcode {
    value: string;
    displayValue: string;
    rawValue: string;
    format: BarcodeFormat;
    type: string;
    bounds: {
      width: number;
      height: number;
      origin: {
        x: number;
        y: number;
      };
    };
    cornerPoints: {
      x: number;
      y: number;
    }[];
  }
  
  export interface UseScanBarcodesOptions {
    checkInverted?: boolean;
  }
  
  export function useScanBarcodes(
    barcodeTypes: BarcodeFormat[],
    options?: UseScanBarcodesOptions
  ): [FrameProcessor, Barcode[]];
}

// Declaración para React Native Vector Icons
declare module 'react-native-vector-icons/MaterialIcons' {
  import React from 'react';
  import { TextProps } from 'react-native';
  
  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  
  export default class Icon extends React.Component<IconProps> {}
}

// Ampliación de tipos para react-native-vision-camera
declare module 'react-native-vision-camera' {
  import { ViewProps } from 'react-native';
  import type { Component } from 'react';

  export type CameraPermissionStatus = 
    | 'authorized'
    | 'not-determined'
    | 'denied'
    | 'granted'
    | 'restricted';
  
  export type CameraDevice = {
    id: string;
    name: string;
    position: 'front' | 'back' | 'external';
    hasFlash: boolean;
    hasTorch: boolean;
    minZoom: number;
    maxZoom: number;
    neutralZoom: number;
    formats: any[];
    supportsParallelVideoProcessing: boolean;
    supportsRawCapture: boolean;
    supportsDepthCapture: boolean;
    supportsFocus: boolean;
    isMultiCam: boolean;
    devices: CameraDevice[];
  };

  export type FrameProcessor = (frame: any) => void;

  export interface CameraProps extends ViewProps {
    device: CameraDevice;
    isActive: boolean;
    frameProcessor?: FrameProcessor;
    fps?: number;
    frameProcessorFps?: number;
    audio?: boolean;
    video?: boolean;
    photo?: boolean;
  }

  export class Camera extends Component<CameraProps> {
    static requestCameraPermission(): Promise<CameraPermissionStatus>;
  }

  export interface CameraDevices {
    back?: CameraDevice;
    front?: CameraDevice;
    external?: CameraDevice;
  }

  export function useCameraDevices(): CameraDevices;
} 