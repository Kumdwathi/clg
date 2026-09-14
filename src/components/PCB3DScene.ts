import * as THREE from 'three';
import { BoardComponentInfo, CameraAnglePreset, RenderSettings, VideoSequenceId } from '../types';

export class PCB3DScene {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public clock: THREE.Clock;

  // Groups
  public rootGroup: THREE.Group;
  public boardGroup: THREE.Group;
  public componentsGroup: THREE.Group;
  public tracesGroup: THREE.Group;
  public silkscreenMesh!: THREE.Mesh;
  public currentParticlesGroup: THREE.Group;
  public thermalOverlayMesh!: THREE.Mesh;

  // Exploded view layers
  public layerBottomGround!: THREE.Mesh;
  public layerFR4Substrate!: THREE.Mesh;
  public layerTopCopper!: THREE.Group;
  public layerSilkscreen!: THREE.Mesh;

  // Dynamic OLED texture
  private oledCanvas: HTMLCanvasElement;
  private oledContext: CanvasRenderingContext2D;
  private oledTexture: THREE.CanvasTexture;
  private oledMesh!: THREE.Mesh;

  // Silkscreen texture
  private silkCanvas: HTMLCanvasElement;
  private silkContext: CanvasRenderingContext2D;
  private silkTexture: THREE.CanvasTexture;

  // Interactive picking
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private clickableMeshes: { mesh: THREE.Object3D; componentId: string }[] = [];
  public onComponentClick?: (componentId: string) => void;
  public onComponentHover?: (componentId: string | null) => void;
  private hoveredComponentId: string | null = null;
  private selectedComponentId: string | null = null;

  // Camera animation & Director
  private isOrbiting = false;
  private isPanning = false;
  private prevMousePos = { x: 0, y: 0 };
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private targetPosition = new THREE.Vector3(0, 120, 180);
  private currentPosition = new THREE.Vector3(0, 120, 180);
  private targetLookAt = new THREE.Vector3(0, 0, 0);
  private currentLookAt = new THREE.Vector3(0, 0, 0);

  // Cinematic Sequences
  public isVideoPlaying = false;
  public activeSequence: VideoSequenceId = 'orbit_360';
  public sequenceProgress = 0; // 0 to 1
  public sequenceDuration = 16; // seconds
  private sequenceTime = 0;

  // Lighting
  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;
  private backLight!: THREE.DirectionalLight;
  private studioLightGroup: THREE.Group;
  private ledLights: THREE.PointLight[] = [];

  // Settings
  private settings: RenderSettings;

  // Live simulation data for OLED & visuals
  private telemetry = {
    temp: 4.2,
    humidity: 89,
    batteryVoltage: 13.2,
    solarVoltage: 14.4,
    acActive: true,
    fanActive: true,
    foggerActive: true,
    cropName: 'Ginger'
  };

  private animationFrameId: number | null = null;

  constructor(container: HTMLElement, settings: RenderSettings) {
    this.container = container;
    this.settings = { ...settings };
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d14);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.camera = new THREE.PerspectiveCamera(42, width / height, 1, 1500);
    this.camera.position.set(0, 130, 190);
    this.currentPosition.copy(this.camera.position);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Required for 4K video recording and snapshot capture
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Initialize Canvas Textures
    this.oledCanvas = document.createElement('canvas');
    this.oledCanvas.width = 512;
    this.oledCanvas.height = 256;
    this.oledContext = this.oledCanvas.getContext('2d')!;
    this.oledTexture = new THREE.CanvasTexture(this.oledCanvas);
    this.oledTexture.minFilter = THREE.LinearFilter;
    this.oledTexture.magFilter = THREE.LinearFilter;

    this.silkCanvas = document.createElement('canvas');
    this.silkCanvas.width = 2048;
    this.silkCanvas.height = 1228;
    this.silkContext = this.silkCanvas.getContext('2d')!;
    this.generateSilkscreenCanvas();
    this.silkTexture = new THREE.CanvasTexture(this.silkCanvas);

    // Groups
    this.rootGroup = new THREE.Group();
    this.boardGroup = new THREE.Group();
    this.componentsGroup = new THREE.Group();
    this.tracesGroup = new THREE.Group();
    this.currentParticlesGroup = new THREE.Group();
    this.studioLightGroup = new THREE.Group();

    this.rootGroup.add(this.boardGroup);
    this.rootGroup.add(this.tracesGroup);
    this.rootGroup.add(this.componentsGroup);
    this.rootGroup.add(this.currentParticlesGroup);
    this.scene.add(this.rootGroup);
    this.scene.add(this.studioLightGroup);

    this.setupLighting();
    this.buildPCBBoard();
    this.buildCopperTracesAndPours();
    this.buildComponents();
    this.buildCurrentFlowSystem();
    this.buildThermalOverlay();
    this.setupEventListeners();
    this.updateOLEDDisplay();

    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    // Ambient light with cool technological tint
    const ambientLight = new THREE.AmbientLight(0x8cb0d0, 1.2);
    this.scene.add(ambientLight);

    // Main Key Light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    this.keyLight.position.set(100, 200, 120);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 10;
    this.keyLight.shadow.camera.far = 500;
    this.keyLight.shadow.camera.left = -120;
    this.keyLight.shadow.camera.right = 120;
    this.keyLight.shadow.camera.top = 100;
    this.keyLight.shadow.camera.bottom = -100;
    this.keyLight.shadow.bias = -0.0005;
    this.studioLightGroup.add(this.keyLight);

    // Fill Light from opposite side (warm amber bounce)
    this.fillLight = new THREE.DirectionalLight(0xffeedd, 1.3);
    this.fillLight.position.set(-140, 120, -100);
    this.studioLightGroup.add(this.fillLight);

    // Rim/Back Light to emphasize PCB edge and component silhouettes
    this.backLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    this.backLight.position.set(0, 80, -160);
    this.studioLightGroup.add(this.backLight);

    // Subtle soft floor grid for studio scale
    const gridHelper = new THREE.GridHelper(400, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -35;
    this.scene.add(gridHelper);
  }

