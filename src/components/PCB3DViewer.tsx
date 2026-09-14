import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Video,
  Zap,
  Flame,
  Download,
  Eye,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { PCB3DScene } from './PCB3DScene';
import { BoardComponentInfo, CameraAnglePreset, RenderSettings, VideoSequenceId } from '../types';
import { BOARD_COMPONENTS, VIDEO_SEQUENCES } from '../data/componentsData';

interface PCB3DViewerProps {
  onSelectComponent: (component: BoardComponentInfo) => void;
  selectedComponent: BoardComponentInfo | null;
  telemetry: {
    temp: number;
    humidity: number;
    batteryVoltage: number;
    solarVoltage: number;
    acActive: boolean;
    fanActive: boolean;
    foggerActive: boolean;
    cropName: string;
  };
}

export const PCB3DViewer: React.FC<PCB3DViewerProps> = ({
  onSelectComponent,
  selectedComponent,
  telemetry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PCB3DScene | null>(null);

  // States
  const [activePreset, setActivePreset] = useState<CameraAnglePreset>('perspective');
  const [activeSequence, setActiveSequence] = useState<VideoSequenceId>('orbit_360');
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(true);
  const [hoveredComp, setHoveredComp] = useState<BoardComponentInfo | null>(null);

  // Render settings
  const [settings, setSettings] = useState<RenderSettings>({
    quality: '4k',
    showTraces: true,
    showSilkscreen: true,
    showCopperPour: true,
    showThermalHeatmap: false,
    showCurrentFlow: true,
    showComponentLabels: true,
    explodedAmount: 0,
    bloomEnabled: true,
    autoRotate: false,
    wireframe: false
  });

  // Video recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new PCB3DScene(containerRef.current, settings);
    sceneRef.current = scene;

    scene.onComponentHover = (id) => {
      if (!id) {
        setHoveredComp(null);
      } else {
        const found = BOARD_COMPONENTS.find((c) => c.id === id);
        setHoveredComp(found || null);
      }
    };

    scene.onComponentClick = (id) => {
      const found = BOARD_COMPONENTS.find((c) => c.id === id);
      if (found) {
        onSelectComponent(found);
      }
    };

    // Start in cinematic video mode
    scene.activeSequence = 'orbit_360';
    scene.isVideoPlaying = true;
    setIsPlayingVideo(true);

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update telemetry in 3D scene (OLED display text)
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateTelemetry(telemetry);
    }
  }, [telemetry]);

  // Focus component when selected from outside
  useEffect(() => {
    if (selectedComponent && sceneRef.current) {
      sceneRef.current.focusComponent(selectedComponent);
      setIsPlayingVideo(false);
    }
  }, [selectedComponent]);

  // Handle settings change
  const updateSetting = <K extends keyof RenderSettings>(key: K, value: RenderSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (sceneRef.current) {
        sceneRef.current.updateSettings(next);
      }
      return next;
    });
  };

  // Toggle Video Playback
  const toggleVideoPlayback = () => {
    if (!sceneRef.current) return;
    const nextState = !isPlayingVideo;
    sceneRef.current.isVideoPlaying = nextState;
    setIsPlayingVideo(nextState);
  };

  // Switch Video Sequence
  const handleSelectSequence = (seqId: VideoSequenceId) => {
    setActiveSequence(seqId);
    if (!sceneRef.current) return;
    sceneRef.current.activeSequence = seqId;
    sceneRef.current.isVideoPlaying = true;
    setIsPlayingVideo(true);

    const seqInfo = VIDEO_SEQUENCES.find((s) => s.id === seqId);
    if (seqInfo) {
      sceneRef.current.sequenceDuration = seqInfo.durationSeconds;
    }

    // Auto toggle thermal heatmap for thermal sequence
    if (seqId === 'thermal_flow') {
      updateSetting('showThermalHeatmap', true);
      updateSetting('showCurrentFlow', true);
    } else if (seqId === 'exploded_layers') {
      updateSetting('explodedAmount', 0.85);
    } else {
      if (settings.explodedAmount > 0) updateSetting('explodedAmount', 0);
    }
  };

  // Switch Camera Preset
  const handleSelectPreset = (preset: CameraAnglePreset) => {
    setActivePreset(preset);
    setIsPlayingVideo(false);
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(preset);
    }
  };

  // Start / Stop 4K Video Recording
  const startRecording = () => {
    if (!sceneRef.current || isRecording) return;

    const canvas = sceneRef.current.renderer.domElement;
    const stream = canvas.captureStream(60); // 60 FPS capture
    recordedChunksRef.current = [];

    // Check supported MIME type
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    const mimeType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || 'video/webm';

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 15000000 // 15 Mbps for crisp 4K recording
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Solar_Cold_Storage_PCB_4K_${activeSequence}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordingSeconds(0);
        if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start timer
      recordIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);

      // Ensure video sequence is playing
      if (!isPlayingVideo) {
        toggleVideoPlayback();
      }
    } catch (err) {
      console.error('MediaRecorder error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Capture High-Res 4K Still Snapshot
  const captureSnapshot = () => {
    if (!sceneRef.current) return;
    const dataUrl = sceneRef.current.capture4KSnapshot();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Solar_Cold_Storage_PCB_4K_Snapshot.png`;
    a.click();
  };

  const currentSeqObj = VIDEO_SEQUENCES.find((s) => s.id === activeSequence) || VIDEO_SEQUENCES[0];

  return (
    <div className="relative w-full h-full min-h-[540px] bg-slate-950 overflow-hidden select-none flex flex-col">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full flex-1 relative cursor-grab active:cursor-grabbing" />

      {/* Top Bar: Title, 4K Badge, Live Sequence Info & Action Buttons */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        {/* Left: Project & Active Sequence Pill */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase">
                4K UHD 60FPS
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-1.5 py-0.5 rounded border border-sky-400/30">
                PBR RAYTRACED
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <span>{currentSeqObj.title}</span>
              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                • {currentSeqObj.durationSeconds}s Tour
              </span>
            </h2>
          </div>
        </div>

        {/* Right: Quick Snapshot & 4K Recording Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Snapshot Button */}
          <button
            id="btn-capture-4k-snapshot"
            onClick={captureSnapshot}
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-mono font-medium px-3 py-2 rounded-xl border border-slate-700/60 transition shadow-md hover:border-slate-500"
            title="Export 4K UHD Still Screenshot (3840x2160)"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Capture 4K</span>
          </button>

          {/* Record 4K Video Button */}
          {!isRecording ? (
            <button
              id="btn-record-4k-video"
              onClick={startRecording}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-rose-900/30 transition active:scale-95"
              title="Record 4K Cinematic Video of the PCB"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span>Record 4K Video</span>
            </button>
          ) : (
            <button
              id="btn-stop-recording"
              onClick={stopRecording}
              className="flex items-center gap-2 bg-slate-900 border border-rose-500/80 text-rose-400 text-xs font-mono font-bold px-3.5 py-2 rounded-xl shadow-lg animate-pulse"
            >
              <div className="w-2 h-2 rounded bg-rose-500" />
              <span>Recording {recordingSeconds}s • Stop & Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Left: Camera Presets Bar (matching Image 2) */}
      <div className="absolute left-4 top-24 pointer-events-auto flex flex-col gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80 shadow-xl z-10 text-[11px] font-mono">
        <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800 mb-1">
          <span>Camera Views</span>
          <Layers className="w-3 h-3 text-slate-500" />
        </div>

        {[
          { id: 'perspective', label: 'Perspective' },
          { id: 'top', label: 'Top View' },
          { id: 'front', label: 'Front Elevation' },
          { id: 'left', label: 'Left Elevation' },
          { id: 'right', label: 'Right Elevation' },
          { id: 'underside', label: 'Underside (Traces)' },
          { id: 'iso_alt1', label: 'Angled Iso 1' },
          { id: 'iso_alt2', label: 'Angled Iso 2' }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => handleSelectPreset(view.id as CameraAnglePreset)}
            className={`px-2.5 py-1.5 rounded-lg text-left transition flex items-center justify-between ${
              activePreset === view.id && !isPlayingVideo
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Floating Right: 3D Visualization Modes & Layer Controls */}
      <div className="absolute right-4 top-24 pointer-events-auto flex flex-col gap-2 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 shadow-xl z-10 text-xs font-mono w-48">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span>Layer Toggles</span>
          <Sliders className="w-3 h-3 text-slate-500" />
        </div>

        {/* Current Flow Toggle */}
        <button
          onClick={() => updateSetting('showCurrentFlow', !settings.showCurrentFlow)}
          className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
            settings.showCurrentFlow
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Current Flow</span>
          </span>
          <span className="text-[10px]">{settings.showCurrentFlow ? 'ON' : 'OFF'}</span>
        </button>

        {/* Thermal Heatmap Toggle */}
        <button
          onClick={() => updateSetting('showThermalHeatmap', !settings.showThermalHeatmap)}
          className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
            settings.showThermalHeatmap
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Thermal IR</span>
          </span>
          <span className="text-[10px]">{settings.showThermalHeatmap ? 'ON' : 'OFF'}</span>
        </button>

        {/* Traces & Copper Pour */}
        <button
          onClick={() => updateSetting('showTraces', !settings.showTraces)}
          className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
            settings.showTraces
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copper Pours</span>
          </span>
          <span className="text-[10px]">{settings.showTraces ? 'ON' : 'OFF'}</span>
        </button>

        {/* Silkscreen Legend */}
        <button
          onClick={() => updateSetting('showSilkscreen', !settings.showSilkscreen)}
          className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
            settings.showSilkscreen
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Silkscreen</span>
          </span>
          <span className="text-[10px]">{settings.showSilkscreen ? 'ON' : 'OFF'}</span>
        </button>

        {/* Exploded View Slider */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Exploded Strata</span>
            <span className="text-sky-400 font-bold">{Math.round(settings.explodedAmount * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.explodedAmount}
            onChange={(e) => updateSetting('explodedAmount', parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Hovered Component Tooltip (HUD) */}
      {hoveredComp && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-sky-500/40 shadow-2xl z-20 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          <div>
            <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <span>{hoveredComp.referenceDesignator}: {hoveredComp.name}</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-normal">
                {hoveredComp.packageType}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 max-w-md line-clamp-1">
              {hoveredComp.roleInColdStorage}
            </p>
          </div>
          <div className="text-[10px] text-sky-400 font-mono border-l border-slate-700 pl-3">
            Click to Inspect
          </div>
        </div>
      )}

      {/* Bottom Cinematic Video Player / Director Bar */}
      <div className="w-full bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-3 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Play/Pause & Sequence Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              id="btn-play-pause-cinematic"
              onClick={toggleVideoPlayback}
              className={`p-2.5 rounded-xl flex items-center justify-center transition ${
                isPlayingVideo
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/30'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
              title={isPlayingVideo ? 'Pause Cinematic Video Flight' : 'Play Cinematic Video Flight'}
            >
              {isPlayingVideo ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 md:flex-none flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {VIDEO_SEQUENCES.map((seq) => (
                <button
                  key={seq.id}
                  onClick={() => handleSelectSequence(seq.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition border ${
                    activeSequence === seq.id
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 font-semibold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {seq.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Sequence description and farmer context reminder */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="hidden lg:flex items-center gap-2 text-[11px] bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold">NE Farmer Goal:</span>
              <span className="text-slate-300">Prevent 25% moisture loss & ginger/chilli decay with solar chill</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span>Left-Drag: Rotate</span>
              <span>•</span>
              <span>Right-Drag: Pan</span>
              <span>•</span>
              <span>Scroll: 4K Zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
