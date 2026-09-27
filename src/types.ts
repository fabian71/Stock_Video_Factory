import type {StockFactoryProps} from './config/factoryConfig';

export type FactoryAsset = StockFactoryProps['asset'];
export type MaterialPreset = StockFactoryProps['material'];
export type ForceField = StockFactoryProps['forceField'];
export type CompositionGrid = StockFactoryProps['compositionGrid'];
export type BackgroundStyle = StockFactoryProps['bgStyle'];
export type OverlayStyle = StockFactoryProps['overlayStyle'];

export type BodyState = {
  id: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  radius: number;
  speed: number;
};
