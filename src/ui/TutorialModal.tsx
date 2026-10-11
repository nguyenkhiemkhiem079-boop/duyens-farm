import React from 'react';
import { ONBOARDING_TUTORIAL_STEPS } from '../content/gameContent';
import { Sparkles, ArrowRight, Check, X } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  if (!isOpen) return null;

  const step = ONBOARDING_TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === ONBOARDING_TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-amber-50 border-2 border-amber-300 shadow-2xl rounded-3xl max-w-lg w-full p-6 text-amber-950 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-amber-200 text-amber-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mb-4">
          {ONBOARDING_TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-amber-500'
                  : idx < currentStep
                  ? 'w-2 bg-amber-300'
                  : 'w-2 bg-amber-200'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-black text-amber-950 tracking-tight">{step.title}</h3>
        </div>

        {/* Content */}
        <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 leading-relaxed shadow-inner min-h-[110px] whitespace-pre-line">
          {step.body}
        </div>

        {/* Footer Navigation */}
        <div className="mt-5 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-xs text-amber-700 hover:text-amber-900 font-bold underline"
          >
            Bỏ qua hướng dẫn
          </button>

          <button
            onClick={handleNext}
            className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white rounded-xl font-bold flex items-center gap-2 shadow"
          >
            <span>{isLast ? 'Bắt đầu ngay!' : 'Tiếp theo'}</span>
            {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
