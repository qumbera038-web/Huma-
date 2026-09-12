import React, { useState, useEffect, useMemo } from "react";
import { StoreSettings } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { 
  MapPin, 
  Navigation, 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare, 
  Share2, 
  CheckCircle, 
  CheckCircle2,
  AlertCircle, 
  UserCheck, 
  Compass, 
  Car, 
  Building2, 
  ShieldCheck, 
  Star, 
  Send, 
  Printer,
  Copy,
  Sparkles,
  Wrench,
  Zap,
  LocateFixed,
  Radio,
  Sliders,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  User,
  Mail,
  AlertTriangle
} from "lucide-react";

export interface BranchLocation {
  id: string;
  code: string;
  name: string;
  shortName: string;
  urduName: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  manager: string;
  lat: number;
  lng: number;
}

export const HAIDER_BRANCHES: BranchLocation[] = [
  {
    id: "branch-1",
    code: "BR-01",
    name: "Branch 1 - Main Head Office (حیدر علی - مین ہیڈ)",
    shortName: "Branch 1 (Main HQ)",
    urduName: "برانچ 1 - مین ہیڈ آفیس (حیدر علی)",
    address: "#03 Sikandro Square, Khyber Bazaar, Peshawar",
    city: "Peshawar",
    phone: "0300-5861463",
    whatsapp: "923005861463",
    manager: "Qumber Ali Shah (Super Admin)",
    lat: 34.0084,
    lng: 71.5672,
  },
  {
    id: "branch-2",
    code: "BR-02",
    name: "Branch 2 - Asad Sanitary Store (اسد سینیٹری اسٹور)",
    shortName: "Branch 2 (City Outlet)",
    urduName: "برانچ 2 - اسد سینیٹری اسٹور (حمزہ علی)",
    address: "Shop #5, City Hardware Plaza, Brandreth Road, Peshawar",
    city: "Peshawar",
    phone: "0321-8899771",
    whatsapp: "923218899771",
    manager: "Hamza Ali",
    lat: 34.0155,
    lng: 71.5802,
  },
  {
    id: "branch-3",
    code: "BR-03",
    name: "Branch 3 - Abbas Sanitary (عباس سینیٹری)",
    shortName: "Branch 3 (Bypass / Ring Road)",
    urduName: "برانچ 3 - عباس سینیٹری (عباس علی / کزن)",
    address: "Bypass Junction, Ring Road, Peshawar",
    city: "Peshawar",
    phone: "0333-7744112",
    whatsapp: "923337744112",
    manager: "Abbas Ali",
    lat: 33.9850,
    lng: 71.5400,
  },
];

// Reference cities with known coordinates for fallback city mapping
const PAKISTAN_CITIES = [
  { name: "Peshawar", urduName: "پشاور", lat: 34.0151, lng: 71.5249, inCity: true },
  { name: "Charsadda", urduName: "چارسدہ", lat: 34.1482, lng: 71.7406, inCity: false },
  { name: "Nowshera", urduName: "نوشہرہ", lat: 34.0153, lng: 71.9747, inCity: false },
  { name: "Mardan", urduName: "مردان", lat: 34.1986, lng: 72.0404, inCity: false },
  { name: "Swabi", urduName: "صوابی", lat: 34.1202, lng: 72.4700, inCity: false },
  { name: "Kohat", urduName: "کوہاٹ", lat: 33.5869, lng: 71.4414, inCity: false },
  { name: "Abbottabad", urduName: "ایبٹ آباد", lat: 34.1688, lng: 73.2215, inCity: false },
  { name: "Islamabad", urduName: "اسلام آباد", lat: 33.6844, lng: 73.0479, inCity: false },
  { name: "Rawalpindi", urduName: "راولپنڈی", lat: 33.5651, lng: 73.0169, inCity: false },
  { name: "Lahore", urduName: "لاہور", lat: 31.5204, lng: 74.3587, inCity: false },
];

