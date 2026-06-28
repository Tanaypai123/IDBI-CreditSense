import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Settings, ShieldCheck, Database, Sliders, ToggleLeft, ToggleRight, Radio, FileText, Cpu, Lock } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

export default function SettingsView() {
  const { showToast } = useAuth();
  const [threshold, setThreshold] = useState(60);
  const [modelType, setModelType] = useState("Ensemble");
  
  const [shapEnabled, setShapEnabled] = useState(true);
  const [pdfEnabled, setPdfEnabled] = useState(true);
  const [secureMode, setSecureMode] = useState(true);

  const handleSliderChange = (val) => {
    setThreshold(val);
    showToast(`Risk underwriting threshold set to ${val}/100.`, "success");
  };

  const handleModelChange = (val) => {
    setModelType(val);
    showToast(`Active ensemble framework shifted to ${val}.`, "success");
  };

  const handleToggle = (type) => {
    if (type === 'shap') {
      setShapEnabled(!shapEnabled);
      showToast(`Real-time SHAP estimations ${!shapEnabled ? 'enabled' : 'disabled'}.`, "success");
    }
    if (type === 'pdf') {
      setPdfEnabled(!pdfEnabled);
      showToast(`PDF report exporter ${!pdfEnabled ? 'enabled' : 'disabled'}.`, "success");
    }
    if (type === 'secure') {
      setSecureMode(!secureMode);
      showToast(`Secure model serialization ${!secureMode ? 'enabled' : 'disabled'}.`, "success");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8"
    >
      <PageHeader 
        title="IDBI CreditSense System Settings" 
        subtitle="Adjust underwriting thresholds, model registry parameters, and compliance options."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card title="🔧 Underwriting Configuration">
            <div className="space-y-6 font-inter text-xs text-slate-655 font-semibold text-slate-700">
              
              {/* Slider option */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1.5 font-bold text-slate-700">
                  <span className="flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Minimum Health Underwriting Threshold</span>
                  </span>
                  <span className="text-blue-600 font-bold">{threshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="80"
                  step="5"
                  value={threshold}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
                  MSMEs scoring below this threshold will be automatically flagged for manual credit reviews.
                </p>
              </div>

              {/* Selector Option */}
              <div className="space-y-2 pt-2 border-t border-slate-50">
                <label className="font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span>Primary Predictor Framework</span>
                </label>
                <select
                  value={modelType}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs shadow-sm bg-slate-50"
                >
                  <option value="Ensemble">LightGBM & XGBoost Ensemble V2.0.0 (FastAPI Server)</option>
                  <option value="SingleLGBM">Single LightGBM Model</option>
                  <option value="CatBoost">CatBoost Classifier V1.0.0</option>
                </select>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-4 pt-4 border-t border-slate-50 font-semibold text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>Compute Real-Time SHAP explanations</span>
                  </span>
                  <button onClick={() => handleToggle('shap')} className="text-slate-400 focus:outline-none">
                    {shapEnabled ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-350" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Compile downloadable Report PDFs</span>
                  </span>
                  <button onClick={() => handleToggle('pdf')} className="text-slate-400 focus:outline-none">
                    {pdfEnabled ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-350" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Security column */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card title="🛡️ Model Registry Security">
            <div className="space-y-5 font-inter text-xs text-slate-600">
              <div className="flex items-start space-x-3 pb-3 border-b border-slate-50">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 font-poppins">Encrypted Serialization</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Model signatures and pickle states are loaded under AES key configurations.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-700">Enforce Encrypted States</span>
                <button onClick={() => handleToggle('secure')} className="text-slate-400 focus:outline-none">
                  {secureMode ? (
                    <ToggleRight className="w-8 h-8 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-350" />
                  )}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
