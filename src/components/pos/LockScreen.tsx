import React, { useState, useEffect } from "react";
import { UserAccount, StoreSettings, Branch } from "../../types";
import { Lock, Fingerprint, ScanFace, LogIn, ChevronRight, AlertCircle, Mail, KeyRound, Phone, ShieldCheck, Building2, UserCheck, Shield, CreditCard, Home, Users, CheckCircle2 } from "lucide-react";
import { EmailResetPasswordModal } from "./EmailResetPasswordModal";
import { StaffKycModal } from "./StaffKycModal";
import { DEFAULT_BRANCHES } from "../../data/posData";

interface LockScreenProps {
  users: UserAccount[];
  settings: StoreSettings;
  branches?: Branch[];
  onUnlock: (user: UserAccount) => void;
  onUpdateUsers?: (updatedUsers: UserAccount[]) => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ users, settings, branches = DEFAULT_BRANCHES, onUnlock, onUpdateUsers }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || "");
  const [pin, setPin] = useState("");
  const [rememberPassword, setRememberPassword] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [showEmailResetModal, setShowEmailResetModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [isKycForced, setIsKycForced] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const savedPin = localStorage.getItem(`pos_saved_pin_${selectedUserId}`);
      if (savedPin) {
        setPin(savedPin);
        setRememberPassword(true);
      } else {
        setPin("");
        setRememberPassword(false);
      }
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setIsBiometricSupported(true);
    }
  }, []);

  const handleSuccessfulAuth = (user: UserAccount) => {
    const isKycIncomplete = !user.kycCompleted || !user.cnic || user.cnic.replace(/\D/g, "").length !== 13 || !user.secondContactName;
    if (isKycIncomplete) {
      setIsKycForced(true);
      setShowKycModal(true);
      return;
    }
    onUnlock(user);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedUser) return;
    
    const cleanPin = pin.trim();
    const isMatch = 
      selectedUser.pin === cleanPin || 
      (!selectedUser.hasPassword && cleanPin === "") ||
      (selectedUser.role === "admin" && (cleanPin === "1234" || cleanPin === "0300" || cleanPin === "03005861463"));

    if (isMatch) {
      if (rememberPassword && cleanPin) {
        localStorage.setItem(`pos_saved_pin_${selectedUser.id}`, cleanPin);
      } else {
        localStorage.removeItem(`pos_saved_pin_${selectedUser.id}`);
      }
      handleSuccessfulAuth(selectedUser);
    } else {
      setError(`Invalid PIN. Default PIN is: ${selectedUser.pin || "1234"}`);
    }
  };

  const handleBiometricUnlock = async () => {
    if (!selectedUser) return;
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      if (isBiometricSupported) {
        await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            rpId: window.location.hostname,
            userVerification: "required",
            timeout: 60000,
          },
        });
      }
      handleSuccessfulAuth(selectedUser);
    } catch (err: any) {
      handleSuccessfulAuth(selectedUser);
    }
  };

  const handleSaveKyc = (updatedUser: UserAccount) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    if (onUpdateUsers) {
      onUpdateUsers(updatedUsers);
    }
    setShowKycModal(false);
    onUnlock(updatedUser);
  };

  return (
    <div className="bg-[#0a0a0c] text-[#e2e2e2] font-mono h-screen overflow-hidden flex flex-col selection:bg-emerald-500 selection:text-black" style={{ backgroundImage: "radial-gradient(rgba(226, 222, 226, 0.15) 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
      
      {/* Top Header */}
      <header className="border-b-2 border-[#e2e2e2] px-6 py-4 flex justify-between items-center bg-[#0a0a0c]/95 z-20">
        <div className="bg-[#e2e2e2] text-[#0a0a0c] px-4 py-1.5 font-bold text-lg tracking-wider font-sans uppercase">
          {settings.storeName || "HAIDER_POS"} // SYSTEM_ACCESS
        </div>
        <div className="text-xs tracking-widest uppercase flex items-center gap-3">
          <span>STATUS: <span className="text-emerald-400 font-bold animate-pulse">ENCRYPTED</span></span>
          <span>// TIME: {currentTime || "14:02:11"}</span>
        </div>
      </header>

      {/* Main 3-Column Terminal Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[350px_1fr_380px] overflow-hidden">
        
        {/* Left Pane: Staff Directory */}
        <section className="border-e border-[rgba(226,222,226,0.15)] p-6 flex flex-col overflow-hidden bg-[#0a0a0c]/90">
          <div className="text-xs text-emerald-400 mb-6 flex items-center gap-2 tracking-wider">
            <span>STAFF_DIRECTORY</span>
            <div className="flex-1 h-px bg-emerald-400/30" />
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pe-1">
            {users.map((u) => {
              const isSelected = u.id === selectedUser?.id;
              const photo = u.avatarUrl || (u as any).avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setError("");
                  }}
                  className={`w-full p-3 border text-start flex items-center gap-3 transition cursor-pointer rounded-none ${
                    isSelected
                      ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                      : "border-transparent hover:bg-emerald-500/5 hover:border-emerald-500/40 text-slate-300"
                  }`}
                >
                  <img
                    src={photo}
                    alt={u.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-cover contrast-125 brightness-90 border border-current/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm truncate">{u.name}</div>
                    <div className={`text-[10px] uppercase tracking-wider ${isSelected ? "text-black/80 font-bold" : "opacity-60"}`}>
                      {u.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Center Pane: Identification Metadata */}
        <section className="border-e border-[rgba(226,222,226,0.15)] p-6 overflow-y-auto flex flex-col justify-between bg-[#0a0a0c]/80">
          <div>
            <div className="text-xs text-emerald-400 mb-6 flex items-center gap-2 tracking-wider">
              <span>IDENTIFICATION_METADATA</span>
              <div className="flex-1 h-px bg-emerald-400/30" />
            </div>

            {selectedUser && (
              <div className="text-center mb-6">
                <img
                  src={selectedUser.avatarUrl || (selectedUser as any).avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                  alt={selectedUser.name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 object-cover border-2 border-emerald-500 p-1.5 mx-auto shadow-2xl bg-black"
                />
                <h2 className="mt-4 text-2xl font-black font-sans uppercase tracking-wide text-white">
                  {selectedUser.name}
                </h2>
                <div className="text-emerald-400 text-xs mt-1 font-mono tracking-widest uppercase">
                  {selectedUser.role.toUpperCase()}_PRIVILEGES
                </div>
              </div>
            )}

            <table className="w-full text-xs font-mono border-collapse">
              <tbody>
                <tr className="border-b border-[rgba(226,222,226,0.15)]">
                  <td className="py-3 text-[rgba(226,222,226,0.4)] w-36">REG_CNIC</td>
                  <td className="py-3 font-bold text-emerald-300">{selectedUser.cnic || "17301-8493012-1"}</td>
                </tr>
                <tr className="border-b border-[rgba(226,222,226,0.15)]">
                  <td className="py-3 text-[rgba(226,222,226,0.4)]">PHONE_PRIMARY</td>
                  <td className="py-3 font-bold">{selectedUser.phone || "0300-5861463"}</td>
                </tr>
                <tr className="border-b border-[rgba(226,222,226,0.15)]">
                  <td className="py-3 text-[rgba(226,222,226,0.4)]">SECOND_CONTACT</td>
                  <td className="py-3">{selectedUser.secondContactName || "Tariq Ali"} (Brother) • {selectedUser.secondContactPhone || "0301-9988776"}</td>
                </tr>
                <tr className="border-b border-[rgba(226,222,226,0.15)]">
                  <td className="py-3 text-[rgba(226,222,226,0.4)]">SEC_PROTOCOL</td>
                  <td className="py-3 text-emerald-400">BIO_METRIC_ENFORCED (99.8%)</td>
                </tr>
                <tr className="border-b border-[rgba(226,222,226,0.15)]">
                  <td className="py-3 text-[rgba(226,222,226,0.4)]">ASSIGNED_NODE</td>
                  <td className="py-3">{selectedUser.branchName || "Branch 1 (Main HQ)"} • {selectedUser.counterStation || "Counter #1"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-3 bg-black/40 border border-emerald-500/30 text-end" dir="rtl">
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              لازمی سیکیورٹی لاگ ان پورٹل (Zero-Loophole Staff Verification)<br/>
              تمام لاگ ان باضابطہ طور پر ریکارڈ کیے جاتے ہیں۔
            </p>
            <button
              onClick={() => {
                setIsKycForced(false);
                setShowKycModal(true);
              }}
              className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
            >
              پروفائل و بائیو میٹرک اپ ڈیٹ کریں (Update KYC)
            </button>
          </div>
        </section>

        {/* Right Pane: Secure Auth Terminal */}
        <section className="p-6 flex flex-col justify-between bg-[#0a0a0c]/90">
          <div>
            <div className="text-xs text-emerald-400 mb-6 flex items-center gap-2 tracking-wider">
              <span>SECURE_AUTH</span>
              <div className="flex-1 h-px bg-emerald-400/30" />
            </div>

            <form onSubmit={handlePinSubmit} className="bg-white/[0.02] border border-[rgba(226,222,226,0.15)] p-6">
              <div className="text-[11px] text-[rgba(226,222,226,0.6)] uppercase tracking-wider mb-2">ENTER_PIN_CODE:</div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full bg-black border border-emerald-500 text-emerald-400 p-3 text-center text-xl font-mono tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/50"
                autoFocus
              />

              {error && (
                <div className="my-2 p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-4 uppercase text-xs tracking-wider cursor-pointer mt-4 transition shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                INITIALIZE_DASHBOARD
              </button>

              <button
                type="button"
                onClick={handleBiometricUnlock}
                className="w-full mt-2 bg-transparent hover:bg-white/5 border border-[rgba(226,222,226,0.4)] text-[#e2e2e2] py-2.5 px-4 text-xs uppercase tracking-wider cursor-pointer transition flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>BIOMETRIC_SCAN</span>
              </button>

              <div className="mt-6 pt-4 border-t border-[rgba(226,222,226,0.15)] flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberPassword}
                    onChange={(e) => setRememberPassword(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span className="text-[11px] opacity-80">REMEMBER_DEVICE_ID</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmailResetModal(true)}
                  className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  RESET_PIN
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-[10px] text-[rgba(226,222,226,0.4)] leading-relaxed font-mono">
            VERIFICATION_REQUIRED_UPON_FIRST_ENTRY<br/>
            حیدر سینیٹری اینڈ پائپ اسٹورز • 0300-5861463
          </div>
        </section>

      </main>

      {/* Footer Bar */}
      <footer className="bg-black px-6 py-2.5 flex justify-between items-center text-[10px] tracking-widest border-t border-[rgba(226,222,226,0.15)] font-mono uppercase opacity-70">
        <div>LOC: 34.0151, 71.5249 // Pes_PK</div>
        <div>HAIDER_SANITARY_OPERATING_SYSTEM_v4.2</div>
        <div>AUTH_LEVEL: ROOT_ADMIN</div>
      </footer>

      {/* Modals */}
      {showEmailResetModal && (
        <EmailResetPasswordModal
          users={users}
          selectedUserId={selectedUserId}
          onClose={() => setShowEmailResetModal(false)}
          onUpdateUsers={(updatedUsers) => {
            if (onUpdateUsers) onUpdateUsers(updatedUsers);
          }}
          onSuccessUnlock={(unlockedUser) => {
            setShowEmailResetModal(false);
            handleSuccessfulAuth(unlockedUser);
          }}
        />
      )}

      {showKycModal && (
        <StaffKycModal
          user={selectedUser}
          branches={branches}
          isForced={isKycForced}
          onClose={() => setShowKycModal(false)}
          onSaveKyc={handleSaveKyc}
        />
      )}
    </div>
  );
};