// Verified Local Plumber Partners for out-of-city requests
const OUT_OF_CITY_PLUMBER_PARTNERS: Record<string, { name: string; phone: string; rating: number; experience: string }> = {
  "Charsadda": { name: "Ustad Saleem Khan (Charsadda Partner)", phone: "0302-9182734", rating: 4.9, experience: "12 Years Expert" },
  "Nowshera": { name: "Ustad Tariq Mehmood (Nowshera Partner)", phone: "0313-8822991", rating: 4.8, experience: "9 Years Expert" },
  "Mardan": { name: "Ustad Jan Sher (Mardan Partner)", phone: "0345-7766554", rating: 4.9, experience: "15 Years Expert" },
  "Swabi": { name: "Ustad Bakhtiar Ali (Swabi Partner)", phone: "0300-4433221", rating: 4.7, experience: "8 Years Expert" },
  "Kohat": { name: "Ustad Niaz Gul (Kohat Partner)", phone: "0331-5544332", rating: 4.8, experience: "10 Years Expert" },
  "Abbottabad": { name: "Ustad Zahid Iqbal (Hazara Partner)", phone: "0312-9988776", rating: 4.9, experience: "14 Years Expert" },
  "Islamabad": { name: "Ustad Naveed Abbasi (Twin Cities Partner)", phone: "0305-6677889", rating: 4.9, experience: "11 Years Expert" },
  "Rawalpindi": { name: "Ustad Asghar Butt (Pindi Partner)", phone: "0323-5566778", rating: 4.8, experience: "13 Years Expert" },
  "default": { name: "Qumber Sanitary Certified Mobile Tech Team", phone: "0300-5861463", rating: 5.0, experience: "Central Verified Partner Network" }
};

// Calculate Haversine distance in KM
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface OnlinePlumberRouterProps {
  settings: StoreSettings;
}

