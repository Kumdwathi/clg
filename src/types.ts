export type CameraAnglePreset =
  | 'perspective'
  | 'top'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'underside'
  | 'iso_alt1'
  | 'iso_alt2';

export type VideoSequenceId =
  | 'orbit_360'
  | 'component_flyby'
  | 'thermal_flow'
  | 'isolation_barrier'
  | 'farmer_shed_overview'
  | 'exploded_layers';

export interface VideoSequence {
  id: VideoSequenceId;
  title: string;
  subtitle: string;
  durationSeconds: number;
  description: string;
  keyPoints: string[];
}

export interface BoardComponentInfo {
  id: string;
  name: string;
  category: 'power' | 'relay' | 'logic' | 'sensor' | 'protection' | 'display' | 'isolation';
  referenceDesignator: string;
  packageType: string;
  coordinates: { x: number; y: number; z: number };
  boundingBox: { width: number; height: number; depth: number };
  voltageRating: string;
  currentRating: string;
  roleInColdStorage: string;
  schematicNode: string;
  wiringAWG?: string;
  specifications: Record<string, string>;
  neFarmerBenefit: string;
}

export interface SimulationState {
  ambientTemp: number; // °C outside in NE region
  coldRoomTemp: number; // °C target cold storage room
  humidity: number; // % RH
  solarIrradiance: number; // W/m2
  batteryVoltage: number; // V
  waterReservoirOk: boolean; // float switch
  acUnitActive: boolean; // Relay 1
  fanActive: boolean; // Relay 2
  foggerActive: boolean; // Relay 3
  auxActive: boolean; // Relay 4
  doorOpen: boolean;
  selectedCrop: 'ginger' | 'orange' | 'potato' | 'chilli' | 'kiwi';
}

export interface CropPreset {
  id: string;
  name: string;
  localRegion: string;
  targetTemp: number;
  targetHumidity: number;
  maxStorageDays: number;
  economicValue: string;
}

export interface RenderSettings {
  quality: '1080p' | '2k' | '4k';
  showTraces: boolean;
  showSilkscreen: boolean;
  showCopperPour: boolean;
  showThermalHeatmap: boolean;
  showCurrentFlow: boolean;
  showComponentLabels: boolean;
  explodedAmount: number; // 0 to 1
  bloomEnabled: boolean;
  autoRotate: boolean;
  wireframe: boolean;
}
