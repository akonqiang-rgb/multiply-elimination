
import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleCellClick = (r: number, c: number, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const key = `${r}-${c}`;
    if (solved.some(s => s.keys.includes(key)) || animatingKeys.includes(key)) return;

    // 获取坐标逻辑，兼容触摸
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = (e as React.MouseEvent).clientX;
      y = (e as React.MouseEvent).clientY;
    }

    if (selected.includes(key)) {
      setSelected(prev => prev.filter(k => k !== key));
      return;
    }

    if (selected.length < 3) {
      const next = [...selected, key];
      setSelected(next);
      if (next.length === 3) {
        validate(next, x, y);
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

      if ('vibrate' in navigator) navigator.vibrate([40, 30, 40]);
    } else {
      setErrorKeys(keys);
      setMsg(validChain ? '不成口诀' : '必须相连');
      if ('vibrate' in navigator) navigator.vibrate(120);
      
      setTimeout(() => {
        setErrorKeys([]);
        setSelected([]);
      }, 500);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden touch-none">
      
      {/* 动态背景 */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#F8FAFC]"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-100 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-emerald-50 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-[600px] bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border border-white p-6 md:p-10 flex flex-col items-stretch">
        
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-3">
            Math Training v3.0
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-none">
            乘法消消乐
          </h1>
        </div>

        {/* 棋盘 3D Container */}
        <div className="perspective-1200 relative">
          <div className="grid grid-cols-13 bg-slate-100 gap-[1px] p-[1px] rounded-3xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border-4 border-white transform-gpu rotate-x-2 transition-transform duration-700 ease-out hover:rotate-x-0">
            {GRID_DATA.map((row, r) => row.map((val, c) => {
              const key = `${r}-${c}`;
              const isSelected = selected.includes(key);
              const isError = errorKeys.includes(key);
              const isSuccessAnim = animatingKeys.includes(key);
              const solvedItem = solved.find(s => s.keys.includes(key));
              
              return (
                <div
                  key={key}
                  onTouchStart={(e) => handleCellClick(r, c, e)}
                  onMouseDown={(e) => handleCellClick(r, c, e)}
                  style={{ 
                    backgroundColor: isSelected ? '#4F46E5' : (solvedItem?.color || '#FFFFFF') 
                  }}
                  className={`
                    aspect-square flex items-center justify-center relative
                    transition-all duration-300 transform-gpu
                    ${isSelected ? 'text-white scale-90 z-10 rounded-lg shadow-xl' : 'text-slate-700'}
                    ${isError ? 'animate-shake bg-red-100 text-red-600 z-20' : ''}
                    ${isSuccessAnim ? 'animate-bounce-custom z-30' : ''}
                    ${solvedItem ? 'font-black' : 'hover:bg-slate-50'}
                  `}
                >
                  <span className={`text-[10px] sm:text-base font-bold pointer-events-none transition-transform ${isSuccessAnim ? 'scale-150' : ''}`}>
                    {val}
                  </span>
                </div>
              );
            }))}
          </div>
        </div>

        {/* 反馈条 */}
        <div className="mt-10 h-10 flex items-center justify-center">
          <div className={`px-8 py-2 rounded-full text-sm font-black transition-all duration-500 ${msg.includes('Bingo') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-slate-100 text-slate-400'}`}>
            {msg}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => setSolved(prev => prev.slice(0, -1))}
            disabled={solved.length === 0}
            className="flex-1 h-16 bg-white border-2 border-slate-100 text-slate-500 rounded-[1.5rem] text-sm font-black active:scale-95 disabled:opacity-20 transition-all shadow-sm"
          >
            撤回
          </button>
          <button 
            onClick={resetGame}
            className="flex-1 h-16 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black active:scale-95 transition-all shadow-2xl shadow-indigo-100"
          >
            重置
          </button>
        </div>
      </div>

      {/* 悬浮公示 */}
      {floatingText && (
        <div 
          className="fixed pointer-events-none animate-float-up text-indigo-600 font-black text-3xl z-[100] drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
          style={{ left: floatingText.x, top: floatingText.y }}
        >
          {floatingText.text}
        </div>
      )}

      <style>{`
        .grid-cols-13 { grid-template-columns: repeat(13, minmax(0, 1fr)); }
        .perspective-1200 { perspective: 1200px; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-1deg); }
          75% { transform: translateX(4px) rotate(1deg); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out infinite; }

        @keyframes bounce-custom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.4) translateY(-10px); }
        }
        .animate-bounce-custom { animation: bounce-custom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

        @keyframes float-up {
          0% { transform: translate(-50%, 0); opacity: 0; scale: 0.5; }
          20% { opacity: 1; scale: 1.2; }
          100% { transform: translate(-50%, -150px); opacity: 0; scale: 1.5; }
        }
        .animate-float-up { animation: float-up 1s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}</style>
    </div>
  );
}
