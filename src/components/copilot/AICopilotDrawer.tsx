import React, { useState, useEffect, useRef } from 'react';
import type { Project, EarlyWarning, RecommendedAction, User } from '../../types';
import { processCopilotQuery, type CopilotMessage } from '../../services/copilotService';
import { CopilotResponseRenderer } from './CopilotResponseRenderer';
import { GlassPanel } from '../motion/GlassPanel';
import { AICore } from '../motion/AICore';
import { PulseIndicator } from '../motion/PulseIndicator';
import { LoadingScanner } from '../motion/LoadingScanner';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  User as UserIcon, 
  ChevronRight
} from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  alerts: EarlyWarning[];
  actions: RecommendedAction[];
  currentUser?: User | null;
  activePage?: string;
  selectedProjectId?: string | null;
  selectedAlertId?: string | null;
  selectedActionId?: string | null;
  onNavigate: (page: string, hash?: string, id?: string) => void;
}

const DEFAULT_SEED_PROMPTS = [
  'Which projects are high risk?',
  'Why is National Highway Expansion high risk?',
  'Show active early warnings',
  'What actions need attention?',
  'Give me a portfolio summary',
  'Compare highest-risk projects'
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  alerts,
  actions,
  currentUser,
  activePage,
  selectedProjectId,
  selectedAlertId,
  selectedActionId,
  onNavigate
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStageText, setAnalysisStageText] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAnalyzing]);

  if (!isOpen) return null;

  // Handle Query Submission
  const handleSendQuery = (queryText: string) => {
    const prompt = queryText.trim();
    if (!prompt || isAnalyzing) return;

    // Add User Message
    const userMsg: CopilotMessage = {
      id: `usr-msg-${Math.random().toString(36).substring(2, 9)}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: prompt
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsAnalyzing(true);
    setAnalysisStageText('READING PROJECT TELEMETRY DATA...');

    // Staged Analysis Sequence Simulation
    setTimeout(() => {
      setAnalysisStageText('EVALUATING RISK ENGINE & WARNING SIGNALS...');
    }, 400);

    setTimeout(() => {
      setAnalysisStageText('COMPILING INTELLIGENCE RESPONSE...');
    }, 800);

    setTimeout(() => {
      // Process Query via copilotService
      const assistantMsg = processCopilotQuery(
        prompt,
        currentUser || null,
        projects,
        alerts,
        actions,
        {
          activePage,
          selectedProjectId: selectedProjectId || undefined,
          selectedAlertId: selectedAlertId || undefined,
          selectedActionId: selectedActionId || undefined
        }
      );

      setMessages(prev => [...prev, assistantMsg]);
      setIsAnalyzing(false);
      setAnalysisStageText('');
    }, 1200);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  // Determine Active Context Display Name
  let contextLabel = 'Global Portfolio Context';
  if (selectedProjectId) {
    const proj = projects.find(p => p.id === selectedProjectId);
    if (proj) contextLabel = `Context: ${proj.code} (${proj.name})`;
  } else if (activePage === 'alerts') {
    contextLabel = 'Context: Early Warning Queue';
  } else if (activePage === 'actions') {
    contextLabel = 'Context: Recommended Actions';
  } else if (activePage === 'analytics') {
    contextLabel = 'Context: Risk Analytics Console';
  } else if (activePage === 'executive_reports') {
    contextLabel = 'Context: Executive Situation Room';
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      {/* Clickable Backdrop Overlay */}
      <div className="fixed inset-0" onClick={onClose} />
      
      {/* Copilot Drawer Panel */}
      <div className="w-full sm:w-[500px] lg:w-[540px] h-full max-h-[100dvh] max-w-full bg-[#030712] border-l border-cyan-500/30 flex flex-col justify-between shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden z-10">
        
        {/* Background Atmospheric Lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ------------------------------------------------------------- */}
        {/* 1. DRAWER HEADER                                             */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <AICore size="sm" state={isAnalyzing ? 'ANALYZING' : 'IDLE'} isAnalyzing={isAnalyzing} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-tight text-white">PRAEVISIO INTELLIGENCE</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  v2.6 COPILOT
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 mt-0.5">
                <PulseIndicator color="cyan" size="sm" />
                <span>ONLINE • DEMO QUERY ENGINE</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-all"
                title="Clear Conversation History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close Copilot Drawer"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all focus-ring touch-target-safe"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Context Status Banner */}
        <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="text-cyan-400 font-bold truncate max-w-xs">{contextLabel}</span>
          <span className="text-slate-500">RBAC RESTRICTED</span>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. CHAT MESSAGES CONTAINER                                   */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          
          {/* Welcome Initial State */}
          {messages.length === 0 && (
            <div className="space-y-4 pt-4 animate-fadeIn">
              
              <GlassPanel className="p-4 border-cyan-500/30 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-sm">PRAEVISIO Infrastructure Copilot</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Ask natural language questions about projects, risk scores, early warnings, and recommended actions.
                </p>
              </GlassPanel>

              {/* Seed Prompts Grid */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
                  SUGGESTED INFRASTRUCTURE QUERIES:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {DEFAULT_SEED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(prompt)}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all text-left flex items-center justify-between group"
                    >
                      <span className="font-medium">{prompt}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Conversation History Stream */}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              {/* Avatar Icon */}
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 p-3 rounded-2xl rounded-tr-none font-medium shadow-md'
                  : 'bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none text-slate-200 space-y-2 shadow-xl'
              }`}>
                {msg.sender === 'user' ? (
                  <div className="text-xs font-semibold">{msg.text}</div>
                ) : (
                  <CopilotResponseRenderer
                    message={msg}
                    onNavigate={(page, hash, id) => {
                      onNavigate(page, hash, id);
                      onClose();
                    }}
                    onFollowUpClick={fq => handleSendQuery(fq)}
                  />
                )}
                
                <div className={`text-[9px] font-mono pt-1 text-right ${msg.sender === 'user' ? 'text-slate-950/70' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Scanning State Indicator */}
          {isAnalyzing && (
            <div className="flex items-start space-x-3 animate-fadeIn">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-2xl rounded-tl-none text-xs font-mono text-cyan-400 space-y-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <LoadingScanner active label={analysisStageText} position="top" />
                  <span>{analysisStageText}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. STICKY INPUT CONTAINER                                    */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/95 relative z-10 space-y-2">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendQuery(inputQuery);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask PRAEVISIO about projects, risk, warnings..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isAnalyzing}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-1">
            <span>Press Enter to send</span>
            <span>Shortcut: Ctrl + I</span>
          </div>
        </div>

      </div>

    </div>
  );
};
