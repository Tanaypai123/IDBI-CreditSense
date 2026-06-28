import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, AlertTriangle, Layers, FileSpreadsheet, CheckCircle2, RefreshCw, Upload, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import ScoreGauge from '../components/ScoreGauge';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import TableComponent from '../components/TableComponent';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function Batch() {
  const { showToast } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedBizId, setSelectedBizId] = useState("");
  const [selectedBizDetail, setSelectedBizDetail] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError("");
      setUploadProgress(100);
      showToast(`${selectedFile.name} loaded. Ready to analyze.`, "success");
    } else {
      setError("Invalid file type. Please select a .csv file.");
      showToast("Only CSV files are supported.", "error");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError("");
      setUploadProgress(100);
      showToast(`${droppedFile.name} uploaded successfully via Drag & Drop.`, "success");
    } else {
      setError("Invalid file type. Please drop a .csv file.");
      showToast("Only CSV files are supported.", "error");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select or drop a CSV file first.");
      showToast("No CSV file selected.", "error");
      return;
    }
    setLoading(true);
    setError("");
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const data = await api.predictBatch(file);
      clearInterval(interval);
      setUploadProgress(100);
      setResults(data.results);
      if (data.results.length > 0) {
        setSelectedBizId(data.results[0].Business_ID);
        setSelectedBizDetail(data.results[0]);
      }
      showToast(`Batch underwriting complete: ${data.results.length} accounts processed.`, "success");
    } catch (e) {
      clearInterval(interval);
      setError(e.message);
      showToast("Batch CSV evaluation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (bizId) => {
    const detail = results.find(item => item.Business_ID === bizId);
    setSelectedBizId(bizId);
    setSelectedBizDetail(detail);
  };

  const tableHeaders = ['Business ID', 'Health Score', 'Risk Category', 'Default Prob', 'Credit Limit', 'Action'];

  const renderRow = (row, idx) => (
    <tr 
      key={idx} 
      className={`hover:bg-slate-50/50 transition-colors cursor-pointer group text-xs font-inter ${
        selectedBizId === row.Business_ID ? 'bg-blue-50/30' : ''
      }`}
      onClick={() => handleInspect(row.Business_ID)}
    >
      <td className="py-3.5 pl-2 font-semibold text-slate-800 font-outfit">{row.Business_ID}</td>
      <td className="py-3.5 font-semibold text-slate-700">{row.score.toFixed(1)}</td>
      <td className="py-3.5">
        <StatusBadge status={row.risk_category} />
      </td>
      <td className="py-3.5 text-slate-500">{(row.default_probability * 100).toFixed(1)}%</td>
      <td className="py-3.5 font-semibold text-slate-800">{row.max_loan.toLocaleString()} INR</td>
      <td className="py-3.5 text-right pr-2 text-blue-600 font-bold font-outfit group-hover:translate-x-1 transition-transform flex items-center justify-end space-x-1">
        <Eye className="w-3.5 h-3.5" />
        <span>Inspect</span>
      </td>
    </tr>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-[1400px] mx-auto px-6 py-8"
    >
      <PageHeader 
        title="IDBI CreditSense Batch Processor" 
        subtitle="Perform high-volume automated underwriting audits via drag-and-drop customer registers."
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* DRAG AND DROP ZONE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 space-y-6"
        >
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-4 ${
              isDragOver ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 bg-white hover:border-blue-500'
            }`}
          >
            <input 
              type="file" 
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="p-4 bg-blue-50 rounded-full text-blue-600">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1 font-inter text-xs">
              <span className="font-bold text-slate-800 block">
                {file ? file.name : "Drag & Drop customer register CSV here"}
              </span>
              <span className="text-slate-400 block">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to browse local files"}
              </span>
            </div>

            {uploadProgress > 0 && (
              <div className="w-64 space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Upload Status</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full">
                  <div className="bg-blue-600 h-1 rounded-full transition-all duration-350" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {file && (
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-outfit tracking-wider uppercase px-6 py-3 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? 'Analyzing Register...' : 'Run Batch Assessment'}</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Template info card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium h-fit"
        >
          <h3 className="text-xs font-bold tracking-wider text-slate-455 uppercase border-b border-slate-100 pb-3 mb-4 font-outfit flex items-center space-x-1.5">
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Ledger Schema Template</span>
          </h3>
          <p className="text-[11px] text-slate-550 leading-relaxed font-inter mb-4">
            Download the official schema layout containing all 32 underwriting parameters. Files must strictly match headers to sync with LightGBM/XGBoost prediction engines.
          </p>
          <a
            href="/msme_batch_template.csv"
            download
            className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-655 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 py-3 rounded-lg border border-slate-200 transition-all font-outfit uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Template</span>
          </a>
        </motion.div>
      </div>

      {loading && <LoadingSkeleton rows={5} />}

      {/* BATCH ASSESSMENT RESULTS REGISTRY */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card title="Batch Underwriting Registry">
              <TableComponent 
                headers={tableHeaders}
                data={results}
                renderRow={renderRow}
              />
            </Card>
          </div>

          <div>
            {selectedBizDetail ? (
              <div className="space-y-6">
                <ScoreGauge score={selectedBizDetail.score} title={`Scorecard: ${selectedBizDetail.Business_ID}`} />
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium space-y-4 text-xs font-inter">
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 font-outfit">
                    🔍 Underwriting Score Details
                  </h3>
                  <div className="flex justify-between pb-2 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold">Risk Class</span>
                    <span><StatusBadge status={selectedBizDetail.risk_category} /></span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold">Credit Status</span>
                    <span><StatusBadge status={selectedBizDetail.eligible ? 'APPROVED' : 'LOCKED'} /></span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold">Credit Limit</span>
                    <span className="font-bold text-slate-800">{selectedBizDetail.max_loan.toLocaleString()} INR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Default Risk</span>
                    <span className="font-bold text-slate-800">{(selectedBizDetail.default_probability * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState message="Select an account to review detailed score card." />
            )}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && (
        <EmptyState message="No batch results processed. Drag and drop a customer register CSV to begin." icon={FileSpreadsheet} />
      )}
    </motion.div>
  );
}
