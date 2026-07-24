import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, Clock, DollarSign, Percent, Palette, Cpu, ShieldCheck, ArrowRightLeft, Receipt } from 'lucide-react';
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

      {/* Stopwatch */}
      {tool.id === 'util-timer-stopwatch' && (
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="text-4xl font-black font-mono text-indigo-600 dark:text-indigo-400 py-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            {Math.floor(time / 60000)}:{(Math.floor(time / 1000) % 60).toString().padStart(2, '0')}:{(Math.floor(time / 10) % 100).toString().padStart(2, '0')}
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setIsRunning(!isRunning)} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => { setIsRunning(false); setTime(0); }} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs">
              Reset
            </button>
          </div>
        </div>
      )}

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

    </div>
  );
};
