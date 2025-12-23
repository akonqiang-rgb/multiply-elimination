
import React, { useState, useEffect, useCallback, useRef } from 'react';

// 生成随机棋盘的工具函数
const generateRandomGrid = (rows: number, cols: number) => {
  // 乘法口诀中常见的因数和积
  const pool = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
    12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 
    32, 35, 36, 40, 42, 45, 48, 49, 54, 56, 63, 64, 72, 81
  ];
  
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    grid.push(row);
  }
  return grid;
};

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
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<number[][]>(() => generateRandomGrid(13, 13));
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<SolvedItem[]>([]);
  const [errorKeys, setErrorKeys] = useState<string[]>([]);
  const [animatingKeys, setAnimatingKeys] = useState<string[]>([]);
  const [msg, setMsg] = useState('点击 3 个相邻数字组成公式');
  const [floatingText, setFloatingText] = useState<{x: number, y: number, text: string} | null>(null);
  const [isChangingLevel, setIsChangingLevel] = useState(false);

  // 重置当前关卡（乱序重排）
  const resetGame = () => {
    setGrid(generateRandomGrid(13, 13));
    setSelected([]);
    setSolved([]);
    setErrorKeys([]);
    setAnimatingKeys([]);
    setMsg('棋盘已重置并重新乱序');
  };

  // 下一关
  const nextLevel = () => {
    setIsChangingLevel(true);
    setTimeout(() => {
      setLevel(prev => prev + 1);
      setGrid(generateRandomGrid(13, 13));
      setSelected([]);
      setSolved([]);
      setErrorKeys([]);
      setAnimatingKeys([]);
      setMsg(`欢迎来到第 ${level + 1} 关`);
      setIsChangingLevel(false);
    }, 600);
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
    if (isChangingLevel) return;
    
    // 兼容触摸与鼠标
    let x, y;
    if ('touches' in e) {
      // 触屏模式下不调用 preventDefault 可能会导致某些浏览器无法触发点击，但这里为了防止缩放必须处理
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = (e as React.MouseEvent).clientX;
      y = (e as React.MouseEvent).clientY;
    }

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
        validate(next, x, y);
      }
    }
  };

  const validate = (keys: string[], clickX: number, clickY: number) => {
    const vals = keys.map(k => {
      const [r, c] = k.split('-').map(Number);
      return grid[r][c];
    });

    const [v1, v2, v3] = vals;
    let formula = '';
    
    // 校验乘法逻辑
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
      setMsg(validChain ? '不成口诀' : '必须相邻');
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

      <div className={`w-full max-w-[600px] bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border border-white p-6 md:p-10 flex flex-col items-stretch transition-all duration-500 ${isChangingLevel ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100'}`}>
        
        {/* 标题 & 关卡指示器 */}
        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-3">
            <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase">
              Level {level}
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
              Solved: {solved.length}
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-none">
            乘法消消乐
          </h1>
        </div>

        {/* 3D 棋盘容器 */}
        <div className="perspective-1200 relative">
          <div className="grid grid-cols-13 bg-slate-200/50 gap-[1px] p-[1.5px] rounded-3xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border-4 border-white transform-gpu rotate-x-2 transition-transform duration-700 ease-out">
            {grid.map((row, r) => row.map((val, c) => {
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
                    ${solvedItem ? 'font-black opacity-90' : 'hover:bg-slate-50'}
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
        <div className="mt-8 h-8 flex items-center justify-center">
          <div className={`px-6 py-1.5 rounded-full text-xs font-black transition-all duration-500 ${msg.includes('Bingo') ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
            {msg}
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-3">
            <button 
              onClick={() => setSolved(prev => prev.slice(0, -1))}
              disabled={solved.length === 0}
              className="flex-1 h-14 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl text-sm font-black active:scale-95 disabled:opacity-20 transition-all shadow-sm"
            >
              撤回
            </button>
            <button 
              onClick={resetGame}
              className="flex-1 h-14 bg-white border-2 border-indigo-50 text-indigo-600 rounded-2xl text-sm font-black active:scale-95 transition-all shadow-sm"
            >
              重置乱序
            </button>
          </div>
          <button 
            onClick={nextLevel}
            className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] text-lg font-black active:scale-95 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-2"
          >
            下一关 
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      {/* 漂浮公式动画 */}
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
