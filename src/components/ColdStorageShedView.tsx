import React, { useState } from 'react';
import {
  Sun,
  Battery,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  Check,
  Zap,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { CROP_PRESETS } from '../data/componentsData';
import { CropPreset } from '../types';

interface ColdStorageShedViewProps {
  currentTemp: number;
  currentHumidity: number;
  batteryVoltage: number;
  acActive: boolean;
  fanActive: boolean;
  foggerActive: boolean;
  selectedCrop: CropPreset;
  onSelectCrop: (crop: CropPreset) => void;
}

export const ColdStorageShedView: React.FC<ColdStorageShedViewProps> = ({
  currentTemp,
  currentHumidity,
  batteryVoltage,
  acActive,
  fanActive,
  foggerActive,
  selectedCrop,
  onSelectCrop
}) => {
  const [activeWiringHighlight, setActiveWiringHighlight] = useState<string | null>(null);

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-4 lg:p-6 overflow-hidden flex flex-col gap-6">
      {/* Header and Farmer Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              NORTH-EASTERN AGRO-TECH CONTEXT
            </span>
            <span className="text-xs font-mono text-slate-400">
              ASSAM • MEGHALAYA • SIKKIM • NAGALAND
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1">
            System Wiring Overview & 3D Cold Storage Shed
          </h3>
          <p className="text-xs text-slate-400">
            How the controller PCB integrates with rooftop solar PV, thermal chiller, misting fogger, and high-value horticultural crops
          </p>
        </div>

        {/* Crop Selection Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Crop:</span>
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {CROP_PRESETS.map((crop) => (
              <button
                key={crop.id}
                onClick={() => onSelectCrop(crop)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                  selectedCrop.id === crop.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {crop.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Shed Visualization & Wiring Diagram matching Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Shed Graphic (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Cold Storage Shed Architecture (On-Farm Micro Chamber)</span>
            </h4>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PUF Insulated Structure (R-28)</span>
            </div>
          </div>

          {/* SVG Diagram of Cold Storage Shed with Wiring Harness matching Image 1 */}
          <div className="w-full bg-slate-900/60 rounded-lg p-3 border border-slate-800/60">
            <svg viewBox="0 0 760 480" className="w-full h-auto font-mono select-none">
              {/* Shed Structural Body */}
              {/* Slanted Solar Roof */}
              <polygon points="120,40 320,40 420,110 80,110" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2.5" />
              <text x="230" y="80" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                ROOFTOP SOLAR PV (600W MONO-PERC)
              </text>

              {/* Shed Walls (PUF / Local Bamboo Clad) */}
              <rect x="80" y="110" width="340" height="260" fill="#1e293b" stroke="#475569" strokeWidth="3" rx="4" />
              <rect x="90" y="120" width="320" height="240" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

              {/* Inside Cold Storage Room Content */}
              {/* Chiller / AC Evaporator Unit on Top Wall */}
              <g transform="translate(110, 135)">
                <rect x="0" y="0" width="130" height="45" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <text x="65" y="24" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  ❄️ AC Chiller Unit
                </text>
                <text x="65" y="38" fill={acActive ? '#4ade80' : '#94a3b8'} fontSize="9" textAnchor="middle">
                  {acActive ? '● STATUS: COOLING ACTIVE' : '○ COMPRESSOR IDLE'}
                </text>
              </g>

              {/* Exhaust & Air Circulation Fan on Opposite Wall */}
              <g transform="translate(270, 135)">
                <circle cx="35" cy="22" r="20" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
                <path
                  d="M 35 10 L 35 34 M 23 22 L 47 22 M 26 13 L 44 31 M 26 31 L 44 13"
                  stroke={fanActive ? '#38bdf8' : '#64748b'}
                  strokeWidth="2.5"
                  className={fanActive ? 'animate-spin origin-center' : ''}
                />
                <text x="75" y="20" fill="#ffffff" fontSize="10" fontWeight="bold">
                  💨 Air Fan
                </text>
                <text x="75" y="34" fill={fanActive ? '#4ade80' : '#94a3b8'} fontSize="8">
                  {fanActive ? 'ON' : 'OFF'}
                </text>
              </g>

              {/* Ultrasonic Misting Fogger with Water Tank */}
              <g transform="translate(110, 290)">
                <rect x="0" y="0" width="80" height="60" rx="4" fill="#0891b2" stroke="#67e8f9" strokeWidth="1.5" />
                <text x="40" y="25" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Fogger Tank
                </text>
                <text x="40" y="42" fill="#e0f2fe" fontSize="8" textAnchor="middle">
                  Misting Pump
                </text>
                <circle cx="70" cy="15" r="4" fill={foggerActive ? '#22c55e' : '#64748b'} />
              </g>

              {/* Stored Horticultural Crops Crates (Ginger / Oranges) */}
              <g transform="translate(210, 240)">
                <rect x="0" y="0" width="180" height="110" rx="4" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
                <text x="90" y="30" fill="#fef3c7" fontSize="12" fontWeight="bold" textAnchor="middle">
                  {selectedCrop.name.split(' ')[0]} Harvest
                </text>
                <text x="90" y="55" fill="#fde68a" fontSize="10" textAnchor="middle">
                  Target: {selectedCrop.targetTemp}°C • {selectedCrop.targetHumidity}% RH
                </text>
                <rect x="15" y="70" width="150" height="28" fill="#451a03" rx="4" />
                <text x="90" y="88" fill="#86efac" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Weight Loss Saved: ~25%
                </text>
              </g>

              {/* DHT22 Digital Sensor on Room Center Wall */}
              <g transform="translate(170, 205)">
                <rect x="0" y="0" width="35" height="42" rx="3" fill="#ffffff" stroke="#94a3b8" />
                <circle cx="17" cy="14" r="7" fill="#cbd5e1" />
                <text x="17" y="32" fill="#0f172a" fontSize="8" fontWeight="bold" textAnchor="middle">
                  DHT22
                </text>
              </g>

              {/* Right Side: Central Control Box & 12V Battery */}
              {/* 12V Battery Bank */}
              <g transform="translate(480, 50)">
                <rect x="0" y="0" width="140" height="90" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                <text x="70" y="35" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  12V Battery Bank
                </text>
                <text x="70" y="55" fill="#facc15" fontSize="11" textAnchor="middle">
                  {batteryVoltage.toFixed(1)}V • 150Ah
                </text>
                <text x="70" y="75" fill="#94a3b8" fontSize="9" textAnchor="middle">
                  LiFePO4 Solar Storage
                </text>
              </g>

              {/* Main PCB Controller Box Graphic matching Image 1 */}
              <g transform="translate(470, 190)">
                <rect x="0" y="0" width="260" height="250" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
                <rect x="0" y="0" width="260" height="30" rx="10" fill="#065f46" />
                <text x="130" y="20" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                  SOLAR COLD STORAGE PCB CONTROLLER
                </text>

                {/* Relays & Terminals visual */}
                <g transform="translate(20, 45)">
                  <rect x="0" y="0" width="220" height="40" rx="4" fill="#0f172a" stroke="#f59e0b" />
                  <text x="110" y="25" fill="#fcd34d" fontSize="10" textAnchor="middle">
                    12V High Current & Relay Section
                  </text>
                </g>

                {/* 3.5mm Isolation Slot Line */}
                <line x1="10" y1="105" x2="250" y2="105" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,3" />
                <text x="130" y="120" fill="#fbbf24" fontSize="8" textAnchor="middle">
                  3.5mm Galvanic Isolation Gap
                </text>

                {/* ESP32 & OLED */}
                <g transform="translate(20, 135)">
                  <rect x="0" y="0" width="105" height="95" rx="4" fill="#09090b" stroke="#38bdf8" />
                  <text x="52" y="35" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    ESP32
                  </text>
                  <text x="52" y="55" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    Dual Core
                  </text>
                  <text x="52" y="75" fill="#38bdf8" fontSize="8" textAnchor="middle">
                    PID Logic
                  </text>

                  <rect x="115" y="0" width="105" height="95" rx="4" fill="#020617" stroke="#38bdf8" />
                  <text x="167" y="30" fill="#facc15" fontSize="8" textAnchor="middle">
                    OLED DISPLAY
                  </text>
                  <text x="167" y="55" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
                    {currentTemp.toFixed(1)}°C
                  </text>
                  <text x="167" y="75" fill="#4ade80" fontSize="10" textAnchor="middle">
                    {currentHumidity}% RH
                  </text>
                </g>
              </g>

              {/* WIRING HARNESS VECTORS with AWG gauges matching Image 1 */}
              {/* Solar Array to Controller (12 AWG) */}
              <path
                d="M 230 40 L 450 40 L 450 215 L 480 215"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="4,2"
              />
              <rect x="360" y="28" width="60" height="18" rx="3" fill="#0284c7" />
              <text x="390" y="40" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                12 AWG
              </text>

              {/* Battery to Controller (12 AWG) */}
              <path
                d="M 550 140 L 550 190"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
              />
              <rect x="560" y="150" width="60" height="18" rx="3" fill="#dc2626" />
              <text x="590" y="162" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                12 AWG
              </text>

              {/* Controller to AC Chiller Unit (12 AWG) */}
              <path
                d="M 470 230 L 440 230 L 440 160 L 240 160"
                fill="none"
                stroke={acActive ? '#38bdf8' : '#64748b'}
                strokeWidth="2.5"
              />
              <rect x="350" y="148" width="60" height="18" rx="3" fill="#1e293b" stroke="#38bdf8" />
              <text x="380" y="160" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">
                12 AWG (AC)
              </text>

              {/* Controller to Fan (18 AWG) */}
              <path
                d="M 470 245 L 430 245 L 430 180 L 350 180 L 350 160"
                fill="none"
                stroke={fanActive ? '#4ade80' : '#64748b'}
                strokeWidth="2"
              />
              <rect x="370" y="172" width="60" height="18" rx="3" fill="#1e293b" stroke="#4ade80" />
              <text x="400" y="184" fill="#4ade80" fontSize="8" fontWeight="bold" textAnchor="middle">
                18 AWG (Fan)
              </text>

              {/* Controller to Fogger Mist Pump (18 AWG) */}
              <path
                d="M 470 260 L 420 260 L 420 320 L 190 320"
                fill="none"
                stroke={foggerActive ? '#c084fc' : '#64748b'}
                strokeWidth="2"
              />
              <rect x="330" y="310" width="70" height="18" rx="3" fill="#1e293b" stroke="#c084fc" />
              <text x="365" y="322" fill="#c084fc" fontSize="8" fontWeight="bold" textAnchor="middle">
                18 AWG (Fogger)
              </text>

              {/* DHT22 Sensor to Logic Header (22 AWG Shielded) */}
              <path
                d="M 205 220 L 430 220 L 430 360 L 490 360"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              <rect x="250" y="210" width="85" height="18" rx="3" fill="#1e293b" stroke="#f59e0b" />
              <text x="292" y="222" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
                22 AWG (DHT22)
              </text>
            </svg>
          </div>
        </div>

        {/* Right Column: Horticultural Specification & Farmer Economic Impact (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Selected Crop Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  Target Horticultural Produce
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {selectedCrop.name}
                </h4>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2 py-1 rounded border border-emerald-800">
                {selectedCrop.localRegion}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">Optimal Temp:</span>
                <div className="text-base font-bold text-sky-400 mt-0.5">
                  {selectedCrop.targetTemp}°C
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">Optimal Humidity:</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {selectedCrop.targetHumidity}% RH
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">Storage Duration:</span>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  Up to {selectedCrop.maxStorageDays} Days
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px]">Current Status:</span>
                <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Condition Met</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 flex flex-col gap-1">
              <span className="font-bold text-emerald-400 font-mono text-[11px]">
                💰 Economic Protection for Farmer:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {selectedCrop.economicValue}. Prevents distress distress selling during peak harvest when prices crash by 60%.
              </p>
            </div>
          </div>

          {/* Wiring Specifications Table matching Image 1 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 font-mono text-xs">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Wiring Gauge & Current Safety Matrix</span>
            </h5>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-sky-400">12 AWG Heavy Copper</span>
                  <p className="text-[10px] text-slate-400">Solar PV, Battery Bank & AC Compressor</p>
                </div>
                <span className="bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
                  Up to 20A
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-emerald-400">18 AWG Stranded Wire</span>
                  <p className="text-[10px] text-slate-400">Exhaust Fan & Ultrasonic Fogger Mist Pump</p>
                </div>
                <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Up to 5A
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-amber-400">22 AWG Shielded Cable</span>
                  <p className="text-[10px] text-slate-400">DHT22 Temp/Humidity & Water Float Switch</p>
                </div>
                <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                  Digital I2C / 1-Wire
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
