import { useState, useEffect } from "react";
import { Zap, Search, Eye, CheckCircle } from "lucide-react";

interface ScanningOverlayProps {
  url: string;
}

interface ScanStep {
  id: string;
  label: string;
  subtitle: string;
  icon: any;
  status: "complete" | "progress" | "waiting";
}

export default function ScanningOverlay({ url }: ScanningOverlayProps) {
  const [progress, setProgress] = useState(5);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const steps: ScanStep[] = [
    { 
      id: "fetch", 
      label: "Website Analysis", 
      subtitle: "Fetching website content and structure",
      icon: Search,
      status: "progress" 
    },
    { 
      id: "performance", 
      label: "Performance Scan", 
      subtitle: "Running Lighthouse performance tests",
      icon: Zap,
      status: "waiting" 
    },
    { 
      id: "extract", 
      label: "Brand Extraction", 
      subtitle: "Analyzing colors, fonts, and visual elements",
      icon: Eye,
      status: "waiting" 
    },
    { 
      id: "preview", 
      label: "Preview Generation", 
      subtitle: "Creating your modern website preview",
      icon: CheckCircle,
      status: "waiting" 
    },
  ];

  const [scanSteps, setScanSteps] = useState(steps);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 8 + 2;
      });
    }, 1200);

    const stepInterval = setInterval(() => {
      setScanSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        const currentIndex = newSteps.findIndex(step => step.status === "progress");
        
        if (currentIndex < newSteps.length - 1) {
          newSteps[currentIndex].status = "complete";
          newSteps[currentIndex + 1].status = "progress";
          setCurrentStepIndex(currentIndex + 1);
        }
        
        return newSteps;
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  const currentStep = scanSteps[currentStepIndex];
  const StepIcon = currentStep?.icon || Search;

  return (
    <div className="min-h-screen flex items-center justify-center p-8" 
         style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      
      {/* Terminal Window */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-t-3xl border border-slate-600 overflow-hidden shadow-2xl">
          
          {/* Window Chrome */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-700 border-b border-slate-600">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-slate-400 text-sm font-mono">
              launchin7.com
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-8 bg-slate-900 text-white font-mono">
            
            {/* Code Lines */}
            <div className="space-y-3 mb-12">
              <div className="flex items-center space-x-3">
                <span className="text-purple-400">const</span>
                <span className="text-blue-300">website</span>
                <span className="text-slate-400">=</span>
                <span className="text-green-400">"scanning..."</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-purple-400">analysis</span>
                <span className="text-slate-400">:</span>
                <span className="text-orange-400">"in progress"</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-blue-300">guarantee</span>
                <span className="text-slate-400">:</span>
                <span className="text-green-400">true</span>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-300 text-lg font-sans">Scan Progress</h3>
                <span className="text-cyan-400 text-lg font-sans">Step {currentStepIndex + 1}/4</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-3 mb-8 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step Card */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-600">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="font-sans">
                  <h4 className="text-white text-xl font-semibold mb-1">
                    {currentStep?.label}
                  </h4>
                  <p className="text-slate-400">
                    {currentStep?.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center mt-8">
              <p className="text-slate-400 font-sans">
                Analyzing your website health...
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
