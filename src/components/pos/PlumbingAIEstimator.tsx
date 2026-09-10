import React, { useState, useEffect } from "react";
import { Product, StoreSettings } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { 
  Sparkles, 
  Layers, 
  CheckCircle, 
  Send, 
  Download, 
  Copy, 
  Info,
  DollarSign,
  Mic,
  MicOff,
  Printer,
  Store,
  Zap,
  Volume2,
  Bell,
  Cpu,
  Play,
  Ruler,
  Wrench,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ListPlus,
  MapPin,
  Compass
} from "lucide-react";
import { OnlinePlumberRouter } from "./OnlinePlumberRouter";

interface PlumbingAIEstimatorProps {
  products: Product[];
  settings: StoreSettings;
}

export const PlumbingAIEstimator: React.FC<PlumbingAIEstimatorProps> = ({
  products,
  settings,
}) => {
  const { t, language } = useLanguage();
  const [estimatorMode, setEstimatorMode] = useState<"house_boq" | "water_indicator" | "online_plumber">("house_boq");

  // ── Existing House BOQ Estimator States ──
  const [projectType, setProjectType] = useState<string>("5-Marla Standard House (2 Bathrooms + 1 Kitchen)");
  const [pipeBrand, setPipeBrand] = useState<string>("Master PPRC & Popular PVC");
  const [customNotes, setCustomNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [estimationResult, setEstimationResult] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // ── New Water Indicator & Automation Planner States ──
  const [indicatorType, setIndicatorType] = useState<"led" | "auto" | "siren">("led");
  const [floorsCount, setFloorsCount] = useState<number>(3);
  const [horizontalDistance, setHorizontalDistance] = useState<number>(50);
  const [wireOption, setWireOption] = useState<"meters" | "roll">("roll");
  const [includePlumberLabor, setIncludePlumberLabor] = useState<boolean>(true);
  const [indicatorBrand, setIndicatorBrand] = useState<string>("Qumber Automation");

  // Interactive Live Demo Simulator States
  const [demoWaterLevel, setDemoWaterLevel] = useState<number>(75); // 0, 25, 50, 75, 100
  const [demoPumpOn, setDemoPumpOn] = useState<boolean>(false);
  const [demoSirenOn, setDemoSirenOn] = useState<boolean>(false);
  const [demoAutoMode, setDemoAutoMode] = useState<boolean>(true);
  const [demoBuzzerPulse, setDemoBuzzerPulse] = useState<boolean>(false);
  const [indicatorQuoteResult, setIndicatorQuoteResult] = useState<string | null>(null);
  const [showIndicatorPrintHeader, setShowIndicatorPrintHeader] = useState<boolean>(false);

  // Sound cue or visual buzzer effect on 100% full
  useEffect(() => {
    if (demoWaterLevel === 100) {
      setDemoBuzzerPulse(true);
      const timer = setTimeout(() => setDemoBuzzerPulse(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [demoWaterLevel]);

  // Simulate auto pump controller behavior
  useEffect(() => {
    if (indicatorType === "auto") {
      if (demoWaterLevel <= 25) {
        setDemoPumpOn(true);
      } else if (demoWaterLevel === 100) {
        setDemoPumpOn(false);
      }
    } else {
      setDemoPumpOn(false);
    }
  }, [demoWaterLevel, indicatorType]);

  // Web Speech API setup for Microphone
  useEffect(() => {
    let recognition: any = null;
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      const langMap: Record<string, string> = {
        'en': 'en-US',
        'ur': 'ur-PK',
        'ps': 'ps-AF'
      };
      recognition.lang = langMap[language] || 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setCustomNotes((prev) => prev + " " + finalTranscript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening && recognition) {
      recognition.start();
    } else if (!isListening && recognition) {
      recognition.stop();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, language]);

  const toggleListen = () => {
    setIsListening(!isListening);
  };

  const presets = [
    {
      label: "5-Marla House (2 Bath + 1 Kitchen)",
      brand: "Master PPRC & Popular PVC",
      notes: "Need complete hot/cold water supply and 4-inch drainage waste lines with sanitary fittings.",
    },
    {
      label: "10-Marla Luxury House (4 Bath + 2 Kitchens)",
      brand: "Master Heavy & Popular Class B",
      notes: "Include 500-gallon water tank connection, suction pump line, and high-end bath mixers.",
    },
    {
      label: "Single Commercial Bathroom Renovation",
      brand: "Porta & Sonex",
      notes: "1 commode set, 1 vanity basin, 1 shower mixer set, and angle valves.",
    },
  ];

  // ── Existing AI Estimator Service ──
  const handleGenerateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEstimationResult(null);

    try {
      const inventorySample = products
        .slice(0, 25)
        .map((p) => `- ${p.name} (${p.category}): Price Rs. ${p.salePrice}/${p.unit}`)
        .join("\n");

      const prompt = `You are the chief plumbing estimator for "${settings.storeName}", a premier pipe and sanitary hardware store in Pakistan.
Create a realistic Bill of Quantities (BOQ) and cost estimation for the following project request:

Project: ${projectType}
Preferred Brand / Specification: ${pipeBrand}
Special Client Notes: ${customNotes || "Standard residential installation"}

Here is sample stock pricing available at our shop:
${inventorySample}

Please generate a clear, structured Urdu-English friendly Plumbing Estimate Breakdown with:
1. PPRC Hot & Cold Water Supply (Pipes, Elbows, Tees, Adaptors with quantities and estimated PKR cost)
2. PVC Drainage & Waste Line (4" & 3" Pipes, P-Traps, Bends, Solvent)
3. Sanitary Ware & CP Fittings (Commodes, Basins, Mixers, Angle Valves)
4. Hardware & Essentials (Teflon tape, cutters, clips)
5. Estimated Material Grand Total (PKR)
6. Professional advice for plumber / homeowner (e.g. pressure testing, slope).`;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: "gemini-3.7-flash",
          systemInstruction:
            "You are an expert plumbing contractor and hardware store estimator in Pakistan. Output well-formatted markdown tables and accurate Pakistani rupee estimates.",
        }),
      });

      const data = await response.json();
      if (data.text) {
        setEstimationResult(data.text);
      } else {
        setEstimationResult("Unable to generate estimate. Please verify backend connection.");
      }
    } catch (err: any) {
      // Fallback realistic demo response if offline
      setEstimationResult(`### 🚰 Plumbing & Sanitary BOQ Estimation: ${projectType}
**Store:** ${settings.storeName}  
**Date:** ${new Date().toLocaleDateString()}  
**Pipe Standard:** ${pipeBrand}

---

#### 1. PPRC Water Supply Lines (Hot & Cold)
| Item Description | Quantity | Est. Unit Rate (PKR) | Total (PKR) |
| :--- | :--- | :--- | :--- |
| Master PPRC Pipe 25mm (3/4") 13ft | 18 Lengths | PKR 530 | PKR 9,540 |
| Master PPRC Pipe 32mm (1") Main Supply | 6 Lengths | PKR 790 | PKR 4,740 |
| Master PPRC Elbows 25mm 90° | 40 Pcs | PKR 40 | PKR 1,600 |
| Master PPRC Equal Tees 25mm | 20 Pcs | PKR 55 | PKR 1,100 |
| Master Brass MTA/FTA 25 x 1/2" | 16 Pcs | PKR 200 | PKR 3,200 |

**PPRC Subtotal: PKR 20,180**

---

#### 2. PVC Drainage & Sewerage Lines
| Item Description | Quantity | Est. Unit Rate (PKR) | Total (PKR) |
| :--- | :--- | :--- | :--- |
| Popular PVC Pipe 4" (110mm) Drainage | 8 Lengths | PKR 1,380 | PKR 11,040 |
| Popular PVC Pipe 3" (75mm) Waste Line | 6 Lengths | PKR 990 | PKR 5,940 |
| Popular PVC P-Trap 4" with Plug | 3 Pcs | PKR 420 | PKR 1,260 |
| Popular PVC Bends 4" & 3" | 12 Pcs | PKR 175 | PKR 2,100 |
| PVC Solvent Cement (Samad) 250ml | 3 Cans | PKR 240 | PKR 720 |

**PVC Subtotal: PKR 21,060**

---

#### 3. Sanitary Ware & CP Fittings
| Item Description | Quantity | Est. Unit Rate (PKR) | Total (PKR) |
| :--- | :--- | :--- | :--- |
| Porta One-Piece Ceramic Commode Set | 2 Sets | PKR 17,800 | PKR 35,600 |
| Marcopolo Vanity Basin with Pedestal | 2 Sets | PKR 7,900 | PKR 15,800 |
| Sonex Deluxe Bath Shower Wall Mixer | 2 Sets | PKR 8,500 | PKR 17,000 |
| Sonex Heavy Muslim Shower Set | 2 Sets | PKR 1,550 | PKR 3,100 |
| Master Brass Angle Valves 1/2" | 8 Pcs | PKR 580 | PKR 4,640 |

**Sanitary Subtotal: PKR 76,140**

---

### 💰 Total Material Estimate: **PKR 117,380**
*(Excluding plumber installation labor charges)*

💡 **Store Advice**: Always perform pneumatic pressure testing at 10 Bar before tiling.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (estimationResult) {
      navigator.clipboard.writeText(estimationResult);
      alert("Estimate copied to clipboard!");
    }
  };

  // ── Dynamic Pricing Fetching for Indicators ──
  const getProductPrice = (code: string, fallback: number) => {
    const prod = products.find(p => p.code === code);
    return prod ? prod.salePrice : fallback;
  };

  const getProductName = (code: string, fallback: string) => {
    const prod = products.find(p => p.code === code);
    return prod ? prod.name : fallback;
  };

  const priceLed = getProductPrice("IND-LED-4", 1850);
  const priceAuto = getProductPrice("IND-AUTO-PUMP", 3850);
  const priceSiren = getProductPrice("IND-OVERFLOW", 750);
  const priceCableRoll = getProductPrice("IND-CABLE-30", 950);
  const priceProbeSet = getProductPrice("IND-PROBE-SS", 550);
  const priceCablePerMeter = Math.round((priceCableRoll / 30) * 1.25); // loose copper wire is slightly premium

  // ── Calculation Math ──
  const totalWireFeet = Math.round((floorsCount * 12 + horizontalDistance) * 1.15); // building height (12ft/floor) + run + slack
  const totalWireMeters = Math.max(5, Math.round(totalWireFeet / 3.281)); // convert to meters
  
  let selectedUnitName = "";
  let selectedUnitCode = "";
  let selectedUnitPrice = 0;
  
  if (indicatorType === "led") {
    selectedUnitName = getProductName("IND-LED-4", "Water Tank Level Indicator - 4 Level LED");
    selectedUnitCode = "IND-LED-4";
    selectedUnitPrice = priceLed;
  } else if (indicatorType === "auto") {
    selectedUnitName = getProductName("IND-AUTO-PUMP", "Automatic Water Pump Controller & Indicator");
    selectedUnitCode = "IND-AUTO-PUMP";
    selectedUnitPrice = priceAuto;
  } else {
    selectedUnitName = getProductName("IND-OVERFLOW", "Water Tank Over-Flow Alarm Siren");
    selectedUnitCode = "IND-OVERFLOW";
    selectedUnitPrice = priceSiren;
  }

  // Calculate cable count/price
  let cableQty = 1;
  let cableUnit = "roll";
  let cableCost = 0;
  let cableName = "";

  if (wireOption === "roll") {
    cableQty = Math.max(1, Math.ceil(totalWireMeters / 30));
    cableUnit = "roll";
    cableCost = cableQty * priceCableRoll;
    cableName = `${getProductName("IND-CABLE-30", "Water Sensor Cable")} (${cableQty}x 30-Meter Rolls)`;
  } else {
    cableQty = totalWireMeters;
    cableUnit = "meter";
    cableCost = totalWireMeters * priceCablePerMeter;
    cableName = `Loose Water Sensor 4-Core Copper Cable (${cableQty} Meters)`;
  }

  const probesQty = 1;
  const probesCost = priceProbeSet;
  const probesName = getProductName("IND-PROBE-SS", "Stainless Steel Sensor Probes (4-Pcs Set)");

  const installationAccessories = 250; // Teflon, Rawal plugs, clips
  const plumberLabor = includePlumberLabor ? 1500 : 0;
  const materialsSubtotal = selectedUnitPrice + cableCost + probesCost + installationAccessories;
  const grandTotal = materialsSubtotal + plumberLabor;

  // Generate automated text receipt for copy & print
  useEffect(() => {
    const techSpecification = indicatorType === "led" 
      ? "LED level panel displaying status at 25%, 50%, 75% and 100% full."
      : indicatorType === "auto"
      ? "Smart Relay Controller which turns the motor ON at 25% and OFF at 100% full autonomously."
      : "Loud over-flow siren that sounds an alarm immediately when water touches 100% full.";

    const boqMarkdown = `### 💧 Water Level Indicator & Automation Setup BOQ
**Store:** ${settings.storeName}  
**Date:** ${new Date().toLocaleDateString()}  
**Client Project:** ${floorsCount}-Story Building, ${horizontalDistance}ft horizontal distance to tank.
**Selected Brand:** ${indicatorBrand} 

---

#### 📋 Complete Material & Installation Invoice Estimate
| Item Code | Material Description | Qty | Unit | Rate (PKR) | Total (PKR) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| \`${selectedUnitCode}\` | ${selectedUnitName} | 1 | pc | PKR ${selectedUnitPrice.toLocaleString()} | PKR ${selectedUnitPrice.toLocaleString()} |
| \`IND-PROBE-SS\` | ${probesName} | 1 | set | PKR ${priceProbeSet.toLocaleString()} | PKR ${priceProbeSet.toLocaleString()} |
| \`${wireOption === "roll" ? "IND-CABLE-30" : "IND-LOOSE"}\` | ${cableName} | ${cableQty} | ${cableUnit} | PKR ${(wireOption === "roll" ? priceCableRoll : priceCablePerMeter).toLocaleString()} | PKR ${cableCost.toLocaleString()} |
| \`HDW-ACC-01\` | Rawal plugs, clips, insulation, Teflon pack | 1 | set | PKR ${installationAccessories.toLocaleString()} | PKR ${installationAccessories.toLocaleString()} |
| \`SRV-LABOR\` | Professional Installer / Plumber Fitting Fee | 1 | job | PKR ${plumberLabor.toLocaleString()} | PKR ${plumberLabor.toLocaleString()} |

---

### 💰 Total Package Investment: **PKR ${grandTotal.toLocaleString()}**
*(Includes All Materials, Copper Wires, Probes, and Expert Installation)*

#### 🔬 System Technical Specifications:
* **Controller:** ${indicatorBrand} Smart Controller.
* **Cable Requirement:** ${totalWireMeters} Meters of 4-Core Copper Signal Wire.
* **Height Matrix:** Calculated for ${floorsCount} Floors (~${floorsCount * 12}ft vertical) with ${horizontalDistance}ft horizontal run.
* **Automation Mechanism:** ${techSpecification}
* **Durability:** SS-304 non-rust food-grade sensors. Zero risk of electric shock inside water tank (5V DC low-current safety).

💡 **Store Warranty & Trust**: 1-Year Local Replacement Warranty on controller unit! Make your home a smart, eco-friendly dream home today.`;

    setIndicatorQuoteResult(boqMarkdown);
  }, [indicatorType, floorsCount, horizontalDistance, wireOption, includePlumberLabor, indicatorBrand, selectedUnitPrice, cableCost, probesCost, grandTotal]);

  const handleCopyIndicatorQuote = () => {
    if (indicatorQuoteResult) {
      navigator.clipboard.writeText(indicatorQuoteResult);
      alert("Indicator estimation copied successfully!");
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs">
      
      {/* Tab Switcher - Visual Core */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 max-w-2xl mx-auto flex-wrap sm:flex-nowrap gap-1">
        <button
          onClick={() => setEstimatorMode("house_boq")}
          className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 text-xs ${
            estimatorMode === "house_boq"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>House BOQ Estimator</span>
        </button>
        <button
          onClick={() => setEstimatorMode("water_indicator")}
          className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 text-xs ${
            estimatorMode === "water_indicator"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Water Indicators</span>
        </button>
        <button
          onClick={() => setEstimatorMode("online_plumber")}
          className={`flex-1 py-2 px-3 rounded-lg font-bold text-center transition flex items-center justify-center gap-1.5 text-xs ${
            estimatorMode === "online_plumber"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Online Plumber & GPS Router</span>
        </button>
      </div>

      {estimatorMode === "house_boq" ? (
        // ── MODE A: ORIGINAL GEMINI HOUSE ESTIMATOR ──
        <>
          {/* Header */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>AI Sanitary & Plumbing Estimator (Gemini Powered)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate instant Bill of Quantities (BOQ) for 5-Marla, 10-Marla, 1-Kanal houses or commercial bathrooms
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-300 font-semibold text-[11px]">
                Gemini 3.7 Flash Model
              </span>
            </div>
          </div>

          {/* Preset Quick Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-slate-400 text-xs font-semibold whitespace-nowrap">Quick Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProjectType(p.label);
                  setPipeBrand(p.brand);
                  setCustomNotes(p.notes);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition text-xs"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Form Inputs (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <h3 className="font-bold text-slate-100 text-sm mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Project Parameters</span>
              </h3>

              <form onSubmit={handleGenerateEstimate} className="space-y-3.5">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Project Scope / Property Size *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder="e.g. 10-Marla Double Story (4 Washrooms + 2 Kitchens)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Preferred Pipe & Fittings Brand
                  </label>
                  <input
                    type="text"
                    value={pipeBrand}
                    onChange={(e) => setPipeBrand(e.target.value)}
                    placeholder="e.g. Master PPRC, Popular UPVC, Sonex Taps"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    {t('speak_now').includes('Listening') ? t('speak_now').split('...')[0] + ' Notes' : 'Specific Client Requirements / Notes'}
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder={t('how_can_i_help')}
                      className="w-full px-3 py-2 pr-12 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-blue-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={toggleListen}
                      className={`absolute right-2 top-2 p-2 rounded-lg transition ${
                        isListening ? "bg-rose-500 text-white animate-pulse" : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title={isListening ? t('stop_listening') : t('voice_command')}
                    >
                      {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {isListening && (
                    <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      {t('speak_now')}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition ${
                    isLoading
                      ? "bg-slate-800 text-slate-500 cursor-wait"
                      : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/20"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      <span>{t('estimating')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t('reply')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Output Area (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[450px]">
              <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/80 border border-blue-500/40 text-blue-300 font-black rounded-xl text-[11px] tracking-wide shadow-md uppercase">
                    <Store className="w-3.5 h-3.5 text-blue-400" />
                    <span>Haider Pipe & Sanitary Store</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">| Estimate BOQ</span>
                </div>

                {estimationResult && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-black transition cursor-pointer text-xs shadow-lg shadow-emerald-500/15 active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Estimate (PDF)
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/60 transition cursor-pointer text-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 p-5 overflow-y-auto max-h-[60vh] bg-slate-950/60 font-sans text-slate-200 leading-relaxed text-xs printable-estimate-area">
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    .printable-estimate-area, .printable-estimate-area * {
                      visibility: visible !important;
                    }
                    .printable-estimate-area {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      color: #000000 !important;
                      background: #ffffff !important;
                      padding: 20px !important;
                      font-size: 14px !important;
                      line-height: 1.6 !important;
                    }
                    .printable-estimate-area table {
                      width: 100% !important;
                      border-collapse: collapse !important;
                      margin: 15px 0 !important;
                    }
                    .printable-estimate-area th, .printable-estimate-area td {
                      border: 1px solid #000000 !important;
                      padding: 8px !important;
                      color: #000000 !important;
                    }
                    .printable-estimate-area h1, .printable-estimate-area h2, .printable-estimate-area h3, .printable-estimate-area h4 {
                      color: #000000 !important;
                      margin-top: 15px !important;
                    }
                  }
                `}} />
                {estimationResult ? (
                  <div className="prose prose-invert prose-xs max-w-none space-y-3 whitespace-pre-wrap">
                    <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
                      <h1 className="text-xl font-bold text-black tracking-tight">{settings.storeName}</h1>
                      <p className="text-xs text-black font-semibold mt-1">#03 Sikandro Square, Khyber Bazaar, Peshawar | PTCL: 091-2565800 | Mobile: 0300-5861463</p>
                      <p className="text-xs text-black mt-0.5 font-bold">PLUMBING & SANITARY MATERIALS ESTIMATE STATEMENT</p>
                      <p className="text-[10px] text-black mt-1">Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    {estimationResult}

                    <div className="hidden print:block pt-6 border-t border-black text-center text-[10px] text-black font-bold mt-8">
                      <p>Thank you for choosing Haider Pipe and Sanitary store for your dream home!</p>
                      <p className="mt-0.5">Please visit us or contact WhatsApp: 0300-5861464</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                    <Sparkles className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="font-semibold text-sm text-slate-400">Ready to calculate plumbing estimation</p>
                    <p className="text-xs max-w-md mt-1">
                      Fill in property specifications on the left and tap Generate. Gemini AI will match store items and calculate realistic PPRC, PVC, and sanitary quantities.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : estimatorMode === "water_indicator" ? (
        // ── MODE B: NEW EXQUISITE WATER INDICATORS PLANNER & LIVE SIMULATOR ──
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600/30 to-slate-900 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>Water Indicator & Tank Automation Setup Planner</span>
              </h2>
              <p className="text-xs text-slate-400">
                Instantly calculate wires, sensors, and controllers based on floors & distance for local water indicator setups.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span>Interactive Live Demo Ready</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* INPUT CONTROLS PANEL (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
              <div>
                <h3 className="font-bold text-slate-100 text-sm mb-1 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Setup Requirements (پیمائش کی تفصیلات)</span>
                </h3>
                <p className="text-[10px] text-slate-400">Configure building size and desired level protection mechanism.</p>
              </div>

              {/* 1. Selector of Indicator System */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block text-xs">
                  Automation System Type (سسٹم کا انتخاب)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setIndicatorType("led")}
                    className={`p-2 rounded-xl border text-center transition ${
                      indicatorType === "led"
                        ? "bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <Cpu className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <span className="block text-[10px]">4-LED Indicator</span>
                    <span className="block text-[8px] font-mono opacity-80">PKR {priceLed}</span>
                  </button>

                  <button
                    onClick={() => setIndicatorType("auto")}
                    className={`p-2 rounded-xl border text-center transition ${
                      indicatorType === "auto"
                        ? "bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <Cpu className="w-4 h-4 mx-auto mb-1 opacity-80 animate-spin-slow" />
                    <span className="block text-[10px]">Auto Controller</span>
                    <span className="block text-[8px] font-mono opacity-80">PKR {priceAuto}</span>
                  </button>

                  <button
                    onClick={() => setIndicatorType("siren")}
                    className={`p-2 rounded-xl border text-center transition ${
                      indicatorType === "siren"
                        ? "bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <Bell className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <span className="block text-[10px]">Overflow Alarm</span>
                    <span className="block text-[8px] font-mono opacity-80">PKR {priceSiren}</span>
                  </button>
                </div>
              </div>

              {/* 2. Floors Range Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-blue-400" />
                    <span>Building Height / Floors (عمارت کی منزلیں)</span>
                  </label>
                  <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md font-mono">{floorsCount} Floors (~{floorsCount * 12} ft)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={floorsCount}
                  onChange={(e) => setFloorsCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-semibold font-mono">
                  <span>1 Floor (12ft)</span>
                  <span>3 Floors (36ft)</span>
                  <span>6 Floors (72ft)</span>
                </div>
              </div>

              {/* 3. Horizontal Distance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Horizontal Wiring Path (کل لمبائی)</span>
                  </label>
                  <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-mono">{horizontalDistance} Feet</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={250}
                  step={10}
                  value={horizontalDistance}
                  onChange={(e) => setHorizontalDistance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-semibold font-mono">
                  <span>10 ft</span>
                  <span>120 ft</span>
                  <span>250 ft</span>
                </div>
              </div>

              {/* 4. Wire buying preference */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block text-xs">
                  Sensor Signal Cable Package (تار کا پیکج)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWireOption("roll")}
                    className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                      wireOption === "roll"
                        ? "bg-blue-600/10 border-blue-500/60 text-blue-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div>
                      <span className="block text-[10px]">30-Meter Wires Roll</span>
                      <span className="block text-[8px] font-mono opacity-80">Full Roll (Safe/Sealed)</span>
                    </div>
                    <span className="text-[10px] font-bold font-mono">PKR {priceCableRoll}</span>
                  </button>

                  <button
                    onClick={() => setWireOption("meters")}
                    className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                      wireOption === "meters"
                        ? "bg-blue-600/10 border-blue-500/60 text-blue-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div>
                      <span className="block text-[10px]">Loose by the Meter</span>
                      <span className="block text-[8px] font-mono opacity-80">Pay per Exact Meter</span>
                    </div>
                    <span className="text-[10px] font-bold font-mono">PKR {priceCablePerMeter}/m</span>
                  </button>
                </div>
              </div>

              {/* 5. Additional Services switches */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="block font-bold text-[10px] text-slate-200">Include Professional Installation</span>
                      <span className="block text-[8px] text-slate-400">Fitting with expert clips, plugs & calibration</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includePlumberLabor}
                    onChange={(e) => setIncludePlumberLabor(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 outline-none cursor-pointer"
                  />
                </div>

                <div className="border-t border-slate-800/60 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Standard Installation Fee:</span>
                  <span className="font-bold text-slate-200 font-mono">PKR 1,500</span>
                </div>
              </div>

              {/* 6. Dynamic Quotation Quick Summary in form */}
              <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Investment Package</span>
                  <span className="text-base font-black text-amber-400 font-mono">PKR {grandTotal.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] text-slate-400">Total Signal Cable:</span>
                  <span className="block text-xs font-bold text-indigo-400 font-mono">{totalWireMeters} Meters (~{totalWireFeet} ft)</span>
                </div>
              </div>

            </div>

            {/* LIVE SIMULATOR & RICH ESTIMATION SHEETS (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* INTERACTIVE SIMULATOR CARD */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Live Customer Demo Simulator (انٹرایکٹو ڈیمو)</span>
                    </h4>
                    <p className="text-[9px] text-slate-400">Tap levels to demonstrate the automatic lights, siren or pump switch to customer!</p>
                  </div>
                  
                  {/* Water level quick selector buttons */}
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDemoWaterLevel(level)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono transition ${
                          demoWaterLevel === level
                            ? "bg-blue-600 text-white"
                            : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {level}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Simulated Water Tank UI */}
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center min-h-[170px] relative">
                    <span className="absolute top-2 left-2 text-[9px] text-slate-500 font-semibold">WATER TANK (واٹر ٹینک)</span>
                    
                    {/* The physical tank cylinder look */}
                    <div className="w-24 h-32 border-2 border-slate-700 rounded-b-xl rounded-t-md relative bg-slate-900 overflow-hidden flex flex-col justify-end shadow-inner">
                      
                      {/* Water volume body */}
                      <div 
                        className="w-full bg-gradient-to-t from-sky-600/80 to-blue-400/80 transition-all duration-700 ease-in-out relative"
                        style={{ height: `${demoWaterLevel}%` }}
                      >
                        {/* Wavy bubble effect */}
                        {demoWaterLevel > 0 && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-sky-200/50 animate-pulse" />
                        )}
                        {demoPumpOn && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                            <span className="text-[9px] font-bold tracking-widest text-white animate-bounce">↓↓ FLOWING ↓↓</span>
                          </div>
                        )}
                      </div>

                      {/* Sensor steel probe lines on the side */}
                      <div className="absolute inset-y-0 right-1.5 flex flex-col justify-between py-2 text-[8px] font-bold z-10 pointer-events-none">
                        <div className={`w-3 h-0.5 border-b border-slate-500 ${demoWaterLevel >= 100 ? "border-emerald-400 bg-emerald-400" : ""}`} title="100% Sensor Probe" />
                        <div className={`w-3 h-0.5 border-b border-slate-500 ${demoWaterLevel >= 75 ? "border-blue-400 bg-blue-400" : ""}`} title="75% Sensor Probe" />
                        <div className={`w-3 h-0.5 border-b border-slate-500 ${demoWaterLevel >= 50 ? "border-amber-400 bg-amber-400" : ""}`} title="50% Sensor Probe" />
                        <div className={`w-3 h-0.5 border-b border-slate-500 ${demoWaterLevel >= 25 ? "border-rose-400 bg-rose-400" : ""}`} title="25% Sensor Probe" />
                        <div className="w-3 h-0.5 border-b border-emerald-400 bg-emerald-400" title="Ground Common Probe" />
                      </div>

                      {/* Over-flow water drops coming from top if over 100 */}
                      {demoWaterLevel === 100 && demoBuzzerPulse && (
                        <span className="absolute top-0 right-4 text-emerald-400 animate-ping text-xs">💧</span>
                      )}
                    </div>

                    <div className="mt-2 text-center">
                      <span className="text-[10px] font-bold text-slate-300 block">Water Status: {demoWaterLevel === 100 ? "🎉 TANK FULL!" : `${demoWaterLevel}% Level`}</span>
                      <span className="text-[8px] text-slate-500 block leading-tight">4 Stainless Steel SS-304 food-grade probes installed inside</span>
                    </div>
                  </div>

                  {/* Simulated Indicator Controller Display */}
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-between min-h-[170px] relative">
                    <span className="absolute top-2 left-2 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{indicatorBrand} SYSTEM</span>
                    
                    {/* The Indicator Box */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 pt-4">
                      
                      {indicatorType === "led" && (
                        /* ── DEVICE A: LED LEVEL INDICATOR DISPLAY ── */
                        <div className="w-32 bg-slate-900 border-2 border-slate-700 rounded-xl p-2.5 shadow-xl relative">
                          <div className="text-[8px] text-slate-400 font-bold tracking-widest text-center border-b border-slate-800 pb-1 mb-2">WATER LEVEL</div>
                          
                          <div className="space-y-1.5">
                            {/* 100% LED (Green) */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 font-mono font-bold">100% (Full)</span>
                              <div className={`w-3.5 h-3.5 rounded-full border border-slate-800 transition-all duration-300 ${demoWaterLevel >= 100 ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-950"}`} />
                            </div>
                            
                            {/* 75% LED (Blue) */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 font-mono font-bold">75% (Normal)</span>
                              <div className={`w-3.5 h-3.5 rounded-full border border-slate-800 transition-all duration-300 ${demoWaterLevel >= 75 ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" : "bg-slate-950"}`} />
                            </div>

                            {/* 50% LED (Yellow/Orange) */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 font-mono font-bold">50% (Medium)</span>
                              <div className={`w-3.5 h-3.5 rounded-full border border-slate-800 transition-all duration-300 ${demoWaterLevel >= 50 ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-slate-950"}`} />
                            </div>

                            {/* 25% LED (Red) */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-400 font-mono font-bold">25% (Low)</span>
                              <div className={`w-3.5 h-3.5 rounded-full border border-slate-800 transition-all duration-300 ${demoWaterLevel >= 25 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" : "bg-slate-950"}`} />
                            </div>
                          </div>

                          {/* Built-in buzzer speaker visualization */}
                          <div className={`absolute -right-1 -top-1 w-3 h-3 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center ${demoBuzzerPulse ? "animate-ping bg-emerald-500" : ""}`}>
                            <span className="w-1 h-1 bg-slate-600 rounded-full" />
                          </div>
                        </div>
                      )}

                      {indicatorType === "auto" && (
                        /* ── DEVICE B: AUTOMATIC PUMP SWITCH CONTROLLER ── */
                        <div className="w-36 bg-slate-900 border-2 border-slate-700 rounded-xl p-2 shadow-xl">
                          <div className="text-[8px] text-slate-400 font-bold tracking-widest text-center border-b border-slate-800 pb-1 mb-2">AUTO PUMP SWITCH</div>
                          
                          <div className="space-y-2">
                            {/* Pump Motor State LED */}
                            <div className="flex items-center justify-between p-1 bg-slate-950 rounded border border-slate-800">
                              <span className="text-[9px] text-slate-300 font-bold font-mono">PUMP MOTOR:</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${demoPumpOn ? "bg-emerald-500/20 text-emerald-300 animate-pulse" : "bg-rose-500/20 text-rose-300"}`}>
                                {demoPumpOn ? "RUNNING (آن)" : "STOPPED (آف)"}
                              </span>
                            </div>

                            {/* Automation Logic display */}
                            <div className="text-[8.5px] text-slate-400 leading-tight space-y-0.5 px-0.5 text-center">
                              <span className="block text-emerald-400 font-semibold">✓ Auto-Start: Triggered at 25%</span>
                              <span className="block text-amber-400 font-semibold">✓ Auto-Cutoff: Triggered at 100%</span>
                            </div>

                            {/* Pump Motor Visual Animation */}
                            <div className="flex justify-center pt-1">
                              <div className={`w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center ${demoPumpOn ? "animate-spin border-emerald-400 text-emerald-400" : "border-slate-700 text-slate-600"}`}>
                                <Zap className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {indicatorType === "siren" && (
                        /* ── DEVICE C: OVER-FLOW SIREN LOUD BELL ── */
                        <div className="w-32 bg-slate-900 border-2 border-slate-700 rounded-xl p-2.5 shadow-xl text-center space-y-2 relative">
                          <div className="text-[8px] text-slate-400 font-bold tracking-widest border-b border-slate-800 pb-1 mb-1">OVERFLOW SIREN</div>
                          
                          <div className="flex justify-center">
                            <div className={`p-2.5 rounded-full border transition-all duration-300 ${demoWaterLevel === 100 ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-bounce" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                              <Bell className="w-6 h-6" />
                            </div>
                          </div>

                          <div className="text-center font-bold">
                            {demoWaterLevel === 100 ? (
                              <div className="text-rose-400 text-[10px] animate-pulse">
                                🚨 ALARM RINGING!
                                <span className="block text-[8px] font-mono opacity-80 mt-0.5">Loud Dual-Tone AC Siren</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[9px] font-medium block">Monitoring... (Silent)</span>
                            )}
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="text-[9px] text-slate-400 font-semibold text-center border-t border-slate-800/80 w-full pt-1.5">
                      {indicatorType === "led" && "4 LED displays wire levels safe 5V DC low current"}
                      {indicatorType === "auto" && "Industrial 30A Relay for Water Suction & Tubewell Motors"}
                      {indicatorType === "siren" && "High-pitch 220V AC dual-tone direct sound siren alarm"}
                    </div>
                  </div>

                </div>
              </div>

              {/* GENERATED BOQ & MATERIAL BREAKDOWN TAB */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[300px]">
                
                <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-[9px] uppercase shadow-sm">
                      QUOTE ESTIMATE
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">Water Tank Indicator Installation BOQ</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setShowIndicatorPrintHeader(true);
                        setTimeout(() => {
                          window.print();
                          setShowIndicatorPrintHeader(false);
                        }, 200);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition text-[10px] active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Quote
                    </button>
                    <button
                      onClick={handleCopyIndicatorQuote}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/60 transition text-[10px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Markdown
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto max-h-[50vh] bg-slate-950/60 font-sans text-slate-200 leading-relaxed text-xs printable-indicator-area">
                  <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      .printable-indicator-area, .printable-indicator-area * {
                        visibility: visible !important;
                      }
                      .printable-indicator-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        color: #000000 !important;
                        background: #ffffff !important;
                        padding: 20px !important;
                        font-size: 13px !important;
                        line-height: 1.5 !important;
                      }
                      .printable-indicator-area table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin: 15px 0 !important;
                      }
                      .printable-indicator-area th, .printable-indicator-area td {
                        border: 1px solid #000000 !important;
                        padding: 8px !important;
                        color: #000000 !important;
                      }
                      .printable-indicator-area h1, .printable-indicator-area h2, .printable-indicator-area h3, .printable-indicator-area h4 {
                        color: #000000 !important;
                        margin-top: 15px !important;
                      }
                    }
                  `}} />
                  
                  {/* Formal Print Receipt Banner */}
                  {(showIndicatorPrintHeader || true) && (
                    <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-5 text-black">
                      <h1 className="text-lg font-bold text-black tracking-tight">{settings.storeName}</h1>
                      <p className="text-[10px] text-black font-semibold mt-1">#03 Sikandro Square, Khyber Bazaar, Peshawar | PTCL: 091-2565800 | Mobile: 0300-5861463</p>
                      <p className="text-[10px] text-black mt-0.5 font-bold uppercase">WATER TANK AUTOMATION & INDICATOR STATEMENT QUOTATION</p>
                      <p className="text-[9px] text-black mt-1">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  )}

                  {/* Aesthetic visual Invoice statement for customer */}
                  <div className="space-y-4 text-xs text-slate-300">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 bg-slate-900/40 p-2.5 rounded-lg">
                      <div>
                        <span className="text-[9px] text-slate-500 block">CLIENT HARDWARE WARRANTY</span>
                        <span className="font-bold text-amber-400">1-Year Brand Replacement Guarantee</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block">INSTALLATION SAFETY</span>
                        <span className="font-bold text-emerald-400">5V DC Shock-Free Safety</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-200">Material Bill of Materials (BOM) Breakdown:</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="py-2 font-bold">Item Description</th>
                              <th className="py-2 text-center font-bold">Qty</th>
                              <th className="py-2 text-right font-bold">Unit Rate</th>
                              <th className="py-2 text-right font-bold">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            <tr>
                              <td className="py-2.5 font-medium text-slate-100">
                                {selectedUnitName} <span className="text-[9px] text-amber-500 block font-mono">{selectedUnitCode}</span>
                              </td>
                              <td className="py-2.5 text-center">1 pc</td>
                              <td className="py-2.5 text-right font-mono">PKR {selectedUnitPrice.toLocaleString()}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-slate-100">PKR {selectedUnitPrice.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-medium text-slate-100">
                                {probesName} <span className="text-[9px] text-slate-500 block font-mono">IND-PROBE-SS</span>
                              </td>
                              <td className="py-2.5 text-center">1 set</td>
                              <td className="py-2.5 text-right font-mono font-medium text-slate-400">PKR {priceProbeSet.toLocaleString()}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-slate-100">PKR {priceProbeSet.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-medium text-slate-100">
                                {cableName} <span className="text-[9px] text-slate-500 block font-mono">{wireOption === "roll" ? "IND-CABLE-30" : "IND-LOOSE"}</span>
                              </td>
                              <td className="py-2.5 text-center">{cableQty} {cableUnit}(s)</td>
                              <td className="py-2.5 text-right font-mono font-medium text-slate-400">PKR {(wireOption === "roll" ? priceCableRoll : priceCablePerMeter).toLocaleString()}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-slate-100">PKR {cableCost.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-medium text-slate-300">
                                Standard installation accessories (Teflon tape, clips, rawal plugs)
                              </td>
                              <td className="py-2.5 text-center">1 pack</td>
                              <td className="py-2.5 text-right font-mono font-medium text-slate-400">PKR {installationAccessories}</td>
                              <td className="py-2.5 text-right font-mono font-bold text-slate-100">PKR {installationAccessories}</td>
                            </tr>
                            {includePlumberLabor && (
                              <tr>
                                <td className="py-2.5 font-medium text-emerald-400 flex items-center gap-1">
                                  <span>Installer Expert Installation & Commissioning Service</span>
                                </td>
                                <td className="py-2.5 text-center">1 Job</td>
                                <td className="py-2.5 text-right font-mono font-medium text-slate-400">PKR 1,500</td>
                                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">PKR 1,500</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-400 font-semibold leading-tight max-w-sm">
                        💡 <span className="font-bold text-amber-500">Store Recommendation:</span> Copper wires should be safely routed along water supply pipes using high-quality insulated clips to maximize lifespan.
                      </div>
                      
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl min-w-[200px] text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block leading-none mb-1">TOTAL GRAND ESTIMATE</span>
                        <span className="text-lg font-black text-amber-400 font-mono">PKR {grandTotal.toLocaleString()}</span>
                        <span className="text-[8px] text-slate-500 block font-bold leading-none mt-1">Cash / Khata / WhatsApp Payable</span>
                      </div>
                    </div>

                    {/* Print Only Footer inside container */}
                    <div className="hidden print:block pt-4 border-t border-black text-center text-[9px] text-black font-semibold mt-4">
                      <p>Thank you for choosing Haider Pipe and Sanitary store for your dream home!</p>
                      <p className="mt-0.5">Please visit us or contact WhatsApp: 0300-5861464</p>
                    </div>

                  </div>

                </div>
              </div>

            </div>

          </div>
        </>
      ) : (
        <OnlinePlumberRouter settings={settings} />
      )}

    </div>
  );
};
