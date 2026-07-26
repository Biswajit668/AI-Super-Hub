import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, Clock, DollarSign, Percent, Palette, Cpu, ShieldCheck, ArrowRightLeft, Receipt, Eye, EyeOff, CheckCircle2, XCircle, RefreshCw, Copy, Check, ExternalLink, Globe, Sparkles, Play, Pause, RotateCcw, Flag, Timer, Hourglass, Bell, Plus, Minus, Volume2, VolumeX, CalendarDays, Gift, Scale, User, Heart, Trash2, Users, Bookmark, Home, Car, GraduationCap, Briefcase, TrendingDown, PieChart, Table } from 'lucide-react';
import { ToolItem } from '../../types';

interface UtilityToolRunnerProps {
  tool: ToolItem;
}

export const UtilityToolRunner: React.FC<UtilityToolRunnerProps> = ({ tool }) => {
  
  // 1. Advanced Age Calculator Suite State & Calculation Engine
  const [ageTab, setAgeTab] = useState<'main' | 'compare' | 'date-math' | 'saved'>('main');
  const [birthDate, setBirthDate] = useState('1998-05-15');
  const [birthTime, setBirthTime] = useState('08:30');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLiveTicking, setIsLiveTicking] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Age Comparison State
  const [person1Name, setPerson1Name] = useState('Person 1');
  const [person1Dob, setPerson1Dob] = useState('1995-03-20');
  const [person2Name, setPerson2Name] = useState('Person 2');
  const [person2Dob, setPerson2Dob] = useState('1998-08-12');

  // Date Math State
  const [baseDate, setBaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mathOp, setMathOp] = useState<'add' | 'subtract'>('add');
  const [addYears, setAddYears] = useState(1);
  const [addMonths, setAddMonths] = useState(6);
  const [addDays, setAddDays] = useState(0);

  // Saved DOBs in LocalStorage
  const [savedDobs, setSavedDobs] = useState<Array<{ id: string; label: string; dob: string }>>(() => {
    try {
      const saved = localStorage.getItem('super_hub_saved_dobs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', label: 'My Birthday', dob: '1998-05-15' },
      { id: '2', label: 'Partner / Spouse', dob: '1999-09-22' },
    ];
  });
  const [newDobLabel, setNewDobLabel] = useState('');

  // Live clock tick
  useEffect(() => {
    if (!isLiveTicking) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isLiveTicking]);

  // Persist saved DOBs
  useEffect(() => {
    try {
      localStorage.setItem('super_hub_saved_dobs', JSON.stringify(savedDobs));
    } catch (e) {}
  }, [savedDobs]);

  const handleSaveDob = () => {
    if (!newDobLabel.trim()) return;
    const item = { id: Date.now().toString(), label: newDobLabel.trim(), dob: birthDate };
    setSavedDobs((prev) => [...prev, item]);
    setNewDobLabel('');
  };

  const handleDeleteDob = (id: string) => {
    setSavedDobs((prev) => prev.filter((d) => d.id !== id));
  };

  // Helper Zodiac Sign Calculation
  const getZodiacSign = (day: number, month: number) => {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'Aries', symbol: '♈', element: 'Fire 🔥', traits: 'Bold, Ambitious, Energetic' };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'Taurus', symbol: '♉', element: 'Earth 🌿', traits: 'Reliable, Patient, Grounded' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'Gemini', symbol: '♊', element: 'Air 💨', traits: 'Adaptable, Curious, Expressive' };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'Cancer', symbol: '♋', element: 'Water 🌊', traits: 'Intuitive, Compassionate, Protective' };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'Leo', symbol: '♌', element: 'Fire 🔥', traits: 'Charismatic, Generous, Confident' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'Virgo', symbol: '♍', element: 'Earth 🌿', traits: 'Analytical, Meticulous, Helpful' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'Libra', symbol: '♎', element: 'Air 💨', traits: 'Harmonious, Diplomatic, Charming' };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'Scorpio', symbol: '♏', element: 'Water 🌊', traits: 'Passionate, Resourceful, Decisive' };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'Sagittarius', symbol: '♐', element: 'Fire 🔥', traits: 'Optimistic, Adventurous, Honest' };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'Capricorn', symbol: '♑', element: 'Earth 🌿', traits: 'Disciplined, Strategic, Resilient' };
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'Aquarius', symbol: '♒', element: 'Air 💨', traits: 'Innovative, Visionary, Independent' };
    return { name: 'Pisces', symbol: '♓', element: 'Water 🌊', traits: 'Empathetic, Artistic, Wise' };
  };

  // Comprehensive Detailed Age Calculator
  const getDetailedAge = () => {
    if (!birthDate) return null;
    const [bYear, bMonth, bDay] = birthDate.split('-').map(Number);
    const [bHour, bMin] = (birthTime || '00:00').split(':').map(Number);

    const birth = new Date(bYear, bMonth - 1, bDay, bHour, bMin, 0);

    // Target Date
    const todayStr = new Date().toISOString().split('T')[0];
    let target = new Date();

    if (targetDate && targetDate !== todayStr) {
      const [tYear, tMonth, tDay] = targetDate.split('-').map(Number);
      target = new Date(tYear, tMonth - 1, tDay, 23, 59, 59);
    } else {
      target = currentTime;
    }

    if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
      return null;
    }

    const diffMs = target.getTime() - birth.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);
    const remDaysInWeeks = totalDays % 7;
    const totalMonths = (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());

    // Exact Y, M, D, H, M, S
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();
    let hours = target.getHours() - birth.getHours();
    let minutes = target.getMinutes() - birth.getMinutes();
    let seconds = target.getSeconds() - birth.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      months--;
      const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthDays;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Born Day of Week
    const bornDayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' });

    // Zodiac
    const zodiac = getZodiacSign(bDay, bMonth);

    // Next Birthday Calculation
    const currentYear = target.getFullYear();
    let nextBdayYear = currentYear;
    const thisYearBday = new Date(currentYear, bMonth - 1, bDay, bHour, bMin, 0);

    if (target >= thisYearBday) {
      nextBdayYear = currentYear + 1;
    }

    const nextBday = new Date(nextBdayYear, bMonth - 1, bDay, bHour, bMin, 0);
    const nextBdayDiffMs = nextBday.getTime() - target.getTime();
    const nextBdayDays = Math.floor(nextBdayDiffMs / (1000 * 60 * 60 * 24));
    const nextBdayHours = Math.floor((nextBdayDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const nextBdayMinutes = Math.floor((nextBdayDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    const nextBdaySeconds = Math.floor((nextBdayDiffMs % (1000 * 60)) / 1000);
    const nextBdayDayOfWeek = nextBday.toLocaleDateString('en-US', { weekday: 'long' });
    const turningAge = nextBdayYear - bYear;

    // Planetary Ages
    const planetAges = [
      { name: 'Mercury 🪐', age: (totalDays / 87.97).toFixed(1) },
      { name: 'Venus 🌕', age: (totalDays / 224.7).toFixed(1) },
      { name: 'Mars 🔴', age: (totalDays / 686.98).toFixed(1) },
      { name: 'Jupiter 🟠', age: (totalDays / 4332.59).toFixed(1) },
      { name: 'Saturn 🪐', age: (totalDays / 10759.22).toFixed(1) },
    ];

    // Life Statistics
    const heartbeats = (totalDays * 100000).toLocaleString();
    const breaths = (totalDays * 22000).toLocaleString();
    const hoursSlept = Math.floor(totalDays * 8).toLocaleString();
    const mealsEaten = Math.floor(totalDays * 3).toLocaleString();
    const centenarianProgress = Math.min(100, Math.round((years / 100) * 100));

    return {
      years, months, days, hours, minutes, seconds,
      totalMonths, totalWeeks, remDaysInWeeks, totalDays, totalHours, totalMinutes, totalSeconds,
      bornDayOfWeek,
      zodiac,
      nextBday: {
        days: nextBdayDays,
        hours: nextBdayHours,
        minutes: nextBdayMinutes,
        seconds: nextBdaySeconds,
        dayOfWeek: nextBdayDayOfWeek,
        turningAge,
      },
      planetAges,
      lifeStats: { heartbeats, breaths, hoursSlept, mealsEaten, centenarianProgress },
    };
  };

  const currentDetailedAge = getDetailedAge();

  // Compare Ages Calculation
  const getAgeComparison = () => {
    if (!person1Dob || !person2Dob) return null;
    const p1 = new Date(person1Dob);
    const p2 = new Date(person2Dob);
    if (isNaN(p1.getTime()) || isNaN(p2.getTime())) return null;

    if (p1.getTime() === p2.getTime()) {
      return { same: true, totalDays: 0 };
    }

    const isP1Older = p1 < p2;
    const older = isP1Older ? person1Name : person2Name;
    const younger = isP1Older ? person2Name : person1Name;

    const earlier = isP1Older ? p1 : p2;
    const later = isP1Older ? p2 : p1;

    const diffMs = later.getTime() - earlier.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

    let y = later.getFullYear() - earlier.getFullYear();
    let m = later.getMonth() - earlier.getMonth();
    let d = later.getDate() - earlier.getDate();
    if (d < 0) {
      m--;
      d += new Date(later.getFullYear(), later.getMonth(), 0).getDate();
    }
    if (m < 0) {
      y--;
      m += 12;
    }

    return {
      same: false,
      older,
      younger,
      y, m, d,
      totalDays,
      totalHours,
    };
  };

  const compResult = getAgeComparison();

  // Date Math Calculation
  const getDateMathResult = () => {
    if (!baseDate) return null;
    const dt = new Date(baseDate);
    if (isNaN(dt.getTime())) return null;

    const mult = mathOp === 'add' ? 1 : -1;
    dt.setFullYear(dt.getFullYear() + (addYears * mult));
    dt.setMonth(dt.getMonth() + (addMonths * mult));
    dt.setDate(dt.getDate() + (addDays * mult));

    return {
      formatted: dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      dateStr: dt.toISOString().split('T')[0],
      dayOfWeek: dt.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  };

  const dateMathResult = getDateMathResult();

  // 2. Advanced GST & Sales Tax Calculator
  const [gstAmountInput, setGstAmountInput] = useState('1000');
  const [gstType, setGstType] = useState<'exclusive' | 'inclusive'>('exclusive'); // Exclusive (Add GST) vs Inclusive (Extract GST)
  const [gstCurrency, setGstCurrency] = useState('₹'); // Default to ₹ INR
  const [gstRate, setGstRate] = useState<number>(18);
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [customGstRateInput, setCustomGstRateInput] = useState('18');
  const [gstSupplyType, setGstSupplyType] = useState<'intra' | 'inter'>('intra'); // Intra-state (CGST+SGST) vs Inter-state (IGST)
  const [copiedGstSummary, setCopiedGstSummary] = useState(false);

  const parsedGstAmount = parseFloat(gstAmountInput) || 0;
  const activeGstRate = isCustomRate ? (parseFloat(customGstRateInput) || 0) : gstRate;

  let netGstAmount = 0;
  let taxGstAmount = 0;
  let totalGstAmount = 0;

  if (gstType === 'exclusive') {
    // Add GST to base amount
    netGstAmount = parsedGstAmount;
    taxGstAmount = (parsedGstAmount * activeGstRate) / 100;
    totalGstAmount = netGstAmount + taxGstAmount;
  } else {
    // Extract GST from gross total amount
    totalGstAmount = parsedGstAmount;
    netGstAmount = parsedGstAmount / (1 + activeGstRate / 100);
    taxGstAmount = totalGstAmount - netGstAmount;
  }

  const cgstAmount = taxGstAmount / 2;
  const sgstAmount = taxGstAmount / 2;
  const igstAmount = taxGstAmount;

  const handleCopyGstSummary = () => {
    const text = `GST Tax Invoice Breakdown:
Calculation Type: ${gstType === 'exclusive' ? 'GST Exclusive (Add Tax)' : 'GST Inclusive (Tax Included)'}
Currency: ${gstCurrency}
----------------------------------
Base Net Price: ${gstCurrency}${netGstAmount.toFixed(2)}
GST Tax Rate: ${activeGstRate}%
${gstSupplyType === 'intra' 
  ? `CGST (${activeGstRate / 2}%): ${gstCurrency}${cgstAmount.toFixed(2)}\nSGST (${activeGstRate / 2}%): ${gstCurrency}${sgstAmount.toFixed(2)}`
  : `IGST (${activeGstRate}%): ${gstCurrency}${igstAmount.toFixed(2)}`}
Total Tax Amount: ${gstCurrency}${taxGstAmount.toFixed(2)}
----------------------------------
Final Total Amount: ${gstCurrency}${totalGstAmount.toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopiedGstSummary(true);
    setTimeout(() => setCopiedGstSummary(false), 2000);
  };

  // 3. Advanced Loan & EMI Calculator Suite State & Calculations
  const [emiCurrency, setEmiCurrency] = useState('₹'); // Default ₹
  const [loanPrincipalInput, setLoanPrincipalInput] = useState('500000'); // 5 Lakhs
  const [loanInterestInput, setLoanInterestInput] = useState('8.5'); // 8.5%
  const [loanTenureInput, setLoanTenureInput] = useState('5'); // 5 Years
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [extraEmiMonthlyInput, setExtraEmiMonthlyInput] = useState('0'); // Prepayment
  const [showAmortizationView, setShowAmortizationView] = useState<'summary' | 'yearly' | 'monthly'>('summary');
  const [copiedEmiSummary, setCopiedEmiSummary] = useState(false);

  const parsedPrincipal = parseFloat(loanPrincipalInput) || 0;
  const parsedInterest = parseFloat(loanInterestInput) || 0;
  const parsedTenure = parseFloat(loanTenureInput) || 0;
  const parsedExtraPayment = parseFloat(extraEmiMonthlyInput) || 0;

  const totalMonths = Math.max(1, Math.round(tenureType === 'years' ? parsedTenure * 12 : parsedTenure));
  const monthlyInterestRate = parsedInterest / 12 / 100;

  // Standard Monthly EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
  let standardEmi = 0;
  if (monthlyInterestRate === 0) {
    standardEmi = parsedPrincipal / totalMonths;
  } else {
    standardEmi = (parsedPrincipal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
  }

  if (isNaN(standardEmi) || !isFinite(standardEmi)) standardEmi = 0;

  const totalPayment = standardEmi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - parsedPrincipal);

  const principalPercent = totalPayment > 0 ? ((parsedPrincipal / totalPayment) * 100).toFixed(1) : '0';
  const interestPercent = totalPayment > 0 ? ((totalInterest / totalPayment) * 100).toFixed(1) : '0';

  // Prepayment Savings Impact Engine
  let extraMonthsNeeded = totalMonths;
  let totalInterestWithPrepayment = 0;
  let interestSavedWithPrepayment = 0;
  let monthsSavedWithPrepayment = 0;

  if (parsedExtraPayment > 0 && parsedPrincipal > 0 && standardEmi > 0) {
    let balance = parsedPrincipal;
    let mCount = 0;
    let accInterest = 0;
    const effectiveMonthlyPay = standardEmi + parsedExtraPayment;

    while (balance > 0 && mCount < totalMonths) {
      mCount++;
      const interestForMonth = balance * monthlyInterestRate;
      accInterest += interestForMonth;
      const principalForMonth = effectiveMonthlyPay - interestForMonth;
      balance -= principalForMonth;
    }

    extraMonthsNeeded = mCount;
    totalInterestWithPrepayment = accInterest;
    interestSavedWithPrepayment = Math.max(0, totalInterest - totalInterestWithPrepayment);
    monthsSavedWithPrepayment = Math.max(0, totalMonths - extraMonthsNeeded);
  }

  // Generate Amortization Schedule Data
  const getAmortizationSchedule = () => {
    let balance = parsedPrincipal;
    const monthlyList: Array<{
      month: number;
      opening: number;
      emi: number;
      principalPaid: number;
      interestPaid: number;
      closing: number;
    }> = [];

    const yearlyList: Array<{
      year: number;
      principalPaid: number;
      interestPaid: number;
      totalPaid: number;
      closingBalance: number;
    }> = [];

    let currentYearPrincipal = 0;
    let currentYearInterest = 0;

    for (let m = 1; m <= totalMonths; m++) {
      if (balance <= 0) break;
      const interestForMonth = balance * monthlyInterestRate;
      const principalForMonth = Math.min(balance, standardEmi - interestForMonth);
      const actualEmi = principalForMonth + interestForMonth;
      const closing = Math.max(0, balance - principalForMonth);

      monthlyList.push({
        month: m,
        opening: balance,
        emi: actualEmi,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        closing,
      });

      currentYearPrincipal += principalForMonth;
      currentYearInterest += interestForMonth;

      // Every 12 months or end of tenure, push yearly roll-up
      if (m % 12 === 0 || m === totalMonths) {
        yearlyList.push({
          year: Math.ceil(m / 12),
          principalPaid: currentYearPrincipal,
          interestPaid: currentYearInterest,
          totalPaid: currentYearPrincipal + currentYearInterest,
          closingBalance: closing,
        });
        currentYearPrincipal = 0;
        currentYearInterest = 0;
      }

      balance = closing;
    }

    return { monthlyList, yearlyList };
  };

  const { monthlyList: monthlyAmortization, yearlyList: yearlyAmortization } = getAmortizationSchedule();

  const handleApplyPresetLoan = (type: 'home' | 'car' | 'personal' | 'education') => {
    if (type === 'home') {
      setLoanPrincipalInput('2500000'); // 25 Lakhs
      setLoanInterestInput('8.5');
      setLoanTenureInput('20');
      setTenureType('years');
    } else if (type === 'car') {
      setLoanPrincipalInput('800000'); // 8 Lakhs
      setLoanInterestInput('9.2');
      setLoanTenureInput('5');
      setTenureType('years');
    } else if (type === 'personal') {
      setLoanPrincipalInput('300000'); // 3 Lakhs
      setLoanInterestInput('12.5');
      setLoanTenureInput('3');
      setTenureType('years');
    } else if (type === 'education') {
      setLoanPrincipalInput('1000000'); // 10 Lakhs
      setLoanInterestInput('10.0');
      setLoanTenureInput('7');
      setTenureType('years');
    }
  };

  const handleCopyEmiSummary = () => {
    const text = `Loan EMI Calculation Summary
Loan Amount: ${emiCurrency}${parsedPrincipal.toLocaleString()}
Interest Rate: ${parsedInterest}% per annum
Loan Tenure: ${parsedTenure} ${tenureType} (${totalMonths} months)
----------------------------------
Monthly EMI: ${emiCurrency}${Math.round(standardEmi).toLocaleString()}
Total Interest Payable: ${emiCurrency}${Math.round(totalInterest).toLocaleString()}
Total Amount Payable: ${emiCurrency}${Math.round(totalPayment).toLocaleString()}
Principal vs Interest Ratio: ${principalPercent}% / ${interestPercent}%
${parsedExtraPayment > 0 ? `----------------------------------\nWith Extra Monthly Prepayment (${emiCurrency}${parsedExtraPayment}):\nInterest Saved: ${emiCurrency}${Math.round(interestSavedWithPrepayment).toLocaleString()}\nTenure Reduced By: ${monthsSavedWithPrepayment} Months` : ''}`;

    navigator.clipboard.writeText(text);
    setCopiedEmiSummary(true);
    setTimeout(() => setCopiedEmiSummary(false), 2000);
  };

  // 4. Advanced Real-Time Live Currency Converter
  const [currAmountInput, setCurrAmountInput] = useState('100');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('INR');
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Live (Auto Updated)');
  const [copiedCurrency, setCopiedCurrency] = useState(false);

  // 25+ Comprehensive World Currencies
  const CURRENCY_LIST = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', flag: '🇳🇵' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿A' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'RO', flag: '🇴🇲' },
  ];

  const [liveRates, setLiveRates] = useState<Record<string, number>>({
    USD: 1,
    INR: 83.50,
    EUR: 0.92,
    GBP: 0.78,
    BDT: 117.20,
    AED: 3.67,
    SAR: 3.75,
    CAD: 1.36,
    AUD: 1.51,
    JPY: 156.40,
    CNY: 7.24,
    SGD: 1.35,
    MYR: 4.71,
    THB: 36.50,
    KRW: 1380.0,
    CHF: 0.90,
    PKR: 278.50,
    NPR: 133.60,
    BRL: 5.45,
    RUB: 88.20,
    ZAR: 18.20,
    TRY: 32.80,
    KWD: 0.31,
    QAR: 3.64,
    OMR: 0.38,
  });

  const fetchLiveRates = async () => {
    setIsFetchingRates(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setLiveRates((prev) => ({ ...prev, ...data.rates }));
          setLastUpdatedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (e) {
      console.warn('Using built-in fallback exchange rates');
    } finally {
      setIsFetchingRates(false);
    }
  };

  useEffect(() => {
    fetchLiveRates();
  }, []);

  const parsedCurrAmount = parseFloat(currAmountInput) || 0;
  const fromRate = liveRates[fromCurr] || 1;
  const toRate = liveRates[toCurr] || 1;

  const convertedVal = (parsedCurrAmount / fromRate) * toRate;
  const unitRate = (1 / fromRate) * toRate;
  const inverseUnitRate = (1 / toRate) * fromRate;

  const getCurrSymbol = (code: string) => {
    const item = CURRENCY_LIST.find((c) => c.code === code);
    return item ? item.symbol : '$';
  };

  const getCurrFlag = (code: string) => {
    const item = CURRENCY_LIST.find((c) => c.code === code);
    return item ? item.flag : '🌐';
  };

  const handleSwapCurrencies = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const handleCopyCurrencySummary = () => {
    const text = `${parsedCurrAmount} ${fromCurr} (${getCurrSymbol(fromCurr)}) = ${convertedVal.toFixed(2)} ${toCurr} (${getCurrSymbol(toCurr)})\nExchange Rate: 1 ${fromCurr} = ${unitRate.toFixed(4)} ${toCurr}`;
    navigator.clipboard.writeText(text);
    setCopiedCurrency(true);
    setTimeout(() => setCopiedCurrency(false), 2000);
  };

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

  // 6. Advanced Color Picker, Palette Generator & Contrast Checker Engine
  const [color, setColor] = useState('#6366f1');
  const [colorTab, setColorTab] = useState<'picker' | 'palettes' | 'mixer' | 'contrast' | 'gradient'>('picker');
  
  // Contrast Checker state
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#6366f1');
  
  // Gradient Generator state
  const [gradColor1, setGradColor1] = useState('#6366f1');
  const [gradColor2, setGradColor2] = useState('#ec4899');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');

  // Color Mixer state
  const [mixColor1, setMixColor1] = useState('#3b82f6');
  const [mixColor2, setMixColor2] = useState('#ef4444');
  const [mixRatio, setMixRatio] = useState(50); // 0% = Color1, 100% = Color2
  const [mixStepsCount, setMixStepsCount] = useState(7); // 5, 7, 9, 11 steps blend scale

  // Saved Swatches / Favorite Palettes
  const [savedSwatches, setSavedSwatches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('super_hub_color_swatches');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
  });

  const [copiedColorText, setCopiedColorText] = useState<string | null>(null);

  const handleCopyColorCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColorText(text);
    setTimeout(() => setCopiedColorText(null), 2000);
  };

  const handleSaveSwatch = (hex: string) => {
    if (!savedSwatches.includes(hex.toLowerCase())) {
      const updated = [hex.toLowerCase(), ...savedSwatches].slice(0, 24);
      setSavedSwatches(updated);
      try {
        localStorage.setItem('super_hub_color_swatches', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const handleRemoveSwatch = (hex: string) => {
    const updated = savedSwatches.filter((c) => c.toLowerCase() !== hex.toLowerCase());
    setSavedSwatches(updated);
    try {
      localStorage.setItem('super_hub_color_swatches', JSON.stringify(updated));
    } catch (e) {}
  };

  // Color Conversions Helpers
  const parseHexToRgb = (hexStr: string) => {
    let clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
    if (clean.length !== 6) clean = '6366f1';
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      hex: `#${clean.toLowerCase()}`
    };
  };

  const rgbToHexStr = (r: number, g: number, b: number) => {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [r, g, b].map((x) => clamp(x).toString(16).padStart(2, '0')).join('');
  };

  const rgbToHslObj = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgbObj = (h: number, s: number, l: number) => {
    h = (((h % 360) + 360) % 360) / 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue2rgb = (pVal: number, qVal: number, tVal: number) => {
        if (tVal < 0) tVal += 1;
        if (tVal > 1) tVal -= 1;
        if (tVal < 1/6) return pVal + (qVal - pVal) * 6 * tVal;
        if (tVal < 1/2) return qVal;
        if (tVal < 2/3) return pVal + (qVal - pVal) * (2/3 - tVal) * 6;
        return pVal;
      };
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const rgbToHsvObj = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const v = max;
    const s = max === 0 ? 0 : d / max;
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const rgbToCmykObj = (r: number, g: number, b: number) => {
    if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
    const c1 = 1 - r / 255;
    const m1 = 1 - g / 255;
    const y1 = 1 - b / 255;
    const k = Math.min(c1, Math.min(m1, y1));
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = (c1 - k) / (1 - k);
    const m = (m1 - k) / (1 - k);
    const y = (y1 - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  // Luminance & WCAG Contrast Calculation
  const getRelativeLuminanceVal = (r: number, g: number, b: number) => {
    const rs = r / 255;
    const gs = g / 255;
    const bs = b / 255;
    const R = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
    const G = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
    const B = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const getWCAGContrastRatio = (hex1: string, hex2: string) => {
    const rgb1 = parseHexToRgb(hex1);
    const rgb2 = parseHexToRgb(hex2);
    const L1 = getRelativeLuminanceVal(rgb1.r, rgb1.g, rgb1.b);
    const L2 = getRelativeLuminanceVal(rgb2.r, rgb2.g, rgb2.b);
    const brighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (brighter + 0.05) / (darker + 0.05);
  };

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

  // --- BMI CALCULATOR STATE ---
  const [bmiTab, setBmiTab] = useState<'bmi' | 'tdee' | 'ideal' | 'water'>('bmi');
  const [bmiWeight, setBmiWeight] = useState('70');
  const [bmiHeight, setBmiHeight] = useState('175');
  const [bmiUnitSystem, setBmiUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [bmiAge, setBmiAge] = useState('25');
  const [bmiGender, setBmiGender] = useState<'male' | 'female'>('male');
  const [bmiActivity, setBmiActivity] = useState<'1.2' | '1.375' | '1.55' | '1.725' | '1.9'>('1.55');
  const [bmiWaist, setBmiWaist] = useState('80');
  const [bmiNeck, setBmiNeck] = useState('38');
  const [bmiHip, setBmiHip] = useState('95');

  // --- GPA CALCULATOR STATE ---
  const [gpaTab, setGpaTab] = useState<'gpa' | 'cgpa' | 'target' | 'multisem' | 'scale'>('gpa');
  const [gpaScale, setGpaScale] = useState<'4.0' | '5.0' | '10.0'>('4.0');
  const [gpaCourses, setGpaCourses] = useState<Array<{ id: string; name: string; grade: string; credits: number }>>([
    { id: '1', name: 'Mathematics & Calculus', grade: 'A', credits: 4 },
    { id: '2', name: 'Physics & Optics', grade: 'A-', credits: 3 },
    { id: '3', name: 'Data Structures & Algorithms', grade: 'A', credits: 4 },
    { id: '4', name: 'Technical English', grade: 'B+', credits: 3 },
  ]);
  const [cgpaPrevious, setCgpaPrevious] = useState('3.45');
  const [cgpaPrevCredits, setCgpaPrevCredits] = useState('45');
  const [targetCGPA, setTargetCGPA] = useState('3.70');
  const [remainingCredits, setRemainingCredits] = useState('30');
  const [gpaSemesters, setGpaSemesters] = useState<Array<{ id: string; name: string; gpa: string; credits: string }>>([
    { id: '1', name: 'Semester 1 (Fall)', gpa: '3.60', credits: '18' },
    { id: '2', name: 'Semester 2 (Spring)', gpa: '3.80', credits: '20' },
    { id: '3', name: 'Semester 3 (Fall)', gpa: '3.50', credits: '19' },
    { id: '4', name: 'Semester 4 (Spring)', gpa: '3.75', credits: '18' },
  ]);

  // --- DISCOUNT CALCULATOR STATE ---
  const [discTab, setDiscTab] = useState<'discount' | 'bogo' | 'reverse' | 'compare'>('discount');
  const [discCurrency, setDiscCurrency] = useState<string>('₹');
  const [discPrice, setDiscPrice] = useState('1200');
  const [discPercent, setDiscPercent] = useState('20');
  const [discExtraPercent, setDiscExtraPercent] = useState('10');
  const [discTax, setDiscTax] = useState('5');
  const [discQty, setDiscQty] = useState('1');

  // BOGO
  const [bogoBuyQty, setBogoBuyQty] = useState('2');
  const [bogoGetQty, setBogoGetQty] = useState('1');
  const [bogoDiscountPct, setBogoDiscountPct] = useState('100');
  const [bogoPrice, setBogoPrice] = useState('500');

  // Reverse Discount
  const [revFinalPrice, setRevFinalPrice] = useState('960');
  const [revDiscPercent, setRevDiscPercent] = useState('20');

  // Compare Items
  const [compItemA, setCompItemA] = useState({ name: 'Option A (Pack 1)', price: '250', qty: '500', unit: 'g' });
  const [compItemB, setCompItemB] = useState({ name: 'Option B (Bulk Pack)', price: '420', qty: '1000', unit: 'g' });

  // 9. Universal Multi-Unit Converter
  type UnitCategoryType = 'length' | 'weight' | 'temp' | 'area' | 'volume' | 'speed' | 'data' | 'time';

  const [unitCategory, setUnitCategory] = useState<UnitCategoryType>('length');
  const [unitInputVal, setUnitInputVal] = useState<string>('10');
  const [unitFrom, setUnitFrom] = useState<string>('m');
  const [unitTo, setUnitTo] = useState<string>('ft');
  const [copiedUnitSummary, setCopiedUnitSummary] = useState<boolean>(false);

  const UNIT_SPECS: Record<
    UnitCategoryType,
    {
      label: string;
      defaultFrom: string;
      defaultTo: string;
      units: Array<{ code: string; name: string; factor?: number }>;
    }
  > = {
    length: {
      label: 'Length',
      defaultFrom: 'm',
      defaultTo: 'ft',
      units: [
        { code: 'm', name: 'Meters (m)', factor: 1 },
        { code: 'km', name: 'Kilometers (km)', factor: 1000 },
        { code: 'cm', name: 'Centimeters (cm)', factor: 0.01 },
        { code: 'mm', name: 'Millimeters (mm)', factor: 0.001 },
        { code: 'ft', name: 'Feet (ft)', factor: 0.3048 },
        { code: 'in', name: 'Inches (in)', factor: 0.0254 },
        { code: 'yd', name: 'Yards (yd)', factor: 0.9144 },
        { code: 'mi', name: 'Miles (mi)', factor: 1609.344 },
        { code: 'nmi', name: 'Nautical Miles (nmi)', factor: 1852 },
      ],
    },
    weight: {
      label: 'Weight / Mass',
      defaultFrom: 'kg',
      defaultTo: 'lb',
      units: [
        { code: 'kg', name: 'Kilograms (kg)', factor: 1 },
        { code: 'g', name: 'Grams (g)', factor: 0.001 },
        { code: 'mg', name: 'Milligrams (mg)', factor: 0.000001 },
        { code: 'lb', name: 'Pounds (lb)', factor: 0.45359237 },
        { code: 'oz', name: 'Ounces (oz)', factor: 0.028349523 },
        { code: 't', name: 'Metric Tonnes (t)', factor: 1000 },
        { code: 'ct', name: 'Carats (ct)', factor: 0.0002 },
      ],
    },
    temp: {
      label: 'Temperature',
      defaultFrom: 'C',
      defaultTo: 'F',
      units: [
        { code: 'C', name: 'Celsius (°C)' },
        { code: 'F', name: 'Fahrenheit (°F)' },
        { code: 'K', name: 'Kelvin (K)' },
        { code: 'R', name: 'Rankine (°R)' },
      ],
    },
    area: {
      label: 'Area',
      defaultFrom: 'm2',
      defaultTo: 'ft2',
      units: [
        { code: 'm2', name: 'Square Meters (m²)', factor: 1 },
        { code: 'ft2', name: 'Square Feet (ft²)', factor: 0.092903 },
        { code: 'ac', name: 'Acres (ac)', factor: 4046.85642 },
        { code: 'ha', name: 'Hectares (ha)', factor: 10000 },
        { code: 'km2', name: 'Square Kilometers (km²)', factor: 1000000 },
        { code: 'mi2', name: 'Square Miles (mi²)', factor: 2589988.11 },
      ],
    },
    volume: {
      label: 'Volume',
      defaultFrom: 'L',
      defaultTo: 'gal',
      units: [
        { code: 'L', name: 'Liters (L)', factor: 1 },
        { code: 'mL', name: 'Milliliters (mL)', factor: 0.001 },
        { code: 'm3', name: 'Cubic Meters (m³)', factor: 1000 },
        { code: 'gal', name: 'Gallons US (gal)', factor: 3.78541178 },
        { code: 'fl_oz', name: 'Fluid Ounces US (fl oz)', factor: 0.0295735 },
        { code: 'cup', name: 'Cups US (cup)', factor: 0.24 },
      ],
    },
    speed: {
      label: 'Speed',
      defaultFrom: 'km/h',
      defaultTo: 'mph',
      units: [
        { code: 'km/h', name: 'Kilometers/hour (km/h)', factor: 0.277777778 },
        { code: 'm/s', name: 'Meters/second (m/s)', factor: 1 },
        { code: 'mph', name: 'Miles/hour (mph)', factor: 0.44704 },
        { code: 'kn', name: 'Knots (kn)', factor: 0.514444 },
      ],
    },
    data: {
      label: 'Data Storage',
      defaultFrom: 'GB',
      defaultTo: 'MB',
      units: [
        { code: 'B', name: 'Bytes (B)', factor: 1 },
        { code: 'KB', name: 'Kilobytes (KB)', factor: 1024 },
        { code: 'MB', name: 'Megabytes (MB)', factor: 1048576 },
        { code: 'GB', name: 'Gigabytes (GB)', factor: 1073741824 },
        { code: 'TB', name: 'Terabytes (TB)', factor: 1099511627776 },
        { code: 'PB', name: 'Petabytes (PB)', factor: 1125899906842624 },
      ],
    },
    time: {
      label: 'Time',
      defaultFrom: 'hr',
      defaultTo: 'min',
      units: [
        { code: 's', name: 'Seconds (s)', factor: 1 },
        { code: 'min', name: 'Minutes (min)', factor: 60 },
        { code: 'hr', name: 'Hours (hr)', factor: 3600 },
        { code: 'd', name: 'Days (d)', factor: 86400 },
        { code: 'wk', name: 'Weeks (wk)', factor: 604800 },
        { code: 'yr', name: 'Years (yr - 365d)', factor: 31536000 },
      ],
    },
  };

  const handleSelectUnitCategory = (cat: UnitCategoryType) => {
    setUnitCategory(cat);
    setUnitFrom(UNIT_SPECS[cat].defaultFrom);
    setUnitTo(UNIT_SPECS[cat].defaultTo);
  };

  const calculateUnitConversion = (val: number, from: string, to: string, cat: UnitCategoryType): number => {
    if (isNaN(val)) return 0;
    if (from === to) return val;

    if (cat === 'temp') {
      let celsius = val;
      if (from === 'F') celsius = ((val - 32) * 5) / 9;
      else if (from === 'K') celsius = val - 273.15;
      else if (from === 'R') celsius = ((val - 491.67) * 5) / 9;

      if (to === 'C') return celsius;
      if (to === 'F') return (celsius * 9) / 5 + 32;
      if (to === 'K') return celsius + 273.15;
      if (to === 'R') return ((celsius + 273.15) * 9) / 5;
      return celsius;
    }

    const categoryUnits = UNIT_SPECS[cat].units;
    const fromUnitObj = categoryUnits.find((u) => u.code === from);
    const toUnitObj = categoryUnits.find((u) => u.code === to);

    if (!fromUnitObj?.factor || !toUnitObj?.factor) return val;

    const baseValue = val * fromUnitObj.factor;
    return baseValue / toUnitObj.factor;
  };

  const formatUnitNumber = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) return '0';
    if (Math.abs(num) >= 1e9 || (Math.abs(num) < 0.00001 && num !== 0)) {
      return num.toExponential(4);
    }
    return parseFloat(num.toFixed(6)).toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const parsedUnitVal = parseFloat(unitInputVal) || 0;
  const convertedUnitResult = calculateUnitConversion(parsedUnitVal, unitFrom, unitTo, unitCategory);

  const getUnitName = (code: string, cat: UnitCategoryType) => {
    const item = UNIT_SPECS[cat].units.find((u) => u.code === code);
    return item ? item.name : code;
  };

  const handleSwapUnits = () => {
    setUnitFrom(unitTo);
    setUnitTo(unitFrom);
  };

  const handleCopyUnitSummary = () => {
    const text = `${parsedUnitVal} ${getUnitName(unitFrom, unitCategory)} = ${formatUnitNumber(convertedUnitResult)} ${getUnitName(unitTo, unitCategory)}`;
    navigator.clipboard.writeText(text);
    setCopiedUnitSummary(true);
    setTimeout(() => setCopiedUnitSummary(false), 2000);
  };

  // 10. Advanced Percentage & Growth Calculator Suite
  type PercModeType = 'change' | 'of_number' | 'increase_decrease' | 'reverse' | 'margin';
  const [percMode, setPercMode] = useState<PercModeType>('change');

  // Mode 1: Percentage Change (Initial to Final)
  const [percInitialInput, setPercInitialInput] = useState('100');
  const [percFinalInput, setPercFinalInput] = useState('125');

  // Mode 2: % of Number
  const [percXInput, setPercXInput] = useState('20');
  const [percYInput, setPercYInput] = useState('250');

  // Mode 3: Add / Subtract %
  const [percAmountInput, setPercAmountInput] = useState('500');
  const [percRateInput, setPercRateInput] = useState('15');

  // Mode 4: Reverse Percentage
  const [percFinalValInput, setPercFinalValInput] = useState('120');
  const [percReverseRateInput, setPercReverseRateInput] = useState('20');
  const [percReverseDirection, setPercReverseDirection] = useState<'increase' | 'decrease'>('increase');

  // Mode 5: Profit Margin & Markup
  const [percCostInput, setPercCostInput] = useState('80');
  const [percSellingInput, setPercSellingInput] = useState('100');

  const [copiedPercSummary, setCopiedPercSummary] = useState(false);

  // Calculations:
  // 1. Percentage Change
  const initialVal = parseFloat(percInitialInput) || 0;
  const finalVal = parseFloat(percFinalInput) || 0;
  const changeDiff = finalVal - initialVal;
  const percentChangeVal = initialVal !== 0 ? ((changeDiff / Math.abs(initialVal)) * 100) : 0;
  const multiplierVal = initialVal !== 0 ? finalVal / initialVal : 0;

  // 2. % of Number
  const xVal = parseFloat(percXInput) || 0;
  const yVal = parseFloat(percYInput) || 0;
  const xPercentOfY = (xVal / 100) * yVal;
  const xIsPercentOfY = yVal !== 0 ? (xVal / yVal) * 100 : 0;

  // 3. Add / Subtract %
  const amtVal = parseFloat(percAmountInput) || 0;
  const rateVal = parseFloat(percRateInput) || 0;
  const rateAmount = (amtVal * rateVal) / 100;
  const valueAfterIncrease = amtVal + rateAmount;
  const valueAfterDecrease = amtVal - rateAmount;

  // 4. Reverse %
  const reverseFinal = parseFloat(percFinalValInput) || 0;
  const reverseRate = parseFloat(percReverseRateInput) || 0;
  let reverseOriginal = 0;
  if (percReverseDirection === 'increase') {
    reverseOriginal = reverseRate !== -100 ? reverseFinal / (1 + reverseRate / 100) : 0;
  } else {
    reverseOriginal = reverseRate !== 100 ? reverseFinal / (1 - reverseRate / 100) : 0;
  }
  const reverseDiff = reverseFinal - reverseOriginal;

  // 5. Margin & Markup
  const costVal = parseFloat(percCostInput) || 0;
  const sellingVal = parseFloat(percSellingInput) || 0;
  const profitAmt = sellingVal - costVal;
  const profitMarginPercent = sellingVal !== 0 ? (profitAmt / sellingVal) * 100 : 0;
  const profitMarkupPercent = costVal !== 0 ? (profitAmt / costVal) * 100 : 0;

  const handleCopyPercSummary = () => {
    let summaryText = '';
    if (percMode === 'change') {
      summaryText = `Percentage Change Result:\nInitial Value: ${initialVal}\nFinal Value: ${finalVal}\nAbsolute Difference: ${changeDiff > 0 ? '+' : ''}${changeDiff}\nPercentage Change: ${percentChangeVal > 0 ? '+' : ''}${percentChangeVal.toFixed(2)}%\nGrowth Multiplier: ${multiplierVal.toFixed(2)}x`;
    } else if (percMode === 'of_number') {
      summaryText = `Percentage Calculations:\n${xVal}% of ${yVal} = ${xPercentOfY.toFixed(2)}\n${xVal} is ${xIsPercentOfY.toFixed(2)}% of ${yVal}`;
    } else if (percMode === 'increase_decrease') {
      summaryText = `Markup & Discount Results for Base Amount ${amtVal}:\nRate: ${rateVal}%\nValue After +${rateVal}% Increase: ${valueAfterIncrease.toFixed(2)} (+${rateAmount.toFixed(2)})\nValue After -${rateVal}% Decrease: ${valueAfterDecrease.toFixed(2)} (-${rateAmount.toFixed(2)})`;
    } else if (percMode === 'reverse') {
      summaryText = `Reverse Percentage Result:\nFinal Value: ${reverseFinal}\nRate: ${reverseRate}% ${percReverseDirection}\nCalculated Original Base Value: ${reverseOriginal.toFixed(2)}`;
    } else if (percMode === 'margin') {
      summaryText = `Profit Margin & Markup Analysis:\nCost Price: ${costVal}\nSelling Price: ${sellingVal}\nProfit Amount: ${profitAmt.toFixed(2)}\nProfit Margin: ${profitMarginPercent.toFixed(2)}%\nMarkup: ${profitMarkupPercent.toFixed(2)}%`;
    }

    navigator.clipboard.writeText(summaryText);
    setCopiedPercSummary(true);
    setTimeout(() => setCopiedPercSummary(false), 2000);
  };

  // 10.5 Full Advanced Scientific Math Calculator Engine
  const [sciExpr, setSciExpr] = useState<string>('0');
  const [sciAngleMode, setSciAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [sciMemory, setSciMemory] = useState<number>(0);
  const [sciLastAns, setSciLastAns] = useState<string>('0');
  const [sciShift, setSciShift] = useState<boolean>(false);
  const [sciTab, setSciTab] = useState<'calc' | 'history' | 'formulas'>('calc');
  const [copiedSciRes, setCopiedSciRes] = useState<boolean>(false);
  const [sciHistory, setSciHistory] = useState<Array<{ id: string; expr: string; res: string; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem('super_hub_sci_calc_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', expr: 'sin(45) * √(2) + 10^2', res: '101', timestamp: '10:15 AM' },
      { id: '2', expr: 'log(1000) * ln(e)', res: '3', timestamp: '10:18 AM' },
    ];
  });

  const evaluateSciExpr = (exprString: string, mode: 'DEG' | 'RAD', ansVal: string): string => {
    if (!exprString || exprString.trim() === '') return '0';
    try {
      let sanitized = exprString
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      // Replace ANS with (ansVal) safely
      const cleanAns = (ansVal && ansVal !== 'Error') ? `(${ansVal})` : '0';

      // Insert implicit multiplication before & after ANS: e.g. 10ANS -> 10*ANS, )ANS -> )*ANS
      sanitized = sanitized.replace(/(\d|\)|π|e|%)\s*ANS\b/gi, `$1*${cleanAns}`);
      sanitized = sanitized.replace(/\bANS\b\s*(\d|\(|π|e|sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs)/gi, `${cleanAns}*$1`);
      sanitized = sanitized.replace(/\bANS\b/gi, cleanAns);

      // Handle %: 50% -> (50/100)
      sanitized = sanitized.replace(/(\d+(\.\d+)?|\)|π|e)\s*%/g, '($1/100)');

      // Implicit multiplication for π and e
      sanitized = sanitized.replace(/(\d|\)|%)\s*π/g, '$1*π');
      sanitized = sanitized.replace(/π\s*(\d|\(|sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|e)/g, 'π*$1');
      sanitized = sanitized.replace(/(\d|\)|%)\s*e\b/gi, '$1*e');
      sanitized = sanitized.replace(/\be\b\s*(\d|\(|sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|π)/gi, 'e*$1');

      // Replace symbols
      sanitized = sanitized
        .replace(/π/g, 'Math.PI')
        .replace(/√\(/g, 'sqrt(')
        .replace(/∛\(/g, 'cbrt(')
        .replace(/\^/g, '**');

      // Implicit multiplication before opening parenthesis `(`
      // e.g. 13(5*5) -> 13*(5*5), )( -> )*(, Math.PI( -> Math.PI*(
      sanitized = sanitized.replace(/(\d+(\.\d+)?|\)|Math\.PI|Math\.E)%?\s*\(/g, '$1*(');

      // Implicit multiplication between closing parenthesis `)` and a number or function name
      // e.g. (5)10 -> (5)*10, (5)sin(30) -> (5)*sin(30)
      sanitized = sanitized.replace(/\)\s*(\d+(\.\d+)?)/g, ')*$1');
      sanitized = sanitized.replace(/\)\s*(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|fact)\b/g, ')*$1');

      // Implicit multiplication before function names e.g. 10sin(30) -> 10*sin(30)
      sanitized = sanitized.replace(/(\d+(\.\d+)?)\s*(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt|abs|fact)\b/g, '$1*$3');

      // Factorial: n! -> fact(n)
      sanitized = sanitized.replace(/(\d+(\.\d+)?|\([^\)]+\)|Math\.PI|Math\.E)!/g, 'fact($1)');

      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const toDeg = (rad: number) => (rad * 180) / Math.PI;

      const sin = (x: number) => Math.sin(mode === 'DEG' ? toRad(x) : x);
      const cos = (x: number) => Math.cos(mode === 'DEG' ? toRad(x) : x);
      const tan = (x: number) => Math.tan(mode === 'DEG' ? toRad(x) : x);
      const asin = (x: number) => (mode === 'DEG' ? toDeg(Math.asin(x)) : Math.asin(x));
      const acos = (x: number) => (mode === 'DEG' ? toDeg(Math.acos(x)) : Math.acos(x));
      const atan = (x: number) => (mode === 'DEG' ? toDeg(Math.atan(x)) : Math.atan(x));

      const log = (x: number) => Math.log10(x);
      const ln = (x: number) => Math.log(x);
      const sqrt = (x: number) => Math.sqrt(x);
      const cbrt = (x: number) => Math.cbrt(x);
      const fact = (n: number) => {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let r = 1;
        for (let i = 2; i <= Math.min(n, 170); i++) r *= i;
        return r;
      };
      const abs = (x: number) => Math.abs(x);

      // Evaluate safely
      const fn = new Function(
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'log', 'ln', 'sqrt', 'cbrt', 'fact', 'abs', 'e',
        `return ${sanitized};`
      );

      const val = fn(sin, cos, tan, asin, acos, atan, log, ln, sqrt, cbrt, fact, abs, Math.E);

      if (typeof val === 'number') {
        if (isNaN(val)) return 'Error';
        if (!isFinite(val)) return 'Infinity';
        if (Math.abs(val) < 1e-11 && val !== 0) return '0';
        return parseFloat(val.toFixed(10)).toString();
      }
      return 'Error';
    } catch (err) {
      return 'Error';
    }
  };

  const handleSciInput = (btn: string) => {
    if (btn === 'AC') {
      setSciExpr('0');
      return;
    }
    if (btn === '⌫') {
      if (sciExpr.length <= 1 || sciExpr === '0' || sciExpr === 'Error') {
        setSciExpr('0');
      } else {
        setSciExpr(sciExpr.slice(0, -1));
      }
      return;
    }
    if (btn === '=') {
      const result = evaluateSciExpr(sciExpr, sciAngleMode, sciLastAns);
      if (result !== 'Error') {
        setSciLastAns(result);
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newHist = [{ id: Date.now().toString(), expr: sciExpr, res: result, timestamp: timeStr }, ...sciHistory].slice(0, 30);
        setSciHistory(newHist);
        try {
          localStorage.setItem('super_hub_sci_calc_history', JSON.stringify(newHist));
        } catch (e) {}
        setSciExpr(result);
      }
      return;
    }

    if (btn === 'MC') { setSciMemory(0); return; }
    if (btn === 'MR') { setSciExpr(sciExpr === '0' ? sciMemory.toString() : sciExpr + sciMemory.toString()); return; }
    if (btn === 'MS') {
      const cur = parseFloat(evaluateSciExpr(sciExpr, sciAngleMode, sciLastAns));
      if (!isNaN(cur)) setSciMemory(cur);
      return;
    }
    if (btn === 'M+') {
      const cur = parseFloat(evaluateSciExpr(sciExpr, sciAngleMode, sciLastAns));
      if (!isNaN(cur)) setSciMemory(m => m + cur);
      return;
    }
    if (btn === 'M-') {
      const cur = parseFloat(evaluateSciExpr(sciExpr, sciAngleMode, sciLastAns));
      if (!isNaN(cur)) setSciMemory(m => m - cur);
      return;
    }

    // Append to expression
    if (sciExpr === '0' || sciExpr === 'Error') {
      if (['+', '×', '÷', '^', '%'].includes(btn)) {
        setSciExpr('0' + btn);
      } else {
        setSciExpr(btn);
      }
    } else {
      setSciExpr(sciExpr + btn);
    }
  };

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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-xl space-y-6">
      
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tool.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      {/* Advanced Age Calculator Suite */}
      {tool.id === 'util-age-calc' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto scrollbar-none gap-1">
            <button
              onClick={() => setAgeTab('main')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition shrink-0 ${
                ageTab === 'main'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Exact Age & Stats</span>
            </button>
            <button
              onClick={() => setAgeTab('compare')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition shrink-0 ${
                ageTab === 'compare'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Compare Ages</span>
            </button>
            <button
              onClick={() => setAgeTab('date-math')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition shrink-0 ${
                ageTab === 'date-math'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Date Math (+/-)</span>
            </button>
            <button
              onClick={() => setAgeTab('saved')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition shrink-0 ${
                ageTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved ({savedDobs.length})</span>
            </button>
          </div>

          {/* TAB 1: EXACT AGE & STATS */}
          {ageTab === 'main' && (
            <div className="space-y-6">
              {/* Inputs Controls Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Time of Birth (Optional)
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Calculate Age As Of
                      </label>
                      <button
                        type="button"
                        onClick={() => setTargetDate(new Date().toISOString().split('T')[0])}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Reset Today
                      </button>
                    </div>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-end pb-1 justify-between flex-wrap gap-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isLiveTicking}
                        onChange={(e) => setIsLiveTicking(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Live Ticking Seconds</span>
                    </label>

                    {/* Save DOB Quick Action */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Label (e.g. Me)"
                        value={newDobLabel}
                        onChange={(e) => setNewDobLabel(e.target.value)}
                        className="w-24 px-2 py-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleSaveDob}
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                        title="Save DOB"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRIMARY AGE HERO DISPLAY CARD */}
              {currentDetailedAge ? (
                <div className="space-y-5">
                  <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 text-white shadow-2xl text-center space-y-3">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Born on {currentDetailedAge.bornDayOfWeek}</span>
                    </div>

                    {/* Major Age Counter */}
                    <div className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                      {currentDetailedAge.years}{' '}
                      <span className="text-indigo-300 text-xl sm:text-2xl font-bold">Years</span>,{' '}
                      {currentDetailedAge.months}{' '}
                      <span className="text-indigo-300 text-xl sm:text-2xl font-bold">Months</span>,{' '}
                      {currentDetailedAge.days}{' '}
                      <span className="text-indigo-300 text-xl sm:text-2xl font-bold">Days</span>
                    </div>

                    {/* Live Ticking Time Sub-Counter */}
                    <div className="pt-1 flex items-center justify-center gap-2 text-xs font-mono font-bold text-amber-300">
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>
                        {String(currentDetailedAge.hours).padStart(2, '0')}h :{' '}
                        {String(currentDetailedAge.minutes).padStart(2, '0')}m :{' '}
                        {String(currentDetailedAge.seconds).padStart(2, '0')}s
                      </span>
                    </div>

                    {/* Zodiac Badge */}
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                      <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-200 font-extrabold flex items-center gap-1.5">
                        <span className="text-base">{currentDetailedAge.zodiac.symbol}</span>
                        <span>{currentDetailedAge.zodiac.name} ({currentDetailedAge.zodiac.element})</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 italic text-[11px]">
                        "{currentDetailedAge.zodiac.traits}"
                      </span>
                    </div>
                  </div>

                  {/* NEXT BIRTHDAY COUNTDOWN CARD */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                        <Gift className="w-4 h-4" />
                        <span>Next Birthday Countdown</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Turning <strong className="text-amber-600 dark:text-amber-400">{currentDetailedAge.nextBday.turningAge}</strong> Years
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{currentDetailedAge.nextBday.days}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Days</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{currentDetailedAge.nextBday.hours}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Hours</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{currentDetailedAge.nextBday.minutes}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Mins</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">{currentDetailedAge.nextBday.seconds}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Secs</div>
                      </div>
                    </div>

                    <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                      Your next birthday falls on a <strong className="text-slate-900 dark:text-white">{currentDetailedAge.nextBday.dayOfWeek}</strong> 🎉
                    </p>
                  </div>

                  {/* TOTAL BREAKDOWN GRID */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Total Time Lived Breakdown
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500 block">Total Months</span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{currentDetailedAge.totalMonths.toLocaleString()} Months</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500 block">Total Weeks</span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{currentDetailedAge.totalWeeks.toLocaleString()} Wks, {currentDetailedAge.remDaysInWeeks} Days</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500 block">Total Days</span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{currentDetailedAge.totalDays.toLocaleString()} Days</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500 block">Total Hours</span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{currentDetailedAge.totalHours.toLocaleString()} Hours</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500 block">Total Minutes</span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{currentDetailedAge.totalMinutes.toLocaleString()} Mins</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500 block">Total Seconds</span>
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">{currentDetailedAge.totalSeconds.toLocaleString()} Secs</span>
                      </div>
                    </div>
                  </div>

                  {/* PLANETARY AGE EQUIVALENTS */}
                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      <Globe className="w-4 h-4" />
                      <span>Your Age on Other Planets</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      {currentDetailedAge.planetAges.map((planet) => (
                        <div key={planet.name} className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{planet.name}</div>
                          <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1">{planet.age} <span className="text-[10px] font-bold text-slate-400">Yrs</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FUN HEALTH & LIFE METRICS */}
                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      <Heart className="w-4 h-4 animate-pulse" />
                      <span>Estimated Life Milestones</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Heartbeats</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{currentDetailedAge.lifeStats.heartbeats}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Breaths Taken</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{currentDetailedAge.lifeStats.breaths}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Hours Slept</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{currentDetailedAge.lifeStats.hoursSlept}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Meals Eaten</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{currentDetailedAge.lifeStats.mealsEaten}</div>
                      </div>
                    </div>

                    {/* Centenarian Century Progress Bar */}
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <span>Progress to 100 Years (Centenarian)</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{currentDetailedAge.lifeStats.centenarianProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-300"
                          style={{ width: `${currentDetailedAge.lifeStats.centenarianProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-center text-xs text-rose-600 dark:text-rose-400 font-bold">
                  Target date must be after Date of Birth!
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPARE AGES */}
          {ageTab === 'compare' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Person 1
                    </h4>
                    <input
                      type="text"
                      value={person1Name}
                      onChange={(e) => setPerson1Name(e.target.value)}
                      placeholder="Name"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    <input
                      type="date"
                      value={person1Dob}
                      onChange={(e) => setPerson1Dob(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Person 2
                    </h4>
                    <input
                      type="text"
                      value={person2Name}
                      onChange={(e) => setPerson2Name(e.target.value)}
                      placeholder="Name"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    <input
                      type="date"
                      value={person2Dob}
                      onChange={(e) => setPerson2Dob(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {compResult ? (
                compResult.same ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-center text-sm font-black text-emerald-800 dark:text-emerald-300">
                    🎉 Both persons were born on the exact same date!
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-center space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
                      <Users className="w-4 h-4" />
                      <span>{compResult.older} is OLDER than {compResult.younger}</span>
                    </div>

                    <div className="text-2xl sm:text-4xl font-black text-indigo-950 dark:text-white">
                      {compResult.y} Years, {compResult.m} Months, {compResult.d} Days
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Exact Difference: <strong className="text-indigo-600 dark:text-indigo-400">{compResult.totalDays.toLocaleString()} Days</strong> ({compResult.totalHours.toLocaleString()} Hours)
                    </p>
                  </div>
                )
              ) : null}
            </div>
          )}

          {/* TAB 3: DATE MATH (+/-) */}
          {ageTab === 'date-math' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Base Date
                  </label>
                  <input
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMathOp('add')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                      mathOp === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> Add Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setMathOp('subtract')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                      mathOp === 'subtract'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Minus className="w-4 h-4" /> Subtract Time
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Years</label>
                    <input
                      type="number"
                      min="0"
                      value={addYears}
                      onChange={(e) => setAddYears(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Months</label>
                    <input
                      type="number"
                      min="0"
                      value={addMonths}
                      onChange={(e) => setAddMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Days</label>
                    <input
                      type="number"
                      min="0"
                      value={addDays}
                      onChange={(e) => setAddDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {dateMathResult && (
                <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Calculated Target Date</span>
                  <div className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-white">
                    {dateMathResult.formatted}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">ISO Date: {dateMathResult.dateStr}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED BIRTHDAYS */}
          {ageTab === 'saved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved Birthdays List</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{savedDobs.length} Saved</span>
              </div>

              {savedDobs.length === 0 ? (
                <p className="text-xs text-center py-8 text-slate-400 italic">No saved birthdays yet. Enter a DOB in main tab and click save!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedDobs.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.dob}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setBirthDate(item.dob);
                            setAgeTab('main');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold"
                        >
                          Use
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDob(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GST / Sales Tax Calculator */}
      {tool.id === 'util-gst-calc' && (
        <div className="space-y-6 max-w-xl mx-auto">
          {/* Top Config Row: Exclusive/Inclusive Mode & Currency Picker */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            {/* Calculation Mode Toggle */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Calculation Mode
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setGstType('exclusive')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    gstType === 'exclusive'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>GST Exclusive (Add Tax)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGstType('inclusive')}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    gstType === 'inclusive'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>GST Inclusive (Remove Tax)</span>
                </button>
              </div>
            </div>

            {/* Currency & Base Amount Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Currency Picker */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Currency Symbol
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold">
                  {['₹', '$', '€', '£', '৳'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setGstCurrency(curr)}
                      className={`flex-1 py-1.5 rounded-lg transition ${
                        gstCurrency === curr
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input (String-handled so 0 can be completely deleted) */}
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {gstType === 'exclusive' ? 'Net Base Amount' : 'Total Gross Amount'} ({gstCurrency})
                  </label>
                  {gstAmountInput !== '' && (
                    <button
                      type="button"
                      onClick={() => setGstAmountInput('')}
                      className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                      Clear Amount
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {gstCurrency}
                  </span>
                  <input
                    type="number"
                    value={gstAmountInput}
                    onChange={(e) => setGstAmountInput(e.target.value)}
                    placeholder="Enter amount (e.g. 1000)"
                    className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* GST Rate Preset Slabs */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                GST / Sales Tax Rate (%)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[0, 3, 5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setGstRate(rate);
                      setIsCustomRate(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      !isCustomRate && gstRate === rate
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomRate(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                    isCustomRate
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Custom %
                </button>

                {isCustomRate && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={customGstRateInput}
                      onChange={(e) => setCustomGstRateInput(e.target.value)}
                      placeholder="Rate %"
                      className="w-20 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-400 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Indian GST Supply Type Split (CGST/SGST vs IGST) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Tax Breakdown Type (Supply Region)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setGstSupplyType('intra')}
                  className={`py-1.5 px-3 rounded-xl border text-left transition ${
                    gstSupplyType === 'intra'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-extrabold">Intra-State Supply</div>
                  <div className="text-[10px] font-normal opacity-80">CGST ({activeGstRate / 2}%) + SGST ({activeGstRate / 2}%)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setGstSupplyType('inter')}
                  className={`py-1.5 px-3 rounded-xl border text-left transition ${
                    gstSupplyType === 'inter'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-extrabold">Inter-State Supply</div>
                  <div className="text-[10px] font-normal opacity-80">IGST ({activeGstRate}%)</div>
                </button>
              </div>
            </div>
          </div>

          {/* RESULTS TAX BREAKDOWN CARD */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Tax Calculation Summary
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyGstSummary}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm"
                >
                  {copiedGstSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGstSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* Main Totals Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Base Net Price</span>
                  <span className="text-lg font-black text-slate-100 mt-0.5 block">
                    {gstCurrency}{netGstAmount.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold uppercase text-amber-300 block">Total GST ({activeGstRate}%)</span>
                  <span className="text-lg font-black text-amber-400 mt-0.5 block">
                    + {gstCurrency}{taxGstAmount.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase text-emerald-300 block">Final Total Price</span>
                  <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                    {gstCurrency}{totalGstAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Detailed CGST/SGST or IGST Breakdown Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-semibold">
                <span className="text-[10px] font-extrabold uppercase text-indigo-400 block mb-1">
                  Tax Breakdown Components ({gstSupplyType === 'intra' ? 'Intra-State CGST + SGST' : 'Inter-State IGST'})
                </span>

                {gstSupplyType === 'intra' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 flex justify-between items-center">
                      <span className="text-slate-400">CGST ({activeGstRate / 2}%):</span>
                      <span className="font-extrabold text-amber-300">{gstCurrency}{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 flex justify-between items-center">
                      <span className="text-slate-400">SGST ({activeGstRate / 2}%):</span>
                      <span className="font-extrabold text-amber-300">{gstCurrency}{sgstAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-800/80 flex justify-between items-center">
                    <span className="text-slate-400">Integrated GST (IGST {activeGstRate}%):</span>
                    <span className="font-extrabold text-amber-300">{gstCurrency}{igstAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Loan & EMI Calculator Suite */}
      {tool.id === 'util-emi-calc' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Quick Loan Presets */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Loan Presets
              </span>
              {/* Currency Symbol Picker */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold">
                {['₹', '$', '€', '£', '৳'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setEmiCurrency(curr)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      emiCurrency === curr
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPresetLoan('home')}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  <Home className="w-3.5 h-3.5" /> Home Loan
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">25 Lakhs @ 8.5% (20Y)</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPresetLoan('car')}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  <Car className="w-3.5 h-3.5" /> Car Loan
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">8 Lakhs @ 9.2% (5Y)</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPresetLoan('personal')}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="w-3.5 h-3.5" /> Personal Loan
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">3 Lakhs @ 12.5% (3Y)</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPresetLoan('education')}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition space-y-1 group"
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="w-3.5 h-3.5" /> Education Loan
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">10 Lakhs @ 10% (7Y)</div>
              </button>
            </div>
          </div>

          {/* INPUT FORM SLIDERS CARD */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5">
            {/* 1. Loan Amount Input + Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Loan Amount ({emiCurrency})
                </label>
                {loanPrincipalInput !== '' && (
                  <button
                    type="button"
                    onClick={() => setLoanPrincipalInput('')}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {emiCurrency}
                </span>
                <input
                  type="number"
                  value={loanPrincipalInput}
                  onChange={(e) => setLoanPrincipalInput(e.target.value)}
                  placeholder="Enter loan amount"
                  className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <input
                type="range"
                min="10000"
                max="10000000"
                step="10000"
                value={parsedPrincipal}
                onChange={(e) => setLoanPrincipalInput(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{emiCurrency}10k</span>
                <span>{emiCurrency}50 Lakhs</span>
                <span>{emiCurrency}1 Crore</span>
              </div>
            </div>

            {/* 2. Interest Rate Input + Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Annual Interest Rate (% p.a.)
                </label>
                {loanInterestInput !== '' && (
                  <button
                    type="button"
                    onClick={() => setLoanInterestInput('')}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={loanInterestInput}
                  onChange={(e) => setLoanInterestInput(e.target.value)}
                  placeholder="Enter interest rate %"
                  className="w-full pr-8 pl-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  %
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="30"
                step="0.1"
                value={parsedInterest}
                onChange={(e) => setLoanInterestInput(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>1%</span>
                <span>15%</span>
                <span>30%</span>
              </div>
            </div>

            {/* 3. Loan Tenure Input + Years/Months Toggle + Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Loan Tenure
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTenureType('years')}
                    className={`px-3 py-1 rounded-lg transition ${
                      tenureType === 'years'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenureType('months')}
                    className={`px-3 py-1 rounded-lg transition ${
                      tenureType === 'months'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Months
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={loanTenureInput}
                  onChange={(e) => setLoanTenureInput(e.target.value)}
                  placeholder={`Enter tenure in ${tenureType}`}
                  className="w-full pl-4 pr-16 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 capitalize">
                  {tenureType}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max={tenureType === 'years' ? 30 : 360}
                step="1"
                value={parsedTenure}
                onChange={(e) => setLoanTenureInput(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
            </div>

            {/* 4. Prepayment / Extra Monthly EMI Option */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" /> Extra Monthly Prepayment ({emiCurrency})
                </label>
                <span className="text-[10px] text-slate-400 italic">Optional</span>
              </div>
              <input
                type="number"
                value={extraEmiMonthlyInput}
                onChange={(e) => setExtraEmiMonthlyInput(e.target.value)}
                placeholder="0 (Optional extra monthly payment)"
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* HERO EMI CALCULATION RESULTS DISPLAY */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 text-white shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                    Monthly Installment (EMI)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmiSummary}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm"
                >
                  {copiedEmiSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmiSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* Big EMI Highlight */}
              <div className="text-center space-y-1">
                <div className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight">
                  {emiCurrency}{Math.round(standardEmi).toLocaleString()} <span className="text-sm font-bold text-indigo-200">/ month</span>
                </div>
                <div className="text-xs text-indigo-300 font-semibold">
                  For {totalMonths} Months ({parsedTenure} {tenureType})
                </div>
              </div>

              {/* Metric Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-indigo-900/60 border border-indigo-700/50">
                  <span className="text-[10px] font-bold uppercase text-indigo-300 block">Total Principal</span>
                  <span className="text-lg font-black text-slate-100 mt-0.5 block">
                    {emiCurrency}{parsedPrincipal.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[10px] font-bold uppercase text-rose-300 block">Total Interest Payable</span>
                  <span className="text-lg font-black text-rose-400 mt-0.5 block">
                    {emiCurrency}{Math.round(totalInterest).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Total Payable Row */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-300 uppercase tracking-wider">Total Payable Amount:</span>
                <span className="text-xl font-black text-emerald-400">
                  {emiCurrency}{Math.round(totalPayment).toLocaleString()}
                </span>
              </div>

              {/* Visual Principal vs Interest Split Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-extrabold text-indigo-200">
                  <span>Principal ({principalPercent}%)</span>
                  <span>Interest ({interestPercent}%)</span>
                </div>
                <div className="w-full h-3 bg-rose-500/40 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${principalPercent}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${interestPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* PREPAYMENT SAVINGS HIGHLIGHT CARD (If extra EMI added) */}
            {parsedExtraPayment > 0 && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Prepayment Impact & Savings</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Interest Saved</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {emiCurrency}{Math.round(interestSavedWithPrepayment).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Loan Shortened By</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      {monthsSavedWithPrepayment} Months ({(monthsSavedWithPrepayment / 12).toFixed(1)} Yrs)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AMORTIZATION SCHEDULE TABLE SWITCHER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Repayment Amortization Schedule
                </span>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowAmortizationView('summary')}
                    className={`px-3 py-1 rounded-lg transition ${
                      showAmortizationView === 'summary'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Hide Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAmortizationView('yearly')}
                    className={`px-3 py-1 rounded-lg transition ${
                      showAmortizationView === 'yearly'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Yearly Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAmortizationView('monthly')}
                    className={`px-3 py-1 rounded-lg transition ${
                      showAmortizationView === 'monthly'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* YEARLY SCHEDULE TABLE */}
              {showAmortizationView === 'yearly' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-80 overflow-y-auto scrollbar-thin">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Year</th>
                        <th className="p-3">Principal Paid</th>
                        <th className="p-3">Interest Paid</th>
                        <th className="p-3">Total Paid</th>
                        <th className="p-3">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
                      {yearlyAmortization.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">Year {row.year}</td>
                          <td className="p-3">{emiCurrency}{Math.round(row.principalPaid).toLocaleString()}</td>
                          <td className="p-3 text-rose-500">{emiCurrency}{Math.round(row.interestPaid).toLocaleString()}</td>
                          <td className="p-3 font-bold">{emiCurrency}{Math.round(row.totalPaid).toLocaleString()}</td>
                          <td className="p-3 font-mono">{emiCurrency}{Math.round(row.closingBalance).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MONTHLY SCHEDULE TABLE */}
              {showAmortizationView === 'monthly' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-80 overflow-y-auto scrollbar-thin">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2.5">Month</th>
                        <th className="p-2.5">Opening</th>
                        <th className="p-2.5">EMI</th>
                        <th className="p-2.5">Principal</th>
                        <th className="p-2.5">Interest</th>
                        <th className="p-2.5">Closing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-[11px]">
                      {monthlyAmortization.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">M{row.month}</td>
                          <td className="p-2.5 font-mono">{emiCurrency}{Math.round(row.opening).toLocaleString()}</td>
                          <td className="p-2.5 font-bold">{emiCurrency}{Math.round(row.emi).toLocaleString()}</td>
                          <td className="p-2.5 text-emerald-600 dark:text-emerald-400">{emiCurrency}{Math.round(row.principalPaid).toLocaleString()}</td>
                          <td className="p-2.5 text-rose-500">{emiCurrency}{Math.round(row.interestPaid).toLocaleString()}</td>
                          <td className="p-2.5 font-mono">{emiCurrency}{Math.round(row.closing).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Live Currency Converter */}
      {tool.id === 'util-currency-calc' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Header Status & Live Refresh Bar */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Live Forex Rates
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                ({lastUpdatedTime})
              </span>
            </div>

            <button
              type="button"
              onClick={fetchLiveRates}
              disabled={isFetchingRates}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRates ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{isFetchingRates ? 'Updating...' : 'Refresh Rates'}</span>
            </button>
          </div>

          {/* Quick Currency Pair Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Popular Pairs
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { from: 'USD', to: 'INR', label: '🇺🇸 USD ➔ 🇮🇳 INR' },
                { from: 'USD', to: 'BDT', label: '🇺🇸 USD ➔ 🇧🇩 BDT' },
                { from: 'EUR', to: 'USD', label: '🇪🇺 EUR ➔ 🇺🇸 USD' },
                { from: 'GBP', to: 'INR', label: '🇬🇧 GBP ➔ 🇮🇳 INR' },
                { from: 'AED', to: 'INR', label: '🇦🇪 AED ➔ 🇮🇳 INR' },
                { from: 'USD', to: 'CAD', label: '🇺🇸 USD ➔ 🇨🇦 CAD' },
              ].map((pair) => (
                <button
                  key={`${pair.from}-${pair.to}`}
                  type="button"
                  onClick={() => {
                    setFromCurr(pair.from);
                    setToCurr(pair.to);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    fromCurr === pair.from && toCurr === pair.to
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                  }`}
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONVERTER INPUT CARD */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5">
            {/* Amount Field with Quick Amount Chips */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Enter Amount ({getCurrSymbol(fromCurr)})
                </label>
                {currAmountInput !== '' && (
                  <button
                    type="button"
                    onClick={() => setCurrAmountInput('')}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Clear Amount
                  </button>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                  {getCurrSymbol(fromCurr)}
                </span>
                <input
                  type="number"
                  value={currAmountInput}
                  onChange={(e) => setCurrAmountInput(e.target.value)}
                  placeholder="Enter amount to convert..."
                  className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Preset Amount Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['10', '50', '100', '500', '1000', '5000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCurrAmountInput(amt)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition"
                  >
                    {getCurrSymbol(fromCurr)}{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* CURRENCY SELECTORS & SWAP BUTTON */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
              {/* From Currency Select */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                  From Currency
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                    {getCurrFlag(fromCurr)}
                  </span>
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {CURRENCY_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} - {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md active:scale-95 group"
                  title="Swap Currencies"
                >
                  <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>

              {/* To Currency Select */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                  To Currency
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                    {getCurrFlag(toCurr)}
                  </span>
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {CURRENCY_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} - {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* HERO RESULT DISPLAY CARD */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border border-emerald-500/30 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200">
                  Converted Result
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCurrencySummary}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
              >
                {copiedCurrency ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurrency ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            {/* Big Result Text */}
            <div className="text-center space-y-1 py-2">
              <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                {getCurrFlag(fromCurr)} {parsedCurrAmount.toLocaleString()} {fromCurr} =
              </div>
              <div className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight">
                {getCurrSymbol(toCurr)}
                {convertedVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xl font-extrabold text-emerald-200">{toCurr}</span>
              </div>
            </div>

            {/* Exchange Rate Details */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-emerald-200">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>
                  Rate: 1 {fromCurr} = <strong className="text-white">{unitRate.toFixed(4)}</strong> {toCurr}
                </span>
              </div>
              <div className="text-[11px] text-emerald-300/80">
                Inverse: 1 {toCurr} = <strong className="text-white">{inverseUnitRate.toFixed(6)}</strong> {fromCurr}
              </div>
            </div>
          </div>

          {/* MULTI-CURRENCY CONVERSION MATRIX TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Multi-Currency Live Rates Matrix ({parsedCurrAmount} {fromCurr})
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                Real-time values
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Currency</th>
                    <th className="p-3">Exchange Rate</th>
                    <th className="p-3 text-right">Converted Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {['USD', 'INR', 'EUR', 'GBP', 'BDT', 'AED', 'CAD', 'AUD', 'JPY', 'SGD']
                    .filter((code) => code !== fromCurr)
                    .map((code) => {
                      const rate = (1 / fromRate) * (liveRates[code] || 1);
                      const amt = parsedCurrAmount * rate;
                      return (
                        <tr
                          key={code}
                          onClick={() => setToCurr(code)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/60 cursor-pointer transition"
                        >
                          <td className="p-3 font-bold flex items-center gap-2">
                            <span className="text-base">{getCurrFlag(code)}</span>
                            <span>{code}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({getCurrSymbol(code)})
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">
                            1 {fromCurr} = {rate.toFixed(4)} {code}
                          </td>
                          <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                            {getCurrSymbol(code)}{' '}
                            {amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
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

      {/* Universal Multi-Unit Converter */}
      {tool.id === 'util-unit-calc' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Category Tabs Switcher */}
          <div className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-4 sm:grid-cols-8 gap-1 text-center">
            {(
              [
                { id: 'length', label: 'Length' },
                { id: 'weight', label: 'Weight' },
                { id: 'temp', label: 'Temp' },
                { id: 'area', label: 'Area' },
                { id: 'volume', label: 'Volume' },
                { id: 'speed', label: 'Speed' },
                { id: 'data', label: 'Data' },
                { id: 'time', label: 'Time' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectUnitCategory(cat.id)}
                className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition ${
                  unitCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* MAIN INPUT & CONVERSION SELECTORS CARD */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5">
            {/* Input Value Field with Preset Chips */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Value to Convert
                </label>
                {unitInputVal !== '' && (
                  <button
                    type="button"
                    onClick={() => setUnitInputVal('')}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Clear Input
                  </button>
                )}
              </div>

              <input
                type="number"
                value={unitInputVal}
                onChange={(e) => setUnitInputVal(e.target.value)}
                placeholder="Enter value..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />

              {/* Preset Value Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['1', '10', '50', '100', '1000', '10000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setUnitInputVal(val)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* FROM & TO SELECTORS WITH SWAP BUTTON */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
              {/* From Select */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                  Convert From
                </label>
                <select
                  value={unitFrom}
                  onChange={(e) => setUnitFrom(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {UNIT_SPECS[unitCategory].units.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handleSwapUnits}
                  className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md active:scale-95 group"
                  title="Swap Units"
                >
                  <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>

              {/* To Select */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                  Convert To
                </label>
                <select
                  value={unitTo}
                  onChange={(e) => setUnitTo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {UNIT_SPECS[unitCategory].units.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* HERO CONVERSION RESULT DISPLAY */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                  {UNIT_SPECS[unitCategory].label} Conversion Result
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyUnitSummary}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm"
              >
                {copiedUnitSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUnitSummary ? 'Copied!' : 'Copy Result'}</span>
              </button>
            </div>

            {/* Big Result Text */}
            <div className="text-center space-y-1 py-2">
              <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                {parsedUnitVal} {getUnitName(unitFrom, unitCategory)} =
              </div>
              <div className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight">
                {formatUnitNumber(convertedUnitResult)}{' '}
                <span className="text-xl font-extrabold text-indigo-200">
                  {getUnitName(unitTo, unitCategory)}
                </span>
              </div>
            </div>

            {/* Unit Ratio Detail */}
            <div className="p-3.5 rounded-2xl bg-indigo-900/60 border border-indigo-700/50 text-center text-xs font-semibold text-indigo-200">
              Unit Ratio: 1 {unitFrom} ={' '}
              <strong className="text-white">
                {formatUnitNumber(calculateUnitConversion(1, unitFrom, unitTo, unitCategory))}
              </strong>{' '}
              {unitTo}
            </div>
          </div>

          {/* ALL UNITS LIVE COMPARISON MATRIX TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                All {UNIT_SPECS[unitCategory].label} Units Matrix ({parsedUnitVal} {unitFrom})
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                Instant comparison
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Symbol / Code</th>
                    <th className="p-3 text-right">Converted Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {UNIT_SPECS[unitCategory].units.map((u) => {
                    const val = calculateUnitConversion(parsedUnitVal, unitFrom, u.code, unitCategory);
                    const isSelected = u.code === unitTo;
                    return (
                      <tr
                        key={u.code}
                        onClick={() => setUnitTo(u.code)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-900/60 cursor-pointer transition ${
                          isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold' : ''
                        }`}
                      >
                        <td className="p-3 font-bold flex items-center gap-2">
                          <span>{u.name}</span>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-black">
                              Target
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-500 uppercase">{u.code}</td>
                        <td className="p-3 text-right font-black text-indigo-600 dark:text-indigo-400">
                          {formatUnitNumber(val)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Percentage & Growth Calculator Suite */}
      {tool.id === 'util-percentage-calc' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Mode Navigation Tabs */}
          <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-1 text-center">
            {[
              { id: 'change', label: '% Change / Growth' },
              { id: 'of_number', label: '% of Number' },
              { id: 'increase_decrease', label: '+/- % (Markup/Tax)' },
              { id: 'reverse', label: 'Reverse %' },
              { id: 'margin', label: 'Margin & Profit' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPercMode(m.id as PercModeType)}
                className={`py-2 px-1.5 rounded-xl text-[11px] font-extrabold transition ${
                  percMode === m.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* MODE 1: PERCENTAGE CHANGE / GROWTH */}
          {percMode === 'change' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Calculate % Increase, Decrease or Growth
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Initial Value */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Initial (Original) Value
                      </label>
                      {percInitialInput !== '' && (
                        <button
                          type="button"
                          onClick={() => setPercInitialInput('')}
                          className="text-[10px] font-bold text-rose-500 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      value={percInitialInput}
                      onChange={(e) => setPercInitialInput(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Final Value */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Final (New) Value
                      </label>
                      {percFinalInput !== '' && (
                        <button
                          type="button"
                          onClick={() => setPercFinalInput('')}
                          className="text-[10px] font-bold text-rose-500 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      value={percFinalInput}
                      onChange={(e) => setPercFinalInput(e.target.value)}
                      placeholder="e.g. 125"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Samples:</span>
                  {[
                    { init: '100', fin: '150', name: '+50% Gain' },
                    { init: '200', fin: '150', name: '-25% Loss' },
                    { init: '500', fin: '1000', name: '2x Double' },
                    { init: '1200', fin: '900', name: '-25% Drop' },
                  ].map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setPercInitialInput(s.init);
                        setPercFinalInput(s.fin);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* HERO RESULT DISPLAY */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 text-white shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                      Percentage Change Summary
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPercSummary}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    {copiedPercSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPercSummary ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="text-center space-y-1 py-1">
                  <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                    {initialVal} ➔ {finalVal}
                  </div>
                  <div className={`text-4xl sm:text-5xl font-black tracking-tight ${percentChangeVal > 0 ? 'text-emerald-400' : percentChangeVal < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {percentChangeVal > 0 ? '+' : ''}{percentChangeVal.toFixed(2)}%
                  </div>
                  <div className="text-xs text-indigo-200 font-bold uppercase tracking-wider pt-1">
                    {percentChangeVal > 0 ? '📈 Percentage Increase' : percentChangeVal < 0 ? '📉 Percentage Decrease' : '⚖️ No Change'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center pt-2">
                  <div className="p-3 rounded-2xl bg-indigo-900/60 border border-indigo-700/50">
                    <span className="text-[10px] font-bold uppercase text-indigo-300 block">Absolute Difference</span>
                    <span className="text-base font-black text-white mt-0.5 block">
                      {changeDiff > 0 ? `+${changeDiff}` : changeDiff}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-900/60 border border-indigo-700/50">
                    <span className="text-[10px] font-bold uppercase text-indigo-300 block">Growth Multiplier</span>
                    <span className="text-base font-black text-amber-300 mt-0.5 block">
                      {multiplierVal.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: PERCENT OF NUMBER */}
          {percMode === 'of_number' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Find % of a Number or Ratio
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      X Value / Percentage
                    </label>
                    <input
                      type="number"
                      value={percXInput}
                      onChange={(e) => setPercXInput(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Y Total Amount
                    </label>
                    <input
                      type="number"
                      value={percYInput}
                      onChange={(e) => setPercYInput(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* HERO RESULT DISPLAY */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border border-emerald-500/30 text-white shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200">
                    Dual Percentage Results
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPercSummary}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    {copiedPercSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPercSummary ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 space-y-1">
                    <span className="text-xs font-bold uppercase text-emerald-300 block">What is {xVal}% of {yVal}?</span>
                    <span className="text-3xl font-black text-amber-400 block">{xPercentOfY.toFixed(2)}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 space-y-1">
                    <span className="text-xs font-bold uppercase text-emerald-300 block">{xVal} is what % of {yVal}?</span>
                    <span className="text-3xl font-black text-emerald-300 block">{xIsPercentOfY.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: ADD / SUBTRACT % (MARKUP & DISCOUNT) */}
          {percMode === 'increase_decrease' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Add or Subtract Percentage (Tax, Tip, Discount)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Base Amount
                    </label>
                    <input
                      type="number"
                      value={percAmountInput}
                      onChange={(e) => setPercAmountInput(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Percentage Rate (%)
                    </label>
                    <input
                      type="number"
                      value={percRateInput}
                      onChange={(e) => setPercRateInput(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* HERO RESULT DISPLAY */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 text-white shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                    Calculated Values ({rateVal}% of {amtVal} = {rateAmount.toFixed(2)})
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPercSummary}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    {copiedPercSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPercSummary ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <span className="text-xs font-bold uppercase text-emerald-300 block">
                      Added (+{rateVal}% Markup/Tax/Tip)
                    </span>
                    <span className="text-3xl font-black text-emerald-400 block">{valueAfterIncrease.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-200 block">(+{rateAmount.toFixed(2)})</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                    <span className="text-xs font-bold uppercase text-rose-300 block">
                      Subtracted (-{rateVal}% Discount/Sale)
                    </span>
                    <span className="text-3xl font-black text-rose-400 block">{valueAfterDecrease.toFixed(2)}</span>
                    <span className="text-[10px] text-rose-200 block">(-{rateAmount.toFixed(2)})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: REVERSE PERCENTAGE */}
          {percMode === 'reverse' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Reverse Percentage (Find Original Base Value)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Final Value After % Change
                    </label>
                    <input
                      type="number"
                      value={percFinalValInput}
                      onChange={(e) => setPercFinalValInput(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Percentage Rate (%)
                    </label>
                    <input
                      type="number"
                      value={percReverseRateInput}
                      onChange={(e) => setPercReverseRateInput(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Change Type
                    </label>
                    <select
                      value={percReverseDirection}
                      onChange={(e) => setPercReverseDirection(e.target.value as 'increase' | 'decrease')}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="increase">After % Increase (+)</option>
                      <option value="decrease">After % Decrease (-)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* HERO RESULT DISPLAY */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 text-white shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                    Original Value Result
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPercSummary}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    {copiedPercSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPercSummary ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="text-center space-y-1 py-1">
                  <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                    Calculated Original Base Value Before {reverseRate}% {percReverseDirection}:
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                    {reverseOriginal.toFixed(2)}
                  </div>
                  <div className="text-xs text-indigo-200 font-bold pt-1">
                    Difference from final: {reverseDiff > 0 ? `+${reverseDiff.toFixed(2)}` : reverseDiff.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 5: MARGIN & PROFIT */}
          {percMode === 'margin' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Profit Margin & Markup Calculator
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Cost Price (CP)
                    </label>
                    <input
                      type="number"
                      value={percCostInput}
                      onChange={(e) => setPercCostInput(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Selling Price (SP)
                    </label>
                    <input
                      type="number"
                      value={percSellingInput}
                      onChange={(e) => setPercSellingInput(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* HERO RESULT DISPLAY */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border border-emerald-500/30 text-white shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200">
                    Profitability Breakdown
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPercSummary}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    {copiedPercSummary ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPercSummary ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="text-center py-1">
                  <span className="text-xs font-bold uppercase text-emerald-300 block">Total Profit Amount</span>
                  <span className={`text-3xl sm:text-4xl font-black block ${profitAmt >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {profitAmt >= 0 ? `+${profitAmt.toFixed(2)}` : profitAmt.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/50">
                    <span className="text-[10px] font-bold uppercase text-emerald-300 block">Profit Margin % (on SP)</span>
                    <span className="text-xl font-black text-emerald-300 mt-0.5 block">
                      {profitMarginPercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/50">
                    <span className="text-[10px] font-bold uppercase text-emerald-300 block">Profit Markup % (on CP)</span>
                    <span className="text-xl font-black text-amber-300 mt-0.5 block">
                      {profitMarkupPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Advanced Scientific Math Calculator */}
      {tool.id === 'util-sci-calc' && (() => {
        const liveEvalResult = evaluateSciExpr(sciExpr, sciAngleMode, sciLastAns);

        const handleCopyResult = (val: string) => {
          navigator.clipboard.writeText(val);
          setCopiedSciRes(true);
          setTimeout(() => setCopiedSciRes(false), 2000);
        };

        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Calculator Mode Navigation */}
            <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1 text-center">
              {[
                { id: 'calc', label: '🧮 Calculator' },
                { id: 'history', label: '📜 Calculation History' },
                { id: 'formulas', label: '📐 Formula Reference' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSciTab(tab.id as 'calc' | 'history' | 'formulas')}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold transition ${
                    sciTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: SCIENTIFIC CALCULATOR KEYPAD */}
            {sciTab === 'calc' && (
              <div className="space-y-4">
                {/* DISPLAY SCREEN CARD */}
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-2xl space-y-3">
                  {/* Status Indicators Bar */}
                  <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSciAngleMode(sciAngleMode === 'DEG' ? 'RAD' : 'DEG')}
                        className={`px-2 py-0.5 rounded text-[10px] font-black transition ${
                          sciAngleMode === 'DEG' ? 'bg-amber-500 text-slate-950' : 'bg-sky-500 text-slate-950'
                        }`}
                      >
                        {sciAngleMode}
                      </button>

                      {sciShift && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-black uppercase">
                          2ND SHIFT
                        </span>
                      )}

                      {sciMemory !== 0 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          M = {sciMemory}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyResult(sciExpr === '0' || sciExpr === 'Error' ? liveEvalResult : sciExpr)}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition"
                        title="Copy text"
                      >
                        {copiedSciRes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSciRes ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expression Input Field & Real-Time Output */}
                  <div className="space-y-1.5 text-right">
                    <input
                      type="text"
                      value={sciExpr}
                      onChange={(e) => setSciExpr(e.target.value)}
                      placeholder="Enter mathematical expression..."
                      className="w-full bg-transparent border-0 text-right font-mono text-xl sm:text-2xl font-bold text-slate-300 focus:outline-none focus:ring-0 p-0"
                    />

                    <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight pt-1 overflow-x-auto whitespace-nowrap">
                      = {liveEvalResult}
                    </div>
                  </div>
                </div>

                {/* KEYBOARD CONTROLS */}
                <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  {/* Memory & Shift Controls Row */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => setSciShift(!sciShift)}
                      className={`py-2 rounded-xl font-black text-[11px] transition ${
                        sciShift
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                      }`}
                    >
                      2nd
                    </button>

                    {['MC', 'MR', 'MS', 'M+', 'M-'].map((mKey) => (
                      <button
                        key={mKey}
                        type="button"
                        onClick={() => handleSciInput(mKey)}
                        className="py-2 rounded-xl bg-slate-200 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white font-extrabold text-[11px] text-slate-700 dark:text-slate-300 transition"
                      >
                        {mKey}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setSciAngleMode(sciAngleMode === 'DEG' ? 'RAD' : 'DEG')}
                      className="py-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-black text-[11px] transition hover:bg-amber-500 hover:text-slate-950"
                    >
                      {sciAngleMode}
                    </button>
                  </div>

                  {/* Scientific Functions Grid */}
                  <div className="grid grid-cols-5 gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {/* Scientific Row 1 */}
                    <button
                      type="button"
                      onClick={() => handleSciInput(sciShift ? 'asin(' : 'sin(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      {sciShift ? 'sin⁻¹' : 'sin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput(sciShift ? 'acos(' : 'cos(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      {sciShift ? 'cos⁻¹' : 'cos'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput(sciShift ? 'atan(' : 'tan(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      {sciShift ? 'tan⁻¹' : 'tan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('π')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition font-serif text-sm"
                    >
                      π
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('e')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition font-serif italic text-sm"
                    >
                      e
                    </button>

                    {/* Scientific Row 2 */}
                    <button
                      type="button"
                      onClick={() => handleSciInput(sciShift ? '^3' : '^2')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      {sciShift ? 'x³' : 'x²'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput(sciShift ? '√(' : '^')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      {sciShift ? 'ⁿ√x' : 'xʸ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput(sciShift ? 'e^(' : '10^(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      {sciShift ? 'eˣ' : '10ˣ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('log(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      log
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('ln(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      ln
                    </button>

                    {/* Scientific Row 3 */}
                    <button
                      type="button"
                      onClick={() => handleSciInput(sciShift ? '∛(' : '√(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      {sciShift ? '∛' : '√'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition font-bold"
                    >
                      (
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput(')')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition font-bold"
                    >
                      )
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('!')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition font-bold"
                    >
                      n!
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput(sciShift ? 'abs(' : '1/(')}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      {sciShift ? '|x|' : '1/x'}
                    </button>
                  </div>

                  {/* Standard Numpad & Operators Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-1 font-extrabold text-base">
                    {/* Row 1 */}
                    <button
                      type="button"
                      onClick={() => handleSciInput('AC')}
                      className="py-3 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 transition shadow-sm active:scale-95 text-sm font-black"
                    >
                      AC
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('⌫')}
                      className="py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition active:scale-95 text-sm"
                    >
                      ⌫
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('%')}
                      className="py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition active:scale-95 text-sm"
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('÷')}
                      className="py-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition active:scale-95"
                    >
                      ÷
                    </button>

                    {/* Row 2 */}
                    {['7', '8', '9'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleSciInput(n)}
                        className="py-3.5 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm active:scale-95"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSciInput('×')}
                      className="py-3.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition active:scale-95"
                    >
                      ×
                    </button>

                    {/* Row 3 */}
                    {['4', '5', '6'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleSciInput(n)}
                        className="py-3.5 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm active:scale-95"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSciInput('-')}
                      className="py-3.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition active:scale-95"
                    >
                      -
                    </button>

                    {/* Row 4 */}
                    {['1', '2', '3'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleSciInput(n)}
                        className="py-3.5 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm active:scale-95"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSciInput('+')}
                      className="py-3.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition active:scale-95"
                    >
                      +
                    </button>

                    {/* Row 5 */}
                    <button
                      type="button"
                      onClick={() => handleSciInput('0')}
                      className="py-3.5 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm active:scale-95"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('.')}
                      className="py-3.5 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm active:scale-95"
                    >
                      .
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('ANS')}
                      className="py-3.5 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition active:scale-95 text-xs font-black"
                    >
                      ANS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSciInput('=')}
                      className="py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg transition active:scale-95 text-xl"
                    >
                      =
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CALCULATION HISTORY */}
            {sciTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Past Calculations Log ({sciHistory.length})
                  </span>
                  {sciHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSciHistory([]);
                        localStorage.removeItem('super_hub_sci_calc_history');
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear History
                    </button>
                  )}
                </div>

                {sciHistory.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-slate-500 space-y-1">
                    <p className="font-extrabold text-sm">No calculations recorded yet.</p>
                    <p className="text-xs">Perform calculations on the keypad to save them here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {sciHistory.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          setSciExpr(h.expr);
                          setSciTab('calc');
                        }}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-mono text-slate-500">{h.expr}</div>
                          <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                            = {h.res}
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">{h.timestamp}</span>
                          <span className="text-[11px] font-extrabold text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                            Load ➔
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FORMULA REFERENCE CHEATSHEET */}
            {sciTab === 'formulas' && (
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Mathematical & Physical Formula Reference
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Algebra & Logs */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase text-[11px]">
                      Algebra & Logarithms
                    </h4>
                    <ul className="space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                      <li>• Quadratic: x = (-b ± √(b² - 4ac)) / (2a)</li>
                      <li>• Log Product: log(a·b) = log(a) + log(b)</li>
                      <li>• Log Power: log(a^b) = b·log(a)</li>
                      <li>• Change of Base: log_b(a) = ln(a) / ln(b)</li>
                    </ul>
                  </div>

                  {/* Trigonometry */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase text-[11px]">
                      Trigonometric Identities
                    </h4>
                    <ul className="space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                      <li>• Pythagorean: sin²(θ) + cos²(θ) = 1</li>
                      <li>• Double Angle: sin(2θ) = 2·sin(θ)·cos(θ)</li>
                      <li>• Law of Sines: a/sin(A) = b/sin(B) = c/sin(C)</li>
                      <li>• Law of Cosines: c² = a² + b² - 2ab·cos(C)</li>
                    </ul>
                  </div>

                  {/* Geometry */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase text-[11px]">
                      Geometry & Mensuration
                    </h4>
                    <ul className="space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                      <li>• Circle Area: A = π·r²</li>
                      <li>• Sphere Volume: V = (4/3)·π·r³</li>
                      <li>• Cylinder Volume: V = π·r²·h</li>
                      <li>• Cone Volume: V = (1/3)·π·r²·h</li>
                    </ul>
                  </div>

                  {/* Physical Constants */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase text-[11px]">
                      Physical Constants
                    </h4>
                    <ul className="space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                      <li>• Speed of Light (c): 2.9979 × 10⁸ m/s</li>
                      <li>• Gravity (g): 9.80665 m/s²</li>
                      <li>• Planck Constant (h): 6.626 × 10⁻³⁴ J·s</li>
                      <li>• Avogadro (N_A): 6.022 × 10²³ mol⁻¹</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

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

      {/* Advanced Color Picker, Palette Generator & Contrast Check Suite */}
      {tool.id === 'util-color-picker' && (() => {
        const rgb = parseHexToRgb(color);
        const hsl = rgbToHslObj(rgb.r, rgb.g, rgb.b);
        const hsv = rgbToHsvObj(rgb.r, rgb.g, rgb.b);
        const cmyk = rgbToCmykObj(rgb.r, rgb.g, rgb.b);

        // Formatted String representations
        const hexString = rgb.hex.toUpperCase();
        const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        const hsvString = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
        const cmykString = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

        // Color Harmonies
        const compHex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 180) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const analog1Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const analog2Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 30) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const triadic1Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 120) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const triadic2Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 240) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const tetradic1Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 90) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const tetradic2Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 180) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const tetradic3Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 270) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const split1Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 150) % 360, hsl.s, hsl.l)) as [number, number, number]);
        const split2Hex = rgbToHexStr(...Object.values(hslToRgbObj((hsl.h + 210) % 360, hsl.s, hsl.l)) as [number, number, number]);

        // Lightness Scale (Tints & Shades)
        const shadesAndTints = [10, 20, 30, 40, 50, 60, 70, 80, 90].map((lVal) => {
          return {
            l: lVal,
            hex: rgbToHexStr(...Object.values(hslToRgbObj(hsl.h, hsl.s, lVal)) as [number, number, number])
          };
        });

        // WCAG Contrast Ratio
        const contrastRatio = getWCAGContrastRatio(fgColor, bgColor);
        const passAANormal = contrastRatio >= 4.5;
        const passAALarge = contrastRatio >= 3.0;
        const passAAANormal = contrastRatio >= 7.0;
        const passAAALarge = contrastRatio >= 4.5;
        const passUI = contrastRatio >= 3.0;

        // Gradient Rule
        const gradientCss = gradType === 'linear' 
          ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`
          : `radial-gradient(circle, ${gradColor1}, ${gradColor2})`;

        // Color Mixer Calculations
        const mix1Rgb = parseHexToRgb(mixColor1);
        const mix2Rgb = parseHexToRgb(mixColor2);
        const weight2 = mixRatio / 100;
        const weight1 = 1 - weight2;

        const mixedRgb = {
          r: Math.round(mix1Rgb.r * weight1 + mix2Rgb.r * weight2),
          g: Math.round(mix1Rgb.g * weight1 + mix2Rgb.g * weight2),
          b: Math.round(mix1Rgb.b * weight1 + mix2Rgb.b * weight2),
        };
        const mixedHex = rgbToHexStr(mixedRgb.r, mixedRgb.g, mixedRgb.b);
        const mixedHsl = rgbToHslObj(mixedRgb.r, mixedRgb.g, mixedRgb.b);

        // Blend Scale Steps
        const blendScaleSteps = Array.from({ length: mixStepsCount }).map((_, idx) => {
          const ratio = idx / (mixStepsCount - 1);
          const r = Math.round(mix1Rgb.r * (1 - ratio) + mix2Rgb.r * ratio);
          const g = Math.round(mix1Rgb.g * (1 - ratio) + mix2Rgb.g * ratio);
          const b = Math.round(mix1Rgb.b * (1 - ratio) + mix2Rgb.b * ratio);
          return {
            percent1: Math.round((1 - ratio) * 100),
            percent2: Math.round(ratio * 100),
            hex: rgbToHexStr(r, g, b),
          };
        });

        // Popular Mixing Color Pairs
        const mixPresets = [
          { name: 'Red + Yellow = Orange', c1: '#ef4444', c2: '#f59e0b' },
          { name: 'Blue + Yellow = Green', c1: '#3b82f6', c2: '#f59e0b' },
          { name: 'Red + Blue = Purple', c1: '#ef4444', c2: '#3b82f6' },
          { name: 'Cyan + Magenta = Violet', c1: '#06b6d4', c2: '#ec4899' },
          { name: 'Blue + White = Ice Blue', c1: '#3b82f6', c2: '#ffffff' },
          { name: 'Black + White = Neutral Gray', c1: '#000000', c2: '#ffffff' },
        ];

        const presetGradients = [
          { name: 'Sunset Glow', c1: '#f97316', c2: '#ec4899', angle: 135 },
          { name: 'Ocean Breeze', c1: '#06b6d4', c2: '#3b82f6', angle: 135 },
          { name: 'Cyberpunk', c1: '#8b5cf6', c2: '#ec4899', angle: 90 },
          { name: 'Emerald Forest', c1: '#10b981', c2: '#064e3b', angle: 180 },
          { name: 'Midnight Neon', c1: '#6366f1', c2: '#0f172a', angle: 135 },
          { name: 'Peach Passion', c1: '#f43f5e', c2: '#fbbf24', angle: 45 },
        ];

        const popularPresets = [
          '#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#06b6d4', '#84cc16', '#14b8a6', '#f97316', '#64748b'
        ];

        // EyeDropper API check
        const handleEyeDropper = async () => {
          if ('EyeDropper' in window) {
            try {
              // @ts-ignore
              const eyeDropper = new window.EyeDropper();
              const result = await eyeDropper.open();
              if (result && result.sRGBHex) {
                setColor(result.sRGBHex);
              }
            } catch (e) {
              // Cancelled or not supported
            }
          }
        };

        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-1 text-center">
              {[
                { id: 'picker', label: '🎨 Picker & Converts' },
                { id: 'palettes', label: '🌈 Harmonies' },
                { id: 'mixer', label: '🧪 Color Mixer' },
                { id: 'contrast', label: '👁️ WCAG Contrast' },
                { id: 'gradient', label: '✨ CSS Gradient' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setColorTab(tab.id as any)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    colorTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: PICKER & CONVERTER */}
            {colorTab === 'picker' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Color Preview Box & Pickers (5 cols) */}
                  <div className="md:col-span-5 space-y-4">
                    {/* Big Color Card */}
                    <div
                      className="h-48 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-2xl relative flex flex-col justify-between p-4 text-white transition-all overflow-hidden"
                      style={{ backgroundColor: color }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
                          Selected Color
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveSwatch(color)}
                          className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition flex items-center gap-1 text-white"
                        >
                          <Bookmark className="w-3.5 h-3.5" /> Save Swatch
                        </button>
                      </div>

                      <div className="space-y-0.5 drop-shadow-md">
                        <span className="text-3xl font-black font-mono tracking-tight block">
                          {hexString}
                        </span>
                        <span className="text-xs font-semibold opacity-90 font-mono">
                          {rgbString}
                        </span>
                      </div>
                    </div>

                    {/* Native Picker Controls */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Color Selection Input
                        </label>
                        {'EyeDropper' in window && (
                          <button
                            type="button"
                            onClick={handleEyeDropper}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-bold transition flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Screen Eyedropper
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-14 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0 shadow-sm"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="#6366f1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Quick Popular Colors
                      </span>
                      <div className="grid grid-cols-6 gap-2">
                        {popularPresets.map((pHex) => (
                          <button
                            key={pHex}
                            type="button"
                            onClick={() => setColor(pHex)}
                            className="h-8 rounded-xl border border-slate-300 dark:border-slate-700 transition transform active:scale-95 hover:scale-105 shadow-sm"
                            style={{ backgroundColor: pHex }}
                            title={pHex}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Exact Format Conversions & Sliders (7 cols) */}
                  <div className="md:col-span-7 space-y-4">
                    {/* RGB Sliders */}
                    <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                        RGB Channels Adjustment
                      </span>

                      <div className="space-y-2.5">
                        {/* Red Slider */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="w-10 font-bold text-rose-500">R: {rgb.r}</span>
                          <input
                            type="range"
                            min="0"
                            max="255"
                            value={rgb.r}
                            onChange={(e) => setColor(rgbToHexStr(Number(e.target.value), rgb.g, rgb.b))}
                            className="flex-1 accent-rose-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        {/* Green Slider */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="w-10 font-bold text-emerald-500">G: {rgb.g}</span>
                          <input
                            type="range"
                            min="0"
                            max="255"
                            value={rgb.g}
                            onChange={(e) => setColor(rgbToHexStr(rgb.r, Number(e.target.value), rgb.b))}
                            className="flex-1 accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        {/* Blue Slider */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="w-10 font-bold text-indigo-500">B: {rgb.b}</span>
                          <input
                            type="range"
                            min="0"
                            max="255"
                            value={rgb.b}
                            onChange={(e) => setColor(rgbToHexStr(rgb.r, rgb.g, Number(e.target.value)))}
                            className="flex-1 accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Format Conversion Cards Grid */}
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                        Converted Color Formats
                      </span>

                      <div className="space-y-2">
                        {[
                          { label: 'HEX', code: hexString },
                          { label: 'RGB', code: rgbString },
                          { label: 'HSL', code: hslString },
                          { label: 'HSV', code: hsvString },
                          { label: 'CMYK', code: cmykString },
                          { label: 'CSS Var', code: `--color-primary: ${hexString};` },
                        ].map((fmt) => (
                          <div
                            key={fmt.label}
                            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                          >
                            <div>
                              <span className="text-slate-400 font-sans font-bold mr-2 text-[11px] uppercase">{fmt.label}:</span>
                              <strong className="text-slate-900 dark:text-white">{fmt.code}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyColorCode(fmt.code)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition font-sans font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1"
                            >
                              {copiedColorText === fmt.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedColorText === fmt.code ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saved Favorite Swatches Strip */}
                {savedSwatches.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-indigo-500" /> Saved Favorite Swatches ({savedSwatches.length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {savedSwatches.map((sw) => (
                        <div key={sw} className="group relative flex items-center">
                          <button
                            type="button"
                            onClick={() => setColor(sw)}
                            className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-2 font-mono text-xs font-bold text-white shadow-sm transition hover:scale-105"
                            style={{ backgroundColor: sw }}
                          >
                            <span className="drop-shadow">{sw.toUpperCase()}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSwatch(sw)}
                            className="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition text-xs ml-1"
                            title="Delete Swatch"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PALETTE HARMONIES & TINTS/SHADES */}
            {colorTab === 'palettes' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                  <span>Generating harmonies based on base color: <strong className="font-mono">{hexString}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleSaveSwatch(color)}
                    className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-sm"
                  >
                    + Save Base Swatch
                  </button>
                </div>

                {/* Harmonies Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Complementary */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-xs font-extrabold uppercase text-slate-500 block">Complementary (Opposite)</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[color, compHex].map((h, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setColor(h)}
                          className="h-16 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-black text-white shadow-sm transition hover:scale-105"
                          style={{ backgroundColor: h }}
                        >
                          <span className="drop-shadow-md">{h.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analogous */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-xs font-extrabold uppercase text-slate-500 block">Analogous (Adjacent ±30°)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[analog1Hex, color, analog2Hex].map((h, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setColor(h)}
                          className="h-16 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-black text-white shadow-sm transition hover:scale-105"
                          style={{ backgroundColor: h }}
                        >
                          <span className="drop-shadow-md">{h.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Triadic */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-xs font-extrabold uppercase text-slate-500 block">Triadic (Balanced 120°)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[color, triadic1Hex, triadic2Hex].map((h, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setColor(h)}
                          className="h-16 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-black text-white shadow-sm transition hover:scale-105"
                          style={{ backgroundColor: h }}
                        >
                          <span className="drop-shadow-md">{h.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Split Complementary */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-xs font-extrabold uppercase text-slate-500 block">Split-Complementary (High Contrast)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[color, split1Hex, split2Hex].map((h, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setColor(h)}
                          className="h-16 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-black text-white shadow-sm transition hover:scale-105"
                          style={{ backgroundColor: h }}
                        >
                          <span className="drop-shadow-md">{h.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tetradic Palette */}
                <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="text-xs font-extrabold uppercase text-slate-500 block">Tetradic (Double Complementary 90°)</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[color, tetradic1Hex, tetradic2Hex, tetradic3Hex].map((h, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setColor(h)}
                        className="h-20 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center font-mono text-xs font-black text-white shadow-sm transition hover:scale-105"
                        style={{ backgroundColor: h }}
                      >
                        <span className="drop-shadow-md">{h.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tints & Shades Lightness Scale */}
                <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="text-xs font-extrabold uppercase text-slate-500 block">Tints & Shades Scale (10% to 90% Lightness)</span>
                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
                    {shadesAndTints.map((st) => (
                      <button
                        key={st.l}
                        type="button"
                        onClick={() => setColor(st.hex)}
                        className="h-16 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center font-mono text-[10px] font-bold shadow-sm transition hover:scale-105"
                        style={{ backgroundColor: st.hex, color: st.l > 55 ? '#0f172a' : '#ffffff' }}
                      >
                        <span>{st.l}%</span>
                        <span className="font-extrabold text-[9px]">{st.hex.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COLOR MIXER */}
            {colorTab === 'mixer' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex flex-wrap items-center justify-between gap-2">
                  <span>🧪 Interactive Color Mixer Engine (RGB & Pigment Blend)</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = mixColor1;
                        setMixColor1(mixColor2);
                        setMixColor2(temp);
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition font-bold text-xs flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Swap Mix Colors
                    </button>
                  </div>
                </div>

                {/* Dual Color Inputs & Slider */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Color 1 Selector */}
                  <div className="md:col-span-4 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Color A ({100 - mixRatio}%)</span>
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{mixColor1.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={mixColor1}
                        onChange={(e) => setMixColor1(e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={mixColor1}
                        onChange={(e) => setMixColor1(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Mixing Ratio Slider in Center */}
                  <div className="md:col-span-4 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                    <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      <span>Color A ({100 - mixRatio}%)</span>
                      <span>Color B ({mixRatio}%)</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mixRatio}
                      onChange={(e) => setMixRatio(Number(e.target.value))}
                      className="w-full h-2.5 rounded-lg cursor-pointer accent-indigo-600"
                      style={{
                        background: `linear-gradient(to right, ${mixColor1}, ${mixColor2})`
                      }}
                    />

                    <div className="text-[11px] font-bold text-slate-500">
                      Drag ratio slider to change proportion
                    </div>
                  </div>

                  {/* Color 2 Selector */}
                  <div className="md:col-span-4 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Color B ({mixRatio}%)</span>
                      <span className="font-mono text-xs font-bold text-rose-500">{mixColor2.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={mixColor2}
                        onChange={(e) => setMixColor2(e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={mixColor2}
                        onChange={(e) => setMixColor2(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Large Result Display Banner */}
                <div
                  className="p-6 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-2xl relative flex flex-col sm:flex-row items-center justify-between gap-4 text-white transition-all"
                  style={{ backgroundColor: mixedHex }}
                >
                  <div className="space-y-1 drop-shadow-md text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
                      Resulting Mixed Color ({100 - mixRatio}% A + {mixRatio}% B)
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
                      {mixedHex.toUpperCase()}
                    </h2>
                    <p className="text-xs font-mono font-semibold opacity-95">
                      rgb({mixedRgb.r}, {mixedRgb.g}, {mixedRgb.b}) • hsl({mixedHsl.h}, {mixedHsl.s}%, {mixedHsl.l}%)
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setColor(mixedHex)}
                      className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition flex items-center gap-1.5"
                    >
                      🎨 Use as Main Color
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveSwatch(mixedHex)}
                      className="px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white font-extrabold text-xs transition flex items-center gap-1.5"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save Swatch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyColorCode(mixedHex)}
                      className="px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white font-extrabold text-xs transition flex items-center gap-1.5"
                    >
                      {copiedColorText === mixedHex ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedColorText === mixedHex ? 'Copied' : 'Copy HEX'}</span>
                    </button>
                  </div>
                </div>

                {/* Multi-Step Blend Scale Bar */}
                <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-500">
                      Step-by-Step Gradient Transition Scale
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500 font-bold mr-1">Steps:</span>
                      {[5, 7, 9, 11].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setMixStepsCount(s)}
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${mixStepsCount === s ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-1.5">
                    {blendScaleSteps.map((step, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMixRatio(step.percent2);
                          setColor(step.hex);
                        }}
                        className="h-16 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-between p-1 font-mono text-[9px] font-extrabold transition hover:scale-105 shadow-sm"
                        style={{ backgroundColor: step.hex, color: parseHexToRgb(step.hex).r * 0.299 + parseHexToRgb(step.hex).g * 0.587 + parseHexToRgb(step.hex).b * 0.114 > 128 ? '#0f172a' : '#ffffff' }}
                      >
                        <span className="opacity-80">{step.percent1}% / {step.percent2}%</span>
                        <span className="font-mono text-[10px] font-black">{step.hex.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Classic Color Mixes */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase text-slate-500 block">Classic Color Mix Presets</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {mixPresets.map((mp) => (
                      <button
                        key={mp.name}
                        type="button"
                        onClick={() => {
                          setMixColor1(mp.c1);
                          setMixColor2(mp.c2);
                          setMixRatio(50);
                        }}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-indigo-500 transition text-left shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: mp.c1 }} />
                          <span className="text-xs font-bold text-slate-400">+</span>
                          <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: mp.c2 }} />
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 ml-1">{mp.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: WCAG CONTRAST CHECKER */}
            {colorTab === 'contrast' && (
              <div className="space-y-6">
                {/* Dual Color Selectors Bar */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      WCAG 2.1 Accessibility Contrast Inspector
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const temp = fgColor;
                        setFgColor(bgColor);
                        setBgColor(temp);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Swap Colors
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Foreground Color */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Text / Foreground Color (FG)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input
                          type="text"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Container / Background Color (BG)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Ratio Header */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-slate-400 block tracking-wider">
                      Calculated Contrast Ratio
                    </span>
                    <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 mt-1">
                      {contrastRatio.toFixed(2)} : 1
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-extrabold">
                    <span className={`px-3 py-1.5 rounded-xl flex items-center gap-1 ${passAANormal ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                      {passAANormal ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} WCAG AA
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl flex items-center gap-1 ${passAAANormal ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                      {passAAANormal ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} WCAG AAA
                    </span>
                  </div>
                </div>

                {/* WCAG Compliance Cards Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Normal Text */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Normal Text (&lt; 18pt)</span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">AA (min 4.5:1)</span>
                      <strong className={passAANormal ? 'text-emerald-500' : 'text-rose-500'}>{passAANormal ? 'PASS' : 'FAIL'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">AAA (min 7.0:1)</span>
                      <strong className={passAAANormal ? 'text-emerald-500' : 'text-rose-500'}>{passAAANormal ? 'PASS' : 'FAIL'}</strong>
                    </div>
                  </div>

                  {/* Large Text */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Large Text (&ge; 18pt / Bold)</span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">AA (min 3.0:1)</span>
                      <strong className={passAALarge ? 'text-emerald-500' : 'text-rose-500'}>{passAALarge ? 'PASS' : 'FAIL'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">AAA (min 4.5:1)</span>
                      <strong className={passAAALarge ? 'text-emerald-500' : 'text-rose-500'}>{passAAALarge ? 'PASS' : 'FAIL'}</strong>
                    </div>
                  </div>

                  {/* UI Components */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">UI Controls & Icons</span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Graphics (min 3.0:1)</span>
                      <strong className={passUI ? 'text-emerald-500' : 'text-rose-500'}>{passUI ? 'PASS' : 'FAIL'}</strong>
                    </div>
                  </div>
                </div>

                {/* Live Real-time Rendered Sample Card */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase text-slate-500 block">
                    Live UI Preview with Selected Colors
                  </span>
                  <div
                    className="p-6 rounded-3xl border shadow-lg space-y-3 transition-colors"
                    style={{ backgroundColor: bgColor, color: fgColor, borderColor: fgColor + '33' }}
                  >
                    <h3 className="text-xl font-black">Sample Display Heading</h3>
                    <p className="text-xs leading-relaxed opacity-90">
                      This live sample preview tests real-world readability. WCAG contrast guidelines ensure content is easily readable for visually impaired users and screen readers.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition"
                      style={{ backgroundColor: fgColor, color: bgColor }}
                    >
                      Sample Action Button
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CSS GRADIENT GENERATOR */}
            {colorTab === 'gradient' && (
              <div className="space-y-6">
                {/* Live Gradient Box */}
                <div
                  className="h-48 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-2xl relative flex items-center justify-center p-4 text-white font-mono text-xs font-black transition-all"
                  style={{ background: gradientCss }}
                >
                  <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md drop-shadow">
                    {gradientCss}
                  </span>
                </div>

                {/* Controls */}
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Color 1 */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Gradient Start Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradColor1}
                          onChange={(e) => setGradColor1(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input
                          type="text"
                          value={gradColor1}
                          onChange={(e) => setGradColor1(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Color 2 */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Gradient End Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradColor2}
                          onChange={(e) => setGradColor2(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input
                          type="text"
                          value={gradColor2}
                          onChange={(e) => setGradColor2(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Type & Angle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gradient Shape Type</label>
                      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setGradType('linear')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${gradType === 'linear' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                          Linear
                        </button>
                        <button
                          type="button"
                          onClick={() => setGradType('radial')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${gradType === 'radial' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                          Radial
                        </button>
                      </div>
                    </div>

                    {gradType === 'linear' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>Angle Orientation</span>
                          <span>{gradAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={gradAngle}
                          onChange={(e) => setGradAngle(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-indigo-600"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* CSS Code Box */}
                <div className="p-4.5 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-indigo-400 font-bold block mb-0.5">CSS Code:</span>
                    <code>background: {gradientCss};</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyColorCode(`background: ${gradientCss};`)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-sans text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                  >
                    {copiedColorText === `background: ${gradientCss};` ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedColorText === `background: ${gradientCss};` ? 'Copied!' : 'Copy CSS'}</span>
                  </button>
                </div>

                {/* Preset Gradients */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase text-slate-500 block">Preset Designer Gradients</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {presetGradients.map((pg) => {
                      const pgStyle = `linear-gradient(${pg.angle}deg, ${pg.c1}, ${pg.c2})`;
                      return (
                        <button
                          key={pg.name}
                          type="button"
                          onClick={() => {
                            setGradColor1(pg.c1);
                            setGradColor2(pg.c2);
                            setGradAngle(pg.angle);
                            setGradType('linear');
                          }}
                          className="h-14 rounded-2xl border border-slate-300 dark:border-slate-700 p-2 text-white font-mono text-[11px] font-bold flex flex-col justify-end transition hover:scale-105 shadow-sm text-left"
                          style={{ background: pgStyle }}
                        >
                          <span className="drop-shadow-md">{pg.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

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

            {/* 10. BMI & Fitness Health Calculator Suite */}
            {tool.id === 'util-bmi-calc' && (() => {
              const weightNum = parseFloat(bmiWeight) || 0;
              const heightNum = parseFloat(bmiHeight) || 0;
              const ageNum = parseFloat(bmiAge) || 25;
              const waistNum = parseFloat(bmiWaist) || 80;
              const neckNum = parseFloat(bmiNeck) || 38;
              const hipNum = parseFloat(bmiHip) || 95;

              let weightKg = weightNum;
              let heightCm = heightNum;
              if (bmiUnitSystem === 'imperial') {
                weightKg = weightNum * 0.453592;
                heightCm = heightNum * 2.54;
              }

              // BMI calculation
              let bmiScore = 0;
              if (heightCm > 0) {
                const heightM = heightCm / 100;
                bmiScore = weightKg / (heightM * heightM);
              }
              bmiScore = Math.round(bmiScore * 10) / 10;

              // BMI Category
              let bmiCat = 'Normal Weight';
              let bmiColor = 'text-emerald-600 dark:text-emerald-400';
              let bmiBg = 'bg-emerald-500/10 border-emerald-500/20';
              let bmiBarPos = 50; // percent on scale

              if (bmiScore < 18.5) {
                bmiCat = 'Underweight';
                bmiColor = 'text-amber-600 dark:text-amber-400';
                bmiBg = 'bg-amber-500/10 border-amber-500/20';
                bmiBarPos = Math.max(5, (bmiScore / 18.5) * 25);
              } else if (bmiScore >= 18.5 && bmiScore < 24.9) {
                bmiCat = 'Normal / Healthy Weight';
                bmiColor = 'text-emerald-600 dark:text-emerald-400';
                bmiBg = 'bg-emerald-500/10 border-emerald-500/20';
                bmiBarPos = 25 + ((bmiScore - 18.5) / 6.4) * 25;
              } else if (bmiScore >= 25 && bmiScore < 29.9) {
                bmiCat = 'Overweight';
                bmiColor = 'text-orange-600 dark:text-orange-400';
                bmiBg = 'bg-orange-500/10 border-orange-500/20';
                bmiBarPos = 50 + ((bmiScore - 25) / 4.9) * 25;
              } else {
                bmiCat = 'Obese';
                bmiColor = 'text-rose-600 dark:text-rose-400';
                bmiBg = 'bg-rose-500/10 border-rose-500/20';
                bmiBarPos = Math.min(95, 75 + ((bmiScore - 30) / 15) * 25);
              }

              // Healthy weight range
              let minHealthyKg = 0;
              let maxHealthyKg = 0;
              if (heightCm > 0) {
                const hm = heightCm / 100;
                minHealthyKg = Math.round(18.5 * hm * hm);
                maxHealthyKg = Math.round(24.9 * hm * hm);
              }

              let displayMinWeight = bmiUnitSystem === 'imperial' ? Math.round(minHealthyKg * 2.20462) : minHealthyKg;
              let displayMaxWeight = bmiUnitSystem === 'imperial' ? Math.round(maxHealthyKg * 2.20462) : maxHealthyKg;

              // BMR (Mifflin-St Jeor)
              let bmr = 0;
              if (weightKg > 0 && heightCm > 0) {
                if (bmiGender === 'male') {
                  bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
                } else {
                  bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
                }
              }
              bmr = Math.round(bmr);

              // TDEE
              const activityMultiplier = parseFloat(bmiActivity) || 1.55;
              const tdee = Math.round(bmr * activityMultiplier);

              // Estimated Body Fat % (Deurenberg Formula)
              const genderFactor = bmiGender === 'male' ? 1 : 0;
              const bodyFatPct = Math.round((1.20 * bmiScore + 0.23 * ageNum - 10.8 * genderFactor - 5.4) * 10) / 10;

              // Ideal Body Weight formulas (in kg)
              const heightInches = heightCm / 2.54;
              const inchesOver5ft = Math.max(0, heightInches - 60);
              let ibwDevine = bmiGender === 'male' ? 50 + 2.3 * inchesOver5ft : 45.5 + 2.3 * inchesOver5ft;
              let ibwRobinson = bmiGender === 'male' ? 52 + 1.9 * inchesOver5ft : 49 + 1.7 * inchesOver5ft;
              let ibwMiller = bmiGender === 'male' ? 56.2 + 1.4 * inchesOver5ft : 53.1 + 1.36 * inchesOver5ft;
              ibwDevine = Math.round(ibwDevine);
              ibwRobinson = Math.round(ibwRobinson);
              ibwMiller = Math.round(ibwMiller);

              // Daily Water Needed (Liters)
              const waterLiters = Math.round((weightKg * 0.033) * 10) / 10;
              const waterGlasses = Math.round(waterLiters * 4); // 250ml glass

              return (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Top Mode Selector Tabs */}
                  <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-1 text-center text-xs font-extrabold">
                    {[
                      { id: 'bmi', label: '📊 BMI & Body Category' },
                      { id: 'tdee', label: '🔥 BMR & Calorie Target' },
                      { id: 'ideal', label: '⚖️ Ideal Weight & Fat %' },
                      { id: 'water', label: '💧 Daily Water Intake' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setBmiTab(tab.id as any)}
                        className={`py-2 px-3 rounded-xl transition ${bmiTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Shared Input Form Controls */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex gap-1.5 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => { setBmiUnitSystem('metric'); setBmiWeight('70'); setBmiHeight('175'); }}
                          className={`px-3 py-1 rounded-lg transition ${bmiUnitSystem === 'metric' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          Metric (kg / cm)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setBmiUnitSystem('imperial'); setBmiWeight('154'); setBmiHeight('69'); }}
                          className={`px-3 py-1 rounded-lg transition ${bmiUnitSystem === 'imperial' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          Imperial (lbs / inches)
                        </button>
                      </div>

                      <div className="flex gap-2 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setBmiGender('male')}
                          className={`px-3 py-1 rounded-xl border ${bmiGender === 'male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'}`}
                        >
                          👨 Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setBmiGender('female')}
                          className={`px-3 py-1 rounded-xl border ${bmiGender === 'female' ? 'bg-pink-600 text-white border-pink-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'}`}
                        >
                          👩 Female
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                          Weight ({bmiUnitSystem === 'metric' ? 'kg' : 'lbs'})
                        </label>
                        <input
                          type="number"
                          value={bmiWeight}
                          onChange={(e) => setBmiWeight(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                          Height ({bmiUnitSystem === 'metric' ? 'cm' : 'inches'})
                        </label>
                        <input
                          type="number"
                          value={bmiHeight}
                          onChange={(e) => setBmiHeight(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                          Age (Years)
                        </label>
                        <input
                          type="number"
                          value={bmiAge}
                          onChange={(e) => setBmiAge(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TAB 1: BMI & SCALE */}
                  {bmiTab === 'bmi' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-3xl border ${bmiBg} text-center space-y-3`}>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Body Mass Index Result
                        </span>
                        <div className="text-5xl font-black font-mono tracking-tight">
                          {bmiScore} <span className="text-lg font-bold text-slate-400">kg/m²</span>
                        </div>
                        <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold border ${bmiBg} ${bmiColor}`}>
                          {bmiCat}
                        </div>

                        {/* Visual Rainbow BMI Scale Bar */}
                        <div className="space-y-1.5 pt-2 max-w-lg mx-auto">
                          <div className="relative h-4 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 via-orange-400 to-rose-500 overflow-hidden shadow-inner">
                            <div
                              className="absolute top-0 bottom-0 w-2 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black shadow-md transition-all duration-300"
                              style={{ left: `${Math.min(96, Math.max(2, bmiBarPos))}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-extrabold text-slate-500">
                            <span>Under (&lt;18.5)</span>
                            <span>Normal (18.5 - 24.9)</span>
                            <span>Over (25 - 29.9)</span>
                            <span>Obese (&gt;30)</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium pt-1">
                          Healthy weight range for your height: <strong className="text-slate-900 dark:text-white">{displayMinWeight} - {displayMaxWeight} {bmiUnitSystem === 'metric' ? 'kg' : 'lbs'}</strong>
                        </p>
                      </div>

                      {/* Health Insights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-400 uppercase block">BMI Prime Ratio</span>
                          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                            {Math.round((bmiScore / 25) * 100) / 100}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 block">(&lt; 1.0 is optimal)</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-400 uppercase block">Est. Body Fat %</span>
                          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                            {bodyFatPct > 0 ? `${bodyFatPct}%` : 'N/A'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 block">(Deurenberg model)</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-400 uppercase block">Ponderal Index</span>
                          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                            {heightCm > 0 ? Math.round((weightKg / Math.pow(heightCm / 100, 3)) * 10) / 10 : 0} kg/m³
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 block">(Volumetric ratio)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BMR & TDEE CALORIE TARGET */}
                  {bmiTab === 'tdee' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                          Select Daily Activity Level
                        </label>
                        <select
                          value={bmiActivity}
                          onChange={(e) => setBmiActivity(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="1.2">😴 Sedentary (Little or no exercise, desk job)</option>
                          <option value="1.375">🚶 Light Active (Exercise 1-3 times / week)</option>
                          <option value="1.55">🏃 Moderate Active (Exercise 3-5 times / week)</option>
                          <option value="1.725">🚴 Very Active (Hard exercise 6-7 times / week)</option>
                          <option value="1.9">🏋️ Extra Active (Physical job + intense training)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-indigo-600 text-white space-y-1 shadow-lg shadow-indigo-600/20">
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80 block">Base Metabolic Rate (BMR)</span>
                          <div className="text-3xl font-black font-mono">{bmr} <span className="text-sm">kcal/day</span></div>
                          <p className="text-xs opacity-90">Calories burned if resting all day in bed.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-emerald-600 text-white space-y-1 shadow-lg shadow-emerald-600/20">
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80 block">Maintenance Calories (TDEE)</span>
                          <div className="text-3xl font-black font-mono">{tdee} <span className="text-sm">kcal/day</span></div>
                          <p className="text-xs opacity-90">Calories needed to maintain current weight.</p>
                        </div>
                      </div>

                      {/* Calorie Goals Breakdown */}
                      <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                        <span className="text-xs font-extrabold uppercase text-slate-500 block">Daily Calorie Targets for Weight Goals</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                            <span className="text-amber-600 dark:text-amber-400 block">Weight Loss (-0.5 kg/wk)</span>
                            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{Math.max(1200, tdee - 500)} kcal</span>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                            <span className="text-emerald-600 dark:text-emerald-400 block">Weight Maintenance</span>
                            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{tdee} kcal</span>
                          </div>
                          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-0.5">
                            <span className="text-indigo-600 dark:text-indigo-400 block">Muscle Gain (+0.5 kg/wk)</span>
                            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{tdee + 500} kcal</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: IDEAL BODY WEIGHT FORMULAS */}
                  {bmiTab === 'ideal' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                        <span className="text-xs font-extrabold uppercase text-slate-500 block">Medical Ideal Body Weight Estimates</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                            <span className="text-xs font-bold text-slate-400 block">Devine Formula</span>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{ibwDevine} kg</span>
                            <span className="text-[10px] text-slate-500 block">({Math.round(ibwDevine * 2.20462)} lbs)</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                            <span className="text-xs font-bold text-slate-400 block">Robinson Formula</span>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{ibwRobinson} kg</span>
                            <span className="text-[10px] text-slate-500 block">({Math.round(ibwRobinson * 2.20462)} lbs)</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                            <span className="text-xs font-bold text-slate-400 block">Miller Formula</span>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{ibwMiller} kg</span>
                            <span className="text-[10px] text-slate-500 block">({Math.round(ibwMiller * 2.20462)} lbs)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: DAILY WATER INTAKE */}
                  {bmiTab === 'water' && (
                    <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-center space-y-3">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        Recommended Daily Hydration
                      </span>
                      <div className="text-5xl font-black font-mono text-blue-600 dark:text-blue-400">
                        {waterLiters} <span className="text-xl font-bold text-slate-500">Liters / day</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Equivalent to approx <strong>{waterGlasses} glasses</strong> of water (250ml each) for healthy hydration.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 11. GPA & CGPA Grade Calculator Suite */}
            {tool.id === 'util-gpa-calc' && (() => {
              const gradePointMap4: Record<string, number> = {
                'A+': 4.0, 'A': 4.0, 'A-': 3.7,
                'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                'D+': 1.3, 'D': 1.0, 'F': 0.0
              };

              const gradePointMap5: Record<string, number> = {
                'A+': 5.0, 'A': 5.0, 'A-': 4.5,
                'B+': 4.0, 'B': 3.5, 'B-': 3.0,
                'C+': 2.5, 'C': 2.0, 'C-': 1.5,
                'D+': 1.0, 'D': 0.5, 'F': 0.0
              };

              const gradePointMap10: Record<string, number> = {
                'O (Outstanding)': 10.0,
                'A+ (Excellent)': 9.0,
                'A (Very Good)': 8.0,
                'B+ (Good)': 7.0,
                'B (Above Avg)': 6.0,
                'C (Average)': 5.0,
                'P (Pass)': 4.0,
                'F (Fail)': 0.0
              };

              let activeMap = gradePointMap4;
              if (gpaScale === '5.0') activeMap = gradePointMap5;
              if (gpaScale === '10.0') activeMap = gradePointMap10;

              let totalCredits = 0;
              let totalPoints = 0;

              gpaCourses.forEach((c) => {
                const pts = activeMap[c.grade] ?? parseFloat(c.grade) ?? 0;
                totalCredits += c.credits;
                totalPoints += pts * c.credits;
              });

              const maxScaleNum = parseFloat(gpaScale) || 4.0;
              const gpaScore = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
              const gpaPercent = Math.round((gpaScore / maxScaleNum) * 100);

              // Class Honors Classification
              let honorsClass = 'Pass / Satisfactory';
              let honorsColor = 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
              const ratio = gpaScore / maxScaleNum;

              if (ratio >= 0.9) {
                honorsClass = '🌟 Summa Cum Laude / First Class with Distinction';
                honorsColor = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
              } else if (ratio >= 0.8) {
                honorsClass = '🥇 Magna Cum Laude / First Class Honours';
                honorsColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
              } else if (ratio >= 0.7) {
                honorsClass = '🥈 Cum Laude / Second Class (Upper Division)';
                honorsColor = 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
              } else if (ratio >= 0.6) {
                honorsClass = '🥉 Second Class (Lower Division)';
                honorsColor = 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20';
              }

              const addCourse = () => {
                const defaultGrade = gpaScale === '10.0' ? 'O (Outstanding)' : 'A';
                setGpaCourses([
                  ...gpaCourses,
                  { id: Date.now().toString(), name: `Subject ${gpaCourses.length + 1}`, grade: defaultGrade, credits: 3 }
                ]);
              };

              const removeCourse = (id: string) => {
                setGpaCourses(gpaCourses.filter((c) => c.id !== id));
              };

              const loadTemplate = (preset: 'eng' | 'uni' | 'reset') => {
                if (preset === 'eng') {
                  const defaultGrade = gpaScale === '10.0' ? 'O (Outstanding)' : 'A';
                  setGpaCourses([
                    { id: '1', name: 'Applied Mathematics IV', grade: defaultGrade, credits: 4 },
                    { id: '2', name: 'Database Management Systems', grade: defaultGrade, credits: 4 },
                    { id: '3', name: 'Computer Networks', grade: defaultGrade, credits: 3 },
                    { id: '4', name: 'Software Engineering', grade: defaultGrade, credits: 3 },
                    { id: '5', name: 'DBMS Hardware Lab', grade: defaultGrade, credits: 2 },
                    { id: '6', name: 'Networks Lab', grade: defaultGrade, credits: 2 },
                  ]);
                } else if (preset === 'uni') {
                  const defaultGrade = gpaScale === '10.0' ? 'A+ (Excellent)' : 'A-';
                  setGpaCourses([
                    { id: '1', name: 'Microeconomics', grade: defaultGrade, credits: 3 },
                    { id: '2', name: 'Business Statistics', grade: defaultGrade, credits: 4 },
                    { id: '3', name: 'Financial Accounting', grade: defaultGrade, credits: 3 },
                    { id: '4', name: 'Marketing Strategy', grade: defaultGrade, credits: 3 },
                    { id: '5', name: 'Business Ethics', grade: defaultGrade, credits: 2 },
                  ]);
                } else {
                  setGpaCourses([]);
                }
              };

              // Cumulative CGPA calculation
              const prevGpaNum = parseFloat(cgpaPrevious) || 0;
              const prevCredsNum = parseFloat(cgpaPrevCredits) || 0;
              const combinedTotalCredits = prevCredsNum + totalCredits;
              const combinedTotalPoints = (prevGpaNum * prevCredsNum) + totalPoints;
              const combinedCGPA = combinedTotalCredits > 0 ? Math.round((combinedTotalPoints / combinedTotalCredits) * 100) / 100 : 0;

              // Multi-Semester Cumulative CGPA
              let multiSemTotalCredits = 0;
              let multiSemTotalPoints = 0;
              let bestSemGpa = 0;
              let bestSemName = '';

              gpaSemesters.forEach((sem) => {
                const sgpa = parseFloat(sem.gpa) || 0;
                const screds = parseFloat(sem.credits) || 0;
                multiSemTotalCredits += screds;
                multiSemTotalPoints += sgpa * screds;
                if (sgpa > bestSemGpa) {
                  bestSemGpa = sgpa;
                  bestSemName = sem.name;
                }
              });

              const overallMultiCGPA = multiSemTotalCredits > 0 ? Math.round((multiSemTotalPoints / multiSemTotalCredits) * 100) / 100 : 0;

              const addSemester = () => {
                setGpaSemesters([
                  ...gpaSemesters,
                  { id: Date.now().toString(), name: `Semester ${gpaSemesters.length + 1}`, gpa: '3.60', credits: '18' }
                ]);
              };

              const removeSemester = (id: string) => {
                setGpaSemesters(gpaSemesters.filter((s) => s.id !== id));
              };

              // Target GPA calculation
              const targetNum = parseFloat(targetCGPA) || 3.5;
              const remCredsNum = parseFloat(remainingCredits) || 30;
              const totalRequiredPoints = targetNum * (prevCredsNum + remCredsNum);
              const currentPoints = prevGpaNum * prevCredsNum;
              const requiredGpa = remCredsNum > 0 ? (totalRequiredPoints - currentPoints) / remCredsNum : 0;
              const requiredGpaFormatted = Math.round(requiredGpa * 100) / 100;

              return (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Top Navigation Tabs */}
                  <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-1 text-center text-xs font-extrabold">
                    {[
                      { id: 'gpa', label: '🎓 Semester GPA' },
                      { id: 'cgpa', label: '📈 2-Semester CGPA' },
                      { id: 'multisem', label: '📚 Full Degree History' },
                      { id: 'target', label: '🎯 Target GPA Goal' },
                      { id: 'scale', label: '📋 Grade Scale Reference' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setGpaTab(tab.id as any)}
                        className={`py-2 px-2.5 rounded-xl transition ${gpaTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* TAB 1: SEMESTER GPA CALCULATOR */}
                  {gpaTab === 'gpa' && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Grade System Scale:</span>
                            <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                              {(['4.0', '5.0', '10.0'] as const).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setGpaScale(s)}
                                  className={`px-3 py-1 rounded-lg transition ${gpaScale === s ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 dark:text-slate-300'}`}
                                >
                                  {s} Scale
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 items-center">
                            <button
                              type="button"
                              onClick={() => loadTemplate('eng')}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                            >
                              ⚡ Eng Preset
                            </button>
                            <button
                              type="button"
                              onClick={() => loadTemplate('uni')}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                            >
                              ⚡ Uni Preset
                            </button>
                            <button
                              type="button"
                              onClick={addCourse}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-md"
                            >
                              + Add Subject
                            </button>
                          </div>
                        </div>

                        {/* Course Table */}
                        <div className="space-y-2">
                          {gpaCourses.map((course, idx) => (
                            <div key={course.id} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                              <input
                                type="text"
                                value={course.name}
                                onChange={(e) => {
                                  const updated = [...gpaCourses];
                                  updated[idx].name = e.target.value;
                                  setGpaCourses(updated);
                                }}
                                className="col-span-5 px-2.5 py-1 text-xs font-bold bg-transparent text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 focus:outline-none"
                                placeholder="Course / Subject Name"
                              />
                              <select
                                value={course.grade}
                                onChange={(e) => {
                                  const updated = [...gpaCourses];
                                  updated[idx].grade = e.target.value;
                                  setGpaCourses(updated);
                                }}
                                className="col-span-4 px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg"
                              >
                                {Object.keys(activeMap).map((g) => (
                                  <option key={g} value={g}>{g} ({activeMap[g]} pts)</option>
                                ))}
                              </select>
                              <select
                                value={course.credits}
                                onChange={(e) => {
                                  const updated = [...gpaCourses];
                                  updated[idx].credits = parseInt(e.target.value) || 1;
                                  setGpaCourses(updated);
                                }}
                                className="col-span-2 px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg"
                              >
                                {[1, 2, 3, 4, 5, 6].map((cr) => (
                                  <option key={cr} value={cr}>{cr} Cr</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeCourse(course.id)}
                                className="col-span-1 text-slate-400 hover:text-rose-500 text-sm font-bold text-center"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Large Result Display */}
                      <div className="p-6 rounded-3xl bg-indigo-600 text-white text-center space-y-3 shadow-xl shadow-indigo-600/20">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-200 block">
                          Calculated Semester GPA Result
                        </span>
                        <div className="text-5xl font-black font-mono">
                          {gpaScore.toFixed(2)} <span className="text-xl font-bold text-indigo-200">/ {maxScaleNum}.00</span>
                        </div>
                        <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold border ${honorsColor}`}>
                          {honorsClass}
                        </div>
                        <p className="text-xs font-semibold text-indigo-100">
                          Total Credit Hours: <strong>{totalCredits}</strong> • Score Percentage: <strong>{gpaPercent}%</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: 2-SEMESTER CUMULATIVE CGPA PLANNER */}
                  {gpaTab === 'cgpa' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Previous Cumulative CGPA
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={cgpaPrevious}
                            onChange={(e) => setCgpaPrevious(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Previous Total Credits Completed
                          </label>
                          <input
                            type="number"
                            value={cgpaPrevCredits}
                            onChange={(e) => setCgpaPrevCredits(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-emerald-600 text-white text-center space-y-2 shadow-xl shadow-emerald-600/20">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200 block">
                          Combined New Cumulative CGPA
                        </span>
                        <div className="text-5xl font-black font-mono">
                          {combinedCGPA.toFixed(2)} <span className="text-xl font-bold text-emerald-200">/ {maxScaleNum}.00</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-100">
                          Total Credits Tracked: <strong>{combinedTotalCredits}</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: FULL DEGREE MULTI-SEMESTER HISTORY */}
                  {gpaTab === 'multisem' && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            Multi-Semester Record Builder
                          </span>
                          <button
                            type="button"
                            onClick={addSemester}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition"
                          >
                            + Add Semester
                          </button>
                        </div>

                        <div className="space-y-2">
                          {gpaSemesters.map((sem, idx) => (
                            <div key={sem.id} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                              <input
                                type="text"
                                value={sem.name}
                                onChange={(e) => {
                                  const updated = [...gpaSemesters];
                                  updated[idx].name = e.target.value;
                                  setGpaSemesters(updated);
                                }}
                                className="col-span-5 px-2.5 py-1 text-xs font-bold bg-transparent text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 focus:outline-none"
                              />
                              <div className="col-span-3 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400">GPA:</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={sem.gpa}
                                  onChange={(e) => {
                                    const updated = [...gpaSemesters];
                                    updated[idx].gpa = e.target.value;
                                    setGpaSemesters(updated);
                                  }}
                                  className="w-full px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-mono"
                                />
                              </div>
                              <div className="col-span-3 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400">Credits:</span>
                                <input
                                  type="number"
                                  value={sem.credits}
                                  onChange={(e) => {
                                    const updated = [...gpaSemesters];
                                    updated[idx].credits = e.target.value;
                                    setGpaSemesters(updated);
                                  }}
                                  className="w-full px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-mono"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSemester(sem.id)}
                                className="col-span-1 text-slate-400 hover:text-rose-500 text-sm font-bold text-center"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Multi-semester Cumulative Result */}
                      <div className="p-6 rounded-3xl bg-purple-600 text-white text-center space-y-2 shadow-xl shadow-purple-600/20">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-purple-200 block">
                          Overall Full Degree CGPA
                        </span>
                        <div className="text-5xl font-black font-mono">
                          {overallMultiCGPA.toFixed(2)} <span className="text-xl font-bold text-purple-200">/ {maxScaleNum}.00</span>
                        </div>
                        <p className="text-xs font-semibold text-purple-100">
                          Total Credits Earned: <strong>{multiSemTotalCredits}</strong> • Best Term: <strong>{bestSemName} ({bestSemGpa})</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: TARGET GPA GOAL */}
                  {gpaTab === 'target' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Desired Target CGPA Goal
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={targetCGPA}
                            onChange={(e) => setTargetCGPA(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Remaining Credits To Complete
                          </label>
                          <input
                            type="number"
                            value={remainingCredits}
                            onChange={(e) => setRemainingCredits(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div className={`p-6 rounded-3xl text-white text-center space-y-2 shadow-xl ${requiredGpaFormatted <= maxScaleNum ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-rose-600 shadow-rose-600/20'}`}>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-white/80 block">
                          Required Average GPA in Remaining Courses
                        </span>
                        <div className="text-5xl font-black font-mono">
                          {requiredGpaFormatted > 0 ? requiredGpaFormatted.toFixed(2) : '0.00'}
                        </div>
                        <p className="text-xs font-semibold opacity-95">
                          {requiredGpaFormatted <= maxScaleNum
                            ? `Achievable! Maintain an average grade of ${requiredGpaFormatted.toFixed(2)} across remaining ${remainingCredits} credits.`
                            : `Target requires > ${maxScaleNum}.0 GPA. Consider adjusting target or completing more credit hours.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: GRADE SCALE REFERENCE TABLE */}
                  {gpaTab === 'scale' && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-extrabold uppercase text-slate-500 block">Standard Academic Grade Conversion Reference Chart ({gpaScale} Scale)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center font-bold">
                        {Object.keys(activeMap).map((g) => (
                          <div key={g} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center px-3">
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{g}</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{activeMap[g]} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 12. Shopping Discount & Savings Calculator Suite */}
            {tool.id === 'util-discount-calc' && (() => {
              const price = parseFloat(discPrice) || 0;
              const disc1 = parseFloat(discPercent) || 0;
              const disc2 = parseFloat(discExtraPercent) || 0;
              const tax = parseFloat(discTax) || 0;
              const qty = parseFloat(discQty) || 1;

              const singleAfter1 = price * (1 - disc1 / 100);
              const singleAfter2 = singleAfter1 * (1 - disc2 / 100);
              const singleFinalPayable = singleAfter2 * (1 + tax / 100);

              const totalOriginal = price * qty;
              const totalPayable = singleFinalPayable * qty;
              const totalSaved = totalOriginal - (singleAfter2 * qty);

              // BOGO calculations
              const buyQtyNum = parseFloat(bogoBuyQty) || 2;
              const getQtyNum = parseFloat(bogoGetQty) || 1;
              const bogoDiscPctNum = parseFloat(bogoDiscountPct) || 100;
              const bogoUnitPrice = parseFloat(bogoPrice) || 500;

              const totalItemsInBogo = buyQtyNum + getQtyNum;
              const bogoTotalOriginalPrice = totalItemsInBogo * bogoUnitPrice;
              const paidForDiscountedItem = bogoUnitPrice * (1 - bogoDiscPctNum / 100);
              const bogoTotalPayablePrice = (buyQtyNum * bogoUnitPrice) + (getQtyNum * paidForDiscountedItem);
              const bogoTotalSavings = bogoTotalOriginalPrice - bogoTotalPayablePrice;
              const bogoEffectiveDiscount = bogoTotalOriginalPrice > 0 ? Math.round((bogoTotalSavings / bogoTotalOriginalPrice) * 100) : 0;
              const bogoEffectivePricePerUnit = totalItemsInBogo > 0 ? Math.round((bogoTotalPayablePrice / totalItemsInBogo) * 100) / 100 : 0;

              // Reverse Discount calculations
              const finalPriceNum = parseFloat(revFinalPrice) || 960;
              const revDiscPctNum = parseFloat(revDiscPercent) || 20;
              const origTagPrice = revDiscPctNum < 100 ? finalPriceNum / (1 - revDiscPctNum / 100) : finalPriceNum;
              const revSavedAmount = origTagPrice - finalPriceNum;

              // Unit Compare calculations
              const itemAPrice = parseFloat(compItemA.price) || 0;
              const itemAQty = parseFloat(compItemA.qty) || 1;
              const itemBPrice = parseFloat(compItemB.price) || 0;
              const itemBQty = parseFloat(compItemB.qty) || 1;

              const unitPriceA = itemAQty > 0 ? itemAPrice / itemAQty : 0;
              const unitPriceB = itemBQty > 0 ? itemBPrice / itemBQty : 0;

              const isABetter = unitPriceA < unitPriceB;
              const diffPct = unitPriceB > 0 ? Math.round((Math.abs(unitPriceA - unitPriceB) / unitPriceB) * 100) : 0;

              return (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Currency Selector & Navigation Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 pl-2">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Currency:</span>
                      <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                        {[
                          { symbol: '₹', code: '₹ INR' },
                          { symbol: '$', code: '$ USD' },
                          { symbol: '€', code: '€ EUR' },
                          { symbol: '£', code: '£ GBP' },
                        ].map((c) => (
                          <button
                            key={c.symbol}
                            type="button"
                            onClick={() => setDiscCurrency(c.symbol)}
                            className={`px-2.5 py-1 rounded-lg transition ${discCurrency === c.symbol ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 dark:text-slate-300'}`}
                          >
                            {c.code}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-center text-xs font-extrabold flex-1 min-w-[280px]">
                      {[
                        { id: 'discount', label: '🏷️ Stacked Discount' },
                        { id: 'bogo', label: '🎁 BOGO & Bundles' },
                        { id: 'reverse', label: '🔍 Reverse Price Finder' },
                        { id: 'compare', label: '⚖️ Deal Unit Comparison' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setDiscTab(tab.id as any)}
                          className={`py-2 px-3 rounded-xl transition ${discTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TAB 1: STACKED DISCOUNT & TAX */}
                  {discTab === 'discount' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Tag Price ({discCurrency})
                          </label>
                          <input
                            type="number"
                            value={discPrice}
                            onChange={(e) => setDiscPrice(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Discount 1 (%)
                          </label>
                          <input
                            type="number"
                            value={discPercent}
                            onChange={(e) => setDiscPercent(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Coupon 2 (%)
                          </label>
                          <input
                            type="number"
                            value={discExtraPercent}
                            onChange={(e) => setDiscExtraPercent(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Sales Tax (%)
                          </label>
                          <input
                            type="number"
                            value={discTax}
                            onChange={(e) => setDiscTax(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={discQty}
                            onChange={(e) => setDiscQty(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block uppercase">
                            Total Savings
                          </span>
                          <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {discCurrency}{totalSaved.toFixed(2)}
                          </span>
                          <p className="text-xs text-slate-500 font-semibold">
                            ({Math.round((totalSaved / (totalOriginal || 1)) * 100)}% total effective discount)
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-indigo-600 text-white text-center space-y-1 shadow-lg shadow-indigo-600/20">
                          <span className="text-xs font-extrabold text-indigo-200 block uppercase">
                            Final Payable Amount ({qty} item{qty > 1 ? 's' : ''})
                          </span>
                          <span className="text-3xl font-black font-mono">
                            {discCurrency}{totalPayable.toFixed(2)}
                          </span>
                          <p className="text-xs text-indigo-100 font-semibold">
                            {discCurrency}{singleFinalPayable.toFixed(2)} per item with tax
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BOGO & BUNDLE SAVINGS */}
                  {discTab === 'bogo' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Buy Quantity
                          </label>
                          <input
                            type="number"
                            value={bogoBuyQty}
                            onChange={(e) => setBogoBuyQty(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Get Free / Discounted
                          </label>
                          <input
                            type="number"
                            value={bogoGetQty}
                            onChange={(e) => setBogoGetQty(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Discount on Extra Item (%)
                          </label>
                          <input
                            type="number"
                            value={bogoDiscountPct}
                            onChange={(e) => setBogoDiscountPct(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Item Unit Price ({discCurrency})
                          </label>
                          <input
                            type="number"
                            value={bogoPrice}
                            onChange={(e) => setBogoPrice(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-indigo-600 text-white text-center space-y-1 shadow-lg shadow-indigo-600/20">
                          <span className="text-xs font-extrabold text-indigo-200 block uppercase">Total Bundle Payable</span>
                          <span className="text-3xl font-black font-mono">{discCurrency}{bogoTotalPayablePrice.toFixed(2)}</span>
                          <p className="text-xs text-indigo-100 font-semibold">
                            Effective Price Per Unit: <strong>{discCurrency}{bogoEffectivePricePerUnit.toFixed(2)}</strong>
                          </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block uppercase">Effective Savings</span>
                          <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{bogoEffectiveDiscount}% OFF</span>
                          <p className="text-xs text-slate-500 font-semibold">Total Money Saved: {discCurrency}{bogoTotalSavings.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: REVERSE PRICE FINDER */}
                  {discTab === 'reverse' && (
                    <div className="space-y-6 max-w-xl mx-auto">
                      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Final Sale Price ({discCurrency})
                          </label>
                          <input
                            type="number"
                            value={revFinalPrice}
                            onChange={(e) => setRevFinalPrice(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                            Discount Applied (%)
                          </label>
                          <input
                            type="number"
                            value={revDiscPercent}
                            onChange={(e) => setRevDiscPercent(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-indigo-600 text-white text-center space-y-2 shadow-xl shadow-indigo-600/20">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-200 block">Original Tag Price</span>
                        <div className="text-5xl font-black font-mono">{discCurrency}{origTagPrice.toFixed(2)}</div>
                        <p className="text-xs font-semibold text-indigo-100">
                          You saved <strong>{discCurrency}{revSavedAmount.toFixed(2)}</strong> on this offer!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: UNIT PRICE COMPARISON */}
                  {discTab === 'compare' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Option A */}
                        <div className={`p-4.5 rounded-2xl border space-y-3 ${isABetter ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                          <div className="flex justify-between items-center">
                            <input
                              type="text"
                              value={compItemA.name}
                              onChange={(e) => setCompItemA({ ...compItemA, name: e.target.value })}
                              className="text-xs font-extrabold bg-transparent text-slate-900 dark:text-white border-b border-slate-300 focus:outline-none"
                            />
                            {isABetter && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                                Best Value
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Price ({discCurrency})</label>
                              <input
                                type="number"
                                value={compItemA.price}
                                onChange={(e) => setCompItemA({ ...compItemA, price: e.target.value })}
                                className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Quantity / Size ({compItemA.unit})</label>
                              <input
                                type="number"
                                value={compItemA.qty}
                                onChange={(e) => setCompItemA({ ...compItemA, qty: e.target.value })}
                                className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                              />
                            </div>
                          </div>
                          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Unit Cost</span>
                            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                              {discCurrency}{unitPriceA.toFixed(4)} <span className="text-xs font-bold text-slate-400">/ {compItemA.unit}</span>
                            </span>
                          </div>
                        </div>

                        {/* Option B */}
                        <div className={`p-4.5 rounded-2xl border space-y-3 ${!isABetter ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                          <div className="flex justify-between items-center">
                            <input
                              type="text"
                              value={compItemB.name}
                              onChange={(e) => setCompItemB({ ...compItemB, name: e.target.value })}
                              className="text-xs font-extrabold bg-transparent text-slate-900 dark:text-white border-b border-slate-300 focus:outline-none"
                            />
                            {!isABetter && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                                Best Value
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Price ({discCurrency})</label>
                              <input
                                type="number"
                                value={compItemB.price}
                                onChange={(e) => setCompItemB({ ...compItemB, price: e.target.value })}
                                className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Quantity / Size ({compItemB.unit})</label>
                              <input
                                type="number"
                                value={compItemB.qty}
                                onChange={(e) => setCompItemB({ ...compItemB, qty: e.target.value })}
                                className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                              />
                            </div>
                          </div>
                          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Unit Cost</span>
                            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                              {discCurrency}{unitPriceB.toFixed(4)} <span className="text-xs font-bold text-slate-400">/ {compItemB.unit}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

    </div>
  );
};