export const OnlinePlumberRouter: React.FC<OnlinePlumberRouterProps> = ({ settings }) => {
  const { t, language } = useLanguage();

  // Geolocation states
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userLat, setUserLat] = useState<number>(34.0084);
  const [userLng, setUserLng] = useState<number>(71.5672);
  const [detectedCity, setDetectedCity] = useState<string>("Peshawar");
  const [locationAddress, setLocationAddress] = useState<string>("Khyber Bazaar / Saddar Area, Peshawar");
  const [manualCityOverride, setManualCityOverride] = useState<string>("Peshawar");
  const [locationSource, setLocationSource] = useState<"gps" | "manual" | "default">("default");

  // Registration states (Google-like 1-click registration)
  const [customerName, setCustomerName] = useState<string>("Muhammad Usman");
  const [customerPhone, setCustomerPhone] = useState<string>("0300-1234567");
  const [customerEmail, setCustomerEmail] = useState<string>("usman.customer@gmail.com");
  const [customerAddress, setCustomerAddress] = useState<string>("House #14, Street 5, Phase 3, Hayatabad, Peshawar");
  const [isGoogleRegistered, setIsGoogleRegistered] = useState<boolean>(true);
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);

  // Appointment states
  const [serviceType, setServiceType] = useState<string>("Sanitary Fitting & Faucets Repair (سینیٹری و ٹونٹی فٹنگ)");
  const [urgencyLevel, setUrgencyLevel] = useState<"standard" | "urgent" | "emergency">("standard");
  const [meetingDate, setMeetingDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [meetingTimeSlot, setMeetingTimeSlot] = useState<string>("10:00 AM - 12:00 PM (Morning Slot)");
  const [problemDescription, setProblemDescription] = useState<string>("Need complete master bathroom sanitary ware fitting and water mixer installation.");

  // Variable visit charge state
  // Standard in-city base visit charge is 1000 per user request, with full variable adjustments
  const [baseVisitCharge, setBaseVisitCharge] = useState<number>(1000);
  const [perKmSurcharge, setPerKmSurcharge] = useState<number>(25); // Rs 25/km for out-of-city travel
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [showAppointmentTicketModal, setShowAppointmentTicketModal] = useState<boolean>(false);

  // Auto-detect location on initial render
  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setLocationSource("gps");

        // Calculate closest known city
        let closestCity = "Peshawar";
        let minCityDist = 999999;
        PAKISTAN_CITIES.forEach((c) => {
          const d = calculateDistanceKm(lat, lng, c.lat, c.lng);
          if (d < minCityDist) {
            minCityDist = d;
            closestCity = c.name;
          }
        });

        // Try reverse geocoding via OpenStreetMap
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`);
          if (resp.ok) {
            const data = await resp.json();
            const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state_district || closestCity;
            setDetectedCity(city);
            setManualCityOverride(city);
            const fullAddr = data.display_name?.split(",").slice(0, 3).join(", ") || `${city}, Pakistan`;
            setLocationAddress(fullAddr);
            if (!customerAddress || customerAddress.includes("Hayatabad")) {
              setCustomerAddress(fullAddr);
            }
          } else {
            setDetectedCity(closestCity);
            setManualCityOverride(closestCity);
            setLocationAddress(`${closestCity} (Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)})`);
          }
        } catch {
          setDetectedCity(closestCity);
          setManualCityOverride(closestCity);
          setLocationAddress(`${closestCity} (Lat: ${lat.toFixed(3)}, Lng: ${lng.toFixed(3)})`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn("Geolocation prompt error or denied:", err.message);
        setGeoError("GPS Permission denied or unavailable. Using standard Peshawar central coordinates.");
        setIsDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualCitySelect = (cityName: string) => {
    setManualCityOverride(cityName);
    setDetectedCity(cityName);
    setLocationSource("manual");
    const matched = PAKISTAN_CITIES.find((c) => c.name === cityName);
    if (matched) {
      setUserLat(matched.lat);
      setUserLng(matched.lng);
      setLocationAddress(`${cityName} Center, KP / Pakistan`);
      setCustomerAddress(`Main Road, ${cityName}`);
    }
  };

  // Compute nearest Qumber Branch calculations
  const branchDistances = useMemo(() => {
    return HAIDER_BRANCHES.map((b) => {
      const distance = calculateDistanceKm(userLat, userLng, b.lat, b.lng);
      return {
        branch: b,
        distance,
      };
    }).sort((a, b) => a.distance - b.distance);
  }, [userLat, userLng]);

  const nearestBranch = branchDistances[0].branch;
  const nearestDistance = branchDistances[0].distance;

  // In-City vs Out-of-City classification
  // In-city is <= 25km radius from Peshawar central branches
  const isOutOfCity = nearestDistance > 25 || (detectedCity !== "Peshawar" && !detectedCity.toLowerCase().includes("peshawar"));

  // Assigned Plumber / Partner Plumber details
  const assignedPlumber = useMemo(() => {
    if (!isOutOfCity) {
      // In-City official Qumber technician
      return {
        name: `Ustad Farooq (Official ${nearestBranch.shortName} Master Plumber)`,
        phone: nearestBranch.phone,
        whatsapp: nearestBranch.whatsapp,
        rating: 4.9,
        type: "Direct Qumber Store Employee",
        badge: "✓ Verified Qumber Master Technician",
      };
    } else {
      // Out-of-City partner plumber
      const partner = OUT_OF_CITY_PLUMBER_PARTNERS[detectedCity] || OUT_OF_CITY_PLUMBER_PARTNERS["default"];
      return {
        name: `${partner.name}`,
        phone: partner.phone,
        whatsapp: partner.phone.replace(/[^0-9]/g, ""),
        rating: partner.rating,
        type: `Nearest Verified ${detectedCity} Partner Network`,
        badge: `✓ Certified Local Partner (${partner.experience})`,
      };
    }
  }, [isOutOfCity, nearestBranch, detectedCity]);

  // Calculate total variable visit charge
  const calculatedVisitCharge = useMemo(() => {
    let charge = baseVisitCharge;

    // Urgency factor
    if (urgencyLevel === "urgent") charge += 500;
    if (urgencyLevel === "emergency") charge += 1000;

    // Out of city travel calculation
    if (isOutOfCity) {
      const extraKm = Math.max(0, nearestDistance - 20);
      const travelSurcharge = Math.round(extraKm * perKmSurcharge);
      charge += Math.max(500, travelSurcharge);
    }

    return charge;
  }, [baseVisitCharge, urgencyLevel, isOutOfCity, nearestDistance, perKmSurcharge]);

  // Google 1-Click Fast Register Handler
  const handleGoogleQuickFill = () => {
    setCustomerName("Muhammad Usman (Google User)");
    setCustomerEmail("usman.engineer@gmail.com");
    setCustomerPhone("0300-5861463");
    setIsGoogleRegistered(true);
    setRegistrationNotice("✓ Google Profile Linked! You are eligible for 1-Year QumberSanitary Dream Home Warranty.");
    setTimeout(() => setRegistrationNotice(null), 4000);
  };

  // Generate Booking Confirmation WhatsApp Message
  const confirmationWhatsAppMessage = useMemo(() => {
    return `🔧 *HAIDER SANITARY - PLUMBER APPOINTMENT CONFIRMED*
