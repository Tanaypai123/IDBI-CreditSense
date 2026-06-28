import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';
import Card from '../components/Card';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGlobalAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/api/analytics/global");
      if (!response.ok) throw new Error("Failed to load global model analytics.");
      const res = await response.json();
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAnalytics();
  }, []);

  const getCellBg = (val) => {
    const absVal = Math.abs(val);
    if (val > 0) return `rgba(0, 97, 255, ${absVal * 0.85})`; // brand-blue with alpha
    if (val < 0) return `rgba(239, 68, 68, ${absVal * 0.85})`; // rose-red with alpha
    return 'rgba(255, 255, 255, 0)';
  };

  // List of features in the correlation grid
  const corrFeatures = [
    "Cashflow Stability Score",
    "Operating Profit Margin",
    "Revenue Growth Rate (MoM)",
    "GST Compliance Score",
    "Current Liquidity Ratio"
  ];

  // Helper to lookup correlation value in array
  const getCorrValue = (x, y) => {
    if (!data || !data.correlation_top20) return 0;
    const match = data.correlation_top20.find(
      item => item.x === x && item.y === y
    );
    return match ? match.val : (x === y ? 1.0 : 0.0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-outfit">
            Ensembles Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global feature importances, sector correlation matrices, and model telemetries.
          </p>
        </div>
        <button
          onClick={fetchGlobalAnalytics}
          disabled={loading}
          className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-600 font-semibold border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-outfit tracking-wide shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs font-medium font-inter space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span>Computing global model analytics...</span>
        </div>
      ) : data && (
        <div className="space-y-8">
          {/* Dual bar charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="📈 Global Feature Importance: Health Score Model">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.health_importance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                    <YAxis dataKey="display_name" type="category" stroke="#94A3B8" fontSize={8} width={130} />
                    <Tooltip />
                    <Bar dataKey="importance" fill="#0061FF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="📉 Global Feature Importance: Default Probability Model">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.default_importance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                    <YAxis dataKey="display_name" type="category" stroke="#94A3B8" fontSize={8} width={130} />
                    <Tooltip />
                    <Bar dataKey="importance" fill="#475569" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Pure HTML correlation matrix heatmap */}
          <Card title="🗺️ Core Metrics Correlation Heatmap">
            <div className="max-w-[700px] mx-auto overflow-x-auto p-4">
              <table className="w-full text-center border-collapse font-inter text-xs text-slate-700">
                <thead>
                  <tr>
                    <th className="p-2 w-32 border-b border-r border-slate-100"></th>
                    {corrFeatures.map((feat, idx) => (
                      <th key={idx} className="p-2 font-semibold font-outfit text-slate-500 border-b border-slate-100 text-[10px] uppercase tracking-wider w-24">
                        {feat.split(" ").slice(0, 2).join(" ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corrFeatures.map((rowFeat, rIdx) => (
                    <tr key={rIdx}>
                      <td className="p-2 text-left font-semibold text-slate-600 border-r border-slate-100">
                        {rowFeat}
                      </td>
                      {corrFeatures.map((colFeat, cIdx) => {
                        const val = getCorrValue(rowFeat, colFeat);
                        return (
                          <td 
                            key={cIdx} 
                            style={{ backgroundColor: getCellBg(val) }} 
                            className="p-3 border border-slate-100/60 font-semibold text-slate-800 transition-all duration-300"
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 flex justify-center space-x-6 text-[10px] font-bold font-outfit tracking-wider uppercase text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 bg-blue-500/80 rounded" />
                  <span>Positive Correlation</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 bg-rose-500/80 rounded" />
                  <span>Negative Correlation</span>
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
