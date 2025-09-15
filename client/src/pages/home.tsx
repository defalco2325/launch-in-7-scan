import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Zap, Search, Eye, Lock, BarChart3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ScanningOverlay from "@/components/scanning-overlay";
import logoImage from "@assets/image_1757954480102.png";

export default function Home() {
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [typedText, setTypedText] = useState("");
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const codeLines = [
    { static: 'const website = "', dynamic: 'launching...', suffix: '"' },
    { static: 'deployment : "', dynamic: '7 days', suffix: '"' },
    { static: 'guarantee : ', dynamic: 'true', suffix: '' }
  ];

  // Typing animation effect
  useEffect(() => {
    if (currentLine < codeLines.length) {
      const line = codeLines[currentLine];
      
      if (typedText.length < line.dynamic.length) {
        const timer = setTimeout(() => {
          setTypedText(line.dynamic.slice(0, typedText.length + 1));
        }, 15 + Math.random() * 15);
        return () => clearTimeout(timer);
      } else {
        const nextLineTimer = setTimeout(() => {
          setCurrentLine(prev => prev + 1);
          setTypedText("");
        }, 300);
        return () => clearTimeout(nextLineTimer);
      }
    }
    // Animation completes and stays in final state - no reset
  }, [typedText, currentLine]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, []);


  const scanMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/scan", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setLocation(`/results/${data.scanId}`);
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Much simpler validation - just check if something was entered
    if (!url || url.trim().length === 0) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to scan",
        variant: "destructive",
      });
      return;
    }
    
    // Minimal URL processing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Start scan immediately
    scanMutation.mutate(normalizedUrl);
  };

  if (scanMutation.isPending) {
    return <ScanningOverlay url={url} />;
  }


  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" 
         style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
         role="main"
         aria-label="LaunchIn7 Website Health Scanner">
      
      {/* Terminal Window */}
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-slate-800 rounded-t-xl sm:rounded-t-2xl lg:rounded-t-3xl border border-slate-600 overflow-hidden shadow-2xl">
          
          {/* Window Chrome */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-slate-700 border-b border-slate-600">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <img 
                src={logoImage} 
                alt="LaunchIn7 Logo" 
                className="h-12 sm:h-16 md:h-20"
              />
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin"
                className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
                data-testid="link-admin"
              >
                <Lock className="w-4 h-4 mr-1 inline" />
                Admin
              </a>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-4 sm:p-6 md:p-8 bg-slate-900 text-white font-mono">
            
            {/* Animated Code Lines */}
            <div className="space-y-3 mb-8 sm:mb-12">
              {/* Static lines that appear first */}
              {currentLine > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 opacity-100 transition-opacity duration-500 text-sm sm:text-base">
                  <span className="text-purple-400">const</span>
                  <span className="text-blue-300">website</span>
                  <span className="text-slate-400">=</span>
                  <span className="text-green-400">"launching..."</span>
                </div>
              )}
              
              {currentLine > 1 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 opacity-100 transition-opacity duration-500 text-sm sm:text-base">
                  <span className="text-purple-400">deployment</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-orange-400">"7 days"</span>
                </div>
              )}
              
              {currentLine > 2 && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 opacity-100 transition-opacity duration-500 text-sm sm:text-base">
                  <span className="text-blue-300">guarantee</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-green-400">true</span>
                </div>
              )}
              
              {/* Active typing line */}
              {currentLine < codeLines.length && (
                <div className="flex flex-wrap items-center gap-1 min-h-[1.5rem] text-sm sm:text-base">
                  {currentLine === 0 && (
                    <>
                      <span className="text-purple-400">const</span>
                      <span className="text-blue-300">website</span>
                      <span className="text-slate-400">=</span>
                      <span className="text-green-400">"{typedText}"</span>
                    </>
                  )}
                  {currentLine === 1 && (
                    <>
                      <span className="text-purple-400">deployment</span>
                      <span className="text-slate-400">:</span>
                      <span className="text-orange-400">"{typedText}"</span>
                    </>
                  )}
                  {currentLine === 2 && (
                    <>
                      <span className="text-blue-300">guarantee</span>
                      <span className="text-slate-400">:</span>
                      <span className="text-green-400">{typedText}</span>
                    </>
                  )}
                  <span className={`text-green-400 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`}>|</span>
                </div>
              )}
            </div>

            {/* Health Check Section */}
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-slate-300 text-lg sm:text-xl font-sans">Website Health Check</h3>
                <span className="text-cyan-400 text-sm sm:text-lg font-sans animate-pulse">Ready to Launch</span>
              </div>
              
              {/* Animated URL Input Form */}
              <form onSubmit={handleSubmit} className="mb-8" role="form" aria-label="Website URL Scanner">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 mb-4 hover:border-purple-400 smooth-transition hover:shadow-lg hover:shadow-purple-500/20 group gpu-accelerated">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <span className="text-purple-400 font-mono animate-pulse">{'>'}</span>
                    <input
                      type="text"
                      placeholder="your-website.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 bg-transparent text-green-400 font-mono text-base sm:text-lg placeholder-slate-500 outline-none focus:text-cyan-300 transition-colors duration-200 focus:placeholder-slate-400 w-full sm:w-auto"
                      aria-label="Enter website URL to scan"
                      aria-describedby="url-description"
                      data-testid="input-website-url"
                    />
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg font-sans font-semibold smooth-transition flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 relative overflow-hidden group w-full sm:w-auto text-sm sm:text-base min-h-[44px]"
                      disabled={scanMutation.isPending}
                      aria-label="Start website health scan"
                      data-testid="button-scan-now"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Search className="w-4 h-4 relative z-10 group-hover:animate-bounce" />
                      <span className="relative z-10">Scan Now</span>
                    </button>
                  </div>
                </div>
              </form>

            </div>

            {/* Animated Feature Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8" role="region" aria-label="Website health check features">
              
              {/* Performance Analysis */}
              <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-600 hover:border-orange-400 smooth-transition hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 opacity-0 animate-fadeInUp group gpu-accelerated" 
                   style={{animationDelay: '0s', animationFillMode: 'forwards'}}>
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:animate-pulse transition-all duration-300">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="font-sans">
                    <h4 className="text-white text-base sm:text-lg font-semibold group-hover:text-orange-300 transition-colors duration-300">Performance Analysis</h4>
                    <p className="text-slate-400 text-xs sm:text-sm group-hover:text-slate-300 transition-colors duration-300">Core Web Vitals & speed metrics</p>
                  </div>
                </div>
              </div>

              {/* Brand Extraction */}
              <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-600 hover:border-cyan-400 smooth-transition hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 opacity-0 animate-fadeInUp group gpu-accelerated" 
                   style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-lg flex items-center justify-center group-hover:animate-pulse transition-all duration-300">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="font-sans">
                    <h4 className="text-white text-base sm:text-lg font-semibold group-hover:text-cyan-300 transition-colors duration-300">Brand Extraction</h4>
                    <p className="text-slate-400 text-xs sm:text-sm group-hover:text-slate-300 transition-colors duration-300">Colors, fonts & visual identity</p>
                  </div>
                </div>
              </div>

              {/* SEO & Accessibility */}
              <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-600 hover:border-purple-400 smooth-transition hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 opacity-0 animate-fadeInUp group sm:col-span-2 md:col-span-1 gpu-accelerated" 
                   style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:animate-pulse transition-all duration-300">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="font-sans">
                    <h4 className="text-white text-base sm:text-lg font-semibold group-hover:text-purple-300 transition-colors duration-300">SEO & Accessibility</h4>
                    <p className="text-slate-400 text-xs sm:text-sm group-hover:text-slate-300 transition-colors duration-300">WCAG compliance & search optimization</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-slate-400 font-sans text-base sm:text-lg mb-2">
                Enter your website URL above to start the health check
              </p>
              <p className="text-slate-500 font-sans text-xs sm:text-sm">
                If it flops, we'll rebuild it—fast. 7-day guarantee.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}