Salam *${customerName}*! Your plumbing service appointment has been booked.

📋 *Booking Details:*
• 📅 *Meeting Date:* ${meetingDate}
• ⏰ *Meeting Time Slot:* ${meetingTimeSlot}
• 🛠️ *Service Required:* ${serviceType}
• 🏢 *Assigned Nearest Branch:* ${nearestBranch.urduName} (ID: ${nearestBranch.code})
• 📍 *Your Location / City:* ${detectedCity} (${nearestDistance} km away)
• 🏷️ *Service Type:* ${isOutOfCity ? "⚠️ Out-of-City Network Partner" : "✅ In-City Official Store Technician"}

👨‍🔧 *Assigned Plumber Technician:*
• Name: *${assignedPlumber.name}*
• Contact / WhatsApp: ${assignedPlumber.phone}
• Quality Rating: ⭐ ${assignedPlumber.rating}/5.0 (${assignedPlumber.badge})

💰 *Visit & Inspection Charges:*
• Total Variable Visit Charge: *PKR ${calculatedVisitCharge.toLocaleString()}*
${isOutOfCity ? `• Includes Out-of-City Travel & Nearest Plumber Network Surcharge` : `• Standard In-City Visit Fee (PKR ${baseVisitCharge.toLocaleString()})`}

🛡️ *QumberSanitary Promise:*
Building trust to make your dream home reality with 100% genuine pipes & sanitary fittings!

