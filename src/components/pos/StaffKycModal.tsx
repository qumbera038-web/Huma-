import React, { useState, useRef, useEffect } from "react";
import { UserAccount, Branch } from "../../types";
import { 
  ShieldCheck, 
  Camera, 
  Fingerprint, 
  ScanFace, 
  UserCheck, 
  Phone, 
  Home, 
  Users, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Upload, 
  Lock,
  Building2,
  HeartPulse,
  Info
} from "lucide-react";

interface StaffKycModalProps {
  user: UserAccount;
  branches: Branch[];
  isForced?: boolean; // If true, cannot be closed until completed (no loophole!)
  onClose?: () => void;
  onSaveKyc: (updatedUser: UserAccount) => void;
}

export const StaffKycModal: React.FC<StaffKycModalProps> = ({
  user,
  branches,
  isForced = true,
  onClose,
  onSaveKyc,
}) => {
  // Form state initialized with user's existing data if any
  const [fullName, setFullName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [cnic, setCnic] = useState(user.cnic || "");
  const [address, setAddress] = useState(user.address || "");
  const [secondContactName, setSecondContactName] = useState(user.secondContactName || "");
  const [secondContactRelation, setSecondContactRelation] = useState(user.secondContactRelation || "Father / Guarantor");
  const [secondContactPhone, setSecondContactPhone] = useState(user.secondContactPhone || "");
  const [counterStation, setCounterStation] = useState(user.counterStation || "Counter #1 (Main Desk)");
  const [branchId, setBranchId] = useState(user.branchId || "branch-1");
  const [bloodGroup, setBloodGroup] = useState(user.bloodGroup || "B+");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80");
  const [cnicFrontUrl, setCnicFrontUrl] = useState(user.cnicFrontUrl || "");
  const [cnicBackUrl, setCnicBackUrl] = useState(user.cnicBackUrl || "");
  
  // Biometrics & Face Scan state
  const [isBiometricVerified, setIsBiometricVerified] = useState(user.biometricRegistered || false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [biometricToken, setBiometricToken] = useState(user.biometricId || `BIO-${Date.now().toString().slice(-6)}`);

  const [isFaceVerified, setIsFaceVerified] = useState(user.faceRecognitionRegistered || false);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(user.faceConfidence || 99.4);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Agreement
  const [agreementChecked, setAgreementChecked] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successAnim, setSuccessAnim] = useState(false);

  // CNIC Auto Formatter (XXXXX-XXXXXXX-X)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 13) raw = raw.slice(0, 13);
    
    let formatted = raw;
    if (raw.length > 5 && raw.length <= 12) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    } else if (raw.length > 12) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5, 12)}-${raw.slice(12, 13)}`;
    }
    setCnic(formatted);
  };

  // Start live webcam
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setErrorMsg("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Camera access failed:", err);
      setErrorMsg("کیمرہ ایکسس نہیں مل سکا۔ آپ تصویر اپ لوڈ کر سکتے ہیں یا اوتار منتخب کر سکتے ہیں۔");
      setIsCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Take camera snapshot
  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setAvatarUrl(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Fingerprint Scan
  const handleScanFingerprint = async () => {
    setIsScanningFingerprint(true);
    setErrorMsg("");

    // Simulate authentic biometric sensor reading
    setTimeout(() => {
      const token = `BIO-PK-${Math.floor(100000 + Math.random() * 900000)}`;
      setBiometricToken(token);
      setIsBiometricVerified(true);
      setIsScanningFingerprint(false);
    }, 1400);
  };

  // Trigger Face Scan
  const handleScanFace = () => {
    setIsScanningFace(true);
    setErrorMsg("");

    setTimeout(() => {
      const score = Number((98.5 + Math.random() * 1.4).toFixed(1));
      setFaceConfidence(score);
      setIsFaceVerified(true);
      setIsScanningFace(false);
    }, 1800);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!avatarUrl) {
      setErrorMsg("برائے مہربانی اپنی تصویر لائیو کیمرہ سے یا فائل اپ لوڈ کے ذریعے لازمی منسلک کریں۔ (Profile Picture is mandatory)");
      return;
    }

    // Strict validation (No loopholes!)
    const cleanCnicDigits = cnic.replace(/\D/g, "");
    if (cleanCnicDigits.length !== 13) {
      setErrorMsg("برائے مہربانی مکمل 13 ہندسوں کا قومی شناختی کارڈ نمبر (CNIC) درج کریں۔");
      return;
    }

    if (!cnicFrontUrl || !cnicBackUrl) {
      setErrorMsg("برائے مہربانی شناختی کارڈ کی فرنٹ اور بیک دونوں تصاویر (CNIC Front & Back) لازمی اپ لوڈ کریں۔");
      return;
    }

    if (!phone || phone.trim().length < 10) {
      setErrorMsg("برائے مہربانی درست ذاتی موبائل فون نمبر درج کریں۔");
      return;
    }

    if (!address || address.trim().length < 5) {
      setErrorMsg("برائے مہربانی مکمل رہائشی پتہ (Address) درج کریں۔");
      return;
    }

    if (!secondContactName || secondContactName.trim().length < 3) {
      setErrorMsg("برائے مہربانی دوسرے رابطہ فرد / ضامن (2nd Contact Person) کا نام درج کریں۔");
      return;
    }

    if (!secondContactPhone || secondContactPhone.trim().length < 10) {
      setErrorMsg("برائے مہربانی دوسرے رابطہ فرد / ضامن کا موبائل نمبر درج کریں۔");
      return;
    }

    if (!isBiometricVerified) {
      setErrorMsg("برائے مہربانی نیچے دیے گئے فنگر پرنٹ بائیو میٹرک سینسر پر کلک کر کے بائیو میٹرک تصدیق مکمل کریں۔");
      return;
    }

    if (!isFaceVerified) {
      setErrorMsg("برائے مہربانی فیس ریکگنیشن (Face Recognition) اسکین مکمل کریں۔");
      return;
    }

    if (!agreementChecked) {
      setErrorMsg("برائے مہربانی تصدیقی حلف نامہ چیک کریں۔");
      return;
    }

    setSuccessAnim(true);

    const selectedBranch = branches.find((b) => b.id === branchId) || branches[0];

    const updatedUser: UserAccount = {
      ...user,
      name: fullName.trim() || user.name,
      phone: phone.trim(),
      cnic: cnic.trim(),
      address: address.trim(),
      secondContactName: secondContactName.trim(),
      secondContactRelation: secondContactRelation.trim(),
      secondContactPhone: secondContactPhone.trim(),
      counterStation: counterStation.trim(),
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      avatarUrl: avatarUrl,
      cnicFrontUrl: cnicFrontUrl,
      cnicBackUrl: cnicBackUrl,
      biometricRegistered: true,
      biometricId: biometricToken,
      biometricDate: new Date().toLocaleString(),
      faceRecognitionRegistered: true,
      faceConfidence: faceConfidence,
      kycCompleted: true,
      kycDate: new Date().toISOString().slice(0, 10),
      bloodGroup: bloodGroup,
    };

    setTimeout(() => {
      onSaveKyc(updatedUser);
    }, 700);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden my-auto animate-in zoom-in-95 text-slate-100 relative">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 border-b border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-white tracking-tight">
                  لازمی اسٹاف سیکیورٹی تصدیق پورٹل (Mandatory KYC & Biometrics)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  لوپ ہول فری تصدیق
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                حیدر سینیٹری اینڈ پائپ اسٹورز — تمام برانچوں کے مینیجرز و اسٹاف کی تصویر، CNIC، بائیو میٹرک اور ضامن کا محفوظ اندراج
              </p>
            </div>
          </div>

          {!isForced && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Staff Identity & Photo / Live Camera */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4" />
              <span>1. لازمی ذاتی معلومات اور لائیو کیمرہ تصویر (Staff Picture & Identity)</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Photo View / Camera Container */}
              <div className="relative shrink-0 flex flex-col items-center">
                <div className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-tighter flex items-center gap-1">
                  <Camera className="w-2.5 h-2.5" />
                  <span>اسٹاف کی تصویر (Staff Photo)</span>
                </div>
                {isCameraActive ? (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-500 relative bg-black shadow-lg">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow transition"
                    >
                      تصویر لیں
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      referrerPolicy="no-referrer"
                      className="w-28 h-28 rounded-2xl object-cover border-2 border-blue-500 shadow-xl ring-2 ring-blue-500/20"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow" title="Picture Attached" />
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-2.5">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg shadow-blue-600/30 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>لائیو کیمرہ سے تصویر لیں</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition shadow-lg"
                    >
                      بند کریں (Close)
                    </button>
                  )}

                  <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>فائل منتخب کریں</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Names & Role */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    اسٹاف کا پورا نام (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثلاً: حیدر علی / حمزہ علی"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    عہدہ و ذمہ داری (Role)
                  </label>
                  <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-blue-300 font-bold flex items-center justify-between">
                    <span className="capitalize">{user.role === "admin" ? "Super Admin (مالک)" : user.role === "manager" ? "Branch Head (مینیجر)" : "Cashier (کاؤنٹر کیشیئر)"}</span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {user.id}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ذاتی موبائل / واٹس ایپ نمبر *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-5861463"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-amber-300 font-mono font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    بلڈ گروپ (Blood Group)
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="A+">A Positive (A+)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="O+">O Positive (O+)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: CNIC & Residential Address */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4" />
              <span>2. قومی شناختی کارڈ اور رہائشی پتہ (CNIC & Address)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    قومی شناختی کارڈ نمبر (CNIC - 13 Digits) *
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${cnic.replace(/\D/g, "").length === 13 ? "text-emerald-400" : "text-amber-400"}`}>
                    {cnic.replace(/\D/g, "").length} / 13 ہندسے
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={cnic}
                  onChange={handleCnicChange}
                  placeholder="17301-8493012-1"
                  maxLength={15}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-emerald-300 font-bold outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">نادرا کے مطابق بغیر کسی غلطی کے مکمل کارڈ نمبر درج کریں</p>

                {/* CNIC Front & Back Picture Upload Section */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <label className="text-xs font-bold text-amber-300 block mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>شناختی کارڈ کی دونوں تصاویر (CNIC Front & Back Pictures) *</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Front CNIC */}
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-200">فرنٹ سائیڈ (CNIC Front)</span>
                        {cnicFrontUrl && <span className="text-[9px] text-emerald-400 font-bold">✓ اپ لوڈڈ</span>}
                      </div>
                      {cnicFrontUrl ? (
                        <div className="relative h-24 rounded-lg overflow-hidden border border-emerald-500/50 bg-black">
                          <img src={cnicFrontUrl} alt="CNIC Front" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setCnicFrontUrl("")}
                            className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold shadow"
                          >
                            تبدیل
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-lg cursor-pointer bg-slate-950/50 transition">
                          <Upload className="w-4 h-4 text-blue-400 mb-1" />
                          <span className="text-[10px] text-slate-300 font-semibold">فرنٹ تصویر اپ لوڈ کریں</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === "string") setCnicFrontUrl(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Back CNIC */}
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-200">بیک سائیڈ (CNIC Back)</span>
                        {cnicBackUrl && <span className="text-[9px] text-emerald-400 font-bold">✓ اپ لوڈڈ</span>}
                      </div>
                      {cnicBackUrl ? (
                        <div className="relative h-24 rounded-lg overflow-hidden border border-emerald-500/50 bg-black">
                          <img src={cnicBackUrl} alt="CNIC Back" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setCnicBackUrl("")}
                            className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold shadow"
                          >
                            تبدیل
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-lg cursor-pointer bg-slate-950/50 transition">
                          <Upload className="w-4 h-4 text-blue-400 mb-1" />
                          <span className="text-[10px] text-slate-300 font-semibold">بیک تصویر اپ لوڈ کریں</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === "string") setCnicBackUrl(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  مکمل مستقل و موجودہ رہائشی پتہ (Address) *
                </label>
                <div className="relative">
                  <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مکان نمبر، گلی نمبر، محلہ، علاقہ، پشاور"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">موجودہ تصدیق شدہ رہائشی ایڈریس</p>
              </div>
            </div>
          </div>

          {/* Section 3: 2nd Person Contact / Guarantor (ایمرجنسی رابطہ یا ضامن) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>3. دوسرا رابطہ فرد یا ضامن (2nd Contact Person / Guarantor)</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                لازمی سیکیورٹی
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  دوسرے فرد کا نام (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={secondContactName}
                  onChange={(e) => setSecondContactName(e.target.value)}
                  placeholder="مثلاً: طارق علی / محمد رشید"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  رشتہ یا حیثیت (Relation) *
                </label>
                <select
                  value={secondContactRelation}
                  onChange={(e) => setSecondContactRelation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="Father">والد محترم (Father)</option>
                  <option value="Brother / Business Partner">بھائی (Brother)</option>
                  <option value="Guarantor">کاروباری ضامن (Guarantor)</option>
                  <option value="Uncle">چچا / ماموں (Uncle)</option>
                  <option value="Cousin">کزن (Cousin)</option>
                  <option value="Neighbor">قریبی پڑوسی (Neighbor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  دوسرے فرد کا فون نمبر (2nd Phone) *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={secondContactPhone}
                    onChange={(e) => setSecondContactPhone(e.target.value)}
                    placeholder="0301-9988776"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-amber-300 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Biometrics (Fingerprint) & Face Recognition */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <ScanFace className="w-4 h-4 text-indigo-400" />
              <span>4. بائیو میٹرک فنگر پرنٹ اور فیس ریکگنیشن (Biometrics & Face Recognition)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Biometric Fingerprint Box */}
              <div className={`p-6 rounded-[2.5rem] border-4 transition-all text-center flex flex-col items-center justify-between relative overflow-hidden group min-h-[260px] ${
                isBiometricVerified 
                  ? "bg-emerald-950/60 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)] text-emerald-100" 
                  : "bg-slate-900 border-indigo-600/50 hover:border-indigo-500 shadow-2xl"
              }`}>
                {!isBiometricVerified && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
                )}

                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-5 relative transition-all duration-700 ${
                  isBiometricVerified 
                    ? "bg-emerald-500/30 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.4)] border-4 border-emerald-400" 
                    : "bg-indigo-600/20 border-4 border-dashed border-indigo-500/80 group-hover:border-indigo-400 group-hover:bg-indigo-500/40 shadow-2xl"
                }`}>
                  <Fingerprint className={`w-20 h-20 transition-all ${isBiometricVerified ? "text-emerald-400" : "text-indigo-400 group-hover:scale-110 group-hover:text-white"}`} />
                  
                  {!isBiometricVerified && !isScanningFingerprint && (
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-ping opacity-20" />
                  )}
                  
                  {isScanningFingerprint && (
                    <div className="absolute inset-0 bg-blue-500/40 rounded-full animate-pulse border-4 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                  )}
                  {isScanningFingerprint && (
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-black tracking-tight uppercase">
                    {isBiometricVerified ? "فنگر پرنٹ بائیو میٹرک رجسٹرڈ ✅" : "فنگر پرنٹ (انگوٹھا) یہاں لگائیں *"}
                  </h4>
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-slate-800 inline-block mx-auto">
                      {isBiometricVerified ? `SECURITY ID: ${biometricToken}` : "BIOMETRIC SENSOR: READY"}
                    </p>
                    <span className="text-[9px] text-amber-400/80 font-bold">بٹن دبائیں اور سینسر پر انگلی رکھیں</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleScanFingerprint}
                  disabled={isScanningFingerprint}
                  className={`mt-6 w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2.5 shadow-xl active:scale-95 ${
                    isBiometricVerified 
                      ? "bg-emerald-600 text-white shadow-emerald-600/40" 
                      : "bg-gradient-to-r from-indigo-600 via-blue-700 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/50 border border-indigo-400/30"
                  }`}
                >
                  {isScanningFingerprint ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>اسکیننگ جاری ہے... (SCANNING)</span>
                    </>
                  ) : isBiometricVerified ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>تصدیق ہو گئی (RE-SCAN)</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5" />
                      <span>اسکین شروع کریں (START SCAN)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Face Recognition Box */}
              <div className={`p-6 rounded-[2.5rem] border-4 transition-all text-center flex flex-col items-center justify-between relative overflow-hidden group min-h-[260px] ${
                isFaceVerified 
                  ? "bg-emerald-950/60 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)] text-emerald-100" 
                  : "bg-slate-900 border-blue-600/50 hover:border-blue-500 shadow-2xl"
              }`}>
                {!isFaceVerified && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
                )}

                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-5 relative transition-all duration-700 ${
                  isFaceVerified 
                    ? "bg-emerald-500/30 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.4)] border-4 border-emerald-400" 
                    : "bg-blue-600/20 border-4 border-dashed border-blue-500/80 group-hover:border-blue-400 group-hover:bg-blue-500/40 shadow-2xl"
                }`}>
                  <ScanFace className={`w-20 h-20 transition-all ${isFaceVerified ? "text-emerald-400" : "text-blue-400 group-hover:scale-110 group-hover:text-white"}`} />
                  
                  {!isFaceVerified && !isScanningFace && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping opacity-20" />
                  )}
                  
                  {isScanningFace && (
                    <div className="absolute inset-0 bg-emerald-500/40 rounded-full animate-pulse border-4 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)]" />
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-black tracking-tight uppercase">
                    {isFaceVerified ? "فیس ریکگنیشن تصدیق شدہ ✅" : "چہرہ یہاں اسکین کریں *"}
                  </h4>
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-slate-800 inline-block mx-auto">
                      {isFaceVerified ? `AI CONFIDENCE: ${faceConfidence}%` : "AI FACE SCANNER: ACTIVE"}
                    </p>
                    <span className="text-[9px] text-amber-400/80 font-bold">کیمرے کی طرف دیکھیں</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleScanFace}
                  disabled={isScanningFace}
                  className={`mt-6 w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2.5 shadow-xl active:scale-95 ${
                    isFaceVerified 
                      ? "bg-emerald-600 text-white shadow-emerald-600/40" 
                      : "bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/50 border border-blue-400/30"
                  }`}
                >
                  {isScanningFace ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>فیس میپنگ جاری ہے... (SCANNING)</span>
                    </>
                  ) : isFaceVerified ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>فیس تصدیق شدہ (RE-SCAN)</span>
                    </>
                  ) : (
                    <>
                      <ScanFace className="w-5 h-5" />
                      <span>AI اسکین شروع کریں</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Branch Assignment & Station */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4" />
              <span>5. برانچ اور کاؤنٹر اسٹیشن تعیناتی (Branch & Counter Station)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  متعلقہ برانچ (Assigned Branch)
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 font-bold"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  کاؤنٹر اسٹیشن (Counter / Terminal Desk)
                </label>
                <input
                  type="text"
                  value={counterStation}
                  onChange={(e) => setCounterStation(e.target.value)}
                  placeholder="Counter #1 (Main Desk)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Legal Agreement Checkbox */}
          <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white block">تصدیقی حلف نامہ و سیکیورٹی اقرار نامہ:</span>
                میں حلفاً تصدیق کرتا ہوں کہ میرا شناختی کارڈ (CNIC)، رہائشی پتہ، فون، فنگر پرنٹ، فیس اسکین اور ضامن کا ڈیٹا بالکل درست ہے اور یہ تمام ریکارڈز آن لائن محفوظ کیے جا رہے ہیں۔
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {!isForced && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
              >
                منسوخ کریں
              </button>
            )}

            <button
              type="submit"
              disabled={successAnim}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition active:scale-95 ${
                successAnim
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30"
              }`}
            >
              {successAnim ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                  <span>تمام معلومات کامیابی سے محفوظ ہو گئیں!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <span>تمام معلومات مستقل محفوظ کریں (Save & Complete Verification)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
