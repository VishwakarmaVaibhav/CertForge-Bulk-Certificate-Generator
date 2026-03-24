import { useRef } from 'react';
import Papa from 'papaparse';
import { useAppContext } from '../context/AppContext';
import {
  Upload, FileSpreadsheet, Table, ArrowLeftRight,
  ChevronRight, ChevronLeft, Check, AlertCircle,
} from 'lucide-react';

export default function DataPanel() {
  const { state, setCsvData, setMapping, setStep } = useAppContext();
  const fileInputRef = useRef(null);

  // Extract placeholders like {{Name}} from text elements
  const placeholders = state.elements
    .filter(el => el.type === 'text')
    .map(el => {
      const match = el.text.match(/\{\{(.+?)\}\}/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData({
          data: results.data,
          headers: results.meta.fields || [],
          fileName: file.name,
        });
      },
      error: (err) => {
        console.error('CSV parse error:', err);
      },
    });
  };

  const allMapped = placeholders.length > 0 && placeholders.every(p => state.mapping[p]);
  const canProceed = state.csvData.length > 0 && allMapped;

  return (
    <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 md:px-8 py-5 border-b border-dark-600/50">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Data & Mapping</h2>
          <p className="text-xs text-dark-300 mt-0.5">Upload CSV data and map placeholders to columns</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setStep(0)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-dark-600 text-dark-100 text-sm font-medium
              hover:bg-dark-500 transition-all duration-200"
          >
            <ChevronLeft size={15} />
            Back
          </button>
          <button
            onClick={() => setStep(2)}
            disabled={!canProceed}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-accent-500 text-white text-sm font-semibold
              hover:bg-accent-400 transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.3)]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Next Step
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* Left: CSV Upload */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <FileSpreadsheet size={16} className="text-accent-400" />
              CSV Data
            </div>

            {!state.csvData.length ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center gap-4 p-10 rounded-2xl border-2 border-dashed border-dark-500
                  hover:border-accent-400/50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-dark-600 flex items-center justify-center
                  group-hover:bg-accent-500/15 transition-all duration-300 group-hover:scale-110">
                  <Upload size={24} className="text-dark-300 group-hover:text-accent-400 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Upload CSV File</p>
                  <p className="text-dark-300 text-xs mt-1">Comma-separated values with headers</p>
                </div>
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                {/* File info */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-700/50 border border-dark-500/50">
                  <FileSpreadsheet size={18} className="text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{state.csvFileName}</p>
                    <p className="text-dark-300 text-xs">{state.csvData.length} rows · {state.csvHeaders.length} columns</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-dark-200 hover:text-accent-300 transition-colors"
                  >
                    Replace
                  </button>
                </div>

                {/* Preview table */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs text-dark-300 font-medium">
                    <Table size={12} />
                    Preview (first 3 rows)
                  </div>
                  <div className="rounded-xl border border-dark-500/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-dark-700">
                            {state.csvHeaders.map(h => (
                              <th key={h} className="px-3 py-2 text-left text-dark-200 font-medium whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {state.csvData.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-t border-dark-600/50 hover:bg-dark-700/30">
                              {state.csvHeaders.map(h => (
                                <td key={h} className="px-3 py-2 text-dark-100 whitespace-nowrap">
                                  {row[h]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </div>

          {/* Right: Mapping */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <ArrowLeftRight size={16} className="text-accent-400" />
              Field Mapping
            </div>

            {placeholders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-dark-500/50">
                <AlertCircle size={24} className="text-dark-400" />
                <p className="text-dark-300 text-sm text-center">
                  No placeholders found. Go back to the designer and add text fields with{' '}
                  <code className="px-1.5 py-0.5 rounded bg-dark-600 text-accent-300 text-xs">{'{{Name}}'}</code>{' '}
                  style formatting.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {placeholders.map(placeholder => (
                  <div
                    key={placeholder}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-700/50 border border-dark-500/50
                      hover:border-dark-400/50 transition-all duration-200"
                  >
                    <code className="px-2 py-0.5 rounded-md bg-accent-500/15 text-accent-300 text-sm font-medium whitespace-nowrap">
                      {`{{${placeholder}}}`}
                    </code>

                    <ChevronRight size={14} className="text-dark-400 shrink-0" />

                    <select
                      value={state.mapping[placeholder] || ''}
                      onChange={(e) => setMapping(placeholder, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-white text-sm
                        focus:outline-none focus:border-accent-500/50 appearance-none cursor-pointer"
                    >
                      <option value="">Select column...</option>
                      {state.csvHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>

                    {state.mapping[placeholder] && (
                      <Check size={16} className="text-emerald-400 shrink-0" />
                    )}
                  </div>
                ))}

                {allMapped && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mt-2">
                    <Check size={16} className="text-emerald-400" />
                    <p className="text-emerald-300 text-sm font-medium">All fields mapped successfully!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
