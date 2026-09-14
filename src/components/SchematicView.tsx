import React, { useState } from 'react';
import { Cpu, Zap, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface SchematicViewProps {
  onSelectComponentById?: (id: string) => void;
}

export const SchematicView: React.FC<SchematicViewProps> = ({ onSelectComponentById }) => {
  const [activeStage, setActiveStage] = useState<'all' | 'harvest' | 'logic' | 'switching' | 'sensors'>('all');

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-4 lg:p-6 overflow-hidden flex flex-col gap-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
              ELECTRICAL ARCHITECTURE
            </span>
            <span className="text-xs font-mono text-slate-400">IEC 60950 SAFETY COMPLIANT</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1">
            Complete Electrical Schematic & Circuit Diagram
          </h3>
          <p className="text-xs text-slate-400">
            Faithful engineering blueprint of the solar cold storage main controller board and rural farm harvesting stage
          </p>
        </div>

        {/* Stage Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[
            { id: 'all', label: 'All Stages' },
            { id: 'harvest', label: '1. Solar Harvesting' },
            { id: 'logic', label: '2. ESP32 & Regulators' },
            { id: 'switching', label: '3. Isolated Relays' },
            { id: 'sensors', label: '4. Sensor Loops' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id as any)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeStage === s.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Electrical Schematic Diagram matching Image 1 */}
      <div className="w-full bg-slate-950 rounded-xl border border-slate-800/80 p-4 overflow-x-auto shadow-inner">
        <svg
          viewBox="0 0 1100 680"
          className="w-full min-w-[900px] h-auto font-mono select-none"
        >
          {/* Background grid */}
          <defs>
            <pattern id="schematicGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>
          <rect width="1100" height="680" fill="url(#schematicGrid)" />

          {/* STAGE 1: Power Input & Harvesting Stage (Left Column) */}
          <g
            className={`transition-opacity duration-300 ${
              activeStage === 'all' || activeStage === 'harvest' ? 'opacity-100' : 'opacity-25'
            }`}
          >
            {/* Outer Stage Box */}
            <rect x="20" y="30" width="280" height="620" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <rect x="20" y="30" width="280" height="36" rx="12" fill="#1e293b" />
            <text x="35" y="54" fill="#38bdf8" fontSize="13" fontWeight="bold">
              Power Input & Harvesting Stage
            </text>

            {/* Solar Array Graphic */}
            <g transform="translate(60, 90)">
              <rect x="0" y="0" width="120" height="130" rx="6" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
              {/* Solar Cells Grid */}
              <line x1="30" y1="0" x2="30" y2="130" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="60" y1="0" x2="60" y2="130" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="90" y1="0" x2="90" y2="130" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="32" x2="120" y2="32" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="65" x2="120" y2="65" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="98" x2="120" y2="98" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
              <text x="60" y="70" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                Solar Array
              </text>
              <text x="60" y="88" fill="#93c5fd" fontSize="11" textAnchor="middle">
                400W - 600W
              </text>
            </g>

            {/* Inline Fuse */}
            <g transform="translate(140, 240)">
              <rect x="0" y="0" width="40" height="16" rx="3" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="-15" y1="8" x2="0" y2="8" stroke="#f59e0b" strokeWidth="2" />
              <line x1="40" y1="8" x2="55" y2="8" stroke="#f59e0b" strokeWidth="2" />
              <text x="20" y="12" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                15A Fuse
              </text>
            </g>

            {/* Reverse Blocking Diode */}
            <g transform="translate(195, 240)">
              <polygon points="10,0 24,8 10,16" fill="#10b981" />
              <line x1="24" y1="0" x2="24" y2="16" stroke="#10b981" strokeWidth="2.5" />
              <line x1="0" y1="8" x2="10" y2="8" stroke="#f59e0b" strokeWidth="2" />
              <line x1="24" y1="8" x2="35" y2="8" stroke="#f59e0b" strokeWidth="2" />
              <text x="17" y="-5" fill="#34d399" fontSize="10" textAnchor="middle">
                D1 (MBR)
              </text>
            </g>

            {/* PWM Charge Controller Box */}
            <g transform="translate(50, 310)">
              <rect x="0" y="0" width="150" height="90" rx="8" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="75" y="40" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                PWM Charge
              </text>
              <text x="75" y="60" fill="#a7f3d0" fontSize="12" textAnchor="middle">
                Controller
              </text>
              <circle cx="25" cy="80" r="4" fill="#facc15" />
              <circle cx="75" cy="80" r="4" fill="#38bdf8" />
              <circle cx="125" cy="80" r="4" fill="#34d399" />
            </g>

            {/* 12V Battery Bank */}
            <g transform="translate(55, 480)">
              <rect x="0" y="0" width="140" height="110" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              {/* Terminals */}
              <rect x="25" y="-10" width="20" height="10" fill="#ef4444" rx="2" />
              <text x="35" y="-2" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                +
              </text>
              <rect x="95" y="-10" width="20" height="10" fill="#0f172a" rx="2" stroke="#64748b" />
              <text x="105" y="-2" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                -
              </text>
              <text x="70" y="45" fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                12V Battery
              </text>
              <text x="70" y="65" fill="#f59e0b" fontSize="12" textAnchor="middle">
                150Ah Deep Cycle
              </text>
              <text x="70" y="85" fill="#94a3b8" fontSize="10" textAnchor="middle">
                LiFePO4 / Gel
              </text>
            </g>

            {/* Wiring from Battery to PCB Main Board */}
            <path d="M 80 470 L 80 440 L 260 440 L 260 210 L 330 210" fill="none" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow)" />
            <text x="210" y="380" fill="#f87171" fontSize="11" fontWeight="bold">
              +12V Supply
            </text>
          </g>

          {/* STAGE 2: Main Control Board (Center & Right Modules) */}
          <g
            className={`transition-opacity duration-300 ${
              activeStage === 'all' || activeStage === 'logic' || activeStage === 'switching'
                ? 'opacity-100'
                : 'opacity-25'
            }`}
          >
            {/* Main PCB Outer Frame */}
            <rect x="330" y="30" width="740" height="620" rx="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <rect x="330" y="30" width="740" height="38" rx="14" fill="#065f46" />
            <text x="350" y="55" fill="#34d399" fontSize="14" fontWeight="bold">
              Main Control Board (PCB) - Galvanic Isolation Architecture
            </text>

            {/* 3.5mm Physical Isolation Barrier Highlight */}
            <rect x="335" y="275" width="730" height="24" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6,4" />
            <text x="700" y="291" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">
              ⚡ PHYSICAL ISOLATION GAP (3.5mm MINIMUM) - CREEPAGE & CLEARANCE ⚡
            </text>

            {/* Power Regulators Section (Top Left of PCB) */}
            <g transform="translate(360, 90)">
              <rect x="0" y="0" width="220" height="150" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="15" y="25" fill="#38bdf8" fontSize="12" fontWeight="bold">
                Power Regulation Rail
              </text>

              {/* LM2596 Block */}
              <rect x="15" y="45" width="85" height="40" rx="4" fill="#1e293b" stroke="#60a5fa" />
              <text x="57" y="65" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                LM2596
              </text>
              <text x="57" y="78" fill="#93c5fd" fontSize="9" textAnchor="middle">
                12V &rarr; 5V 3A
              </text>

              {/* AMS1117-3.3V Block */}
              <rect x="120" y="45" width="85" height="40" rx="4" fill="#1e293b" stroke="#34d399" />
              <text x="162" y="65" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                AMS1117
              </text>
              <text x="162" y="78" fill="#a7f3d0" fontSize="9" textAnchor="middle">
                5V &rarr; 3.3V
              </text>

              {/* Voltage Sensing Divider (30k / 7.5k to GPIO34) */}
              <g transform="translate(15, 100)">
                <text x="0" y="15" fill="#e2e8f0" fontSize="10" fontWeight="bold">
                  Battery Voltage Sense (GPIO34):
                </text>
                <rect x="0" y="22" width="50" height="18" fill="#1e293b" stroke="#94a3b8" />
                <text x="25" y="34" fill="#e2e8f0" fontSize="9" textAnchor="middle">
                  R1: 30kΩ
                </text>
                <text x="55" y="34" fill="#94a3b8" fontSize="9">
                  —
                </text>
                <rect x="65" y="22" width="50" height="18" fill="#1e293b" stroke="#94a3b8" />
                <text x="90" y="34" fill="#e2e8f0" fontSize="9" textAnchor="middle">
                  R2: 7.5kΩ
                </text>
                <line x1="120" y1="31" x2="160" y2="31" stroke="#38bdf8" strokeWidth="2" />
                <text x="165" y="34" fill="#38bdf8" fontSize="10" fontWeight="bold">
                  &rarr; ADC
                </text>
              </g>
            </g>

            {/* Isolated Switching Stage (Relays & Optocouplers - Top Right of PCB) */}
            <g transform="translate(600, 90)">
              <rect x="0" y="0" width="450" height="170" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="15" y="25" fill="#fbbf24" fontSize="12" fontWeight="bold">
                Isolated Switching Stage (High Voltage / Current Zone)
              </text>

              {/* 4 Relay Channels */}
              {[
                { name: 'RL1 SRD', label: 'AC Unit / Inverter', terminal: 'TB3' },
                { name: 'RL2 SRD', label: 'Exhaust Fan', terminal: 'TB4' },
                { name: 'RL3 SRD', label: 'Fogger Mist Pump', terminal: 'TB5' },
                { name: 'RL4 SRD', label: 'Aux Defrost', terminal: 'TB6' }
              ].map((r, idx) => {
                const ox = 15 + idx * 105;
                return (
                  <g key={idx} transform={`translate(${ox}, 40)`}>
                    {/* PC817 Optocoupler */}
                    <rect x="5" y="0" width="30" height="24" rx="3" fill="#1e293b" stroke="#38bdf8" />
                    <text x="20" y="15" fill="#38bdf8" fontSize="8" textAnchor="middle">
                      PC817
                    </text>

                    {/* S8050 NPN */}
                    <circle cx="50" cy="12" r="8" fill="#1e293b" stroke="#94a3b8" />
                    <text x="50" y="15" fill="#ffffff" fontSize="8" textAnchor="middle">
                      Q{idx + 1}
                    </text>

                    {/* Cube Relay */}
                    <rect x="0" y="32" width="95" height="55" rx="4" fill="#111827" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="47" y="52" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {r.name}
                    </text>
                    <text x="47" y="68" fill="#93c5fd" fontSize="9" textAnchor="middle">
                      {r.label}
                    </text>

                    {/* Terminal Output */}
                    <rect x="15" y="94" width="65" height="22" rx="3" fill="#1d4ed8" stroke="#60a5fa" />
                    <text x="47" y="108" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {r.terminal} Out
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Bottom Logic Section: ESP32 DevKit Central Brain */}
            <g transform="translate(560, 320)">
              <rect x="0" y="0" width="260" height="290" rx="10" fill="#09090b" stroke="#38bdf8" strokeWidth="2" />
              {/* RF Shield Can */}
              <rect x="35" y="40" width="190" height="110" rx="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="130" y="80" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle">
                U1: ESP32 DevKit
              </text>
              <text x="130" y="102" fill="#38bdf8" fontSize="12" textAnchor="middle">
                Tensilica Dual-Core LX6
              </text>
              <text x="130" y="122" fill="#94a3b8" fontSize="10" textAnchor="middle">
                240MHz • Wi-Fi / BLE Telemetry
              </text>

              {/* GPIO Map labels */}
              <g transform="translate(15, 170)">
                <text x="0" y="15" fill="#34d399" fontSize="10">GPIO25 &rarr; RL1 (Inverter Chiller)</text>
                <text x="0" y="32" fill="#34d399" fontSize="10">GPIO26 &rarr; RL2 (Exhaust Fan)</text>
                <text x="0" y="49" fill="#34d399" fontSize="10">GPIO27 &rarr; RL3 (Mist Pump)</text>
                <text x="0" y="66" fill="#34d399" fontSize="10">GPIO32 &rarr; RL4 (Aux Heater)</text>
                <text x="0" y="83" fill="#60a5fa" fontSize="10">GPIO21 / 22 &rarr; I2C OLED (SDA/SCL)</text>
                <text x="0" y="100" fill="#fbbf24" fontSize="10">GPIO04 &rarr; DHT22 | GPIO05 &rarr; Float SW</text>
              </g>
            </g>

            {/* OLED 0.96" Display Module (Bottom Left) */}
            <g transform="translate(360, 320)">
              <rect x="0" y="0" width="180" height="140" rx="8" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
              <text x="15" y="25" fill="#ffffff" fontSize="11" fontWeight="bold">
                DISP1: 0.96" I2C OLED
              </text>
              <rect x="15" y="35" width="150" height="85" rx="4" fill="#020617" stroke="#38bdf8" />
              <text x="25" y="60" fill="#facc15" fontSize="10">NE-AGRI COLD CHILL</text>
              <text x="25" y="80" fill="#38bdf8" fontSize="14" fontWeight="bold">4.2°C  89%</text>
              <text x="25" y="100" fill="#4ade80" fontSize="9">[AC:ON] [FAN:ON] [MIST:ON]</text>
            </g>

            {/* Sensor Interface Module (Bottom Left Below OLED) */}
            <g transform="translate(360, 480)">
              <rect x="0" y="0" width="180" height="130" rx="8" fill="#0f172a" stroke="#34d399" strokeWidth="1.5" />
              <text x="15" y="25" fill="#34d399" fontSize="11" fontWeight="bold">
                Sensor Header Interface
              </text>

              <rect x="15" y="38" width="150" height="34" rx="4" fill="#1e293b" stroke="#64748b" />
              <text x="25" y="54" fill="#ffffff" fontSize="10" fontWeight="bold">
                DHT22 Digital Sensor
              </text>
              <text x="25" y="66" fill="#94a3b8" fontSize="8">
                -40°C..+80°C | 0..100% RH
              </text>

              <rect x="15" y="82" width="150" height="34" rx="4" fill="#1e293b" stroke="#64748b" />
              <text x="25" y="98" fill="#ffffff" fontSize="10" fontWeight="bold">
                Water Float Reed Switch
              </text>
              <text x="25" y="110" fill="#94a3b8" fontSize="8">
                Fogger Reservoir Interlock
              </text>
            </g>

            {/* Loads & External Wiring Outputs (Far Right Column) */}
            <g transform="translate(840, 320)">
              <rect x="0" y="0" width="210" height="290" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
              <text x="15" y="25" fill="#f8fafc" fontSize="12" fontWeight="bold">
                Cold Storage Loads
              </text>

              {/* Chiller AC Unit */}
              <g transform="translate(15, 40)">
                <rect x="0" y="0" width="180" height="48" rx="6" fill="#1e293b" stroke="#38bdf8" />
                <text x="15" y="22" fill="#ffffff" fontSize="11" fontWeight="bold">
                  ❄️ AC Chiller Unit
                </text>
                <text x="15" y="38" fill="#93c5fd" fontSize="9">
                  12AWG Wire • 4°C Chilling Loop
                </text>
              </g>

              {/* Exhaust Fan */}
              <g transform="translate(15, 100)">
                <rect x="0" y="0" width="180" height="48" rx="6" fill="#1e293b" stroke="#34d399" />
                <text x="15" y="22" fill="#ffffff" fontSize="11" fontWeight="bold">
                  💨 Air Circulation Fan
                </text>
                <text x="15" y="38" fill="#a7f3d0" fontSize="9">
                  18AWG Wire • Anti-Mold Vent
                </text>
              </g>

              {/* Fogger Mist Pump */}
              <g transform="translate(15, 160)">
                <rect x="0" y="0" width="180" height="48" rx="6" fill="#1e293b" stroke="#a855f7" />
                <text x="15" y="22" fill="#ffffff" fontSize="11" fontWeight="bold">
                  💦 Ultrasonic Fogger
                </text>
                <text x="15" y="38" fill="#d8b4fe" fontSize="9">
                  18AWG Wire • 90% RH Humidity
                </text>
              </g>

              {/* Auxiliary Defrost */}
              <g transform="translate(15, 220)">
                <rect x="0" y="0" width="180" height="48" rx="6" fill="#1e293b" stroke="#f59e0b" />
                <text x="15" y="22" fill="#ffffff" fontSize="11" fontWeight="bold">
                  🔥 Defrost Heater / Alarm
                </text>
                <text x="15" y="38" fill="#fcd34d" fontSize="9">
                  Auxiliary Cycle Control
                </text>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Engineering Design Highlights for NE Farmers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Zap className="w-4 h-4" />
            <span>Opto-Isolated Switching</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            PC817 optocouplers completely separate the inductive kicks of the compressor and fans from the ESP32 microcontroller logic.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>3.5mm Safety Air Barrier</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            A physical CNC slot cuts through the FR4 fiberglass to prevent high-voltage lightning tracking across the PCB in humid mountain weather.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Humidity Retention Interlock</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Relay 3 powers an ultrasonic fogger to maintain 88-95% RH for ginger and orange crops, interlocked with a water float switch to prevent dry burn.
          </p>
        </div>
      </div>
    </div>
  );
};
