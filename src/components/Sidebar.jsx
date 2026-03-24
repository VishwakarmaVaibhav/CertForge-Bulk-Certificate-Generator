import { useAppContext } from '../context/AppContext';
import { Palette, Database, Rocket, Check } from 'lucide-react';

const steps = [
  { id: 0, label: 'Design', sublabel: 'Template Editor', icon: Palette },
  { id: 1, label: 'Data', sublabel: 'CSV Upload', icon: Database },
  { id: 2, label: 'Generate', sublabel: 'Export PDFs', icon: Rocket },
];

export default function Sidebar() {
  const { state, setStep } = useAppContext();

  const canGoToStep = (stepId) => {
    if (stepId === 0) return true;
    if (stepId === 1) return !!state.backgroundImage && state.elements.length > 0;
    if (stepId === 2) return state.csvData.length > 0 && Object.keys(state.mapping).length > 0;
    return false;
  };

  return (
    <aside className="w-full md:w-[260px] h-auto md:h-full flex-none glass flex flex-col py-4 px-4 md:py-8 md:px-5 shrink-0 z-20 border-b border-dark-600/50 md:border-b-0 md:border-r">
      {/* Logo */}
      <div className="mb-4 md:mb-10 px-2 flex items-center justify-between md:justify-start">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <img
            src="/logo.png"
            alt="CertForge Logo"
            className="w-8 h-8 rounded-lg object-contain bg-white/5"
          />
          CertForge
        </h1>
        <p className="hidden md:block text-xs text-dark-300 mt-1 ml-10">Bulk Certificate</p>
      </div>

      {/* Steps */}
      <nav className="flex md:flex-1 flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
        {steps.map((step, index) => {
          const isActive = state.currentStep === step.id;
          const isCompleted = state.currentStep > step.id;
          const isClickable = canGoToStep(step.id);
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && setStep(step.id)}
              disabled={!isClickable}
              className={`
                group relative flex min-w-[140px] md:min-w-0 flex-1 md:flex-none items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-left
                transition-all duration-200 ease-out
                ${isActive
                  ? 'bg-accent-500/15 text-white'
                  : isCompleted
                    ? 'text-dark-200 hover:bg-dark-600/50 hover:text-white'
                    : isClickable
                      ? 'text-dark-300 hover:bg-dark-600/50 hover:text-dark-100'
                      : 'text-dark-400 cursor-not-allowed opacity-50'
                }
              `}
            >
              {/* Step connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className={`hidden md:block absolute left-[29px] top-[42px] w-[2px] h-[14px] rounded-full transition-colors duration-300 ${
                  isCompleted ? 'bg-accent-500/40' : 'bg-dark-500'
                }`} />
              )}

              {/* Icon container */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                transition-all duration-200
                ${isActive
                  ? 'bg-accent-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                  : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-dark-600 text-dark-300 group-hover:bg-dark-500'
                }
              `}>
                {isCompleted ? <Check size={15} strokeWidth={3} /> : <Icon size={15} />}
              </div>

              {/* Text */}
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-semibold tracking-tight ${
                  isActive ? 'text-white' : ''
                }`}>{step.label}</span>
                <span className="text-[11px] text-dark-300 truncate">{step.sublabel}</span>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-accent-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="hidden md:block mt-auto px-2 pt-6 border-t border-dark-500/50">
        <p className="text-[11px] text-dark-400 leading-relaxed mb-2">
          100% client-side. Your data never leaves the browser.
        </p>
        <p className="text-[10px] text-dark-500 font-medium">
          Developed by{' '}
          <a href="https://www.linkedin.com/in/vishwakarmavaibhav/" target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:text-accent-300 transition-colors">
            Vaibhav Vishwakarma
          </a>
          <span className="mx-1.5 opacity-50">•</span>
          <a href="https://github.com/VishwakarmaVaibhav" target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white transition-colors">
            GitHub
          </a>
        </p>
      </div>
    </aside>
  );
}
