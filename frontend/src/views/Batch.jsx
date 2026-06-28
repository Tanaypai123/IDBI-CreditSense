import React, { useState } from 'react';
import { Layers, Download, CheckCircle, AlertTriangle, Search, Activity } from 'lucide-react';
import Card from '../components/Card';
import Gauge from '../components/Gauge';

export default function Batch() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [selectedBizId, setSelectedBizId] = useState("");
  const [selectedBizDetail, setSelectedBizDetail] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/predict/batch", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error("Failed to process batch CSV. Check file format.");
      }
      const data = await response.json();
      setResults(data.results);
      if (data.results.length > 0) {
        setSelectedBizId(data.results[0].Business_ID);
        setSelectedBizDetail(data.results[0]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (bizId) => {
    const detail = results.find(item => item.Business_ID === bizId);
    setSelectedBizId(bizId);
    setSelectedBizDetail(detail);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-outfit">
          Batch CSV Processor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Perform high-volume automated underwriting audits.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload and Template Download Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200/60 rounded-xl p-6 shadow-premium">
          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 mb-5 font-outfit">
            📂 Upload Customer Register CSV
          </h3>
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-outfit tracking-wider uppercase px-5 py-2.5 rounded-lg shadow-sm"
            >
              {loading ? 'Processing...' : 'Upload & Underwrite'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-premium">
          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 mb-4 font-outfit">
            📄 Ledger Schema Template
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-inter mb-4">
            Download the official credit assessment CSV header layout containing all 32 parameters.
          </p>
          <a
            href="/msme_batch_template.csv"
            download
            className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 py-2.5 rounded-lg border border-slate-200 transition-all font-outfit"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </a>
        </div>
      </div>

      {/* RESULTS LIST TABLE */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary table */}
          <div className="lg:col-span-2">
            <Card title="Batch Underwriting Registry">
              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-2">Business ID</th>
                      <th className="pb-3">Health Score</th>
                      <th className="pb-3">Risk Category</th>
                      <th className="pb-3">Default Prob</th>
                      <th className="pb-3">Credit Limit</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-inter text-xs text-slate-600">
                    {results.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          selectedBizId === row.Business_ID ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={() => handleInspect(row.Business_ID)}
                      >
                        <td className="py-3.5 pl-2 font-semibold text-slate-800 font-outfit">
                          {row.Business_ID}
                        </td>
                        <td className="py-3.5 font-semibold text-slate-700">
                          {row.score.toFixed(1)}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-outfit ${
                            row.score >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            row.score >= 70 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            row.score >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {row.risk_category}
                          </span>
                        </td>
                        <td className="py-3.5">
                          {(row.default_probability * 100).toFixed(1)}%
                        </td>
                        <td className="py-3.5 font-semibold text-slate-800">
                          {row.max_loan.toLocaleString()} INR
                        </td>
                        <td className="py-3.5 text-right pr-2 text-blue-600 font-semibold font-outfit">
                          Inspect ➔
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Drill-down Card Inspector */}
          <div>
            {selectedBizDetail ? (
              <div className="space-y-6">
                <Gauge score={selectedBizDetail.score} title={`Scorecard: ${selectedBizDetail.Business_ID}`} />
                
                <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-premium space-y-4 text-xs font-inter">
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 font-outfit">
                    🔍 Underwriting Score Details
                  </h3>
                  <div className="flex justify-between pb-2 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold">Risk Class</span>
                    <span className="font-bold text-slate-800">{selectedBizDetail.risk_category}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold">Credit Status</span>
                    <span className={`font-bold ${selectedBizDetail.eligible ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {selectedBizDetail.eligible ? 'APPROVED' : 'LOCKED'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold">Credit limit</span>
                    <span className="font-bold text-slate-800">{selectedBizDetail.max_loan.toLocaleString()} INR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Default Risk</span>
                    <span className="font-bold text-slate-800">{(selectedBizDetail.default_probability * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-premium flex items-center justify-center h-48 text-slate-400 text-xs font-medium font-inter">
                Select a business ID to inspect.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