  private generateSilkscreenCanvas() {
    const ctx = this.silkContext;
    const w = this.silkCanvas.width;
    const h = this.silkCanvas.height;

    // Clear transparent
    ctx.clearRect(0, 0, w, h);

    // Outer border line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Physical isolation line markings
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 8]);
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(30, h * 0.44);
    ctx.lineTo(w - 30, h * 0.44);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(30, h * 0.49);
    ctx.lineTo(w - 30, h * 0.49);
    ctx.stroke();
    ctx.setLineDash([]);

    // Text markings
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';

    // Title Block
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText('SOLAR COLD STORAGE SYSTEM CONTROLLER - v2.4 (NE REGION)', 50, 75);

    ctx.font = '20px "JetBrains Mono", monospace';
    ctx.fillText('ICAR / AAU AGRI-TECH INITIATIVE', 50, 105);

    // High current zone text
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('12V HIGH CURRENT HARVESTING & POWER SECTION', 50, 150);

    // Isolation gap text
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ PHYSICAL ISOLATION GAP (3.5mm MINIMUM AIR BARRIER) ⚡', w / 2, h * 0.465);

    // Logic Section Text
    ctx.textAlign = 'left';
    ctx.fillText('3.3V / 5V GALVANICALLY ISOLATED LOGIC & SENSOR SECTION', 50, h * 0.54);

    // Terminals text matching Image 1
    const termPositions = [
      { text: 'PV+', sub: 'TB1 (SOLAR)', x: w * 0.12 },
      { text: 'BAT+', sub: 'TB2 (12V BATT)', x: w * 0.30 },
      { text: 'AC UNIT', sub: 'TB3 (INVERTER)', x: w * 0.56 },
      { text: 'FAN+', sub: 'TB4 (EXHAUST)', x: w * 0.74 },
      { text: 'PUMP-', sub: 'TB5 (FOGGER)', x: w * 0.90 }
    ];

    termPositions.forEach((tp) => {
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tp.text, tp.x, 195);
      ctx.font = '18px "JetBrains Mono", monospace';
      ctx.fillText(tp.sub, tp.x, 220);

      // Box around terminal block
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(tp.x - 70, 235, 140, 90);
    });

    // Relay markings
    const relayX = [w * 0.55, w * 0.67, w * 0.79, w * 0.91];
    relayX.forEach((rx, i) => {
      ctx.strokeRect(rx - 55, 340, 110, 140);
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`RL1.${i + 1}`, rx, 410);
      const labels = ['AC CHILL', 'AIR FAN', 'FOGGER', 'AUX DEF'];
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText(labels[i], rx, 435);
    });

    // Fuses & Diodes markings
    ctx.strokeRect(w * 0.18 - 45, 350, 90, 60);
    ctx.fillText('F1 (15A)', w * 0.18, 385);
    ctx.strokeRect(w * 0.28 - 45, 350, 90, 60);
    ctx.fillText('F2 (20A)', w * 0.28, 385);

    ctx.fillText('DIODE D1', w * 0.38, 380);
    ctx.fillText('DIODE D2', w * 0.44, 380);

    // ESP32 Section
    ctx.strokeRect(w * 0.52, h * 0.60, 360, 260);
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ESP32 DevKit V1', w * 0.61, h * 0.73);
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('XTENSA DUAL-CORE / WI-FI + BLE', w * 0.61, h * 0.77);

    // OLED marking
    ctx.strokeRect(w * 0.22, h * 0.62, 220, 220);
    ctx.fillText('OLED 0.96" I2C', w * 0.27, h * 0.73);

    // Sensor Headers
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('J1: DHT22 SENSOR', w * 0.83, h * 0.66);
    ctx.fillText('J2: FLOAT SWITCH', w * 0.83, h * 0.74);
    ctx.fillText('J3: I2C BUS OLED', w * 0.83, h * 0.82);

    // Regulators
    ctx.fillText('LM2596 BUCK (12V->5V)', 70, h * 0.70);
    ctx.fillText('AMS1117 (5V->3.3V)', 70, h * 0.85);

    // Corner mounting holes circles
    const corners = [
      { x: 50, y: 50 },
      { x: w - 50, y: 50 },
      { x: 50, y: h - 50 },
      { x: w - 50, y: h - 50 }
    ];
    corners.forEach(c => {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 22, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  private buildPCBBoard() {
    const boardWidth = 200;
    const boardLength = 120;
    const boardThickness = 1.6;

    // 1. FR-4 Core Substrate Material (composite glass-reinforced epoxy)
    const fr4Mat = new THREE.MeshStandardMaterial({
      color: 0x13381e, // Deep solder mask green
      roughness: 0.35,
      metalness: 0.1,
      bumpScale: 0.02
    });

    // Create PCB shape with corner radius and mounting holes
    const shape = new THREE.Shape();
    const w = boardWidth / 2;
    const l = boardLength / 2;
    const r = 4;

    shape.moveTo(-w + r, -l);
    shape.lineTo(w - r, -l);
    shape.quadraticCurveTo(w, -l, w, -l + r);
    shape.lineTo(w, l - r);
    shape.quadraticCurveTo(w, l, w - r, l);
    shape.lineTo(-w + r, l);
    shape.quadraticCurveTo(-w, l, -w, l - r);
    shape.lineTo(-w, -l + r);
    shape.quadraticCurveTo(-w, -l, -w + r, -l);

    // Add 4 M3 mounting holes
    const holeRadius = 2.0;
    const holeOffset = 6;
    const holeCenters = [
      new THREE.Vector2(-w + holeOffset, -l + holeOffset),
      new THREE.Vector2(w - holeOffset, -l + holeOffset),
      new THREE.Vector2(w - holeOffset, l - holeOffset),
      new THREE.Vector2(-w + holeOffset, l - holeOffset)
    ];

    holeCenters.forEach(hc => {
      const hole = new THREE.Path();
      hole.absarc(hc.x, hc.y, holeRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    });

    // Add 3.5mm CNC Milled Physical Isolation Gap Slot
    // Runs across board between High Current Section and Logic Section
    const slotPath = new THREE.Path();
    const slotY = -3;
    const slotHalfWidth = w - 12;
    const slotHalfHeight = 1.75; // 3.5mm total height
    slotPath.moveTo(-slotHalfWidth, slotY - slotHalfHeight);
    slotPath.lineTo(slotHalfWidth, slotY - slotHalfHeight);
    slotPath.quadraticCurveTo(slotHalfWidth + 1.75, slotY, slotHalfWidth, slotY + slotHalfHeight);
    slotPath.lineTo(-slotHalfWidth, slotY + slotHalfHeight);
    slotPath.quadraticCurveTo(-slotHalfWidth - 1.75, slotY, -slotHalfWidth, slotY - slotHalfHeight);
    shape.holes.push(slotPath);

    const extrudeSettings = {
      depth: boardThickness,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.3,
      bevelThickness: 0.3
    };

    const boardGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Orient board horizontally (XZ plane)
    boardGeo.rotateX(Math.PI / 2);

    this.layerFR4Substrate = new THREE.Mesh(boardGeo, fr4Mat);
    this.layerFR4Substrate.receiveShadow = true;
    this.layerFR4Substrate.castShadow = true;
    this.boardGroup.add(this.layerFR4Substrate);

    // Add golden plated rings around mounting holes
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xdfb15b,
      metalness: 0.85,
      roughness: 0.25
    });

    holeCenters.forEach(hc => {
      const ringGeo = new THREE.RingGeometry(2.1, 4.5, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringTop = new THREE.Mesh(ringGeo, goldMat);
      ringTop.position.set(hc.x, 0.05, -hc.y);
      this.boardGroup.add(ringTop);

      const ringBot = new THREE.Mesh(ringGeo, goldMat);
      ringBot.position.set(hc.x, -boardThickness - 0.05, -hc.y);
      this.boardGroup.add(ringBot);
    });

    // 2. Silkscreen Overlay Mesh
    const silkGeo = new THREE.PlaneGeometry(boardWidth, boardLength);
    silkGeo.rotateX(-Math.PI / 2);
    const silkMat = new THREE.MeshStandardMaterial({
      map: this.silkTexture,
      transparent: true,
      opacity: 0.95,
      roughness: 0.7,
      metalness: 0.05,
      depthWrite: false
    });

    this.layerSilkscreen = new THREE.Mesh(silkGeo, silkMat);
    this.layerSilkscreen.position.y = 0.08;
    this.boardGroup.add(this.layerSilkscreen);
    this.silkscreenMesh = this.layerSilkscreen;

    // 3. Bottom Copper Plane
    const bottomGeo = new THREE.PlaneGeometry(boardWidth - 4, boardLength - 4);
    bottomGeo.rotateX(Math.PI / 2);
    const bottomMat = new THREE.MeshStandardMaterial({
      color: 0x11341a,
      roughness: 0.3,
      metalness: 0.3
    });
    this.layerBottomGround = new THREE.Mesh(bottomGeo, bottomMat);
    this.layerBottomGround.position.y = -boardThickness - 0.02;
    this.boardGroup.add(this.layerBottomGround);
  }

  private buildCopperTracesAndPours() {
    this.layerTopCopper = new THREE.Group();

    // Heavy tinned copper tracks material (silver-gold metallic)
    const tinnedCopperMat = new THREE.MeshStandardMaterial({
      color: 0xd4a559,
      metalness: 0.85,
      roughness: 0.22,
      bumpScale: 0.05
    });

    const highCurrentTinnedMat = new THREE.MeshStandardMaterial({
      color: 0xc0c8d0, // Solder-tinned high current busbars
      metalness: 0.92,
      roughness: 0.28
    });

    // 1. High-Current Power Busbars on Top Section
    // PV to Fuse & Battery
    const busbar1 = new THREE.Mesh(new THREE.BoxGeometry(45, 0.15, 6), highCurrentTinnedMat);
    busbar1.position.set(-60, 0.08, -45);
    this.layerTopCopper.add(busbar1);

    // Battery to Relays Busbar
    const busbar2 = new THREE.Mesh(new THREE.BoxGeometry(90, 0.15, 8), highCurrentTinnedMat);
    busbar2.position.set(25, 0.08, -48);
    this.layerTopCopper.add(busbar2);

    // Relay Output Feeds to Terminals
    const feedPositions = [10, 45, 80];
    feedPositions.forEach(x => {
      const feed = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 18), highCurrentTinnedMat);
      feed.position.set(x, 0.08, -40);
      this.layerTopCopper.add(feed);
    });

    // 2. Logic Signal Traces (Thin copper routing between ESP32 and Sensors/Optocouplers)
    const traceCoords = [
      // ESP32 to Optocouplers
      { sx: 20, sz: 15, ex: 20, ez: -2 },
      { sx: 35, sz: 15, ex: 35, ez: -2 },
      { sx: 50, sz: 15, ex: 50, ez: -2 },
      { sx: 65, sz: 15, ex: 65, ez: -2 },
      // ESP32 to OLED (I2C SDA/SCL)
      { sx: 0, sz: 20, ex: -15, ez: 20 },
      { sx: 0, sz: 25, ex: -15, ez: 25 },
      // ESP32 to Sensor Headers
      { sx: 55, sz: 32, ex: 75, ez: 32 },
      { sx: 55, sz: 38, ex: 75, ez: 38 }
    ];

    traceCoords.forEach(tc => {
      const dx = tc.ex - tc.sx;
      const dz = tc.ez - tc.sz;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);

      const traceMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, length), tinnedCopperMat);
      traceMesh.position.set(tc.sx + dx / 2, 0.06, tc.sz + dz / 2);
      traceMesh.rotation.y = angle;
      this.layerTopCopper.add(traceMesh);
    });

    // 3. Thermal Vias Array near LM2596 and Relays
    const viaMat = new THREE.MeshStandardMaterial({
      color: 0xdfb15b,
      metalness: 0.9,
      roughness: 0.2
    });

    for (let x = -75; x <= -55; x += 5) {
      for (let z = 10; z <= 25; z += 5) {
        const viaGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 8);
        const viaMesh = new THREE.Mesh(viaGeo, viaMat);
        viaMesh.position.set(x, -0.7, z);
        this.layerTopCopper.add(viaMesh);
      }
    }

    this.tracesGroup.add(this.layerTopCopper);
  }

  private buildComponents() {
    // 1. Blue Screw Terminal Blocks (TB1 to TB5)
    const terminalConfigs = [
      { id: 'tb1_pv', x: -80, label: 'PV' },
      { id: 'tb2_bat', x: -45, label: 'BAT' },
      { id: 'tb3_ac', x: 10, label: 'AC' },
      { id: 'tb4_fan', x: 45, label: 'FAN' },
      { id: 'tb5_pump', x: 80, label: 'PUMP' }
    ];

    terminalConfigs.forEach(tc => {
      const termGroup = this.createTerminalBlock(tc.label);
      termGroup.position.set(tc.x, 0, -55);
      this.componentsGroup.add(termGroup);
      this.registerClickable(termGroup, tc.id);
    });

    // 2. Glass Cartridge Fuses (F1, F2) in Brass Clips
    const fuseGroup = this.createFuseHolders();
    fuseGroup.position.set(-65, 0, -35);
    this.componentsGroup.add(fuseGroup);
    this.registerClickable(fuseGroup, 'fuses_f1_f2');

    // 3. Power Diodes (D1, D2)
    const diodeGroup = this.createPowerDiodes();
    diodeGroup.position.set(-30, 0, -35);
    this.componentsGroup.add(diodeGroup);
    this.registerClickable(diodeGroup, 'diodes_d1_d2');

    // 4. Relay Bank (4x Songle SRD Relays)
    const relayBankGroup = this.createRelayBank();
    relayBankGroup.position.set(0, 0, 0); // Contains its own offsets
    this.componentsGroup.add(relayBankGroup);
    this.registerClickable(relayBankGroup, 'relays_bank');

    // 5. ESP32 DevKit Module
    const esp32Group = this.createESP32DevKit();
    esp32Group.position.set(25, 0, 25);
    this.componentsGroup.add(esp32Group);
    this.registerClickable(esp32Group, 'esp32_devkit');

    // 6. 0.96" OLED Display Module
    const oledModuleGroup = this.createOLEDModule();
    oledModuleGroup.position.set(-28, 0, 22);
    this.componentsGroup.add(oledModuleGroup);
    this.registerClickable(oledModuleGroup, 'oled_display');

    // 7. LM2596 Buck Converter & Heatsink
    const buckGroup = this.createLM2596Module();
    buckGroup.position.set(-65, 0, 20);
    this.componentsGroup.add(buckGroup);
    this.registerClickable(buckGroup, 'lm2596_buck');

    // 8. AMS1117-3.3V LDO
    const ldoGroup = this.createAMS1117();
    ldoGroup.position.set(-42, 0, 42);
    this.componentsGroup.add(ldoGroup);
    this.registerClickable(ldoGroup, 'ams1117_ldo');

    // 9. PC817 Optocouplers Array
    const optoGroup = this.createOptocouplerArray();
    optoGroup.position.set(0, 0, 0);
    this.componentsGroup.add(optoGroup);
    this.registerClickable(optoGroup, 'optocouplers_array');

    // 10. Sensor Pin Headers
    const sensorHeaderGroup = this.createSensorHeaders();
    sensorHeaderGroup.position.set(80, 0, 30);
    this.componentsGroup.add(sensorHeaderGroup);
    this.registerClickable(sensorHeaderGroup, 'sensor_headers');

    // 11. SMD Resistors and LED Indicators
    this.createSMDPassivesAndLEDs();

    // 12. Register Isolation Gap click
    const dummyIsolationBox = new THREE.Mesh(
      new THREE.BoxGeometry(190, 4, 6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    dummyIsolationBox.position.set(0, 0, -3);
    this.componentsGroup.add(dummyIsolationBox);
    this.registerClickable(dummyIsolationBox, 'isolation_gap');
  }

  // --- COMPONENT FACTORY METHODS ---

  private createTerminalBlock(label: string): THREE.Group {
    const group = new THREE.Group();

    // Blue nylon housing
    const blueHousingMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Classic vibrant industrial blue
      roughness: 0.35,
      metalness: 0.08
    });

    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(14, 13, 10),
      blueHousingMat
    );
    housing.position.y = 6.5;
    housing.castShadow = true;
    housing.receiveShadow = true;
    group.add(housing);

    // Top screw cavities & steel slotted screws
    const screwMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.85,
      roughness: 0.25
    });

    [-3.2, 3.2].forEach(offset => {
      // Cavity
      const cavity = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 3, 16),
        new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.8 })
      );
      cavity.position.set(offset, 12, 0);
      group.add(cavity);

      // Screw head
      const screwHead = new THREE.Mesh(
        new THREE.CylinderGeometry(2.0, 2.0, 1.2, 16),
        screwMat
      );
      screwHead.position.set(offset, 12.2, 0);
      group.add(screwHead);

      // Cross slot on screw
      const slot = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.4, 0.6),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
      );
      slot.position.set(offset, 12.8, 0);
      group.add(slot);

      // Front wire entry hole with brass clamp inside
      const hole = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 4.5, 2),
        new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 })
      );
      hole.position.set(offset, 5, 5);
      group.add(hole);
    });

    return group;
  }

  private createFuseHolders(): THREE.Group {
    const group = new THREE.Group();

    // 2 Fuses side by side
    [-7, 7].forEach(offset => {
      // Brass clips
      const clipMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.9,
        roughness: 0.2
      });

      const clip1 = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 4), clipMat);
      clip1.position.set(offset, 3, -7);
      group.add(clip1);

      const clip2 = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 4), clipMat);
      clip2.position.set(offset, 3, 7);
      group.add(clip2);

      // Transparent glass tube
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        transmission: 0.85,
        roughness: 0.1,
        metalness: 0.05
      });
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 14, 16),
        glassMat
      );
      tube.rotation.x = Math.PI / 2;
      tube.position.set(offset, 4.2, 0);
      group.add(tube);

      // Silver metal end caps
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.15
      });
      [-6, 6].forEach(capZ => {
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(2.35, 2.35, 2.8, 16),
          capMat
        );
        cap.rotation.x = Math.PI / 2;
        cap.position.set(offset, 4.2, capZ);
        group.add(cap);
      });

      // Thin silver fuse wire inside
      const wireMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 10, 8),
        wireMat
      );
      wire.rotation.x = Math.PI / 2;
      wire.position.set(offset, 4.2, 0);
      group.add(wire);
    });

    return group;
  }

  private createPowerDiodes(): THREE.Group {
    const group = new THREE.Group();

    [-6, 6].forEach(offset => {
      // Axial cylinder body (DO-201)
      const diodeBodyMat = new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.4,
        metalness: 0.1
      });
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.4, 9, 16),
        diodeBodyMat
      );
      body.rotation.x = Math.PI / 2;
      body.position.set(offset, 3.8, 0);
      body.castShadow = true;
      group.add(body);

      // Silver cathode band
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.7,
        roughness: 0.3
      });
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(2.42, 2.42, 1.6, 16),
        bandMat
      );
      band.rotation.x = Math.PI / 2;
      band.position.set(offset, 3.8, 2.8);
      group.add(band);

      // Silver axial bent leads
      const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 });
      const lead1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6, 8), leadMat);
      lead1.position.set(offset, 2, -6.5);
      group.add(lead1);

      const lead2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6, 8), leadMat);
      lead2.position.set(offset, 2, 6.5);
      group.add(lead2);
    });

    return group;
  }

  private createRelayBank(): THREE.Group {
    const group = new THREE.Group();
    const relayXPositions = [15, 38, 61, 84];
    const relayLabels = ['RL1 AC INVERTER', 'RL2 EXHAUST FAN', 'RL3 MIST PUMP', 'RL4 AUX HEATER'];

    relayXPositions.forEach((rx, idx) => {
      const singleRelay = new THREE.Group();

      // Black molded cube housing
      const cubeMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.28,
        metalness: 0.15
      });
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(15.5, 15, 18.5),
        cubeMat
      );
      cube.position.y = 7.5;
      cube.castShadow = true;
      cube.receiveShadow = true;
      singleRelay.add(cube);

      // Relay top printed markings (Songle SRD styling)
      const topCanvas = document.createElement('canvas');
      topCanvas.width = 256;
      topCanvas.height = 256;
      const tc = topCanvas.getContext('2d')!;
      tc.fillStyle = '#111111';
      tc.fillRect(0, 0, 256, 256);
      tc.fillStyle = '#ffffff';
      tc.font = 'bold 36px monospace';
      tc.fillText('SONGLE', 30, 50);
      tc.fillStyle = '#38bdf8';
      tc.font = '24px monospace';
      tc.fillText('SRD-12VDC-SL-C', 30, 90);
      tc.fillStyle = '#94a3b8';
      tc.font = '20px monospace';
      tc.fillText('10A 250VAC 10A 30VDC', 30, 130);
      tc.fillStyle = '#f59e0b';
      tc.font = 'bold 24px monospace';
      tc.fillText(relayLabels[idx], 20, 185);

      const topTexture = new THREE.CanvasTexture(topCanvas);
      const topPlate = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 18),
        new THREE.MeshBasicMaterial({ map: topTexture })
      );
      topPlate.rotation.x = -Math.PI / 2;
      topPlate.position.y = 15.05;
      singleRelay.add(topPlate);

      // Red status LED next to each relay
      const ledMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 1.5
      });
      const led = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.0), ledMat);
      led.position.set(-6.5, 0.6, 11);
      singleRelay.add(led);

      // PointLight for realistic red bounce on PCB
      const relayLight = new THREE.PointLight(0xef4444, 0.4, 25);
      relayLight.position.set(-6.5, 4, 11);
      singleRelay.add(relayLight);
      this.ledLights.push(relayLight);

      singleRelay.position.set(rx, 0, -28);
      group.add(singleRelay);
    });

    return group;
  }

  private createESP32DevKit(): THREE.Group {
    const group = new THREE.Group();

    // 1. ESP32 sub-board (black FR4)
    const subBoardMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.4,
      metalness: 0.1
    });
    const subBoard = new THREE.Mesh(
      new THREE.BoxGeometry(26, 1.6, 50),
      subBoardMat
    );
    subBoard.position.y = 4.8; // sits atop headers
    subBoard.castShadow = true;
    group.add(subBoard);

    // 2. Metallic RF Shielding Can (ESP-WROOM-32)
    const canMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.88,
      roughness: 0.22
    });
    const shieldCan = new THREE.Mesh(
      new THREE.BoxGeometry(17.5, 3.2, 19),
      canMat
    );
    shieldCan.position.set(0, 7.2, 2);
    shieldCan.castShadow = true;
    group.add(shieldCan);

    // Silk text on shield can
    const shieldCanvas = document.createElement('canvas');
    shieldCanvas.width = 256;
    shieldCanvas.height = 256;
    const sc = shieldCanvas.getContext('2d')!;
    sc.fillStyle = '#d1d5db';
    sc.fillRect(0, 0, 256, 256);
    sc.fillStyle = '#1e293b';
    sc.font = 'bold 32px monospace';
    sc.fillText('Espressif', 45, 60);
    sc.font = 'bold 36px monospace';
    sc.fillText('ESP32', 70, 110);
    sc.font = '22px monospace';
    sc.fillText('ESP-WROOM-32', 30, 150);
    sc.font = '18px monospace';
    sc.fillText('FCC ID: 2AC7Z', 45, 190);

    const shieldTexture = new THREE.CanvasTexture(shieldCanvas);
    const shieldPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(17, 18.5),
      new THREE.MeshBasicMaterial({ map: shieldTexture })
    );
    shieldPlate.rotation.x = -Math.PI / 2;
    shieldPlate.position.set(0, 8.82, 2);
    group.add(shieldPlate);

    // 3. Meandering Golden PCB Trace Antenna on top edge
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0xdfb15b,
      metalness: 0.9,
      roughness: 0.15
    });
    const antennaPlate = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.2, 8),
      antennaMat
    );
    antennaPlate.position.set(0, 5.7, 18);
    group.add(antennaPlate);

    // 4. Micro-USB Connector at bottom edge
    const usbMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });
    const usbJack = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 3.0, 5.5),
      usbMat
    );
    usbJack.position.set(0, 6.4, -24);
    group.add(usbJack);

    // 5. Tactile Push Buttons (EN & BOOT)
    [-7, 7].forEach(bx => {
      const btnBase = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 1.8, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
      );
      btnBase.position.set(bx, 6.2, -18);
      group.add(btnBase);

      const btnCap = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 1.0, 0.8, 12),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
      );
      btnCap.position.set(bx, 7.3, -18);
      group.add(btnCap);
    });

    // 6. Dual 15-pin Headers beneath
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.5
    });
    const goldPinMat = new THREE.MeshStandardMaterial({
      color: 0xdfb15b,
      metalness: 0.95
    });

    [-11.5, 11.5].forEach(px => {
      const plasticStrip = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 3.8, 48),
        pinMat
      );
      plasticStrip.position.set(px, 2.0, 0);
      group.add(plasticStrip);

      for (let pz = -23; pz <= 23; pz += 3.2) {
        const pin = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 6, 0.6),
          goldPinMat
        );
        pin.position.set(px, 2.0, pz);
        group.add(pin);
      }
    });

    return group;
  }

  private createOLEDModule(): THREE.Group {
    const group = new THREE.Group();

    // Module PCB (blue)
    const oledPcb = new THREE.Mesh(
      new THREE.BoxGeometry(28, 1.6, 28),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35 })
    );
    oledPcb.position.y = 4.0;
    oledPcb.castShadow = true;
    group.add(oledPcb);

    // Glossy OLED Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.05,
      metalness: 0.8
    });
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(25, 1.0, 18),
      glassMat
    );
    glass.position.set(0, 5.2, -1);
    group.add(glass);

    // OLED Active Screen with Dynamic Canvas Texture
    const oledScreenMat = new THREE.MeshBasicMaterial({
      map: this.oledTexture,
      toneMapped: false
    });
    this.oledMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 15),
      oledScreenMat
    );
    this.oledMesh.rotation.x = -Math.PI / 2;
    this.oledMesh.position.set(0, 5.75, -1);
    group.add(this.oledMesh);

    // Subtle blue screen glow light
    const oledLight = new THREE.PointLight(0x38bdf8, 0.6, 40);
    oledLight.position.set(0, 8, -1);
    group.add(oledLight);
    this.ledLights.push(oledLight);

    // 4-pin top connector (VCC, GND, SCL, SDA)
    const pinHeader = new THREE.Mesh(
      new THREE.BoxGeometry(10.5, 3.5, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    pinHeader.position.set(0, 2.0, 11);
    group.add(pinHeader);

    return group;
  }

  public updateOLEDDisplay() {
    const ctx = this.oledContext;
    const w = this.oledCanvas.width;
    const h = this.oledCanvas.height;

    // Deep OLED black background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Top status banner (Yellow/Cyan header bar common on SSD1306)
    ctx.fillStyle = '#facc15'; // Amber top strip
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NE-AGRI COLD STORAGE', 15, 35);
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.telemetry.batteryVoltage.toFixed(1)}V`, w - 15, 35);

    // Divider line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 48);
    ctx.lineTo(w - 10, 48);
    ctx.stroke();

    // Main telemetry digits in bright cyan
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';

    // Temp Block
    ctx.font = 'bold 54px monospace';
    ctx.fillText(`${this.telemetry.temp.toFixed(1)}°C`, 20, 110);
    ctx.font = '22px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ROOM TEMP', 20, 140);

    // Humidity Block
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 54px monospace';
    ctx.fillText(`${Math.round(this.telemetry.humidity)}%`, 270, 110);
    ctx.font = '22px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('REL HUMIDITY', 270, 140);

    // Relay indicators bottom bar
    ctx.fillStyle = this.telemetry.acActive ? '#22c55e' : '#64748b';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(`[AC:${this.telemetry.acActive ? 'ON' : 'OFF'}]`, 20, 190);

    ctx.fillStyle = this.telemetry.fanActive ? '#22c55e' : '#64748b';
    ctx.fillText(`[FAN:${this.telemetry.fanActive ? 'ON' : 'OFF'}]`, 180, 190);

    ctx.fillStyle = this.telemetry.foggerActive ? '#22c55e' : '#64748b';
    ctx.fillText(`[MIST:${this.telemetry.foggerActive ? 'ON' : 'OFF'}]`, 340, 190);

    // Crop Preset and Status
    ctx.fillStyle = '#f8fafc';
    ctx.font = '22px monospace';
    ctx.fillText(`CROP: ${this.telemetry.cropName} | STATUS: OPTIMAL`, 20, 235);

    this.oledTexture.needsUpdate = true;
  }

  private createLM2596Module(): THREE.Group {
    const group = new THREE.Group();

    // Black SMT power IC
    const ic = new THREE.Mesh(
      new THREE.BoxGeometry(10, 3, 10),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 })
    );
    ic.position.set(-6, 2, 0);
    group.add(ic);

    // Finned Aluminum Heatsink
    const heatsinkMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.3
    });
    const heatsink = new THREE.Mesh(
      new THREE.BoxGeometry(12, 10, 12),
      heatsinkMat
    );
    heatsink.position.set(-6, 8, 0);
    heatsink.castShadow = true;
    group.add(heatsink);

    // Toroidal Power Inductor (copper coil on ferrite doughnut)
    const toroidMat = new THREE.MeshStandardMaterial({
      color: 0x27272a, // Ferrite core
      roughness: 0.6
    });
    const toroid = new THREE.Mesh(
      new THREE.TorusGeometry(6, 2.5, 16, 32),
      toroidMat
    );
    toroid.rotation.x = Math.PI / 2;
    toroid.position.set(8, 3.5, 0);
    group.add(toroid);

    // Copper winding strands visible on toroid
    const copperWireMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.85,
      roughness: 0.25
    });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const strand = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.4, 8, 16),
        copperWireMat
      );
      strand.position.set(8 + Math.cos(a) * 6, 3.5, Math.sin(a) * 6);
      strand.rotation.y = -a;
      group.add(strand);
    }

    // 2 Electrolytic Capacitors with stamped safety vent cross
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Navy capacitor sleeve
      roughness: 0.3
    });
    const capTopMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Aluminum top
      metalness: 0.85,
      roughness: 0.3
    });

    [-7, 7].forEach(cz => {
      const capCan = new THREE.Mesh(
        new THREE.CylinderGeometry(3.5, 3.5, 11, 24),
        capMat
      );
      capCan.position.set(18, 5.5, cz);
      capCan.castShadow = true;
      group.add(capCan);

      const capTop = new THREE.Mesh(
        new THREE.CylinderGeometry(3.48, 3.48, 0.5, 24),
        capTopMat
      );
      capTop.position.set(18, 11.1, cz);
      group.add(capTop);
    });

    return group;
  }

  private createAMS1117(): THREE.Group {
    const group = new THREE.Group();

    // SOT-223 Black Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 1.8, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 })
    );
    body.position.y = 0.9;
    group.add(body);

    // Metal thermal tab
    const tab = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.4, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 })
    );
    tab.position.set(0, 0.9, -2.4);
    group.add(tab);

    return group;
  }

  private createOptocouplerArray(): THREE.Group {
    const group = new THREE.Group();
    const optoX = [15, 38, 61, 84];

    optoX.forEach(ox => {
      // 4-pin DIP/SOP IC spanning the isolation line
      const optoBody = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 3.2, 7.0),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.35 })
      );
      optoBody.position.set(ox, 1.7, -4);
      optoBody.castShadow = true;
      group.add(optoBody);

      // Pin 1 dot
      const dot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12),
        new THREE.MeshBasicMaterial({ color: 0x64748b })
      );
      dot.position.set(ox - 1.8, 3.32, -6);
      group.add(dot);

      // S8050 NPN driver transistor next to it
      const to92 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 1.6, 4, 16, 1, false, 0, Math.PI * 1.4),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
      );
      to92.position.set(ox - 6, 2, -4);
      group.add(to92);
    });

    return group;
  }

  private createSensorHeaders(): THREE.Group {
    const group = new THREE.Group();

    // 3 rows of headers for DHT22, Float, and I2C
    const labels = ['DHT22', 'FLOAT', 'OLED_BUS'];
    const zOffsets = [0, 8, 16];

    zOffsets.forEach((zo, i) => {
      const plasticBase = new THREE.Mesh(
        new THREE.BoxGeometry(10, 2.5, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 })
      );
      plasticBase.position.set(0, 1.25, zo);
      group.add(plasticBase);

      [-3.8, -1.2, 1.2, 3.8].forEach(px => {
        const pin = new THREE.Mesh(
          new THREE.BoxGeometry(0.64, 8.5, 0.64),
          new THREE.MeshStandardMaterial({ color: 0xdfb15b, metalness: 0.95 })
        );
        pin.position.set(px, 4.25, zo);
        group.add(pin);
      });
    });

    return group;
  }

  private createSMDPassivesAndLEDs() {
    const smdMat = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.5 });
    const capSmdMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.35 });
    const solderMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85 });

    // Grid of passives near ESP32 and LM2596
    const passiveCoords = [
      { x: -5, z: 12, isCap: true },
      { x: -5, z: 16, isCap: false },
      { x: -5, z: 20, isCap: false },
      { x: -5, z: 24, isCap: true },
      { x: 5, z: 12, isCap: false },
      { x: 5, z: 16, isCap: true },
      { x: -50, z: 35, isCap: true },
      { x: -50, z: 40, isCap: false },
      { x: -50, z: 45, isCap: false }
    ];

    passiveCoords.forEach(pc => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.8, 1.2),
        pc.isCap ? capSmdMat : smdMat
      );
      mesh.position.set(pc.x, 0.45, pc.z);
      this.componentsGroup.add(mesh);

      // Silver solder end terminations
      [-0.9, 0.9].forEach(sx => {
        const term = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.82, 1.22),
          solderMat
        );
        term.position.set(pc.x + sx, 0.45, pc.z);
        this.componentsGroup.add(term);
      });
    });

    // 12V Power Indicator LED (Green)
    const greenLedMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 2.0
    });
    const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.2), greenLedMat);
    pwrLed.position.set(-80, 0.5, -20);
    this.componentsGroup.add(pwrLed);

    const pwrLight = new THREE.PointLight(0x22c55e, 0.5, 30);
    pwrLight.position.set(-80, 3, -20);
    this.componentsGroup.add(pwrLight);
    this.ledLights.push(pwrLight);
  }

  // --- ANIMATED CURRENT FLOW PARTICLES ---

  private buildCurrentFlowSystem() {
    // Current paths along high-current traces
    const curves: THREE.CatmullRomCurve3[] = [
      // PV to Fuses
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-80, 0.2, -55),
        new THREE.Vector3(-80, 0.2, -45),
        new THREE.Vector3(-65, 0.2, -45),
        new THREE.Vector3(-65, 0.2, -35)
      ]),
      // Battery to Relays
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-45, 0.2, -55),
        new THREE.Vector3(-45, 0.2, -40),
        new THREE.Vector3(0, 0.2, -40),
        new THREE.Vector3(20, 0.2, -40),
        new THREE.Vector3(38, 0.2, -35)
      ]),
      // Relays to AC Unit (TB3)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(15, 0.2, -28),
        new THREE.Vector3(10, 0.2, -45),
        new THREE.Vector3(10, 0.2, -55)
      ]),
      // Relays to Fan (TB4)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(38, 0.2, -28),
        new THREE.Vector3(45, 0.2, -45),
        new THREE.Vector3(45, 0.2, -55)
      ]),
      // Relays to Mist Pump (TB5)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(61, 0.2, -28),
        new THREE.Vector3(80, 0.2, -45),
        new THREE.Vector3(80, 0.2, -55)
      ])
    ];

    const particleCountPerCurve = 25;
    const particleGeo = new THREE.SphereGeometry(0.7, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9
    });

    curves.forEach((curve, cIdx) => {
      const color = cIdx < 2 ? 0xf59e0b : 0x38bdf8; // Amber for harvest, cyan for loads
      for (let i = 0; i < particleCountPerCurve; i++) {
        const mat = particleMat.clone();
        mat.color.setHex(color);
        const particle = new THREE.Mesh(particleGeo, mat);
        particle.userData = {
          curve,
          offset: i / particleCountPerCurve,
          speed: 0.15 + (cIdx % 2) * 0.05
        };
        this.currentParticlesGroup.add(particle);
      }
    });

    this.currentParticlesGroup.visible = this.settings.showCurrentFlow;
  }

  // --- THERMAL INFRARED HEATMAP OVERLAY ---

  private buildThermalOverlay() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 614;
    const ctx = canvas.getContext('2d')!;

    // Base cool green/blue (room temp ~22°C)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Warm gradients around LM2596 (45°C) and Relays (38°C)
    const addThermalHotspot = (x: number, y: number, r: number, colorStart: string) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, colorStart);
      grad.addColorStop(0.5, '#ea580c'); // Orange
      grad.addColorStop(0.8, '#ca8a04'); // Yellow
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // LM2596 heatsink spot
    addThermalHotspot(200, 420, 160, '#ef4444');
    // Relay coils spots
    addThermalHotspot(650, 180, 140, '#f97316');
    addThermalHotspot(750, 180, 140, '#f97316');
    // Power Diodes
    addThermalHotspot(360, 180, 100, '#fbbf24');

    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(200, 120);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });

    this.thermalOverlayMesh = new THREE.Mesh(geo, mat);
    this.thermalOverlayMesh.position.y = 0.12;
    this.thermalOverlayMesh.visible = this.settings.showThermalHeatmap;
    this.boardGroup.add(this.thermalOverlayMesh);
  }

  // --- INTERACTION & EVENT LISTENERS ---

  private registerClickable(object: THREE.Object3D, componentId: string) {
    object.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        this.clickableMeshes.push({ mesh: child, componentId });
      }
    });
  }

  private setupEventListeners() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.isOrbiting = true;
      if (e.button === 2) this.isPanning = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isOrbiting = false;
      this.isPanning = false;
    });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isOrbiting) {
        const deltaX = e.clientX - this.prevMousePos.x;
        const deltaY = e.clientY - this.prevMousePos.y;

        // Spherical orbit around target
        const offset = this.targetPosition.clone().sub(this.targetLookAt);
        const radius = offset.length();
        let theta = Math.atan2(offset.x, offset.z);
        let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

        theta -= deltaX * 0.008;
        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY * 0.008));

        this.targetPosition.x = this.targetLookAt.x + radius * Math.sin(phi) * Math.sin(theta);
        this.targetPosition.y = this.targetLookAt.y + radius * Math.cos(phi);
        this.targetPosition.z = this.targetLookAt.z + radius * Math.sin(phi) * Math.cos(theta);

        this.prevMousePos = { x: e.clientX, y: e.clientY };
      } else if (this.isPanning) {
        const deltaX = e.clientX - this.prevMousePos.x;
        const deltaY = e.clientY - this.prevMousePos.y;

        const panSpeed = 0.15;
        this.targetLookAt.x -= deltaX * panSpeed;
        this.targetLookAt.z += deltaY * panSpeed;
        this.targetPosition.x -= deltaX * panSpeed;
        this.targetPosition.z += deltaY * panSpeed;

        this.prevMousePos = { x: e.clientX, y: e.clientY };
      } else {
        this.checkHover();
      }
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.15;
      const offset = this.targetPosition.clone().sub(this.targetLookAt);
      const newRadius = Math.max(30, Math.min(450, offset.length() + zoomFactor));
      offset.setLength(newRadius);
      this.targetPosition.copy(this.targetLookAt).add(offset);
    }, { passive: false });

    el.addEventListener('click', () => {
      this.checkClick();
    });

    el.addEventListener('contextmenu', (e) => e.preventDefault());

    // Window Resize handling
    window.addEventListener('resize', () => {
      this.onResize();
    });
  }

  private checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.clickableMeshes.map(c => c.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const matched = this.clickableMeshes.find(c => c.mesh === hit);
      if (matched && matched.componentId !== this.hoveredComponentId) {
        this.hoveredComponentId = matched.componentId;
        this.renderer.domElement.style.cursor = 'pointer';
        if (this.onComponentHover) this.onComponentHover(this.hoveredComponentId);
      }
    } else {
      if (this.hoveredComponentId !== null) {
        this.hoveredComponentId = null;
        this.renderer.domElement.style.cursor = 'default';
        if (this.onComponentHover) this.onComponentHover(null);
      }
    }
  }

  private checkClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.clickableMeshes.map(c => c.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const matched = this.clickableMeshes.find(c => c.mesh === hit);
      if (matched) {
        this.selectedComponentId = matched.componentId;
        if (this.onComponentClick) this.onComponentClick(matched.componentId);
      }
    }
  }

  public onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // --- CAMERA PRESET NAVIGATION ---

  public setCameraPreset(preset: CameraAnglePreset) {
    this.isVideoPlaying = false; // Stop auto flight when user picks preset
    switch (preset) {
      case 'perspective':
        this.targetPosition.set(0, 110, 160);
        this.targetLookAt.set(0, 0, 0);
        break;
      case 'top':
        this.targetPosition.set(0, 220, 0.1);
        this.targetLookAt.set(0, 0, 0);
        break;
      case 'front':
        this.targetPosition.set(0, 10, 180);
        this.targetLookAt.set(0, 5, 0);
        break;
      case 'back':
        this.targetPosition.set(0, 10, -180);
        this.targetLookAt.set(0, 5, 0);
        break;
      case 'left':
        this.targetPosition.set(-180, 15, 0);
        this.targetLookAt.set(0, 5, 0);
        break;
      case 'right':
        this.targetPosition.set(180, 15, 0);
        this.targetLookAt.set(0, 5, 0);
        break;
      case 'underside':
        this.targetPosition.set(0, -180, 10);
        this.targetLookAt.set(0, 0, 0);
        break;
      case 'iso_alt1':
        this.targetPosition.set(120, 95, 120);
        this.targetLookAt.set(0, 0, 0);
        break;
      case 'iso_alt2':
        this.targetPosition.set(-120, 85, -110);
        this.targetLookAt.set(0, 0, 0);
        break;
    }
  }

  public focusComponent(component: BoardComponentInfo) {
    this.isVideoPlaying = false;
    const c = component.coordinates;
    this.targetLookAt.set(c.x, c.y + 3, c.z);
    this.targetPosition.set(c.x + 25, c.y + 45, c.z + 45);
  }

  // --- CINEMATIC SEQUENCER UPDATE ---

  private updateCinematicSequence(delta: number) {
    if (!this.isVideoPlaying) return;

    this.sequenceTime = (this.sequenceTime + delta) % this.sequenceDuration;
    this.sequenceProgress = this.sequenceTime / this.sequenceDuration;
    const t = this.sequenceProgress; // 0 to 1

    switch (this.activeSequence) {
      case 'orbit_360': {
        const radius = 180;
        const angle = t * Math.PI * 2;
        const height = 90 + Math.sin(t * Math.PI * 4) * 25;
        this.targetPosition.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        this.targetLookAt.set(0, 0, 0);
        break;
      }
      case 'component_flyby': {
        // Waypoints over ESP32 -> Opto -> Relays -> Fuses -> OLED
        const waypoints = [
          { cam: new THREE.Vector3(35, 30, 45), look: new THREE.Vector3(25, 5, 25) },
          { cam: new THREE.Vector3(45, 25, 15), look: new THREE.Vector3(45, 2, -4) },
          { cam: new THREE.Vector3(70, 35, -10), look: new THREE.Vector3(50, 8, -28) },
          { cam: new THREE.Vector3(-40, 30, -15), look: new THREE.Vector3(-65, 4, -35) },
          { cam: new THREE.Vector3(-20, 25, 40), look: new THREE.Vector3(-28, 5, 22) }
        ];
        const seg = t * (waypoints.length - 1);
        const idx = Math.min(waypoints.length - 2, Math.floor(seg));
        const segT = seg - idx;
        const p1 = waypoints[idx];
        const p2 = waypoints[idx + 1];

        this.targetPosition.lerpVectors(p1.cam, p2.cam, segT);
        this.targetLookAt.lerpVectors(p1.look, p2.look, segT);
        break;
      }
      case 'thermal_flow': {
        // Slow sweeping orbit with thermal heatmap enabled
        const radius = 150;
        const angle = Math.PI * 0.25 + Math.sin(t * Math.PI * 2) * 0.8;
        this.targetPosition.set(
          Math.cos(angle) * radius,
          85 + Math.sin(t * Math.PI) * 20,
          Math.sin(angle) * radius
        );
        this.targetLookAt.set(-10, 0, -10);
        break;
      }
      case 'isolation_barrier': {
        // Micro zoom on the 3.5mm slot
        const slotX = -50 + t * 100;
        this.targetPosition.set(slotX, 32, 28);
        this.targetLookAt.set(slotX, 0, -3);
        break;
      }
      case 'farmer_shed_overview': {
        // Dolly out from board to wider perspective
        const distance = 120 + t * 160;
        this.targetPosition.set(0, distance * 0.75, distance);
        this.targetLookAt.set(0, 0, 0);
        break;
      }
      case 'exploded_layers': {
        // Orbit while layers are exploded
        const angle = t * Math.PI * 2;
        this.targetPosition.set(Math.sin(angle) * 160, 110, Math.cos(angle) * 160);
        this.targetLookAt.set(0, 10, 0);
        break;
      }
    }
  }

  // --- SETTINGS AND VISIBILITY CONTROLS ---

  public updateSettings(newSettings: Partial<RenderSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    if (newSettings.showTraces !== undefined) {
      this.tracesGroup.visible = newSettings.showTraces;
    }
    if (newSettings.showSilkscreen !== undefined) {
      this.silkscreenMesh.visible = newSettings.showSilkscreen;
    }
    if (newSettings.showCurrentFlow !== undefined) {
      this.currentParticlesGroup.visible = newSettings.showCurrentFlow;
    }
    if (newSettings.showThermalHeatmap !== undefined) {
      this.thermalOverlayMesh.visible = newSettings.showThermalHeatmap;
    }
    if (newSettings.explodedAmount !== undefined) {
      this.applyExplodedAmount(newSettings.explodedAmount);
    }
  }

  private applyExplodedAmount(amount: number) {
    // amount: 0 to 1
    // Separate layers along Y axis
    const maxExplode = 40; // mm gap
    this.layerBottomGround.position.y = -1.62 - amount * maxExplode * 0.6;
    this.layerTopCopper.position.y = amount * maxExplode * 0.3;
    this.layerSilkscreen.position.y = 0.08 + amount * maxExplode * 0.6;
    this.componentsGroup.position.y = amount * maxExplode * 1.0;
  }

  public updateTelemetry(data: Partial<typeof this.telemetry>) {
    Object.assign(this.telemetry, data);
    this.updateOLEDDisplay();
  }

  // --- ANIMATION LOOP ---

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Cinematic sequence progression
    if (this.isVideoPlaying) {
      this.updateCinematicSequence(delta);
    } else if (this.settings.autoRotate && !this.isOrbiting) {
      const radius = 170;
      const angle = elapsedTime * 0.25;
      this.targetPosition.x = Math.cos(angle) * radius;
      this.targetPosition.z = Math.sin(angle) * radius;
    }

    // Smooth camera damping
    this.currentPosition.lerp(this.targetPosition, 0.08);
    this.currentLookAt.lerp(this.targetLookAt, 0.08);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);

    // Animate Current Flow Particles
    if (this.currentParticlesGroup.visible) {
      this.currentParticlesGroup.children.forEach(child => {
        const p = child as THREE.Mesh;
        const data = p.userData;
        data.offset = (data.offset + delta * data.speed) % 1.0;
        const pt = (data.curve as THREE.CatmullRomCurve3).getPoint(data.offset);
        p.position.copy(pt);
      });
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  public capture4KSnapshot(): string {
    // Set 4K canvas size temporarily for pristine ultra-res capture
    const origWidth = this.renderer.domElement.width;
    const origHeight = this.renderer.domElement.height;

    this.renderer.setSize(3840, 2160, false);
    this.camera.aspect = 3840 / 2160;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    // Restore original size
    this.renderer.setSize(origWidth, origHeight, false);
    this.camera.aspect = origWidth / origHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);

    return dataUrl;
  }

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
