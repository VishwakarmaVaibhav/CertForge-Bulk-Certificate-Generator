import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateCertificates } from '../utils/generateCertificates';
import {
  Rocket, ChevronLeft, Download, FileText, Image,
  Users, Type, Loader2, CheckCircle2, Sparkles, Eye, X,
} from 'lucide-react';

export default function GeneratePanel() {
  const { state, setStep, setGenerating, setProgress, setComplete, resetGeneration } = useAppContext();
  const [error, setError] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handlePreview = async () => {
    setError(null);
    setIsPreviewing(true);
    try {
      const blob = await generateCertificates({
        backgroundImage: state.backgroundImage,
        imageWidth: state.imageWidth,
        imageHeight: state.imageHeight,
        elements: state.elements,
        csvData: state.csvData,
        mapping: state.mapping,
        isPreview: true,
      });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (err) {
      console.error('Preview error:', err);
      setError(err.message);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);

    try {
      await generateCertificates({
        backgroundImage: state.backgroundImage,
        imageWidth: state.imageWidth,
        imageHeight: state.imageHeight,
        elements: state.elements,
        csvData: state.csvData,
        mapping: state.mapping,
        onProgress: (current, total) => {
          const pct = Math.round((current / total) * 100);
          setProgress(pct, current, total);
        },
      });
      setComplete();
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
      setGenerating(false);
    }
  };

  const placeholders = state.elements
    .filter(el => el.type === 'text')
    .map(el => {
      const match = el.text.match(/\{\{(.+?)\}\}/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  return (
    <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-dark-600/50">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Generate Certificates</h2>
          <p className="text-xs text-dark-300 mt-0.5">Review and generate your certificates</p>
        </div>
        <button
          onClick={() => { resetGeneration(); setStep(1); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-600 text-dark-100 text-sm font-medium
            hover:bg-dark-500 transition-all duration-200"
        >
          <ChevronLeft size={15} />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
        <div className="max-w-lg w-full flex flex-col gap-8">

          {/* Summary cards */}
          {!state.isGenerating && !state.isComplete && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl glass-light">
                  <Image size={20} className="text-accent-400" />
                  <span className="text-xs text-dark-300">Template</span>
                  <span className="text-sm text-white font-semibold truncate max-w-full px-1" title={state.backgroundImageName}>
                    {state.backgroundImageName?.split('.')[0] || 'Uploaded'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl glass-light">
                  <Users size={20} className="text-accent-400" />
                  <span className="text-xs text-dark-300">Records</span>
                  <span className="text-sm text-white font-semibold">{state.csvData.length}</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl glass-light">
                  <Type size={20} className="text-accent-400" />
                  <span className="text-xs text-dark-300">Fields</span>
                  <span className="text-sm text-white font-semibold">{placeholders.length}</span>
                </div>
              </div>

              {/* Mapping summary */}
              <div className="rounded-xl glass-light p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-accent-400" />
                  Mapping Summary
                </h3>
                <div className="flex flex-col gap-2">
                  {placeholders.map(p => (
                    <div key={p} className="flex items-center justify-between text-sm">
                      <code className="text-accent-300 text-xs px-1.5 py-0.5 rounded bg-accent-500/10">{`{{${p}}}`}</code>
                      <span className="text-dark-300 text-xs">→</span>
                      <span className="text-white text-xs font-medium">{state.mapping[p]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePreview}
                  disabled={isPreviewing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl glass-light border border-dark-500
                    text-white font-medium text-sm hover:bg-dark-600 transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPreviewing ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                  Live Preview
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-[2] flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-500 to-accent-400
                    text-white font-bold text-base shadow-[0_0_30px_rgba(124,58,237,0.4)]
                    hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] hover:scale-[1.02]
                    transition-all duration-300 animate-pulse-glow"
                >
                  <Rocket size={20} />
                  Generate {state.csvData.length} Certificates
                </button>
              </div>
            </>
          )}

          {/* Progress */}
          {state.isGenerating && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="relative">
                <Loader2 size={48} className="text-accent-400 animate-spin" />
                <Sparkles size={16} className="text-accent-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg">Generating Certificates...</p>
                <p className="text-dark-300 text-sm mt-1">
                  {state.generatedCount} of {state.totalCount} completed
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-dark-300">Progress</span>
                  <span className="text-sm text-accent-300 font-semibold">{state.progress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-dark-700 overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar-shimmer transition-all duration-300 ease-out"
                    style={{ width: `${state.progress}%` }}
                  />
                </div>
              </div>

              <p className="text-dark-400 text-xs">Please don't close this tab</p>
            </div>
          )}

          {/* Complete */}
          {state.isComplete && (
            <div className="flex flex-col items-center gap-6 py-8 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-xl">Generation Complete!</p>
                <p className="text-dark-300 text-sm mt-2">
                  {state.totalCount} certificates generated and downloaded as a ZIP file.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    resetGeneration();
                    setStep(0);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-dark-600 text-dark-100 text-sm font-medium
                    hover:bg-dark-500 transition-all duration-200"
                >
                  Start Over
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-500 text-white text-sm font-semibold
                    hover:bg-accent-400 transition-all duration-200"
                >
                  <Download size={15} />
                  Generate Again
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mt-4">
              <span className="text-rose-400 text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-dark-900/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-5xl h-full flex flex-col glass rounded-2xl overflow-hidden border border-dark-500/50 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600/50 bg-dark-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText size={18} className="text-accent-400" />
                Certificate Preview (Row 1)
              </h3>
              <button
                onClick={() => {
                  URL.revokeObjectURL(previewBlobUrl);
                  setPreviewBlobUrl(null);
                }}
                className="p-2 rounded-lg hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-dark-700 w-full h-full p-0 m-0 relative">
              <iframe 
                src={previewBlobUrl} 
                className="absolute inset-0 w-full h-full border-0"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
