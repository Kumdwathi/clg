import { BoardComponentInfo, CropPreset, VideoSequence } from '../types';

export const BOARD_COMPONENTS: BoardComponentInfo[] = [
  {
    id: 'tb1_pv',
    name: 'PV Array Input Terminal',
    category: 'power',
    referenceDesignator: 'TB1',
    packageType: 'Screw Terminal 5.08mm 2-Pin (Blue)',
    coordinates: { x: -80, y: 0.6, z: -55 },
    boundingBox: { width: 15, height: 14, depth: 10 },
    voltageRating: '300V / 16A rated (12-24V Solar Input)',
    currentRating: '15A continuous',
    roleInColdStorage: 'Connects rooftop solar photovoltaic strings through the PWM charge controller to harvest solar energy for off-grid operation.',
    schematicNode: 'NET_PV_POS / NET_PV_NEG',
    wiringAWG: '12 AWG stranded copper',
    specifications: {
      'Pitch': '5.08 mm',
      'Wire Range': '24-12 AWG',
      'Contact Material': 'Tinned phosphor bronze',
      'Torque': '0.5 Nm',
      'Operating Temp': '-40°C to +105°C'
    },
    neFarmerBenefit: 'Enables zero-electricity-bill cooling in remote hilly terrains where grid blackouts exceed 14 hours daily.'
  },
  {
    id: 'tb2_bat',
    name: '12V Battery Bank Terminal',
    category: 'power',
    referenceDesignator: 'TB2',
    packageType: 'Screw Terminal 5.08mm 2-Pin (Blue)',
    coordinates: { x: -45, y: 0.6, z: -55 },
    boundingBox: { width: 15, height: 14, depth: 10 },
    voltageRating: '12V nominal (11.0V - 14.6V LiFePO4 / Lead-Acid)',
    currentRating: '20A peak',
    roleInColdStorage: 'Supplies continuous 24/7 power buffer to maintain cooling during monsoon cloudy weeks in North East India.',
    schematicNode: 'NET_12V_BAT_POS / GND_PWR',
    wiringAWG: '12 AWG stranded silicone wire',
    specifications: {
      'Max Surge Current': '25A',
      'Reverse Protection': 'Inline Schottky D1 + Glass Fuse F2',
      'Recommended Battery': '12V 100Ah - 200Ah Deep Cycle Gel or LiFePO4'
    },
    neFarmerBenefit: 'Protects delicate horticultural harvest overnight and during cloudy monsoon seasons in Assam & Meghalaya.'
  },
  {
    id: 'tb3_ac',
    name: 'AC Chiller / Inverter Remote Relay Output',
    category: 'relay',
    referenceDesignator: 'TB3',
    packageType: 'Screw Terminal 5.08mm 2-Pin (Blue)',
    coordinates: { x: 10, y: 0.6, z: -55 },
    boundingBox: { width: 15, height: 14, depth: 10 },
    voltageRating: '12V DC / 250V AC Relay Contact',
    currentRating: '10A continuous',
    roleInColdStorage: 'Switches the DC cold storage compressor or signals the external inverter remote ON/OFF loop to maintain cold room at 3°C - 7°C.',
    schematicNode: 'RELAY_1_COM / RELAY_1_NO',
    wiringAWG: '12 AWG heavy gauge',
    specifications: {
      'Switching Device': 'Songle SRD-12VDC-SL-C Relay 1',
      'Isolation': 'Galvanic via PC817 Optocoupler U2',
      'Cycle Life': '100,000 operations'
    },
    neFarmerBenefit: 'Automates chilling without manual intervention; prevents chilling injury by stopping compressor when target temperature is reached.'
  },
  {
    id: 'tb4_fan',
    name: 'Exhaust & Circulation Fan Terminal',
    category: 'relay',
    referenceDesignator: 'TB4',
    packageType: 'Screw Terminal 5.08mm 2-Pin (Blue)',
    coordinates: { x: 45, y: 0.6, z: -55 },
    boundingBox: { width: 15, height: 14, depth: 10 },
    voltageRating: '12V DC',
    currentRating: '3A continuous',
    roleInColdStorage: 'Drives high-CFM brushless exhaust and internal air-circulation fan to eliminate thermal hotspots in stacked ginger/potato crates.',
    schematicNode: 'RELAY_2_COM / RELAY_2_NO',
    wiringAWG: '18 AWG copper wire',
    specifications: {
      'Control Mode': 'Temperature & Humidity gradient triggered',
      'Flyback Diode': '1N4007 across inductive coil',
      'Protection': 'Overcurrent fuse protected'
    },
    neFarmerBenefit: 'Even air distribution prevents mold, sprouting, and fungal rot in humid North Eastern storage sheds.'
  },
  {
    id: 'tb5_pump',
    name: 'Ultrasonic Fogger & Misting Pump Terminal',
    category: 'relay',
    referenceDesignator: 'TB5',
    packageType: 'Screw Terminal 5.08mm 2-Pin (Blue)',
    coordinates: { x: 80, y: 0.6, z: -55 },
    boundingBox: { width: 15, height: 14, depth: 10 },
    voltageRating: '12V DC',
    currentRating: '4A continuous',
    roleInColdStorage: 'Activates high-frequency ultrasonic fogger pump to maintain 85%-95% relative humidity, crucial for preventing weight loss in fresh horticultural crops.',
    schematicNode: 'RELAY_3_COM / RELAY_3_NO',
    wiringAWG: '18 AWG copper wire',
    specifications: {
      'Humidity Target': '85% - 92% RH for ginger and oranges',
      'Interlock': 'Hardware interlock with water float level sensor',
      'Switching': 'Songle SRD Relay 3'
    },
    neFarmerBenefit: 'Prevents weight shrinkage of fresh ginger rhizomes and oranges, safeguarding 15-25% crop weight value at regional mandi sales.'
  },
  {
    id: 'fuses_f1_f2',
    name: 'Fast-Acting Cartridge Fuses (5x20mm)',
    category: 'protection',
    referenceDesignator: 'F1, F2',
    packageType: '5x20mm Glass Cartridge in Brass Spring Clips',
    coordinates: { x: -65, y: 0.5, z: -35 },
    boundingBox: { width: 18, height: 8, depth: 12 },
    voltageRating: '250V / 15A & 20A',
    currentRating: '15A (Solar) / 20A (Battery)',
    roleInColdStorage: 'Isolates the board instantly during lightning surges, short circuits, or wiring errors common in rural farm installations.',
    schematicNode: 'NET_PV_FUSED / NET_BAT_FUSED',
    specifications: {
      'Type': 'Time-lag glass fuse (Slow-Blow)',
      'Interrupting Rating': '100A at 250VAC',
      'Clip Material': 'Nickel-plated spring brass'
    },
    neFarmerBenefit: 'User-replaceable 5-rupee fuse protects costly micro-controller and solar inverter from accidental reverse battery connection.'
  },
  {
    id: 'diodes_d1_d2',
    name: 'High-Current Schottky Power Diodes',
    category: 'protection',
    referenceDesignator: 'D1, D2',
    packageType: 'DO-201AD Axial Power Diode (Thick Black Cylinder)',
    coordinates: { x: -30, y: 0.5, z: -35 },
    boundingBox: { width: 16, height: 8, depth: 12 },
    voltageRating: '100V / 20A (MBR20100 / 1N5408 Series)',
    currentRating: '15A continuous forward current',
    roleInColdStorage: 'Blocks nighttime battery discharge back into solar panels and prevents reverse polarity destruction.',
    schematicNode: 'DIODE_CATHODE_12V',
    specifications: {
      'Forward Drop': '0.45V low VF Schottky technology',
      'Reverse Leakage': '< 100uA',
      'Peak Surge Current': '200A'
    },
    neFarmerBenefit: 'Stops precious stored battery energy from bleeding away into solar panels during pitch-black hill station nights.'
  },
  {
    id: 'relays_bank',
    name: '4-Channel Isolated Relay Array (Songle SRD)',
    category: 'relay',
    referenceDesignator: 'RL1, RL2, RL3, RL4',
    packageType: 'Sealed Cube Relays (SRD-12VDC-SL-C)',
    coordinates: { x: 38, y: 0.8, z: -30 },
    boundingBox: { width: 75, height: 16, depth: 20 },
    voltageRating: 'Coil: 12V DC | Contacts: 10A 250VAC / 10A 30VDC',
    currentRating: '10A per channel',
    roleInColdStorage: 'Industrial-grade switching for high-power cooling components: AC Chiller Compressor, Exhaust Fan, Ultrasonic Mist Pump, and Auxiliary Heater/Defrost.',
    schematicNode: 'RL1_IN, RL2_IN, RL3_IN, RL4_IN',
    specifications: {
      'Coil Resistance': '400 Ω ±10%',
      'Operate Time': '< 10 ms',
      'Dielectric Strength': '1500 VAC (between coil and contacts)',
      'Color': 'Glossy molded black casing with gold contacts'
    },
    neFarmerBenefit: 'High surge tolerance withstands inductive startup currents of refrigeration compressors and ventilation fans.'
  },
  {
    id: 'isolation_gap',
    name: '3.5mm Physical Isolation Barrier (CNC Milled Slot)',
    category: 'isolation',
    referenceDesignator: 'ISO-GAP-01',
    packageType: 'Air Gap & Optical Isolation Slot',
    coordinates: { x: 0, y: 0.1, z: -10 },
    boundingBox: { width: 190, height: 2, depth: 4 },
    voltageRating: '3.75 kV Isolation',
    currentRating: 'N/A (Galvanic dielectric barrier)',
    roleInColdStorage: 'Separates noisy 12V high-current relay switching and solar surges from sensitive 3.3V ESP32 microcontroller logic traces.',
    schematicNode: 'GND_POWER vs GND_LOGIC',
    specifications: {
      'Slot Width': '3.5 mm minimum',
      'Creepage Distance': '> 6.3 mm',
      'Compliant Standard': 'IEC 60950 / UL 60950'
    },
    neFarmerBenefit: 'Prevents electrical noise and lightning transients from freezing or resetting the ESP32 brain in remote mountain installations.'
  },
  {
    id: 'esp32_devkit',
    name: 'ESP32 DevKit V1 Microcontroller',
    category: 'logic',
    referenceDesignator: 'U1',
    packageType: '30-Pin Dual-In-Line DevKit with ESP-WROOM-32',
    coordinates: { x: 25, y: 0.6, z: 25 },
    boundingBox: { width: 52, height: 7, depth: 28 },
    voltageRating: '3.3V Core (5V USB/Vin)',
    currentRating: '80mA - 240mA peak during Wi-Fi/BLE transmission',
    roleInColdStorage: 'Autonomous brain executing PID cooling control, humidity management, battery health algorithms, and remote IoT telemetry for farmers via smartphone.',
    schematicNode: 'U1_ESP32',
    specifications: {
      'Processor': 'Dual-Core Tensilica Xtensa 32-bit LX6 @ 240 MHz',
      'SRAM': '520 KB',
      'Flash Memory': '4 MB SPI Flash',
      'Wireless': '2.4 GHz Wi-Fi 802.11 b/g/n + Bluetooth 4.2 BR/EDR & BLE',
      'Antenna': 'On-board meandered inverted-F trace antenna (MIFA)',
      'Shield': 'Stamped nickel RF shield with FCC/CE certification markings'
    },
    neFarmerBenefit: 'Enables real-time SMS alerts to farmer’s phone when cold room door is left open or temperature exceeds 8°C.'
  },
  {
    id: 'oled_display',
    name: '0.96" I2C OLED Telemetry Display',
    category: 'display',
    referenceDesignator: 'DISP1',
    packageType: '128x64 Monochrome Graphic OLED Module (Blue/Yellow)',
    coordinates: { x: -28, y: 0.7, z: 22 },
    boundingBox: { width: 32, height: 6, depth: 30 },
    voltageRating: '3.3V - 5V DC',
    currentRating: '20mA average',
    roleInColdStorage: 'Provides instant local visual readout on cold room door: Storage Temperature (e.g. 4.2°C), Relative Humidity (e.g. 89%), Battery State of Charge, and Active Chill cycle.',
    schematicNode: 'I2C_SDA (GPIO21), I2C_SCL (GPIO22)',
    specifications: {
      'Resolution': '128 x 64 pixels',
      'Driver IC': 'SSD1306',
      'Interface': 'I2C (Address 0x3C)',
      'Viewing Angle': '> 160° for easy field visibility'
    },
    neFarmerBenefit: 'Allows rural farmers without smartphones to verify cold storage parameters at a single glance with clear, bright digits.'
  },
  {
    id: 'lm2596_buck',
    name: 'LM2596 Step-Down Switching Regulator',
    category: 'power',
    referenceDesignator: 'U6 / VR1',
    packageType: 'TO-263-5 / SMT with Toroidal Inductor & Heatsink',
    coordinates: { x: -65, y: 0.6, z: 20 },
    boundingBox: { width: 34, height: 12, depth: 25 },
    voltageRating: 'Input: 7V - 35V DC | Output: 5.0V regulated',
    currentRating: '3.0A continuous',
    roleInColdStorage: 'Steps down 12V battery power efficiently (up to 92% efficiency) to create the stable 5V rail for the display, sensors, and LDO.',
    schematicNode: 'NET_5V_REGULATED',
    specifications: {
      'Switching Frequency': '150 kHz',
      'Inductor': '68uH shielded toroidal ferrite core',
      'Output Ripple': '< 30 mV p-p',
      'Heatsink': 'Aluminum finned heatsink with thermal pad'
    },
    neFarmerBenefit: 'High electrical efficiency minimizes heat buildup inside the sealed waterproof control box.'
  },
  {
    id: 'ams1117_ldo',
    name: 'AMS1117-3.3V Linear Low-Dropout Regulator',
    category: 'power',
    referenceDesignator: 'U7',
    packageType: 'SOT-223 SMT',
    coordinates: { x: -42, y: 0.3, z: 42 },
    boundingBox: { width: 8, height: 3, depth: 6 },
    voltageRating: 'Input: 5.0V | Output: 3.3V ±1%',
    currentRating: '800 mA continuous',
    roleInColdStorage: 'Supplies ultra-clean, noise-free 3.3V power to the ESP32 ADC and precision DHT22 digital temperature sensor.',
    schematicNode: 'NET_3V3_LOGIC',
    specifications: {
      'Dropout Voltage': '1.1V at 800mA',
      'Current Limit': '1000 mA',
      'Thermal Protection': 'Internal shutdown at 165°C'
    },
    neFarmerBenefit: 'Eliminates sensor jitter, ensuring precise ±0.5°C temperature measurement required for cold storage compliance.'
  },
  {
    id: 'optocouplers_array',
    name: 'PC817 Quad Optical Isolator Array',
    category: 'isolation',
    referenceDesignator: 'U2, U3, U4, U5',
    packageType: 'DIP-4 / SOP-4 Infrared Optocouplers',
    coordinates: { x: 38, y: 0.4, z: -5 },
    boundingBox: { width: 68, height: 4, depth: 8 },
    voltageRating: '5000 Vrms Isolation',
    currentRating: '50 mA Collector Current',
    roleInColdStorage: 'Transfers ESP32 digital firing commands across the 3.5mm isolation barrier via light beams, completely isolating MCU from relay inductive kicks.',
    schematicNode: 'OPTO_TRIG_1, OPTO_TRIG_2, OPTO_TRIG_3, OPTO_TRIG_4',
    specifications: {
      'Current Transfer Ratio': '100% to 300%',
      'Forward Voltage': '1.2V',
      'Response Time': '4 us rise / 3 us fall'
    },
    neFarmerBenefit: 'Prevents electrical back-EMF from heavy inductive AC compressors from destroying the delicate microcontroller.'
  },
  {
    id: 'sensor_headers',
    name: 'DHT22 & Water Float Level Sensor Headers',
    category: 'sensor',
    referenceDesignator: 'J_SENSORS',
    packageType: '2.54mm Gold-Plated Male Pin Headers',
    coordinates: { x: 80, y: 0.5, z: 30 },
    boundingBox: { width: 14, height: 9, depth: 16 },
    voltageRating: '3.3V - 5V',
    currentRating: '500 mA',
    roleInColdStorage: 'Connects cables running into cold room: DHT22 (Digital Temp & Humidity) and magnetic reed float switch in water tank.',
    schematicNode: 'DHT22_DATA (GPIO4), FLOAT_SW (GPIO5)',
    wiringAWG: '22 AWG shielded sensor cable',
    specifications: {
      'Pull-up': '4.7kΩ precision SMD pull-up on DHT22 line',
      'De-bounce': 'RC low-pass filter on float switch line',
      'Header Plating': 'Gold flash over nickel'
    },
    neFarmerBenefit: 'Quick disconnect plug allows easy replacement of sensors during annual post-harvest shed sanitization.'
  },
  {
    id: 'copper_pours',
    name: 'Heavy 2oz High-Current Copper Pours & Traces',
    category: 'power',
    referenceDesignator: 'COPPER_POUR',
    packageType: 'Top & Bottom 2oz/ft² FR-4 Copper Planes',
    coordinates: { x: -20, y: 0.1, z: -45 },
    boundingBox: { width: 180, height: 1, depth: 35 },
    voltageRating: '50V Max',
    currentRating: '20A without exceeding 10°C thermal rise',
    roleInColdStorage: 'Conducts solar charging current and battery surge currents directly into the relays with minimal I²R resistive losses and no overheating.',
    schematicNode: 'HIGH_CURRENT_12V_RAIL',
    specifications: {
      'Copper Thickness': '70 µm (2 oz)',
      'Trace Width': '8.0 mm busbar width with solder tinned paths',
      'Thermal Vias': '0.3mm drill with 0.6mm pads connecting to bottom ground plane'
    },
    neFarmerBenefit: 'Thermal reliability prevents copper trace burning when starting high-torque compressor motors in summer.'
  }
];

