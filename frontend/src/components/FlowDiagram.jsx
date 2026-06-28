import React from 'react';
import { 
  Building2, 
  Landmark, 
  FileText, 
  Cpu, 
  Gauge, 
  Coins 
} from 'lucide-react';

export default function FlowDiagram() {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium relative overflow-hidden select-none">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(#00796B 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* SVG Canvas for Connectors */}
      <svg 
        viewBox="0 0 800 580" 
        className="w-full h-auto relative z-10"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Arrowhead Markers */}
          <marker 
            id="arrow" 
            viewBox="0 0 10 10" 
            refX="6" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6" 
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00796B" />
          </marker>
          
          <marker 
            id="arrow-orange" 
            viewBox="0 0 10 10" 
            refX="6" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6" 
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F26C21" />
          </marker>
        </defs>

        {/* 1. TOP ROW CONNECTORS (Dashed Green Lines) */}
        {/* Drops from Row 1 nodes down to join H-line, then drops into Row 2 nodes */}
        <path 
          d="M 110 80 V 115 H 690 M 400 80 V 115 M 200 115 V 150 M 600 115 V 150" 
          stroke="#00796B" 
          strokeWidth="2.5" 
          strokeDasharray="5 5" 
          strokeLinecap="round"
        />

        {/* 2. SECOND ROW CONNECTORS (Solid Curved Green Lines merging into Engine) */}
        <path 
          d="M 200 210 C 200 250, 400 250, 400 280" 
          stroke="#00796B" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <path 
          d="M 600 210 C 600 250, 400 250, 400 280" 
          stroke="#00796B" 
          strokeWidth="3" 
          strokeLinecap="round"
        />

        {/* 3. ENGINE TO CREDIT SCORE (Solid Green Arrow) */}
        <path 
          d="M 400 360 V 408" 
          stroke="#00796B" 
          strokeWidth="3" 
          markerEnd="url(#arrow)"
          strokeLinecap="round"
        />

        {/* 4. CREDIT SCORE TO RECOMMENDATION (Solid Orange Arrow) */}
        <path 
          d="M 400 470 V 498" 
          stroke="#F26C21" 
          strokeWidth="3" 
          markerEnd="url(#arrow-orange)"
          strokeLinecap="round"
        />

        {/* ==================== HTML NODES USING FOREIGNOBJECT ==================== */}

        {/* ROW 1: MSME Business */}
        <foreignObject x="10" y="20" width="200" height="60">
          <div className="w-full h-full bg-white border border-slate-200 rounded-xl px-4 flex items-center space-x-3 shadow-sm hover:border-[#00796B] transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#00796B]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-poppins font-bold text-xs text-slate-800 tracking-tight leading-none">MSME Business</span>
          </div>
        </foreignObject>

        {/* ROW 1: GST Logs */}
        <foreignObject x="300" y="20" width="200" height="60">
          <div className="w-full h-full bg-white border border-slate-200 rounded-xl px-4 flex items-center space-x-3 shadow-sm hover:border-[#00796B] transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#00796B] font-poppins font-black text-xs">
              GST
            </div>
            <span className="font-poppins font-bold text-xs text-slate-800 tracking-tight leading-none">GST Logs</span>
          </div>
        </foreignObject>

        {/* ROW 1: Bank Statements */}
        <foreignObject x="590" y="20" width="200" height="60">
          <div className="w-full h-full bg-white border border-slate-200 rounded-xl px-4 flex items-center space-x-3 shadow-sm hover:border-[#00796B] transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#00796B]">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="font-poppins font-bold text-xs text-slate-800 tracking-tight leading-none">Bank Statements</span>
          </div>
        </foreignObject>

        {/* ROW 2: UPI Sync */}
        <foreignObject x="100" y="150" width="200" height="60">
          <div className="w-full h-full bg-white border border-slate-200 rounded-xl px-4 flex items-center justify-between shadow-sm hover:border-[#00796B] transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                <span className="font-poppins font-black italic text-xs text-[#F26C21] tracking-tighter">UPI</span>
              </div>
              <span className="font-poppins font-bold text-xs text-slate-800 tracking-tight leading-none">UPI Sync</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </foreignObject>

        {/* ROW 2: Financial Ledgers */}
        <foreignObject x="500" y="150" width="200" height="60">
          <div className="w-full h-full bg-white border border-slate-200 rounded-xl px-4 flex items-center space-x-3 shadow-sm hover:border-[#00796B] transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#00796B]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-poppins font-bold text-xs text-slate-800 tracking-tight leading-none">Financial Ledgers</span>
          </div>
        </foreignObject>

        {/* ROW 3: IDBI AI RISK ENGINE */}
        <foreignObject x="220" y="280" width="360" height="80">
          <div className="w-full h-full bg-[#00796B] rounded-2xl px-6 flex items-center justify-between shadow-md border border-[#00695C] relative overflow-hidden">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
                  <path d="M46.5 45C46.5 43.07 48.07 41.5 50 41.5C51.93 41.5 53.5 43.07 53.5 45V73.5C53.5 75.43 51.93 77 50 77C48.07 77 46.5 75.43 46.5 73.5V45Z" fill="#F26C21" />
                  <circle cx="50" cy="31" r="6" fill="#F26C21" />
                  <path d="M33 46C33 36 40 33 44 33.5C38 39 38 56 46.5 72C38.5 70 33 60 33 46Z" fill="#F26C21" />
                  <path d="M26 49C26 35 36.5 30 41 30.5C34 37 34 59.5 44 76C33 73.5 26 62.5 26 49Z" fill="#F26C21" />
                  <path d="M67 46C67 36 60 33 56 33.5C62 39 62 56 53.5 72C61.5 70 67 60 67 46Z" fill="#F26C21" />
                  <path d="M74 49C74 35 63.5 30 59 30.5C66 37 66 59.5 56 76C67 73.5 74 62.5 74 49Z" fill="#F26C21" />
                </svg>
              </div>
              <div className="flex flex-col items-start justify-center">
                <span className="font-poppins font-black text-sm text-white tracking-wider uppercase leading-none">IDBI AI RISK ENGINE</span>
                <span className="font-poppins text-[10px] text-[#E0F2F1] mt-1.5 font-semibold">LightGBM • XGBoost Ensembles</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-lg bg-[#00695C] border border-[#005B4F]/30 flex items-center justify-center text-emerald-300">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </foreignObject>

        {/* ROW 4: Credit Score */}
        <foreignObject x="260" y="410" width="280" height="60">
          <div className="w-full h-full bg-white border border-[#00796B]/30 rounded-xl px-5 flex items-center justify-between shadow-sm hover:border-[#00796B] transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#00796B]">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="font-poppins font-bold text-xs text-slate-800 tracking-tight leading-none">Credit Score</span>
            </div>
            <span className="font-poppins font-black text-[15px] text-[#00796B]">94.0 / 100</span>
          </div>
        </foreignObject>

        {/* ROW 5: Loan Recommendation */}
        <foreignObject x="260" y="500" width="280" height="60">
          <div className="w-full h-full bg-[#F0FDF4] border border-emerald-300 rounded-xl px-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Coins className="w-5 h-5" />
              </div>
              <span className="font-poppins font-black text-xs text-slate-800 tracking-tight leading-none">Loan Recommendation</span>
            </div>
            <span className="font-poppins font-extrabold text-[11px] text-emerald-700 uppercase tracking-wider">Approved Limit</span>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
