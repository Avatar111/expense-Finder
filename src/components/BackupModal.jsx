import React, { useRef, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const BackupModal = ({ isOpen, onClose }) => {
  const {
    t,
    exportToCSV,
    exportBackupJSON,
    importBackupJSON,
    clearAllData,
    loadDemoData,
  } = useExpenses();

  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const res = importBackupJSON(content);
      if (res.success) {
        setImportStatus({ success: true, message: `വിജയകരമായി ${res.count} ഇടപാടുകൾ റീസ്റ്റോർ ചെയ്തു!` });
      } else {
        setImportStatus({ success: false, message: `എറർ: ${res.error}` });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t.exportData}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Export options */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              എക്സ്പോർട്ട് ഓപ്ഷനുകൾ (Export)
            </span>

            <button
              onClick={exportToCSV}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.exportCSV}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Excel, Google Sheets എന്നിവയിൽ തുറക്കാൻ
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
            </button>

            <button
              onClick={exportBackupJSON}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.backupJSON}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    മറ്റൊരു ഫോണിലേക്ക് മാറ്റാൻ അല്ലെങ്കിൽ സുരക്ഷിതമായി സൂക്ഷിക്കാൻ
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
            </button>
          </div>

          {/* Import option */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              ഇമ്പോർട്ട് (Restore)
            </span>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    JSON ഫയൽ അപ്‌ലോഡ് ചെയ്യുക
                  </div>
                  <div className="text-[11px] text-slate-500">
                    നേരത്തെ സേവ് ചെയ്ത ബാക്കപ്പ് തിരികെ എടുക്കുക
                  </div>
                </div>
              </div>
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
            </button>
          </div>

          {/* Reset & Demo Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={loadDemoData}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>മാതൃകാ ഡാറ്റ ലോഡ് ചെയ്യുക (Demo Data)</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(t.confirmClear)) {
                  clearAllData();
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearData}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