export const VIDEO_SEQUENCES: VideoSequence[] = [
  {
    id: 'orbit_360',
    title: '4K Studio Turntable 360°',
    subtitle: 'Ultra-realistic complete board overview with studio lighting',
    durationSeconds: 16,
    description: 'A continuous cinematic 360° rotating showcase of the solar cold storage PCB. Highlights the dual-zone layout: high-current 12V power harvesting on top and low-voltage ESP32 brain below.',
    keyPoints: [
      'Dual-zone layout with 3.5mm physical isolation gap',
      'Glossy green solder mask with golden edge connectors',
      'High current tinned copper pours and heavy terminal blocks',
      'Real-time glowing blue OLED telemetry screen'
    ]
  },
  {
    id: 'component_flyby',
    title: 'Macro Fly-Through & Components',
    subtitle: 'Close-up dynamic camera gliding across micro-components',
    durationSeconds: 20,
    description: 'Ultra-close macro lens glide inspecting the ESP-WROOM-32 metallic RF shield, PC817 optical isolators, Songle cube relays, toroidal power inductor, and safety glass fuses.',
    keyPoints: [
      'ESP-WROOM-32 stamped metal RF shield & trace antenna',
      'Songle SRD-12VDC-SL-C sealed cube relays',
      'Glass cartridge fuses in spring brass clips',
      'SMD 0805 passives and SOT-223 voltage regulators'
    ]
  },
  {
    id: 'thermal_flow',
    title: 'Thermal Dissipation & Current Flow',
    subtitle: 'Live animated electrical pulses & thermal heat gradients',
    durationSeconds: 18,
    description: 'Visualizes high-amperage current traveling from solar PV and battery terminals through the fuses, power diodes, and relay contacts, while displaying thermal dissipation zones around the LM2596 and relays.',
    keyPoints: [
      'Animated current vectors along 2oz copper traces',
      'Thermal heatmap showing cool logic zone (<28°C) vs regulator warm spot (42°C)',
      'Proof of 3.5mm barrier preventing thermal creep to ESP32',
      'Low resistance current distribution prevents energy waste'
    ]
  },
  {
    id: 'isolation_barrier',
    title: 'Galvanic Isolation & Safety Slot',
    subtitle: 'Microscope zoom on the 3.5mm milled physical slot & optocouplers',
    durationSeconds: 14,
    description: 'Focuses on the crucial safety architecture that makes this design robust for rural North Eastern farms: optical light beam switching across the milled PCB air gap.',
    keyPoints: [
      '3.5mm CNC milled slot preventing electrical arc-over',
      'PC817 optocouplers providing 5kV galvanic separation',
      'Independent logic ground (GND_LOGIC) vs power ground (GND_PWR)',
      'Surge suppression diodes handling relay inductive flyback'
    ]
  },
  {
    id: 'farmer_shed_overview',
    title: 'North Eastern Cold Storage Context',
    subtitle: 'Connecting the PCB to the farm shed, crops, and solar arrays',
    durationSeconds: 22,
    description: 'Pulls back to reveal the complete solar-powered micro-cold storage shed designed for farmers in Assam, Meghalaya, Sikkim, and Nagaland storing ginger, oranges, and potatoes.',
    keyPoints: [
      'Rooftop solar PV array (400W-800W) harvesting mountain sunlight',
      'PUF insulated shed maintaining 4°C with minimal energy',
      'Ultrasonic fogger misting maintaining 90% RH against ginger weight loss',
      'Wiring harness: 12 AWG power runs and 18/22 AWG sensor cables'
    ]
  },
  {
    id: 'exploded_layers',
    title: 'Exploded 3D Layer Inspection',
    subtitle: 'Substrate, copper planes, solder mask, silkscreen & components floating in 3D',
    durationSeconds: 16,
    description: 'Vertically separates all manufacturing layers: Bottom Solder Mask, FR-4 Fiberglass Core, Inner Copper Pour, Top Traces, Green Solder Mask, White Silkscreen, and Mounted Components.',
    keyPoints: [
      'Layer 1: Bottom Ground Plane & Solder Mask',
      'Layer 2: 1.6mm FR-4 Double-Sided Substrate',
      'Layer 3: Top Copper Traces & High Current Pours',
      'Layer 4: High-Definition White Silkscreen Legend',
      'Layer 5: Through-Hole & SMT Electronics Assembly'
    ]
  }
];

