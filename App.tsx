
import React, { useState, useEffect, useCallback } from 'react';

// 严格按照图片内容校对的 13x13 矩阵数据
const GRID_DATA = [
  [2, 7, 14, 3, 4, 8, 5, 9, 8, 72, 9, 3, 3],
  [7, 1, 11, 4, 9, 36, 6, 23, 28, 4, 0, 8, 27],
  [6, 65, 50, 12, 3, 62, 30, 1, 9, 9, 6, 21, 19],
  [42, 30, 2, 0, 9, 81, 7, 6, 2, 12, 9, 54, 2],
  [9, 5, 45, 10, 27, 39, 5, 6, 30, 21, 55, 17, 9],
  [2, 6, 7, 41, 35, 6, 7, 42, 2, 5, 3, 81, 9],
  [5, 32, 42, 29, 4, 9, 2, 9, 18, 10, 6, 26, 11],
  [7, 21, 3, 8, 24, 4, 2, 7, 14, 5, 2, 2, 2],
  [35, 9, 4, 2, 8, 32, 6, 4, 5, 4, 7, 28, 4],
  [5, 1, 6, 9, 45, 5, 5, 25, 20, 9, 2, 6, 12],
  [2, 3, 6, 28, 7, 3, 5, 15, 31, 43, 6, 8, 48],
  [7, 2, 67, 45, 3, 9, 27, 6, 5, 4, 20, 5, 9],
  [7, 49, 9, 8, 72, 7, 9, 63, 64, 3, 4, 6, 24]
];

const HIGHLIGHT_COLORS = [
  '#fef9c3', '#dcfce7', '#e0f2fe', '#fce7f3', '#f3e8ff', 
  '#ffedd5', '#ecfccb', '#d1fae5', '#e0e7ff', '#fae8ff'
];

interface SolvedItem {
  keys: string[];
  color: string;
  formula: string;
}

