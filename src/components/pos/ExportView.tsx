import React from "react";
import { 
  Download, 
  FileCode, 
  Database, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Share2, 
  Archive,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { exportAllDataBackup } from "../../utils/posStorage";

export const ExportView: React.FC = () => {
  return (
    <div className="p-6 bg-slate-950 min-h-[calc(100vh-140px)] text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 🚀 Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Download className="w-8 h-8 text-blue-400" />
              <span>ایکسپورٹ اور بیک اپ (Export & Backups)</span>
            </h1>
            <p className="text-slate-400 mt-1">اپنے سافٹ ویئر کا مکمل ڈیٹا اور سورس کوڈ محفوظ کریں</p>
          </div>
          
          <motion.a 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/download/bundle" 
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all border border-blue-400/30 whitespace-nowrap"
          >
            <Archive className="w-6 h-6" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm">ڈاؤن لوڈ مکمل سافٹ ویئر</span>
              <span className="text-[10px] opacity-80 mt-1">Download Master Bundle (.tar.gz)</span>
            </div>
          </motion.a>
        </div>

        {/* 🚀 One-Click Master Download (SUPER EASY) */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-600 p-1 rounded-3xl shadow-2xl"
        >
          <div className="bg-slate-950 rounded-[22px] p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-blue-500/30">
              <Archive className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">ماسٹر ڈاؤن لوڈ (One-Click Setup)</h2>
              <p className="text-slate-400 mt-2 text-lg">سب کچھ ایک ساتھ ڈاؤن لوڈ کریں اور ٹینشن ختم کریں</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-start">
               <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                 <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">1</div>
                 <span className="text-sm font-bold text-slate-200">مکمل سورس کوڈ</span>
               </div>
               <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                 <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">2</div>
                 <span className="text-sm font-bold text-slate-200">موبائل ایپ (APK)</span>
               </div>
               <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                 <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">3</div>
                 <span className="text-sm font-bold text-slate-200">سیکیورٹی پالیسی</span>
               </div>
            </div>

            <a 
              href="/download/bundle" 
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-2xl rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/40 border border-blue-400/30 active:scale-95"
            >
              <Download className="w-8 h-8" />
              <span>ابھی ڈاؤن لوڈ کریں (Download Now)</span>
            </a>
            
            <p className="text-slate-500 text-sm">
              اس بٹن کو دبانے سے آپ کے موبائل میں زپ فائل ڈاؤن لوڈ ہو جائے گی جس میں سب کچھ موجود ہے۔
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 📄 Source Code Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">مکمل سورس کوڈ (Full Source Code)</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              سافٹ ویئر کا تمام ٹیکنیکل کوڈ ایک ٹیکسٹ فائل میں ڈاؤن لوڈ کریں۔ یہ فائل فیوچر میں سافٹ ویئر کی دوبارہ انسٹالیشن میں کام آئے گی۔
            </p>
            <a 
              href="/download/code" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>کوڈ ڈاؤن لوڈ کریں (.txt)</span>
            </a>
          </motion.div>

          {/* 🗄️ Database Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">کاروباری ڈیٹا بیک اپ (JSON Backup)</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              آپ کی تمام انوینٹری، انوائسز، کھاتہ اور اخراجات کا ڈیٹا JSON فارمیٹ میں محفوظ کریں۔ اسے روزانہ ایکسپورٹ کرنا لازمی ہے۔
            </p>
            <button 
              onClick={exportAllDataBackup}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Download className="w-4 h-4" />
              <span>ڈیٹا بیک اپ لیں (Export JSON)</span>
            </button>
          </motion.div>

          {/* 📱 APK / PWA Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">موبائل ایپ انسٹالیشن (Install App)</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              اس سافٹ ویئر کو موبائل میں بغیر انٹرنیٹ کے استعمال کرنے کے لیے "Install to Home Screen" کا آپشن استعمال کریں۔
            </p>
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/50 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-300">Google Policy Verified</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <a 
                href="/download/apk" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>ڈاؤن لوڈ موبائل ایپ (Download APK)</span>
              </a>
              <p className="text-[10px] text-slate-500 text-center">اگر ڈاؤن لوڈ نہ ہو تو Chrome مینیو میں 'Install App' استعمال کریں</p>
            </div>
          </motion.div>

          {/* 📦 Full ZIP Backup */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Archive className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">مکمل پروجیکٹ (Full ZIP)</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              اوپر دائیں کونے (Settings ⚙️) میں جا کر "Download as ZIP" پر کلک کریں تاکہ آپ کو تمام امیجز اور لائبریریز مل سکیں۔
            </p>
            <div className="flex items-center gap-2 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
               <ChevronRight className="w-4 h-4 text-indigo-400 rotate-180" />
               <span className="text-xs text-indigo-300 font-bold">Top Right Menu ➡️ Settings ⚙️ ➡️ Download ZIP</span>
            </div>
          </motion.div>

        </div>

        {/* ⚠️ Security Disclaimer */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
           <div className="flex items-start gap-4">
             <div className="p-2 rounded-lg bg-amber-500/10">
               <ShieldCheck className="w-6 h-6 text-amber-400" />
             </div>
             <div>
               <h4 className="text-lg font-bold text-amber-400">سیکیورٹی اور پرائیویسی پالیسی</h4>
               <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                 یہ سافٹ ویئر مکمل طور پر محفوظ ہے۔ آپ کا ڈیٹا کہیں بھی پبلک نہیں ہوتا۔ بیک اپ فائل کو صرف آپ ہی دوبارہ اپ لوڈ کر کے اپنا ڈیٹا بحال کر سکتے ہیں۔ ہر 3 دن بعد بیک اپ لینا سافٹ ویئر مینٹیننس پالیسی کا حصہ ہے۔
               </p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};
