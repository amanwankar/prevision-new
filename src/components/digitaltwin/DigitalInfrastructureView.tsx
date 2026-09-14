import React, { useState, useMemo, useEffect } from 'react';
import type { Project, EarlyWarning, RecommendedAction } from '../../types';
import { 
  buildInfrastructureGraph, 
  type VisualizationMode 
} from '../../services/infrastructureVisualizationService';
import { InfrastructureNetworkCanvas } from './InfrastructureNetworkCanvas';
import { ProjectIntelligenceDrawer } from './ProjectIntelligenceDrawer';
import { 
  Layers, 
  Search, 
  Maximize2, 
  Minimize2, 
  Play, 
  Square, 
  AlertOctagon, 
  Lightbulb, 
  FolderKanban, 
  ShieldAlert, 
  List,
  Grid,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { CommandButton } from '../common/CommandButton';
import { RiskBadge } from '../common/RiskBadge';
import { StaggerContainer, StaggerItem } from '../motion/StaggerContainer';

interface DigitalInfrastructureViewProps {
  projects: Project[];
  alerts?: EarlyWarning[];
  actions?: RecommendedAction[];
  onSelectProject: (projectId: string) => void;
  onSelectAlert?: (alertId: string) => void;
  onSelectAction?: (actionId: string) => void;
}

export const DigitalInfrastructureView: React.FC<DigitalInfrastructureViewProps> = ({
  projects,
  alerts = [],
  actions = [],
  onSelectProject,
  onSelectAlert,
  onSelectAction,
}) => {
  // State
  const [mode, setMode] = useState<VisualizationMode>('OVERVIEW');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  
  // UI Flags
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'visual' | 'accessible_list'>('visual');

  // Presentation Mode Sequence State
  const [isPresentationActive, setIsPresentationActive] = useState<boolean>(false);

  // Keyboard shortcut ESC to exit Focus Mode
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Build infrastructure graph
  const fullGraphData = useMemo(() => {
    return buildInfrastructureGraph(projects, alerts, actions);
  }, [projects, alerts, actions]);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return fullGraphData.nodes.filter((node) => {
      const matchesSearch =
        searchTerm === '' ||
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector = sectorFilter === 'ALL' || node.sector === sectorFilter;
      const matchesRisk =
        riskFilter === 'ALL' ||
        (riskFilter === 'HIGH' && (node.riskScore >= 70 || node.riskLevel === 'High' || node.riskLevel === 'Critical')) ||
        (riskFilter === 'MED' && node.riskScore >= 45 && node.riskScore < 70) ||
        (riskFilter === 'LOW' && node.riskScore < 45);

      return matchesSearch && matchesSector && matchesRisk;
    });
  }, [fullGraphData.nodes, searchTerm, sectorFilter, riskFilter]);

  // Highlight matching node from search
  const highlightedNodeId = useMemo(() => {
    if (!searchTerm || filteredNodes.length === 0) return null;
    return filteredNodes[0].id;
  }, [searchTerm, filteredNodes]);

  // Handle Mode Change with short scanline sweep
  const handleModeChange = (newMode: VisualizationMode) => {
    setMode(newMode);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 400);
  };

  // Presentation Sequence Runner
  useEffect(() => {
    if (!isPresentationActive) return;

    const timers: Array<ReturnType<typeof setTimeout>> = [];

    // Step 1: Grid activate
    handleModeChange('OVERVIEW');

    // Step 2: Risk mode activate (2.5s)
    timers.push(
      setTimeout(() => {
        handleModeChange('RISK');
      }, 2500)
    );

    // Step 3: Highlight critical node & open drawer (5s)
    timers.push(
      setTimeout(() => {
        const criticalNode = fullGraphData.nodes.find((n) => n.riskScore >= 75) || fullGraphData.nodes[0];
        if (criticalNode) {
          setSelectedNodeId(criticalNode.id);
        }
      }, 5000)
    );

    return () => timers.forEach(clearTimeout);
  }, [isPresentationActive, fullGraphData.nodes]);

  const selectedNode = fullGraphData.nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className={`space-y-6 ${isFocusMode ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      
      {/* Header Banner */}
      {!isFocusMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
                <Layers className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                DIGITAL INFRASTRUCTURE VIEW
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold uppercase">
                2.5D NETWORK ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualize project health, risk signals, progress, and operational status.
            </p>
          </div>

          {/* Engine Status Tag */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-bold">● VISUALIZATION ENGINE READY</span>
              <span className="text-[10px] text-slate-500 font-normal">| DEMO VISUALIZATION</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Portfolio HUD Metrics */}
      {!isFocusMode && (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StaggerItem>
            <MetricCard
              label="TOTAL MONITORED PROJECTS"
              value={fullGraphData.summary.totalProjects}
              sublabel="PORTFOLIO NODES"
              icon={FolderKanban}
              color="cyan"
            />
          </StaggerItem>

          <StaggerItem>
            <MetricCard
              label="HIGH RISK PROJECTS"
              value={fullGraphData.summary.highRiskCount}
              sublabel="RISK SCORE >70"
              icon={ShieldAlert}
              color="red"
            />
          </StaggerItem>

          <StaggerItem>
            <MetricCard
              label="ACTIVE EARLY WARNINGS"
              value={fullGraphData.summary.activeWarningsCount}
              sublabel="UNRESOLVED TRIGGERS"
              icon={AlertOctagon}
              color="amber"
            />
          </StaggerItem>

          <StaggerItem>
            <MetricCard
              label="PENDING ACTIONS"
              value={fullGraphData.summary.pendingActionsCount}
              sublabel="OPERATIONAL RESPONSES"
              icon={Lightbulb}
              color="purple"
            />
          </StaggerItem>
        </StaggerContainer>
      )}

      {/* Control Toolbar: Modes, Search, Filters, Focus, Presentation */}
      <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 space-y-4 shadow-sm">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Mode Selector Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {(['OVERVIEW', 'RISK', 'PROGRESS', 'WARNINGS', 'ACTIONS'] as VisualizationMode[]).map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {m === 'OVERVIEW' && '🌐 OVERVIEW'}
                  {m === 'RISK' && '⚠️ RISK INTENSITY'}
                  {m === 'PROGRESS' && '📈 PROGRESS GAP'}
                  {m === 'WARNINGS' && '🚨 ACTIVE WARNINGS'}
                  {m === 'ACTIONS' && '⚡ PENDING ACTIONS'}
                </button>
              );
            })}
          </div>

          {/* Action CTAs: Focus Mode, Presentation Mode, View Fallback */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Accessible View Toggle */}
            <CommandButton
              variant="secondary"
              size="sm"
              onClick={() => setViewMode(viewMode === 'visual' ? 'accessible_list' : 'visual')}
              className="text-xs"
            >
              {viewMode === 'visual' ? <List className="w-3.5 h-3.5 mr-1.5" /> : <Grid className="w-3.5 h-3.5 mr-1.5" />}
              <span>{viewMode === 'visual' ? 'Accessible List' : '2.5D Visual Grid'}</span>
            </CommandButton>

            {/* Presentation Mode */}
            <CommandButton
              variant={isPresentationActive ? 'danger' : 'primary'}
              size="sm"
              onClick={() => {
                setIsPresentationActive(!isPresentationActive);
                if (isPresentationActive) {
                  setSelectedNodeId(null);
                }
              }}
              className="text-xs"
            >
              {isPresentationActive ? (
                <>
                  <Square className="w-3.5 h-3.5 mr-1.5" />
                  <span>Stop Sequence</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  <span>SIH 2026 Presentation</span>
                </>
              )}
            </CommandButton>

            {/* Focus Mode */}
            <CommandButton
              variant="ghost"
              size="sm"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="text-xs"
              title="Maximize visualization space (ESC to exit)"
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </CommandButton>
          </div>
        </div>

        {/* Search & Filters Sub-bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          
          {/* Global Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by project name, ID, state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 font-mono"
          >
            <option value="ALL">All Infrastructure Sectors</option>
            <option value="Highways">Highways Sector</option>
            <option value="Railways">Railways Sector</option>
            <option value="Urban Transit">Urban Transit Sector</option>
            <option value="Power & Energy">Power & Energy</option>
            <option value="Ports & Waterways">Ports & Waterways</option>
            <option value="Smart Cities">Smart Cities</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 font-mono"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High & Critical Risk (&gt;70)</option>
            <option value="MED">Medium Risk (45-70)</option>
            <option value="LOW">Low Risk (&lt;45)</option>
          </select>

          {/* Filter Reset */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSectorFilter('ALL');
              setRiskFilter('ALL');
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center space-x-1.5 transition font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Canvas / Accessible Fallback View */}
      {viewMode === 'visual' ? (
        <InfrastructureNetworkCanvas
          nodes={filteredNodes}
          connections={fullGraphData.connections}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => setSelectedNodeId(id)}
          mode={mode}
          isScanning={isScanning}
          highlightedNodeId={highlightedNodeId}
        />
      ) : (
        /* Accessible List Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`p-4 rounded-2xl bg-slate-900/80 border transition cursor-pointer hover:border-cyan-500/40 space-y-3 ${
                selectedNodeId === node.id ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-cyan-400 border border-slate-800">
                    {node.code}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 leading-snug">{node.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{node.state} • {node.sector}</div>
                </div>
                <RiskBadge score={node.riskScore} level={node.riskLevel} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Progress</div>
                  <div className="text-white font-bold">{node.actualPhysicalProgress}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Delay Impact</div>
                  <div className="text-amber-400 font-bold">+{node.delayDays}d</div>
                </div>
              </div>

              <CommandButton
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProject(node.id);
                }}
              >
                <span>Inspect Project Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </CommandButton>
            </div>
          ))}
        </div>
      )}

      {/* Selected Project Intelligence Drawer */}
      <ProjectIntelligenceDrawer
        node={selectedNode}
        isOpen={!!selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        onSelectProject={onSelectProject}
        onSelectAlert={onSelectAlert}
        onSelectAction={onSelectAction}
      />

    </div>
  );
};
