import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, TrendingUp, Users, ShieldAlert, CheckCircle, Percent, DollarSign, Activity, Filter, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import TableComponent from '../components/TableComponent';
import StatusBadge from '../components/StatusBadge';

const INDUSTRIES = ["All Industries", "Retail", "Restaurant", "Textile", "Manufacturing", "IT Sector"];
const STATES = ["All States", "MH", "KA", "TN", "GJ", "DL"];
const DATE_RANGES = ["Last 30 Days", "Last 90 Days", "Last 12 Months", "Year to Date"];

export default function Analytics() {
  const { showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateFilter, setDateFilter] = useState("Last 90 Days");
  const [industryFilter, setIndustryFilter] = useState("All Industries");
  const [stateFilter, setStateFilter] = useState("All States");

  const fetchGlobalAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getGlobalAnalytics();
      setData(res);
      showToast("IDBI CreditSense global analytics synchronized.", "success");
    } catch (e) {
      setError(e.message);
      showToast("Failed to fetch model analytics.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAnalytics();
  }, []);

  const handleFilterChange = (type, val) => {
    if (type === 'date') setDateFilter(val);
    if (type === 'industry') setIndustryFilter(val);
    if (type === 'state') setStateFilter(val);
    showToast(`Portfolio queries filtered by ${val}.`, "success");
  };

  const healthDistribution = [
    { range: '0-20', count: 120 },
    { range: '20-40', count: 480 },
    { range: '40-60', count: 3200 },
    { range: '60-80', count: 12800 },
    { range: '80-100', count: 8400 }
  ];

  const riskDistribution = [
    { name: 'Excellent', value: 8400, color: '#16A34A' },
    { name: 'Low Risk', value: 9200, color: '#2563EB' },
    { name: 'Medium Risk', value: 5260, color: '#F59E0B' },
    { name: 'High Risk', value: 1680, color: '#EA580C' },
    { name: 'Critical Risk', value: 460, color: '#DC2626' }
  ];

  const industryDistribution = [
    { name: 'Retail', count: 6200 },
    { name: 'Manufacturing', count: 4800 },
    { name: 'Restaurant', count: 3100 },
    { name: 'Textile', count: 2900 },
    { name: 'IT Sector', count: 2500 }
  ];

  const stateDistribution = [
    { state: 'MH', count: 7200 },
    { state: 'KA', count: 4500 },
    { state: 'TN', count: 4100 },
    { state: 'GJ', count: 3800 },
    { state: 'DL', count: 2400 }
  ];

  const monthlyTrends = [
    { month: 'Jan', health: 66.8, approval: 83.5, default: 15.2 },
    { month: 'Feb', health: 67.1, approval: 83.9, default: 15.0 },
    { month: 'Mar', health: 67.4, approval: 84.2, default: 14.8 }
  ];

  const highestRiskAccounts = [
    { id: 'MSME-4309', industry: 'Textile', health: 48.0, default: 42.1, risk: 'High Risk' },
    { id: 'MSME-3208', industry: 'Agriculture', health: 32.5, default: 58.4, risk: 'Critical Risk' },
    { id: 'MSME-1102', industry: 'Construction', health: 38.2, default: 51.0, risk: 'Critical Risk' },
    { id: 'MSME-8902', industry: 'Textile', health: 49.1, default: 39.5, risk: 'High Risk' },
    { id: 'MSME-6612', industry: 'Restaurant', health: 46.5, default: 44.0, risk: 'High Risk' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } }
  };

  const headerAction = (
    <button
      onClick={fetchGlobalAnalytics}
      disabled={loading}
      className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-650 font-semibold border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-outfit tracking-wide shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      <span>Sync Data</span>
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-[1400px] mx-auto px-6 py-8"
    >
      <PageHeader 
        title="IDBI CreditSense Portfolio Analytics" 
        subtitle="Operational telemetry and aggregate risk exposures across 25,000 simulated accounts."
        action={headerAction}
      />

      {/* FILTER PANEL */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-premium flex flex-wrap items-center gap-6 text-xs font-inter text-slate-600"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-800 font-outfit uppercase tracking-wider text-[10px]">Filter Portfolio:</span>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={dateFilter}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-xs bg-slate-50"
          >
            {DATE_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select 
            value={industryFilter}
            onChange={(e) => handleFilterChange('industry', e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-xs bg-slate-50"
          >
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select 
            value={stateFilter}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-xs bg-slate-50"
          >
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </motion.div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading && <LoadingSkeleton rows={6} />}

      {/* TOP KPI ROW */}
      {!loading && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-6 gap-4"
        >
          <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium space-y-1 hover:shadow-premium-hover transition-shadow duration-300">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-outfit block">Total MSMEs</span>
            <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit block">25,000+</span>
            <span className="text-[9px] text-slate-400 font-inter">Simulated database</span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium space-y-1 hover:shadow-premium-hover transition-shadow duration-300">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-outfit block">Average Health</span>
            <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit block">67.4 / 100</span>
            <span className="text-[9px] text-slate-400 font-inter">Ensemble weighted</span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium space-y-1 hover:shadow-premium-hover transition-shadow duration-300">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-outfit block">Default Probability</span>
            <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit block">14.8%</span>
            <span className="text-[9px] text-slate-400 font-inter">Aggregate NPA risk</span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium space-y-1 hover:shadow-premium-hover transition-shadow duration-300">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-outfit block">Approval Rate</span>
            <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit block">84.2%</span>
            <span className="text-[9px] text-slate-400 font-inter">Priority lending tier</span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium space-y-1 hover:shadow-premium-hover transition-shadow duration-300">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-outfit block">High Risk MSMEs</span>
            <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit block">2,140</span>
            <span className="text-[9px] text-rose-500 font-bold font-inter">SMA-1 & SMA-2 limits</span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium space-y-1 hover:shadow-premium-hover transition-shadow duration-300">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-outfit block">Credit Exposure</span>
            <span className="text-xl font-bold tracking-tight text-slate-850 font-outfit block truncate">78.5B INR</span>
            <span className="text-[9px] text-slate-400 font-inter">Total pre-approved</span>
          </motion.div>
        </motion.div>
      )}

      {/* PORTFOLIO OVERVIEW */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ChartCard title="📊 Financial Health Score Distribution" height="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="range" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🎯 Portfolio Credit Risk Rating Distribution" height="h-56">
              <div className="flex h-full items-center justify-between">
                <div className="flex-1 h-full min-w-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 text-[10px] font-inter text-slate-505 font-semibold px-4">
                  {riskDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}: {item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          <div className="space-y-8">
            <ChartCard title="🏢 Industry-wise Portfolio Distribution" height="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={industryDistribution} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#475569" radius={[0, 4, 4, 0]} isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🗺️ State-wise Portfolio Distribution" height="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="state" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* RISK INSIGHTS */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card title="⚠️ Highest-Risk Portfolio Accounts">
              <TableComponent 
                headers={['Account ID', 'Sector', 'Health Score', 'Default Prob', 'Risk Badge']}
                data={highestRiskAccounts}
                renderRow={(row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-800 font-outfit">{row.id}</td>
                    <td className="py-3 text-slate-500 font-medium">{row.industry}</td>
                    <td className="py-3 font-semibold text-slate-850">{row.health.toFixed(1)}</td>
                    <td className="py-3 font-semibold text-rose-600">{row.default}%</td>
                    <td className="py-3 pr-2 text-right">
                      <StatusBadge status={row.risk} />
                    </td>
                  </tr>
                )}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="📊 Sector & Regional Risk Insights">
              <div className="space-y-4 font-inter text-xs text-slate-650">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit block mb-2">Industries with Highest Risk</span>
                  <div className="space-y-1.5 font-semibold text-slate-700">
                    <div className="flex justify-between"><span>1. Textile & Apparel</span><span className="text-rose-600 font-bold">25.4% Default Rate</span></div>
                    <div className="flex justify-between"><span>2. Construction</span><span className="text-orange-600 font-bold">22.8% Default Rate</span></div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit block mb-2">States with Highest Risk</span>
                  <div className="space-y-1.5 font-semibold text-slate-700">
                    <div className="flex justify-between"><span>1. Rajasthan</span><span className="text-rose-600 font-bold">18.5% Average</span></div>
                    <div className="flex justify-between"><span>2. Uttar Pradesh</span><span className="text-orange-600 font-bold">17.2% Average</span></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TRENDS */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ChartCard title="📈 Monthly Health Score Trend" height="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} />
                <YAxis stroke="#94A3B8" fontSize={9} domain={[65, 70]} />
                <Tooltip />
                <Line type="monotone" dataKey="health" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📉 Monthly Loan Approval Trend" height="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} />
                <YAxis stroke="#94A3B8" fontSize={9} domain={[80, 90]} />
                <Tooltip />
                <Line type="monotone" dataKey="approval" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="⚠️ Monthly Default Probability Trend" height="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} />
                <YAxis stroke="#94A3B8" fontSize={9} domain={[14, 16]} />
                <Tooltip />
                <Line type="monotone" dataKey="default" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* GLOBAL IMPORTANCE & EXPLAINABILITY */}
      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChartCard title="📈 Global Feature Importance (Model Significance)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.health_importance.slice(0, 6)} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                  <YAxis dataKey="display_name" type="category" stroke="#94A3B8" fontSize={8} width={130} />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#2563EB" radius={[0, 4, 4, 0]} isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="space-y-6">
            <Card title="💡 Core Portfolio SHAP Tickers">
              <div className="space-y-4 font-inter text-xs text-slate-700">
                <span className="text-[9px] text-slate-400 font-medium">Most influential portfolio features driving predictions:</span>
                <ul className="space-y-2.5 font-semibold text-slate-700">
                  <li className="flex justify-between pb-2 border-b border-slate-50">
                    <span>1. Operating Margin Mean</span>
                    <span className="text-blue-600">32.4% Influence</span>
                  </li>
                  <li className="flex justify-between pb-2 border-b border-slate-50">
                    <span>2. GST Compliance Score</span>
                    <span className="text-blue-600">28.1% Influence</span>
                  </li>
                  <li className="flex justify-between pb-2 border-b border-slate-50">
                    <span>3. Outstanding Loan Principal</span>
                    <span className="text-slate-550">18.2% Influence</span>
                  </li>
                  <li className="flex justify-between">
                    <span>4. Current Ratio Mean</span>
                    <span className="text-slate-550">12.5% Influence</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* PORTFOLIO ACTIONS */}
      {!loading && (
        <Card title="💡 Actionable Banking Portfolio Directives">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-inter text-xs text-slate-600">
            <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
              <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider block font-outfit">Sector Credit Warning</span>
              <p className="leading-relaxed"><b>Manufacturing & Textile sectors</b> demonstrate higher default probabilities than Retail. Restrict term credit limits on Textile entities scoring below 70.</p>
            </div>
            
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
              <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block font-outfit">GST Compliance Lever</span>
              <p className="leading-relaxed"><b>GST Compliance</b> remains the strongest positive driver across all models. MSMEs participating in digital tax programs show 18% lower default transition rates.</p>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
              <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block font-outfit">Regional Monitoring Sweep</span>
              <p className="leading-relaxed"><b>Northern & Western regions</b> require closer loan covenant reviews due to elevated turnover volatilities. Propose structured receivable swaps.</p>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
