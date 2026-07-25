import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, Clock, DollarSign, Percent, Palette, Cpu, ShieldCheck, ArrowRightLeft, Receipt, Eye, EyeOff, CheckCircle2, XCircle, RefreshCw, Copy, Check, ExternalLink, Globe, Sparkles, Play, Pause, RotateCcw, Flag, Timer, Hourglass, Bell, Plus, Volume2, VolumeX } from 'lucide-react';
import { ToolItem } from '../../types';

interface UtilityToolRunnerProps {
  tool: ToolItem;
}

export const UtilityToolRunner: React.FC<UtilityToolRunnerProps> = ({ tool }) => {
  
  // 1. Age Calculator
  const [birthDate, setBirthDate] = useState('1998-05-15');
  const [ageResult, setAgeResult] = useState<{ years: number; months: number; days: number } | null>(null);

  const calculateAge = () => {
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += 30; }
    if (months < 0) { years--; months += 12; }
    setAgeResult({ years, months, days });
  };

  // 2. GST Calculator
  const [gstAmount, setGstAmount] = useState(1000);
  const [gstRate, setGstRate] = useState(18);

  const gstTax = (gstAmount * gstRate) / 100;
  const totalGstPrice = gstAmount + gstTax;

  // 3. EMI Loan Calculator
  const [loanPrincipal, setLoanPrincipal] = useState(100000);
  const [loanInterest, setLoanInterest] = useState(8.5);
  const [loanTenureMonths, setLoanTenureMonths] = useState(24);

  const calculateEmi = () => {
    const r = loanInterest / 12 / 100;
    const emi = (loanPrincipal * r * Math.pow(1 + r, loanTenureMonths)) / (Math.pow(1 + r, loanTenureMonths) - 1);
    const totalPayment = emi * loanTenureMonths;
    const totalInterest = totalPayment - loanPrincipal;
    return { emi: Math.round(emi), totalPayment: Math.round(totalPayment), totalInterest: Math.round(totalInterest) };
  };
  const emiStats = calculateEmi();

  // 4. Currency Converter
  const [currAmount, setCurrAmount] = useState(100);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('INR');
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.78, INR: 83.5, BDT: 117.2, JPY: 156.4, CAD: 1.36, AUD: 1.51 };
  const convertedCurrency = ((currAmount / rates[fromCurr]) * rates[toCurr]).toFixed(2);

  // 5. Stopwatch & Timer
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => setTime((prev) => prev + 10), 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // 6. Color Picker
  const [color, setColor] = useState('#6366f1');

  // 7. UUID Generator
  const [uuidList, setUuidList] = useState<string[]>([]);
  const generateUuids = () => {
    const list = Array.from({ length: 5 }, () => crypto.randomUUID());
    setUuidList(list);
  };

  // 8. Password Strength & Entropy Analyzer
  const [password, setPassword] = useState('SuperP@ssw0rd2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);

  const getPasswordMetrics = (pwd: string) => {
    let poolSize = 0;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNumber) poolSize += 10;
    if (hasSymbol) poolSize += 32;

    const entropy = pwd.length > 0 && poolSize > 0 ? Math.floor(pwd.length * Math.log2(poolSize)) : 0;
    
    let score = 0; // 0 to 100
    if (entropy < 28) score = 20;
    else if (entropy < 36) score = 40;
    else if (entropy < 60) score = 60;
    else if (entropy < 80) score = 85;
    else score = 100;

    let label = 'Very Weak';
    let colorClass = 'bg-rose-500 text-rose-500';
    let crackTime = 'Instant';

    if (score >= 85) {
      label = 'Extremely Secure';
      colorClass = 'bg-emerald-500 text-emerald-500';
      crackTime = '34 Billion Years';
    } else if (score >= 60) {
      label = 'Strong';
      colorClass = 'bg-teal-500 text-teal-500';
      crackTime = '1,200 Years';
    } else if (score >= 40) {
      label = 'Fair';
      colorClass = 'bg-amber-500 text-amber-500';
      crackTime = '3 Days';
    } else if (score >= 20) {
      label = 'Weak';
      colorClass = 'bg-orange-500 text-orange-500';
      crackTime = '12 Minutes';
    }

    return { entropy, score, label, colorClass, crackTime, hasLower, hasUpper, hasNumber, hasSymbol };
  };

  const pwdMetrics = getPasswordMetrics(password);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let res = '';
    for (let i = 0; i < 18; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  // 9. Unit Converter
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp'>('length');
  const [unitVal, setUnitVal] = useState(10);
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('ft');

  const convertUnits = () => {
    if (unitCategory === 'length') {
      const toMeters: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.34 };
      const meters = unitVal * (toMeters[unitFrom] || 1);
      return (meters / (toMeters[unitTo] || 1)).toFixed(4);
    }
    if (unitCategory === 'weight') {
      const toKg: Record<string, number> = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 };
      const kgs = unitVal * (toKg[unitFrom] || 1);
      return (kgs / (toKg[unitTo] || 1)).toFixed(4);
    }
    if (unitCategory === 'temp') {
      if (unitFrom === 'C' && unitTo === 'F') return ((unitVal * 9) / 5 + 32).toFixed(2);
      if (unitFrom === 'F' && unitTo === 'C') return (((unitVal - 32) * 5) / 9).toFixed(2);
      if (unitFrom === 'C' && unitTo === 'K') return (unitVal + 273.15).toFixed(2);
      return unitVal.toString();
    }
    return '0';
  };

  // 10. Percentage Calculator
  const [percVal1, setPercVal1] = useState(20);
  const [percVal2, setPercVal2] = useState(250);

  // 11. Interactive Calendar & Planner State
  const [calViewMode, setCalViewMode] = useState<'special-app' | 'planner'>('special-app');
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [selectedCalDate, setSelectedCalDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [calEvents, setCalEvents] = useState<Array<{ id: string; dateStr: string; title: string; time: string; category: string; completed: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('super_hub_cal_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return [
      { id: '1', dateStr: todayStr, title: 'Team Sync & Product Planning', time: '10:00 AM', category: 'Work', completed: false },
      { id: '2', dateStr: todayStr, title: 'Gym & Fitness Workout', time: '05:30 PM', category: 'Personal', completed: true },
    ];
  });
  const [newCalTitle, setNewCalTitle] = useState('');
  const [newCalTime, setNewCalTime] = useState('10:00 AM');
  const [newCalCategory, setNewCalCategory] = useState('Work');

  useEffect(() => {
    try {
      localStorage.setItem('super_hub_cal_events', JSON.stringify(calEvents));
    } catch (e) {}
  }, [calEvents]);

  const handleAddCalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalTitle.trim()) return;
    const newEv = {
      id: Date.now().toString(),
      dateStr: selectedCalDate,
      title: newCalTitle.trim(),
      time: newCalTime,
      category: newCalCategory,
      completed: false,
    };
    setCalEvents((prev) => [...prev, newEv]);
    setNewCalTitle('');
  };

  const toggleCalEvent = (id: string) => {
    setCalEvents((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const deleteCalEvent = (id: string) => {
    setCalEvents((prev) => prev.filter((item) => item.id !== id));
  };

  // 12. Scientific Calculator State
  const [sciCalcExpr, setSciCalcExpr] = useState('');
  const [sciCalcAns, setSciCalcAns] = useState('');
  const [sciAngleMode, setSciAngleMode] = useState<'deg' | 'rad'>('deg');
  const [sciHistory, setSciHistory] = useState<Array<{ expr: string; ans: string }>>([]);

  const evalSciCalc = () => {
    if (!sciCalcExpr.trim()) return;
    try {
      let clean = sciCalcExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/\^/g, '**');

      if (sciAngleMode === 'deg') {
        clean = clean
          .replace(/sin\(([^)]+)\)/g, (_, arg) => `Math.sin((${arg}) * Math.PI / 180)`)
          .replace(/cos\(([^)]+)\)/g, (_, arg) => `Math.cos((${arg}) * Math.PI / 180)`)
          .replace(/tan\(([^)]+)\)/g, (_, arg) => `Math.tan((${arg}) * Math.PI / 180)`);
      } else {
        clean = clean
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(');
      }

      const res = Function(`'use strict'; return (${clean})`)();
      let formattedRes = String(res);
      if (typeof res === 'number') {
        if (Number.isNaN(res)) formattedRes = 'Error';
        else if (!Number.isFinite(res)) formattedRes = 'Infinity';
        else formattedRes = String(Math.round(res * 1e10) / 1e10);
      }
      setSciCalcAns(formattedRes);
      if (formattedRes !== 'Error') {
        setSciHistory((prev) => [{ expr: sciCalcExpr, ans: formattedRes }, ...prev.slice(0, 9)]);
      }
    } catch {
      setSciCalcAns('Error');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
      
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tool.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      {/* Age Calculator */}
      {tool.id === 'util-age-calc' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Select Date of Birth</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>
          <button onClick={calculateAge} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
            Calculate Age
          </button>
          {ageResult && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-center">
              <span className="text-2xl font-black text-indigo-900 dark:text-white">{ageResult.years} Years, {ageResult.months} Months, {ageResult.days} Days</span>
            </div>
          )}
        </div>
      )}

      {/* GST Calculator */}
      {tool.id === 'util-gst-calc' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Base Price Amount ($ / ₹)</label>
            <input
              type="number"
              value={gstAmount}
              onChange={(e) => setGstAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">GST / Tax Rate (%)</label>
            <select value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
              <option value={5}>5% Standard</option>
              <option value={12}>12% Reduced</option>
              <option value={18}>18% Regular</option>
              <option value={28}>28% Luxury</option>
            </select>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Tax Amount:</span><span className="font-bold text-amber-600 dark:text-amber-400">${gstTax.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-bold border-t border-slate-200 dark:border-slate-700 pt-2 text-slate-900 dark:text-white"><span>Total Price:</span><span className="text-emerald-600 dark:text-emerald-400">${totalGstPrice.toFixed(2)}</span></div>
          </div>
        </div>
      )}

      {/* EMI Calculator */}
      {tool.id === 'util-emi-calc' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Loan Amount ($ / ₹)</label>
            <input type="number" value={loanPrincipal} onChange={(e) => setLoanPrincipal(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Annual Interest Rate (%)</label>
            <input type="number" step="0.1" value={loanInterest} onChange={(e) => setLoanInterest(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Tenure (Months)</label>
            <input type="number" value={loanTenureMonths} onChange={(e) => setLoanTenureMonths(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white" />
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Monthly EMI:</span><span className="font-bold text-indigo-700 dark:text-indigo-300">${emiStats.emi}</span></div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Total Interest:</span><span className="font-bold text-rose-600 dark:text-rose-400">${emiStats.totalInterest}</span></div>
            <div className="flex justify-between font-bold text-sm border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-900 dark:text-white"><span>Total Payable:</span><span className="text-emerald-600 dark:text-emerald-400">${emiStats.totalPayment}</span></div>
          </div>
        </div>
      )}

      {/* Currency Converter */}
      {tool.id === 'util-currency-calc' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Amount</label>
            <input type="number" value={currAmount} onChange={(e) => setCurrAmount(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">From</label>
              <select value={fromCurr} onChange={(e) => setFromCurr(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">To</label>
              <select value={toCurr} onChange={(e) => setToCurr(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-center">
            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-300">{currAmount} {fromCurr} = {convertedCurrency} {toCurr}</span>
          </div>
        </div>
      )}

      {/* Password Strength & Entropy Analyzer */}
      {(tool.id === 'util-password-strength' || tool.id === 'util-password-analyzer') && (
        <div className="space-y-5 max-w-lg mx-auto">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enter Password to Analyze</label>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Generate Random
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type or paste a password..."
                className="w-full pl-4 pr-20 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute right-2 top-2.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(password);
                    setCopiedPwd(true);
                    setTimeout(() => setCopiedPwd(false), 2000);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {copiedPwd ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Strength Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Security Score:</span>
              <span className={`font-bold ${pwdMetrics.colorClass.split(' ')[1]}`}>
                {pwdMetrics.label} ({pwdMetrics.entropy} bits entropy)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${pwdMetrics.colorClass.split(' ')[0]}`}
                style={{ width: `${Math.max(5, pwdMetrics.score)}%` }}
              />
            </div>
          </div>

          {/* Crack Time Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Est. Crack Time</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white block mt-0.5">{pwdMetrics.crackTime}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Length & Pool</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white block mt-0.5">{password.length} Chars</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Complexity Requirements</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                {password.length >= 12 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span className={password.length >= 12 ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400'}>At least 12 characters</span>
              </div>
              <div className="flex items-center gap-2">
                {pwdMetrics.hasUpper ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span className={pwdMetrics.hasUpper ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400'}>Uppercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                {pwdMetrics.hasLower ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span className={pwdMetrics.hasLower ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400'}>Lowercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                {pwdMetrics.hasNumber ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span className={pwdMetrics.hasNumber ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400'}>Number (0-9)</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                {pwdMetrics.hasSymbol ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span className={pwdMetrics.hasSymbol ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400'}>Special symbol (!@#$%^&*)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Converter */}
      {tool.id === 'util-unit-calc' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div className="flex gap-2">
            {(['length', 'weight', 'temp'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setUnitCategory(cat)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize ${unitCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Input Value</label>
            <input type="number" value={unitVal} onChange={(e) => setUnitVal(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">From</label>
              <select value={unitFrom} onChange={(e) => setUnitFrom(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                {unitCategory === 'length' && ['m', 'km', 'cm', 'mm', 'ft', 'in', 'mi'].map(u => <option key={u} value={u}>{u}</option>)}
                {unitCategory === 'weight' && ['kg', 'g', 'mg', 'lb', 'oz'].map(u => <option key={u} value={u}>{u}</option>)}
                {unitCategory === 'temp' && ['C', 'F', 'K'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">To</label>
              <select value={unitTo} onChange={(e) => setUnitTo(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                {unitCategory === 'length' && ['m', 'km', 'cm', 'mm', 'ft', 'in', 'mi'].map(u => <option key={u} value={u}>{u}</option>)}
                {unitCategory === 'weight' && ['kg', 'g', 'mg', 'lb', 'oz'].map(u => <option key={u} value={u}>{u}</option>)}
                {unitCategory === 'temp' && ['C', 'F', 'K'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-center font-bold text-lg text-indigo-700 dark:text-indigo-300">
            {unitVal} {unitFrom} = {convertUnits()} {unitTo}
          </div>
        </div>
      )}

      {/* Percentage Calculator */}
      {tool.id === 'util-percentage-calc' && (
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">What is X%</label>
            <input type="number" value={percVal1} onChange={(e) => setPercVal1(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Of Total Y</label>
            <input type="number" value={percVal2} onChange={(e) => setPercVal2(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white" />
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-center font-extrabold text-xl text-emerald-800 dark:text-emerald-300">
            {percVal1}% of {percVal2} = {((percVal1 / 100) * percVal2).toFixed(2)}
          </div>
        </div>
      )}

      {/* Advanced Precision Stopwatch & Countdown Timer & Pomodoro Suite */}
      {tool.id === 'util-timer-stopwatch' && (() => {
        // Mode State: 'stopwatch' | 'countdown' | 'pomodoro'
        const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown' | 'pomodoro'>('stopwatch');

        // Web Audio Alarm Helper
        const playAlarmSound = () => {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
          } catch (e) {
            // Audio context failed or blocked by browser policy
          }
        };

        // --- 1. STOPWATCH ENGINE ---
        const [swTime, setSwTime] = useState(0);
        const [swRunning, setSwRunning] = useState(false);
        const [swLaps, setSwLaps] = useState<Array<{ id: number; lapTime: number; overallTime: number }>>([]);
        const [swCopied, setSwCopied] = useState(false);

        useEffect(() => {
          let interval: any;
          if (swRunning) {
            interval = setInterval(() => {
              setSwTime((prev) => prev + 10);
            }, 10);
          } else {
            clearInterval(interval);
          }
          return () => clearInterval(interval);
        }, [swRunning]);

        const formatSwTime = (ms: number) => {
          const hrs = Math.floor(ms / 3600000);
          const mins = Math.floor((ms % 3600000) / 60000);
          const secs = Math.floor((ms % 60000) / 1000);
          const millis = Math.floor((ms % 1000) / 10);
          return {
            formatted: `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`,
            hrs, mins, secs, millis
          };
        };

        const addLap = () => {
          if (swTime === 0) return;
          const prevTotal = swLaps.length > 0 ? swLaps[0].overallTime : 0;
          const lapTime = swTime - prevTotal;
          const newLap = {
            id: swLaps.length + 1,
            lapTime,
            overallTime: swTime,
          };
          setSwLaps([newLap, ...swLaps]);
        };

        const resetStopwatch = () => {
          setSwRunning(false);
          setSwTime(0);
          setSwLaps([]);
        };

        // Min/Max Laps for highlighting
        let fastestLapId = -1;
        let slowestLapId = -1;
        if (swLaps.length >= 2) {
          let minTime = Infinity;
          let maxTime = -1;
          swLaps.forEach((l) => {
            if (l.lapTime < minTime) { minTime = l.lapTime; fastestLapId = l.id; }
            if (l.lapTime > maxTime) { maxTime = l.lapTime; slowestLapId = l.id; }
          });
        }

        const copyLaps = () => {
          if (swLaps.length === 0) return;
          const text = swLaps
            .map((l) => `Lap ${l.id}: Split ${formatSwTime(l.lapTime).formatted} | Total ${formatSwTime(l.overallTime).formatted}`)
            .join('\n');
          navigator.clipboard.writeText(text);
          setSwCopied(true);
          setTimeout(() => setSwCopied(false), 2000);
        };

        // --- 2. COUNTDOWN TIMER ENGINE ---
        const [cdHours, setCdHours] = useState(0);
        const [cdMins, setCdMins] = useState(5);
        const [cdSecs, setCdSecs] = useState(0);
        const [cdInitialTotal, setCdInitialTotal] = useState(300); // in seconds
        const [cdRemaining, setCdRemaining] = useState(300);
        const [cdRunning, setCdRunning] = useState(false);
        const [cdSound, setCdSound] = useState(true);
        const [cdFinished, setCdFinished] = useState(false);

        useEffect(() => {
          let interval: any;
          if (cdRunning && cdRemaining > 0) {
            interval = setInterval(() => {
              setCdRemaining((prev) => {
                if (prev <= 1) {
                  setCdRunning(false);
                  setCdFinished(true);
                  if (cdSound) playAlarmSound();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            clearInterval(interval);
          }
          return () => clearInterval(interval);
        }, [cdRunning, cdRemaining, cdSound]);

        const startCountdownWithPreset = (secs: number) => {
          setCdFinished(false);
          setCdRunning(false);
          setCdInitialTotal(secs);
          setCdRemaining(secs);
          setCdHours(Math.floor(secs / 3600));
          setCdMins(Math.floor((secs % 3600) / 60));
          setCdSecs(secs % 60);
        };

        const applyCustomCountdownInput = () => {
          const totalSecs = cdHours * 3600 + cdMins * 60 + cdSecs;
          if (totalSecs <= 0) return;
          setCdFinished(false);
          setCdRunning(false);
          setCdInitialTotal(totalSecs);
          setCdRemaining(totalSecs);
        };

        const addCountdownTime = (addSecs: number) => {
          setCdInitialTotal((prev) => prev + addSecs);
          setCdRemaining((prev) => prev + addSecs);
          setCdFinished(false);
        };

        const resetCountdown = () => {
          setCdRunning(false);
          setCdFinished(false);
          setCdRemaining(cdInitialTotal);
        };

        const formatCdRemaining = (seconds: number) => {
          const h = Math.floor(seconds / 3600);
          const m = Math.floor((seconds % 3600) / 60);
          const s = seconds % 60;
          return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        const cdProgressPercent = cdInitialTotal > 0 ? Math.min(100, Math.max(0, (cdRemaining / cdInitialTotal) * 100)) : 0;

        // --- 3. POMODORO TIMER ENGINE ---
        const [pomoType, setPomoType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
        const [pomoTime, setPomoTime] = useState(1500); // 25 mins in seconds
        const [pomoRunning, setPomoRunning] = useState(false);
        const [pomoSessions, setPomoSessions] = useState(0);

        useEffect(() => {
          let interval: any;
          if (pomoRunning && pomoTime > 0) {
            interval = setInterval(() => {
              setPomoTime((prev) => {
                if (prev <= 1) {
                  setPomoRunning(false);
                  playAlarmSound();
                  if (pomoType === 'focus') {
                    setPomoSessions((s) => s + 1);
                  }
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            clearInterval(interval);
          }
          return () => clearInterval(interval);
        }, [pomoRunning, pomoTime, pomoType]);

        const switchPomoType = (type: 'focus' | 'shortBreak' | 'longBreak') => {
          setPomoType(type);
          setPomoRunning(false);
          if (type === 'focus') setPomoTime(1500); // 25 min
          if (type === 'shortBreak') setPomoTime(300); // 5 min
          if (type === 'longBreak') setPomoTime(900); // 15 min
        };

        return (
          <div className="space-y-6 max-w-xl mx-auto">
            {/* Suite Header / Mode Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setTimerMode('stopwatch')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === 'stopwatch'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Timer className="w-4 h-4" /> Precision Stopwatch
              </button>
              <button
                onClick={() => setTimerMode('countdown')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === 'countdown'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Hourglass className="w-4 h-4" /> Countdown Timer
              </button>
              <button
                onClick={() => setTimerMode('pomodoro')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  timerMode === 'pomodoro'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🍅 Pomodoro
              </button>
            </div>

            {/* MODE 1: PRECISION STOPWATCH */}
            {timerMode === 'stopwatch' && (
              <div className="space-y-5">
                {/* Huge Clock Display */}
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-2 shadow-inner">
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">High-Precision Stopwatch</span>
                  <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                    {formatSwTime(swTime).formatted}
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSwRunning(!swRunning)}
                    className={`py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      swRunning
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {swRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {swRunning ? 'Pause' : 'Start'}
                  </button>

                  <button
                    onClick={addLap}
                    disabled={!swRunning && swTime === 0}
                    className="py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Flag className="w-4 h-4" /> Record Lap
                  </button>

                  <button
                    onClick={resetStopwatch}
                    className="py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>

                {/* Laps List */}
                {swLaps.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-indigo-500" /> Recorded Laps ({swLaps.length})
                      </span>
                      <button
                        onClick={copyLaps}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {swCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {swCopied ? 'Copied!' : 'Copy Laps'}
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                      {swLaps.map((lap) => {
                        const isFastest = lap.id === fastestLapId;
                        const isSlowest = lap.id === slowestLapId;

                        return (
                          <div
                            key={lap.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                              isFastest
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                                : isSlowest
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-12 font-bold text-slate-400">Lap {lap.id}</span>
                              {isFastest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-extrabold uppercase">Best</span>}
                              {isSlowest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-extrabold uppercase">Worst</span>}
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans">Split</span>
                                <span>+{formatSwTime(lap.lapTime).formatted}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans">Total</span>
                                <span className="font-extrabold">{formatSwTime(lap.overallTime).formatted}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: COUNTDOWN TIMER */}
            {timerMode === 'countdown' && (
              <div className="space-y-5">
                {/* Presets Grid */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Quick Timer Presets</label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {[
                      { label: '30s', secs: 30 },
                      { label: '1m', secs: 60 },
                      { label: '3m', secs: 180 },
                      { label: '5m', secs: 300 },
                      { label: '10m', secs: 600 },
                      { label: '15m', secs: 900 },
                      { label: '30m', secs: 1800 },
                      { label: '60m', secs: 3600 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => startCountdownWithPreset(p.secs)}
                        className="py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Time Input */}
                {!cdRunning && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Set Custom Duration</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Hours</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={cdHours}
                          onChange={(e) => { setCdHours(Number(e.target.value)); applyCustomCountdownInput(); }}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Minutes</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={cdMins}
                          onChange={(e) => { setCdMins(Number(e.target.value)); applyCustomCountdownInput(); }}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Seconds</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={cdSecs}
                          onChange={(e) => { setCdSecs(Number(e.target.value)); applyCustomCountdownInput(); }}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Big Display + Progress Bar */}
                <div className={`p-8 rounded-3xl border text-center space-y-3 relative overflow-hidden transition-all ${
                  cdFinished
                    ? 'bg-rose-500/20 border-rose-500 animate-pulse text-rose-600 dark:text-rose-400'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}>
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium px-2">
                    <span>Countdown</span>
                    <button
                      onClick={() => setCdSound(!cdSound)}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {cdSound ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                      {cdSound ? 'Sound On' : 'Muted'}
                    </button>
                  </div>

                  <div className="text-6xl font-black font-mono tracking-tight py-2">
                    {formatCdRemaining(cdRemaining)}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${cdProgressPercent}%` }}
                    />
                  </div>

                  {cdFinished && (
                    <div className="text-base font-extrabold text-rose-500 dark:text-rose-400 flex items-center justify-center gap-2 pt-2">
                      <Bell className="w-5 h-5 animate-bounce" /> Time is Up! Alarm Ringing!
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => { setCdFinished(false); setCdRunning(!cdRunning); }}
                    className={`px-8 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      cdRunning
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {cdRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {cdRunning ? 'Pause' : 'Start Timer'}
                  </button>

                  <button
                    onClick={() => addCountdownTime(60)}
                    className="px-4 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> 1 Min
                  </button>

                  <button
                    onClick={() => addCountdownTime(300)}
                    className="px-4 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> 5 Min
                  </button>

                  <button
                    onClick={resetCountdown}
                    className="px-4 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: POMODORO TIMER */}
            {timerMode === 'pomodoro' && (
              <div className="space-y-5">
                {/* Pomodoro Subtabs */}
                <div className="flex gap-2">
                  {[
                    { id: 'focus', label: '🧠 Focus (25m)', timeSecs: 1500 },
                    { id: 'shortBreak', label: '☕ Short Break (5m)', timeSecs: 300 },
                    { id: 'longBreak', label: '🌴 Long Break (15m)', timeSecs: 900 },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => switchPomoType(p.id as any)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        pomoType === p.id
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Pomodoro Display */}
                <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                    {pomoType === 'focus' ? 'Focus Session' : pomoType === 'shortBreak' ? 'Short Break' : 'Long Rest Break'}
                  </div>
                  <div className="text-6xl font-black font-mono text-white tracking-tight py-2">
                    {formatCdRemaining(pomoTime)}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400">
                    <span>🍅 Completed Today:</span> <strong>{pomoSessions} Sessions</strong>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setPomoRunning(!pomoRunning)}
                    className={`px-8 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                      pomoRunning
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {pomoRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {pomoRunning ? 'Pause Focus' : 'Start Focus'}
                  </button>

                  <button
                    onClick={() => {
                      setPomoRunning(false);
                      setPomoTime(pomoType === 'focus' ? 1500 : pomoType === 'shortBreak' ? 300 : 900);
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* UUID Generator */}
      {tool.id === 'util-uuid-gen' && (
        <div className="space-y-4 max-w-md mx-auto">
          <button onClick={generateUuids} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
            Generate 5 Batch UUID v4
          </button>
          {uuidList.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono text-indigo-700 dark:text-indigo-300">
              {uuidList.map((u, i) => <div key={i}>{u}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Color Picker */}
      {tool.id === 'util-color-picker' && (
        <div className="space-y-4 max-w-md mx-auto text-center">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-24 h-24 rounded-2xl cursor-pointer bg-transparent border-0 mx-auto" />
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-sm text-slate-900 dark:text-white">
            HEX: <span className="font-bold text-indigo-600 dark:text-indigo-400">{color.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Interactive Calendar & Event Planner */}
      {tool.id === 'util-calendar-planner' && (() => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const prevMonth = () => {
          if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear((y) => y - 1);
          } else {
            setCalendarMonth((m) => m - 1);
          }
        };

        const nextMonth = () => {
          if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear((y) => y + 1);
          } else {
            setCalendarMonth((m) => m + 1);
          }
        };

        const goToToday = () => {
          setCalendarYear(today.getFullYear());
          setCalendarMonth(today.getMonth());
          setSelectedCalDate(todayStr);
        };

        const selectedEvents = calEvents.filter((ev) => ev.dateStr === selectedCalDate);

        return (
          <div className="space-y-6">
            {/* Top Navigation & Integration Mode Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Special Day Calendar
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Integrated
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {calViewMode === 'special-app' ? 'Live Special Day Calendar WebApp' : `${monthNames[calendarMonth]} ${calendarYear} Planner`}
                  </p>
                </div>
              </div>

              {/* View Selector Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setCalViewMode('special-app')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      calViewMode === 'special-app'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> Special Day Calendar App
                  </button>
                  <button
                    onClick={() => setCalViewMode('planner')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      calViewMode === 'planner'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Event Planner Grid
                  </button>
                </div>

                <a
                  href="https://special-day-calendar.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Open Special Day Calendar in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Render Mode 1: Integrated Special Day Calendar WebApp (iframe) */}
            {calViewMode === 'special-app' && (
              <div className="space-y-3">
                <div className="relative w-full h-[680px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md">
                  <iframe
                    src="https://special-day-calendar.web.app/"
                    title="Special Day Calendar"
                    className="w-full h-full border-0"
                    allow="geolocation; microphone; camera"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span>Connected to: <strong className="text-indigo-600 dark:text-indigo-400">https://special-day-calendar.web.app/</strong></span>
                  <a
                    href="https://special-day-calendar.web.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Open directly <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Render Mode 2: Local Planner Grid */}
            {calViewMode === 'planner' && (
              <div className="space-y-6">
                {/* Calendar Month Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {monthNames[calendarMonth]} {calendarYear}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToToday}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      Today
                    </button>
                    <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-xl p-0.5">
                      <button
                        onClick={prevMonth}
                        className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        &larr; Prev
                      </button>
                      <button
                        onClick={nextMonth}
                        className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid Layout: Calendar + Side Planner */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Main Calendar Month Grid (7 cols) */}
                  <div className="md:col-span-7 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {daysOfWeek.map((day) => (
                        <span key={day} className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase py-1">
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Day Grid Cells */}
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {/* Empty cells before 1st day */}
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
                      ))}

                      {/* Month days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === selectedCalDate;
                        const dayEvs = calEvents.filter((ev) => ev.dateStr === dateStr);
                        const hasEvs = dayEvs.length > 0;

                        return (
                          <button
                            key={dayNum}
                            onClick={() => setSelectedCalDate(dateStr)}
                            className={`h-10 sm:h-12 rounded-xl relative flex flex-col items-center justify-center text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500'
                                : isToday
                                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                            }`}
                          >
                            <span>{dayNum}</span>
                            {hasEvs && (
                              <div className="flex gap-0.5 mt-0.5">
                                {dayEvs.slice(0, 3).map((ev) => (
                                  <span
                                    key={ev.id}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isSelected
                                        ? 'bg-white'
                                        : ev.category === 'Work'
                                        ? 'bg-indigo-500'
                                        : ev.category === 'Personal'
                                        ? 'bg-emerald-500'
                                        : 'bg-amber-500'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Side Event Planner Panel (5 cols) */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Agenda for {selectedCalDate}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {selectedEvents.length} Event{selectedEvents.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* Add Event Form */}
                      <form onSubmit={handleAddCalEvent} className="space-y-2">
                        <input
                          type="text"
                          placeholder="Add task or event title..."
                          value={newCalTitle}
                          onChange={(e) => setNewCalTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={newCalTime}
                            onChange={(e) => setNewCalTime(e.target.value)}
                            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                            placeholder="Time (e.g. 10:00 AM)"
                          />
                          <select
                            value={newCalCategory}
                            onChange={(e) => setNewCalCategory(e.target.value)}
                            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                          >
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Important">Important</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm"
                        >
                          + Save Event
                        </button>
                      </form>

                      {/* Events List */}
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {selectedEvents.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">No events scheduled for this day.</p>
                        ) : (
                          selectedEvents.map((ev) => (
                            <div
                              key={ev.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                            >
                              <div className="flex items-start gap-2 pr-2">
                                <input
                                  type="checkbox"
                                  checked={ev.completed}
                                  onChange={() => toggleCalEvent(ev.id)}
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <span className={`font-semibold block ${ev.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                    {ev.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> {ev.time} • <span className="font-medium text-indigo-500">{ev.category}</span>
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteCalEvent(ev.id)}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                &times;
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Scientific Calculator */}
      {(tool.id === 'util-sci-calc' || !['util-age-calc', 'util-gst-calc', 'util-emi-calc', 'util-currency-calc', 'util-password-strength', 'util-password-analyzer', 'util-unit-calc', 'util-percentage-calc', 'util-timer-stopwatch', 'util-uuid-gen', 'util-color-picker', 'util-calendar-planner'].includes(tool.id)) && (() => {
        const handleBtnClick = (val: string) => {
          if (val === 'AC') {
            setSciCalcExpr('');
            setSciCalcAns('');
          } else if (val === 'DEL') {
            setSciCalcExpr((prev) => prev.slice(0, -1));
          } else if (['sin', 'cos', 'tan', 'log', 'ln'].includes(val)) {
            setSciCalcExpr((prev) => prev + val + '(');
          } else if (val === '√') {
            setSciCalcExpr((prev) => prev + '√(');
          } else if (val === '=') {
            evalSciCalc();
          } else {
            setSciCalcExpr((prev) => prev + val);
          }
        };

        const buttons = [
          { label: 'AC', type: 'clear' },
          { label: 'DEL', type: 'clear' },
          { label: '(', type: 'op' },
          { label: ')', type: 'op' },
          { label: '÷', type: 'op' },

          { label: 'sin', type: 'func' },
          { label: 'cos', type: 'func' },
          { label: 'tan', type: 'func' },
          { label: 'π', type: 'func' },
          { label: '×', type: 'op' },

          { label: 'log', type: 'func' },
          { label: 'ln', type: 'func' },
          { label: '√', type: 'func' },
          { label: '^', type: 'func' },
          { label: '-', type: 'op' },

          { label: '7', type: 'num' },
          { label: '8', type: 'num' },
          { label: '9', type: 'num' },
          { label: 'e', type: 'func' },
          { label: '+', type: 'op' },

          { label: '4', type: 'num' },
          { label: '5', type: 'num' },
          { label: '6', type: 'num' },
          { label: '%', type: 'op' },
          { label: '=', type: 'eq' },

          { label: '1', type: 'num' },
          { label: '2', type: 'num' },
          { label: '3', type: 'num' },
          { label: '0', type: 'num' },
          { label: '.', type: 'num' },
        ];

        return (
          <div className="space-y-5 max-w-lg mx-auto">
            {/* Top Display Screen */}
            <div className="p-5 rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-700/80 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-100">Scientific Calc</span>
                  <button
                    type="button"
                    onClick={() => setSciAngleMode((m) => (m === 'deg' ? 'rad' : 'deg'))}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono text-xs font-extrabold shadow-sm hover:bg-indigo-500 transition-colors"
                  >
                    {sciAngleMode.toUpperCase()} Mode
                  </button>
                </div>
                {sciHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSciHistory([])}
                    className="text-xs font-bold text-slate-300 hover:text-white underline underline-offset-2"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {/* Expression Input Line */}
              <div className="text-base sm:text-lg font-mono text-amber-300 font-semibold tracking-wide text-right overflow-x-auto whitespace-nowrap min-h-[28px] scrollbar-none">
                {sciCalcExpr || <span className="text-slate-400 font-normal">Enter expression...</span>}
              </div>

              {/* Result Line */}
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-300 tracking-tight text-right overflow-x-auto whitespace-nowrap min-h-[44px]">
                {sciCalcAns || '0'}
              </div>
            </div>

            {/* Grid Keypad (5 columns) */}
            <div className="grid grid-cols-5 gap-2">
              {buttons.map((btn, idx) => {
                let colorStyle = '';
                if (btn.type === 'clear') {
                  colorStyle = 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/20 font-black';
                } else if (btn.type === 'func') {
                  colorStyle = 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/20 font-bold';
                } else if (btn.type === 'op') {
                  colorStyle = 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 font-extrabold';
                } else if (btn.type === 'eq') {
                  colorStyle = 'bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg shadow-md shadow-indigo-600/30 border-indigo-500';
                } else {
                  colorStyle = 'bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black border-slate-200 dark:border-slate-700/80';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleBtnClick(btn.label)}
                    className={`py-3.5 rounded-2xl border text-sm sm:text-base flex items-center justify-center transition-all active:scale-95 shadow-sm ${colorStyle}`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Action Equals Bar */}
            <button
              type="button"
              onClick={evalSciCalc}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Calculate Result (=)</span>
            </button>

            {/* Calculation History */}
            {sciHistory.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Calculation History</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {sciHistory.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSciCalcExpr(item.expr);
                        setSciCalcAns(item.ans);
                      }}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono hover:border-indigo-500 transition-colors text-left"
                    >
                      <span className="text-slate-500 truncate mr-2">{item.expr}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">={item.ans}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
};

