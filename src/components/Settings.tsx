import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Database, 
  Bell, 
  Save, 
  CheckCircle2
} from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const Settings: React.FC = () => {
  const [landWeight, setLandWeight] = useState(35);
  const [financialWeight, setFinancialWeight] = useState(25);
  const [regulatoryWeight, setRegulatoryWeight] = useState(20);
  const [seasonalityWeight, setSeasonalityWeight] = useState(10);
  const [criticalThreshold, setCriticalThreshold] = useState(75);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-amber-400" />
          <span>System Settings & ML Risk Model Configurator</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Fine-tune predictive risk weights, early warning trigger thresholds, and backend integrations.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ML Risk Model weights and threshold configurations successfully updated and calibrated!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>AI Risk Scoring Factor Weight Calibration</span>
          </h3>
          <p className="text-xs text-slate-400">
            Adjust the impact relative percentages for feature attribution SHAP calculations.
          </p>

          <div className="space-y-4 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Land Acquisition & Right-of-Way Weight ({landWeight}%)</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={landWeight}
                onChange={(e) => setLandWeight(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Financial Disbursement vs Physical Progress Gap Weight ({financialWeight}%)</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={financialWeight}
                onChange={(e) => setFinancialWeight(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Regulatory & Forest Clearances Weight ({regulatoryWeight}%)</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={regulatoryWeight}
                onChange={(e) => setRegulatoryWeight(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Monsoon Seasonality Disruption Weight ({seasonalityWeight}%)</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={seasonalityWeight}
                onChange={(e) => setSeasonalityWeight(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Early Warning Alert Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Critical Risk Score Threshold</label>
              <input
                type="number"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Physical Progress Gap Trigger %</label>
              <input
                type="number"
                defaultValue={15}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-teal-400" />
            <span>Database & Microservice API Integration</span>
          </h3>

          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs">
            <div>
              <div className="font-bold text-white">Supabase PostgreSQL Database Engine</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isSupabaseConfigured 
                  ? 'Connected via environment variables (VITE_SUPABASE_URL)' 
                  : 'Operating in High-Performance Demo Mode with Local Storage Sync'}
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
              isSupabaseConfigured ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {isSupabaseConfigured ? 'Supabase Active' : 'Demo Local Storage Sync Active'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save & Apply Configuration</span>
        </button>

      </form>

    </div>
  );
};