export default function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<SolvedItem[]>([]);
  const [errorKeys, setErrorKeys] = useState<string[]>([]);
  const [animatingKeys, setAnimatingKeys] = useState<string[]>([]);
  const [msg, setMsg] = useState('点击 3 个相邻数字组成公式');
  const [floatingText, setFloatingText] = useState<{x: number, y: number, text: string} | null>(null);

  const resetGame = () => {
    setSelected([]);
    setSolved([]);
    setErrorKeys([]);
    setAnimatingKeys([]);
    setMsg('点击 3 个相邻数字组成公式');
  };

  const isAdjacent = (k1: string, k2: string) => {
    const [r1, c1] = k1.split('-').map(Number);
    const [r2, c2] = k2.split('-').map(Number);
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  };

  const isChain = (keys: string[]) => {
    const [a, b, c] = keys;
    return (
      (isAdjacent(a, b) && isAdjacent(b, c)) ||
      (isAdjacent(a, c) && isAdjacent(c, b)) ||
      (isAdjacent(b, a) && isAdjacent(a, c))
    );
  };

  const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
    const key = `${r}-${c}`;
    if (solved.some(s => s.keys.includes(key)) || animatingKeys.includes(key)) return;

    if (selected.includes(key)) {
      setSelected(prev => prev.filter(k => k !== key));
      return;
    }

    if (selected.length < 3) {
      const next = [...selected, key];
      setSelected(next);
      if (next.length === 3) {
        validate(next, e.clientX, e.clientY);
      }
    }
  };

  const validate = (keys: string[], clickX: number, clickY: number) => {
    const vals = keys.map(k => {
      const [r, c] = k.split('-').map(Number);
      return GRID_DATA[r][c];
    });

    const [v1, v2, v3] = vals;
    let formula = '';
    
    if (v1 * v2 === v3) formula = `${v1}×${v2}=${v3}`;
    else if (v1 * v3 === v2) formula = `${v1}×${v3}=${v2}`;
    else if (v2 * v3 === v1) formula = `${v2}×${v3}=${v1}`;

    const validChain = isChain(keys);

    if (formula && validChain) {
      // 成功流程
      setAnimatingKeys(keys);
      const color = HIGHLIGHT_COLORS[solved.length % HIGHLIGHT_COLORS.length];
      
      setFloatingText({ x: clickX, y: clickY - 40, text: formula });
      setTimeout(() => setFloatingText(null), 1000);

      setTimeout(() => {
        setSolved(prev => [...prev, { keys, color, formula }]);
        setAnimatingKeys([]);
        setSelected([]);
        setMsg(`Bingo! ${formula}`);
      }, 400);

      if ('vibrate' in navigator) navigator.vibrate([30, 10, 30]);
    } else {
      // 失败流程
      setErrorKeys(keys);
      setMsg(validChain ? '不成口诀' : '必须相连');
      if ('vibrate' in navigator) navigator.vibrate(100);
      
      setTimeout(() => {
        setErrorKeys([]);
        setSelected([]);
      }, 500);
    }
  };

  const undo = () => {
    setSolved(prev => prev.slice(0, -1));
    setMsg('已撤销上一步');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans select-none overflow-hidden">
      
      {/* 背景动态装饰 */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-[650px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex flex-col p-6 md:p-10 relative border border-white">
        
        {/* 标题栏 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            乘法消消乐 <span className="text-blue-500 font-medium text-lg ml-2">1-9</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-[11px] text-slate-400 font-medium uppercase tracking-widest">
            <span className="border-b border-slate-100 pb-1">Class: ____</span>
            <span className="border-b border-slate-100 pb-1">Name: ____</span>
            <span className="border-b border-slate-100 pb-1">No: ____</span>
          </div>
        </div>

        {/* 主棋盘 */}
        <div className="relative group perspective-1000">
          <div className="grid grid-cols-13 bg-slate-200 gap-[1.5px] p-[1.5px] rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200 transform-gpu transition-transform duration-500 hover:rotate-x-1 hover:rotate-y-1">
            {GRID_DATA.map((row, r) => row.map((val, c) => {
              const key = `${r}-${c}`;
              const isSelected = selected.includes(key);
              const isError = errorKeys.includes(key);
              const isSuccessAnim = animatingKeys.includes(key);
              const solvedItem = solved.find(s => s.keys.includes(key));
              
              return (
                <div
                  key={key}
                  onMouseDown={(e) => handleCellClick(r, c, e)}
                  style={{ 
                    backgroundColor: isSelected ? '#3B82F6' : (solvedItem?.color || '#FFFFFF') 
                  }}
                  className={`
                    aspect-square flex items-center justify-center relative
                    cursor-pointer transition-all duration-300 transform-gpu
                    ${isSelected ? 'text-white scale-90 z-10 rounded-lg shadow-lg' : 'text-slate-700'}
                    ${isError ? 'animate-error bg-red-50 text-red-600 z-20' : ''}
                    ${isSuccessAnim ? 'animate-success z-30' : ''}
                    ${solvedItem ? 'font-bold opacity-100' : 'hover:bg-slate-50'}
                  `}
                >
                  <span className={`text-[10px] sm:text-sm md:text-base font-bold transition-transform ${isSuccessAnim ? 'scale-150' : ''}`}>
                    {val}
                  </span>
                  {isSuccessAnim && (
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                  )}
                </div>
              );
            }))}
          </div>
        </div>

        {/* 消息提示 (Glassmorphism) */}
        <div className="mt-8 flex justify-center">
          <div className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-500 ${msg.includes('Bingo') ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-110' : 'bg-slate-100 text-slate-400'}`}>
            {msg}
          </div>
        </div>

        {/* 操作区 */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={undo}
            disabled={solved.length === 0}
            className="flex-1 h-14 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl text-sm font-bold active:scale-95 disabled:opacity-20 transition-all hover:bg-slate-50 hover:border-slate-200 shadow-sm"
          >
            撤销上步
          </button>
          <button 
            onClick={resetGame}
            className="flex-1 h-14 bg-slate-900 text-white rounded-2xl text-sm font-bold active:scale-95 transition-all shadow-xl shadow-slate-200 hover:bg-slate-800"
          >
            重新开始
          </button>
        </div>

        {/* 底部信息 */}
        <div className="mt-6 flex justify-between items-center px-4">
          <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            System Live
          </div>
          <div className="text-slate-400 text-xs font-medium">
            Progress: <span className="text-slate-800 font-black">{solved.length}</span> / 50
          </div>
        </div>
      </div>

      {/* 悬浮气泡动效 */}
      {floatingText && (
        <div 
          className="fixed pointer-events-none animate-float-up text-blue-600 font-black text-2xl z-[100] drop-shadow-lg"
          style={{ left: floatingText.x, top: floatingText.y }}
        >
          {floatingText.text}
        </div>
      )}

      <style>{`
        .grid-cols-13 { grid-template-columns: repeat(13, minmax(0, 1fr)); }
        
        @keyframes error {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-error { animation: error 0.4s ease-in-out; }

        @keyframes success {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); filter: brightness(1.5); }
          100% { transform: scale(1); }
        }
        .animate-success { animation: success 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        @keyframes float-up {
          0% { transform: translate(-50%, 0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(-50%, -100px); opacity: 0; }
        }
        .animate-float-up { animation: float-up 1s ease-out forwards; }

        .perspective-1000 { perspective: 1000px; }
        .rotate-x-1 { transform: rotateX(2deg); }
        .rotate-y-1 { transform: rotateY(2deg); }
      `}</style>
    </div>
  );
}