📞 *Head Office Helpline:* 0300-5861463 | PTCL: 091-2565800
Store Address: #03 Sikandro Square, Khyber Bazaar, Peshawar`;
  }, [customerName, meetingDate, meetingTimeSlot, serviceType, nearestBranch, detectedCity, nearestDistance, isOutOfCity, assignedPlumber, calculatedVisitCharge, baseVisitCharge]);

  // Generate Work Complete WhatsApp Message
  const workCompleteWhatsAppMessage = useMemo(() => {
    return `✅ *HAIDER SANITARY - WORK COMPLETION & WARRANTY REPORT*
Salam *${customerName}*!

Your plumbing and sanitary installation work has been *SUCCESSFULLY COMPLETED*.

📋 *Job Summary:*
• 🛠️ *Work Done:* ${serviceType}
• 📅 *Completion Date:* ${new Date().toLocaleDateString()}
• 🏢 *Coordinating Branch:* ${nearestBranch.name}
• 👨‍🔧 *Technician:* ${assignedPlumber.name}
• 💵 *Visit & Labor Paid:* PKR ${calculatedVisitCharge.toLocaleString()}

🛡️ *WARRANTY & TRUST CERTIFICATE:*
• 1-Year Leak-Free & Quality Fitting Guarantee by Qumber Pipe & Sanitary Store.
• 100% Master PPRC, Popular PVC & Pure Brass Certified.

🌟 *Customer Feedback:*
Please rate our plumber's service: ⭐⭐⭐⭐⭐ (5/5)
For next orders or pipe supplies, WhatsApp us: 0300-5861463!`;
  }, [customerName, serviceType, nearestBranch, assignedPlumber, calculatedVisitCharge]);

  const handleCopyMessage = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(label);
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleSendWhatsApp = (text: string) => {
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `92${cleanPhone.slice(1)}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone || nearestBranch.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-blue-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-black text-[10px] tracking-wider uppercase border border-blue-500/30">
              SMART DISPATCH & GPS ROUTING
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Online Plumber Network
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-100 mt-1 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>Online Plumber Booking & Nearest Branch Router</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            1-Click Google registration • GPS city detection • Nearest branch suggestion • Variable visit charges • Automated WhatsApp reply
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={detectUserLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
          >
            {isDetectingLocation ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Detecting GPS...</span>
              </>
            ) : (
              <>
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Refresh My City (GPS 📍)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowAppointmentTicketModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      {/* Geolocation & Nearest Branch Live Status Bar */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isOutOfCity 
          ? "bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20" 
          : "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: User Detected City & Location */}
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isOutOfCity ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DETECTED USER LOCATION
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-100">
                  {detectedCity}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  isOutOfCity 
                    ? "bg-amber-500/30 text-amber-200 border border-amber-500/40" 
                    : "bg-emerald-500/30 text-emerald-200 border border-emerald-500/40"
                }`}>
                  {isOutOfCity ? "⚠️ Out-of-City Request" : "✅ In-City Service"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{locationAddress}</p>
              
              {/* Quick City Override Pills */}
              <div className="flex items-center gap-1 pt-1 flex-wrap">
                <span className="text-[9px] text-slate-500">Quick Switch:</span>
                {PAKISTAN_CITIES.slice(0, 5).map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleManualCitySelect(c.name)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition ${
                      detectedCity === c.name 
                        ? "bg-blue-600 text-white font-bold" 
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Auto Suggested Nearest Branch */}
          <div className="flex items-start gap-3 border-t md:border-t-0 md:border-s border-slate-800 pt-3 md:pt-0 md:ps-4">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                SUGGESTED NEAREST BRANCH ID
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400">
                  {nearestBranch.code}: {nearestBranch.shortName}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  {nearestDistance} km
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{nearestBranch.address}</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                <span>Manager: <strong className="text-slate-200">{nearestBranch.manager}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-mono font-bold">{nearestBranch.phone}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Assigned Plumber / Nearest Local Partner */}
          <div className="flex items-start gap-3 border-t md:border-t-0 md:border-s border-slate-800 pt-3 md:pt-0 md:ps-4">
            <div className={`p-2.5 rounded-xl shrink-0 ${isOutOfCity ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isOutOfCity ? "AUTO-ASSIGNED LOCAL PARTNER" : "OFFICIAL STORE TECHNICIAN"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100">{assignedPlumber.name}</span>
                <span className="text-[10px] text-amber-400 font-bold">⭐ {assignedPlumber.rating}</span>
              </div>
              <p className="text-[10px] text-emerald-300 font-semibold">{assignedPlumber.badge}</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="font-mono">{assignedPlumber.phone}</span>
                {isOutOfCity && (
                  <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[8px] font-black rounded uppercase">
                    Partner Network
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main 2-Column Interface: Left = Registration & Appointment / Right = Variable Pricing & WhatsApp Automation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: 1-Click Registration & Appointment Planner (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Section 1: Google 1-Click Registration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-xs">Step 1: 1-Click Registration (Google Style)</h3>
                  <p className="text-[10px] text-slate-400">Quick verified customer profile with dream home warranty eligibility</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleQuickFill}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Quick Fill with Google</span>
              </button>
            </div>

            {registrationNotice && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{registrationNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Customer Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Muhammad Usman"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">WhatsApp / Mobile Phone *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Email (Optional)</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. customer@gmail.com"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">House Address & Nearest Landmark *</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. Street 4, Hayatabad / University Town"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Online Appointment & Meeting Time */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-slate-200 text-xs">Step 2: Online Appointment & Meeting Time</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                Guaranteed Time Slot
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Select Plumbing Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
                >
                  <option value="Sanitary Fitting & Faucets Repair (سینیٹری و ٹونٹی فٹنگ)">Sanitary Fitting & Faucets Repair (سینیٹری و ٹونٹی فٹنگ)</option>
                  <option value="Water Tank Indicator & Auto Pump Installation (واٹر ٹینک انڈیکیٹر و موٹر)">Water Tank Indicator & Auto Pump Installation (واٹر ٹینک انڈیکیٹر و موٹر)</option>
                  <option value="PPRC & PVC Pipe Leakage Repairing (پائپ لیکیج ریپئرنگ)">PPRC & PVC Pipe Leakage Repairing (پائپ لیکیج ریپئرنگ)</option>
                  <option value="Full Bathroom Renovation & Mixer Replacement (مکمل باتھ روم ریپلیسمنٹ)">Full Bathroom Renovation & Mixer Replacement (مکمل باتھ روم ریپلیسمنٹ)</option>
                  <option value="New House Full Plumbing Contract Estimate (نئے گھر کا مکمل پلمبنگ تخمینہ)">New House Full Plumbing Contract Estimate (نئے گھر کا مکمل پلمبنگ تخمینہ)</option>
                  <option value="Emergency Water Leak / Motor Breakdown (ایمرجنسی لیکیج یا موٹر خرابی)">Emergency Water Leak / Motor Breakdown (ایمرجنسی لیکیج یا موٹر خرابی)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Appointment Date (ملاقات کی تاریخ)</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Meeting Time Slot (ملاقات کا وقت)</label>
                  <select
                    value={meetingTimeSlot}
                    onChange={(e) => setMeetingTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
                  >
                    <option value="09:00 AM - 11:00 AM (Morning Slot)">09:00 AM - 11:00 AM (Morning Slot)</option>
                    <option value="11:00 AM - 01:00 PM (Mid-Day Slot)">11:00 AM - 01:00 PM (Mid-Day Slot)</option>
                    <option value="02:00 PM - 04:00 PM (Afternoon Slot)">02:00 PM - 04:00 PM (Afternoon Slot)</option>
                    <option value="04:00 PM - 06:00 PM (Evening Slot)">04:00 PM - 06:00 PM (Evening Slot)</option>
                    <option value="06:00 PM - 08:00 PM (Night Slot)">06:00 PM - 08:00 PM (Night Slot)</option>
                    <option value="Emergency ASAP (Within 45 Minutes)">🚨 Emergency ASAP (Within 45 Minutes)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgencyLevel("standard")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      urgencyLevel === "standard"
                        ? "bg-blue-600/20 border-blue-500 text-blue-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>Standard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgencyLevel("urgent")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      urgencyLevel === "urgent"
                        ? "bg-amber-600/20 border-amber-500 text-amber-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>Same Day (+Rs 500)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgencyLevel("emergency")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      urgencyLevel === "emergency"
                        ? "bg-rose-600/20 border-rose-500 text-rose-300 animate-pulse"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🚨 Emergency (+Rs 1000)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Job & Problem Specific Notes</label>
                <textarea
                  rows={2}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe issues, leaking points, or specific brand requirements..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Variable Visit Fee Calculator & Automated WhatsApp Hub (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section 3: Variable Visit Charge Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-slate-200 text-xs">Step 3: Variable Visit Charge Calculation</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                Auto-Adjusted Fee
              </span>
            </div>

            <div className="space-y-3">
              {/* Base In-City Fee Slider / Variable Controls */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-300">Base In-City Visit Fee:</span>
                  <span className="font-mono font-bold text-amber-400">PKR {baseVisitCharge.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="2500"
                  step="100"
                  value={baseVisitCharge}
                  onChange={(e) => setBaseVisitCharge(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>PKR 500 (Basic)</span>
                  <span className="text-amber-400 font-bold">PKR 1,000 (Standard Per-Visit)</span>
                  <span>PKR 2,500 (Major Fitting)</span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Technician Visit & Inspection:</span>
                  <span className="font-mono font-semibold">PKR {baseVisitCharge.toLocaleString()}</span>
                </div>

                {urgencyLevel !== "standard" && (
                  <div className="flex justify-between text-amber-300">
                    <span>Priority Dispatch Surcharge ({urgencyLevel}):</span>
                    <span className="font-mono font-semibold">+PKR {urgencyLevel === "urgent" ? "500" : "1,000"}</span>
                  </div>
                )}

                {isOutOfCity && (
                  <div className="flex justify-between text-purple-300 border-t border-slate-800/60 pt-1.5">
                    <div>
                      <span className="block font-medium">Out-of-City Travel & Partner Routing:</span>
                      <span className="text-[9px] text-purple-400 font-mono">({detectedCity} • {nearestDistance} km)</span>
                    </div>
                    <span className="font-mono font-semibold">+PKR {Math.round(Math.max(500, (nearestDistance - 20) * perKmSurcharge)).toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">TOTAL VISIT CHARGE</span>
                    <span className="text-[9px] text-emerald-400 font-semibold">
                      {isOutOfCity ? "Assigned Nearest Partner" : "Official Qumber Technician"}
                    </span>
                  </div>
                  <div className="text-end">
                    <span className="text-base font-black text-amber-400 font-mono">
                      PKR {calculatedVisitCharge.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {isOutOfCity && (
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-200 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-purple-300 font-bold block">Out-of-City Auto-Partner Buy / Dispatch:</strong>
                    This job is routed through our regional partner network in <strong>{detectedCity}</strong> under the coordination of <strong>{nearestBranch.shortName}</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: WhatsApp Automation Hub */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-slate-200 text-xs">Step 4: WhatsApp Automation Replies</h3>
              </div>
              {copiedStatus && (
                <span className="text-[10px] font-bold text-emerald-400 animate-pulse">
                  ✓ {copiedStatus} Copied!
                </span>
              )}
            </div>

            {/* Sub-tab 1: Booking Confirmation WhatsApp Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  1. Appointment Confirmation Message:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(confirmationWhatsAppMessage, "Confirmation Message")}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 whitespace-pre-line max-h-36 overflow-y-auto leading-relaxed scrollbar-thin">
                {confirmationWhatsAppMessage}
              </div>

              <button
                type="button"
                onClick={() => handleSendWhatsApp(confirmationWhatsAppMessage)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Booking Confirmation via WhatsApp 💬</span>
              </button>
            </div>

            {/* Sub-tab 2: Work Complete WhatsApp Message */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-blue-400" />
                  2. Work Complete & Warranty Message:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(workCompleteWhatsAppMessage, "Work Complete Message")}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 whitespace-pre-line max-h-28 overflow-y-auto leading-relaxed scrollbar-thin">
                {workCompleteWhatsAppMessage}
              </div>

              <button
                type="button"
                onClick={() => handleSendWhatsApp(workCompleteWhatsAppMessage)}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm active:scale-98 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Work Complete & Warranty Message</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Appointment Ticket Print Modal */}
      {showAppointmentTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">Plumbing Service Appointment Slip</h3>
              </div>
              <button
                onClick={() => setShowAppointmentTicketModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Printable Container */}
            <div className="p-4 bg-white text-black rounded-xl text-xs space-y-3 font-sans print:p-0">
              <div className="text-center border-b-2 border-black pb-2">
                <h2 className="text-base font-black tracking-tight uppercase">{settings.storeName}</h2>
                <p className="text-[10px] text-gray-700 font-medium">#03 Sikandro Square, Khyber Bazaar, Peshawar | 091-2565800 | 0300-5861463</p>
                <p className="text-[11px] font-bold mt-1 uppercase bg-gray-100 py-0.5">ONLINE PLUMBER APPOINTMENT & DISPATCH SLIP</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-600 block">Customer Name:</span>
                  <strong className="font-bold">{customerName}</strong>
                </div>
                <div>
                  <span className="text-gray-600 block">Phone / WhatsApp:</span>
                  <strong className="font-bold">{customerPhone}</strong>
                </div>
                <div>
                  <span className="text-gray-600 block">Meeting Date & Time:</span>
                  <strong className="font-bold">{meetingDate} ({meetingTimeSlot})</strong>
                </div>
                <div>
                  <span className="text-gray-600 block">Coordinating Branch ID:</span>
                  <strong className="font-bold">{nearestBranch.code} - {nearestBranch.shortName}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600 block">Address / Location:</span>
                  <strong className="font-bold">{customerAddress} ({detectedCity})</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600 block">Assigned Technician:</span>
                  <strong className="font-bold">{assignedPlumber.name} ({assignedPlumber.phone})</strong>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                <span className="font-bold">Total Variable Visit Fee:</span>
                <span className="font-mono font-black text-sm">PKR {calculatedVisitCharge.toLocaleString()}</span>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 text-center text-[9px] text-gray-600">
                <p>QumberSanitary - Trust and Quality for your Dream Home</p>
                <p>1-Year Warranty on Master PPRC & Popular PVC Fitting Work</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAppointmentTicketModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ticket (پرنٹ)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
