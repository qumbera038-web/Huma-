import React, { useState } from "react";
import { UserAccount } from "../../types";
import { 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Lock, 
  Send, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles
} from "lucide-react";

interface EmailResetPasswordModalProps {
  users: UserAccount[];
  selectedUserId?: string;
  onClose: () => void;
  onUpdateUsers: (updatedUsers: UserAccount[]) => void;
  onSuccessUnlock?: (user: UserAccount) => void;
}

export const EmailResetPasswordModal: React.FC<EmailResetPasswordModalProps> = ({
  users,
  selectedUserId: initialUserId,
  onClose,
  onUpdateUsers,
  onSuccessUnlock,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    initialUserId || users[0]?.id || ""
  );
  
  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];
  const [emailInput, setEmailInput] = useState<string>(
    selectedUser?.email || `${selectedUser?.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user"}@pipesanitary.com`
  );

  // Flow steps: 1 = Enter Email & Request OTP, 2 = Verify 6-digit OTP, 3 = Set New PIN/Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpInput, setOtpInput] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [copiedOtp, setCopiedOtp] = useState(false);

  // New Password state
  const [newPin, setNewPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Update email input when user changes
  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setEmailInput(
        targetUser.email || `${targetUser.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@pipesanitary.com`
      );
    }
  };

  // Generate 6-digit OTP and send simulated email
  const handleSendVerificationEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) {
      setOtpError("Please enter a valid email address (برائے مہربانی درست ای میل درج کریں)");
      return;
    }

    setIsSendingCode(true);
    setOtpError("");

    setTimeout(() => {
      // Generate 6-digit numeric OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsSendingCode(false);
      setStep(2);
    }, 1000);
  };

  // Verify entered OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp) {
      setOtpError("");
      setStep(3);
    } else {
      setOtpError("❌ Incorrect verification code. Please check the code sent to your email.");
    }
  };

  // Save New PIN / Password
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) {
      setPinError("PIN / Password cannot be empty.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match. Please enter matching PINs.");
      return;
    }

    setIsSaving(true);
    setPinError("");

    setTimeout(() => {
      // Update selected user's PIN in stored users
      const updatedUsers = users.map((u) => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            pin: newPin.trim(),
            hasPassword: true,
            email: emailInput.trim(),
          };
        }
        return u;
      });

      onUpdateUsers(updatedUsers);
      setIsSaving(false);
      setStep(4);

      // If unlocked from lock screen, unlock directly
      const updatedUser = updatedUsers.find((u) => u.id === selectedUser.id);
      if (updatedUser && onSuccessUnlock) {
        setTimeout(() => {
          onSuccessUnlock(updatedUser);
        }, 1500);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <span>Email Password Verification</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                ای میل کے ذریعے پاسورڈ دوبارہ حاصل کریں (Reset PIN/Password)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Select User & Input Email */}
        {step === 1 && (
          <form onSubmit={handleSendVerificationEmail} className="py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Staff Account (اکاؤنٹ منتخب کریں):
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 py-2.5 px-3 rounded-xl text-xs font-medium focus:border-indigo-500 outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address (رجسٹرد ای میل ایڈریس):
              </label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={emailInput}
                  className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-400 pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none cursor-not-allowed font-mono"
                  title="This email is permanent and cannot be changed during reset."
                />
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-amber-400/80 mt-1.5 font-bold">
                ⚠️ Security Notice: The verification code will be sent strictly to this permanent registered email.
              </p>
            </div>

            {otpError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingCode}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {isSendingCode ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Code to Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Email Verification Code</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter & Verify 6-digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="py-5 space-y-4">
            {/* Simulated Live Email Inbox Preview Box */}
            <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                    Simulated Email Inbox Notification
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  Just Now
                </span>
              </div>

              <div className="text-xs space-y-1">
                <p className="text-slate-300">
                  <span className="text-slate-500">To:</span> <span className="font-mono text-slate-200">{emailInput}</span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500">Subject:</span> <span className="font-semibold text-white">QumberSanitary Security Verification Code</span>
                </p>
                <div className="pt-2 flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Your 6-Digit Verification Code:</span>
                    <span className="text-lg font-black font-mono text-emerald-400 tracking-widest">
                      {generatedOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpInput(generatedOtp);
                      navigator.clipboard.writeText(generatedOtp);
                      setCopiedOtp(true);
                      setTimeout(() => setCopiedOtp(false), 2000);
                    }}
                    className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOtp ? "Copied!" : "Auto-Fill Code"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter 6-Digit Verification Code (ای میل کوڈ درج کریں):
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value);
                  setOtpError("");
                }}
                placeholder="6-Digit Code (e.g. 123456)"
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-center font-mono text-xl tracking-[0.3em] py-2.5 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {otpError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Continue</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New PIN / Password */}
        {step === 3 && (
          <form onSubmit={handleSaveNewPin} className="py-5 space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Email verified successfully! Set your new security PIN/password below.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New PIN / Password for {selectedUser.name}:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value);
                    setPinError("");
                  }}
                  placeholder="Enter New PIN (e.g. 1234 or custom password)"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-4 pr-10 py-2.5 rounded-xl font-mono text-sm outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New PIN / Password:
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  setPinError("");
                }}
                placeholder="Confirm New PIN"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-4 py-2.5 rounded-xl font-mono text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {pinError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating PIN...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Save New Password & PIN</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success Notification */}
        {step === 4 && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-100">
                Password / PIN Updated Successfully!
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                آپ کا پاسورڈ ای میل کی تصدیق سے کامیابی کے ساتھ تبدیل کر دیا گیا ہے
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-indigo-300">
              New PIN for {selectedUser.name}: <span className="font-bold text-white">{newPin}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