export const CROP_PRESETS: CropPreset[] = [
  {
    id: 'ginger',
    name: 'Nadia & Mahima Ginger (আদা)',
    localRegion: 'Assam, Meghalaya & Sikkim Hills',
    targetTemp: 12.0,
    targetHumidity: 90,
    maxStorageDays: 180,
    economicValue: '₹60 - ₹120 / kg (Prevents 25% moisture weight shrinkage)'
  },
  {
    id: 'orange',
    name: 'Khasi Mandarin Orange (কমলা)',
    localRegion: 'Meghalaya (Cherrapunjee belt) & Arunachal',
    targetTemp: 4.5,
    targetHumidity: 88,
    maxStorageDays: 90,
    economicValue: '₹80 - ₹150 / kg (Triples market window past peak glut)'
  },
  {
    id: 'potato',
    name: 'Kufri Jyoti Seed Potato (আলু)',
    localRegion: 'Tripura, Assam & Meghalaya',
    targetTemp: 3.5,
    targetHumidity: 92,
    maxStorageDays: 210,
    economicValue: '₹35 - ₹55 / kg (Preserves seed viability without sprouting)'
  },
  {
    id: 'chilli',
    name: 'Bhut Jolokia / King Chilli (ভোট জলকীয়া)',
    localRegion: 'Assam & Nagaland Hills',
    targetTemp: 8.0,
    targetHumidity: 95,
    maxStorageDays: 45,
    economicValue: '₹400 - ₹900 / kg (Prevents calyx mold & capsaicin degradation)'
  },
  {
    id: 'kiwi',
    name: 'Organic Allison Kiwi (কিউই)',
    localRegion: 'Arunachal Pradesh & Ziro Valley',
    targetTemp: 1.0,
    targetHumidity: 95,
    maxStorageDays: 120,
    economicValue: '₹180 - ₹280 / kg (Enables off-season metro market export)'
  }
];
