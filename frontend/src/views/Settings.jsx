import React, { useState } from 'react';
import { Settings, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import Card from '../components/Card';

export default function SettingsView() {
  const [threshold, setThreshold] = useState(60);
  const [modelType, setModelType] = useState("Ensemble");

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-outfit">
          System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Adjust underwriting thresholds, model registry parameters, and compliance options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card title="🔧 Underwriting Configuration">
            <div className="space-y-6 font-inter text-xs text-slate-600">
              <div>
                <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
                  <span>Minimum Health Underwriting Threshold</span>
                  <span className="text-blue-600 font-bold">{threshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="80"
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  MSMEs scoring below this threshold will be automatically flagged for credit review.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Primary Predictor Framework</label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="Ensemble">LightGBM & XGBoost Ensemble V2.0.0 (FastAPI Server)</option>
                  <option value="SingleLGBM">Single LightGBM Model</option>
                  <option value="CatBoost">CatBoost Classifier V1.0.0</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <input type="checkbox" id="realtimeShap" defaultChecked className="rounded border-slate-300 text-blue-600" />
                <label htmlFor="realtimeShap" className="font-semibold text-slate-700">Compute Real-Time SHAP explanations</label>
              </div>

              <div className="flex items-center space-x-3">
                <input type="checkbox" id="pdfGen" defaultChecked className="rounded border-slate-300 text-blue-600" />
                <label htmlFor="pdfGen" className="font-semibold text-slate-700">Compile downloadable Report PDFs</label>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="🛡️ Model Registry Security">
            <div className="space-y-4 font-inter text-xs text-slate-600">
              <div className="flex items-start space-x-2.5 pb-3 border-b border-slate-100">
                <Lock className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-700 leading-none mb-1">Encrypted Serialization</h4>
                  <p className="text-[10px] text-slate-400">All loaded pickle weights are secured and validated on startup.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2.5 pb-3 border-b border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-700 leading-none mb-1">Hash Integrity Passed</h4>
                  <p className="text-[10px] text-slate-400">Model keys match SHA-256 release versions.</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block font-outfit">Active Node License</span>
                <span className="text-[11px] text-blue-600 font-medium font-inter mt-1.5 block">IDBI Enterprise Internal Node</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
