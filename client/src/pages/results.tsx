import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Eye,
  Monitor,
  Clock,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Zap,
  Shield,
  Search,
  Globe,
} from "lucide-react";
import LeadForm from "@/components/lead-form";
import ScanningOverlay from "@/components/scanning-overlay";
import OutcomePanel from "@/components/OutcomePanel";
import type { Scan, CoreWebVitals, Issue } from "@shared/schema";
import logoImage from "@assets/image_1757954480102.png";

export default function Results() {
  const { id } = useParams();
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [animatedScores, setAnimatedScores] = useState({
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0
  });

  const { data: scan, isLoading } = useQuery<Scan & { status: string; progress: number }>({
    queryKey: ["/api/scan", id],
    refetchInterval: (data) => {
      return (data as any)?.status === "complete" ? false : 2000;
    },
  });

  // Typing animation for header
  useEffect(() => {
    if (scan) {
      const text = `Analyzing: ${new URL(scan.url).hostname}`;
      if (typedText.length < text.length) {
        const timer = setTimeout(() => {
          setTypedText(text.slice(0, typedText.length + 1));
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [typedText, scan]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Animate scores
  useEffect(() => {
    if (scan && scan.status === "complete") {
      const scores = getScores();
      const duration = 1500;
      const steps = 60;
      const interval = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedScores({
          performance: Math.round(scores.performanceScore * easeOut),
          accessibility: Math.round(scores.accessibilityScore * easeOut),
          bestPractices: Math.round(scores.bestPracticesScore * easeOut),
          seo: Math.round(scores.seoScore * easeOut)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [scan, device]);

  const scrollToLeadForm = () => {
    document.getElementById("lead-form-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (isLoading || !scan) {
    return <ScanningOverlay url="your website" />;
  }

  if (scan.status === "running") {
    return <ScanningOverlay url={scan.url} />;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return "shadow-green-400/50";
    if (score >= 60) return "shadow-yellow-400/50";
    return "shadow-red-400/50";
  };

  // Get scores based on selected device
  const getScores = () => {
    if (device === "mobile") {
      return {
        performanceScore: scan.mobilePerformanceScore || 0,
        accessibilityScore: scan.mobileAccessibilityScore || 0,
        bestPracticesScore: scan.mobileBestPracticesScore || 0,
        seoScore: scan.mobileSeoScore || 0,
        coreWebVitals: scan.mobileCoreWebVitals,
        topIssues: scan.mobileTopIssues || []
      };
    } else {
      return {
        performanceScore: scan.performanceScore || 0,
        accessibilityScore: scan.accessibilityScore || 0,
        bestPracticesScore: scan.bestPracticesScore || 0,
        seoScore: scan.seoScore || 0,
        coreWebVitals: scan.coreWebVitals,
        topIssues: scan.topIssues || []
      };
    }
  };

  const scores = getScores();

  return (
    <div className="min-h-screen terminal-window">
      {/* Terminal Window Container */}
      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        <div className="bg-slate-800 rounded-t-xl sm:rounded-t-2xl lg:rounded-t-3xl border border-slate-600 overflow-hidden shadow-2xl">
          
          {/* Terminal Chrome - Mobile optimized */}
          <div className="terminal-chrome px-2 xs:px-3 sm:px-6 py-2 xs:py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-2 xs:gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 self-start sm:self-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={logoImage} 
                alt="LaunchIn7 Logo" 
                className="h-10 sm:h-14 md:h-16"
              />
            </div>

            {/* Device Toggle */}
            <div className="device-toggle-terminal rounded-lg p-1 flex flex-row">
              <button
                onClick={() => setDevice("desktop")}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md flex items-center gap-1 sm:gap-2 transition-all ${
                  device === "desktop" ? "active" : "text-slate-400"
                }`}
                data-testid="button-desktop-view"
              >
                <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="code-text text-xs sm:text-sm hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md flex items-center gap-1 sm:gap-2 transition-all ${
                  device === "mobile" ? "active" : "text-slate-400"
                }`}
                data-testid="button-mobile-view"
              >
                <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="code-text text-xs sm:text-sm hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="terminal-content p-4 sm:p-6 md:p-8">
            
            {/* Header with typing animation */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 text-sm sm:text-base">
                <span className="text-purple-400 code-text">const</span>
                <span className="text-blue-300 code-text">scan</span>
                <span className="text-slate-400">=</span>
                <span className="text-green-400 code-text break-all" data-testid="text-scanned-url">
                  "{typedText}"
                </span>
                <span className={`text-green-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base">
                <span className="text-purple-400 code-text">status:</span>
                <span className="text-cyan-400 code-text animate-pulse">"complete"</span>
              </div>
            </div>

            {/* Performance Score Cards - Mobile optimized */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
              <div className="terminal-card p-3 sm:p-6 text-center animate-fadeInUp stagger-1 smooth-transition gpu-accelerated">
                <div className="mb-2 sm:mb-3">
                  <Zap className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto ${getScoreColor(animatedScores.performance)}`} />
                </div>
                <div className={`text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 score-display ${getScoreColor(animatedScores.performance)}`}
                     data-testid="score-performance">
                  {animatedScores.performance}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 code-text mb-2 sm:mb-3">
                  Performance
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full progress-bar-fill ${
                      animatedScores.performance >= 80 ? 'bg-green-400' :
                      animatedScores.performance >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ '--progress-width': `${animatedScores.performance}%` } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="terminal-card p-3 sm:p-6 text-center animate-fadeInUp stagger-2 smooth-transition gpu-accelerated">
                <div className="mb-2 sm:mb-3">
                  <Eye className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto ${getScoreColor(animatedScores.accessibility)}`} />
                </div>
                <div className={`text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 score-display ${getScoreColor(animatedScores.accessibility)}`}
                     data-testid="score-accessibility">
                  {animatedScores.accessibility}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 code-text mb-2 sm:mb-3">
                  Accessibility
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full progress-bar-fill ${
                      animatedScores.accessibility >= 80 ? 'bg-green-400' :
                      animatedScores.accessibility >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ '--progress-width': `${animatedScores.accessibility}%` } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="terminal-card p-3 sm:p-6 text-center animate-fadeInUp stagger-3 smooth-transition gpu-accelerated">
                <div className="mb-2 sm:mb-3">
                  <Shield className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto ${getScoreColor(animatedScores.bestPractices)}`} />
                </div>
                <div className={`text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 score-display ${getScoreColor(animatedScores.bestPractices)}`}
                     data-testid="score-best-practices">
                  {animatedScores.bestPractices}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 code-text mb-2 sm:mb-3">
                  Best Practices
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full progress-bar-fill ${
                      animatedScores.bestPractices >= 80 ? 'bg-green-400' :
                      animatedScores.bestPractices >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ '--progress-width': `${animatedScores.bestPractices}%` } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="terminal-card p-3 sm:p-6 text-center animate-fadeInUp stagger-4 smooth-transition gpu-accelerated">
                <div className="mb-2 sm:mb-3">
                  <Globe className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto ${getScoreColor(animatedScores.seo)}`} />
                </div>
                <div className={`text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 score-display ${getScoreColor(animatedScores.seo)}`}
                     data-testid="score-seo">
                  {animatedScores.seo}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 code-text mb-2 sm:mb-3">
                  SEO
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full progress-bar-fill ${
                      animatedScores.seo >= 80 ? 'bg-green-400' :
                      animatedScores.seo >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ '--progress-width': `${animatedScores.seo}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              {/* Current Website Screenshot */}
              <div className="terminal-card p-3 xs:p-4 sm:p-6 animate-slideInLeft smooth-transition">
                <div className="flex flex-wrap items-center gap-2 mb-4 text-sm sm:text-base">
                  <span className="text-purple-400 code-text break-all">screenshot:</span>
                  <span className="text-cyan-400 code-text break-all">"current_site"</span>
                </div>
                <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
                  {scan.screenshot ? (
                    <img
                      src={`data:image/png;base64,${scan.screenshot}`}
                      alt="Current website screenshot"
                      className="w-full h-full object-cover"
                      data-testid="img-current-website"
                    />
                  ) : (
                    <div className="text-slate-500 flex items-center code-text">
                      <Monitor className="w-8 h-8 mr-2" />
                      <span>null</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <a
                    href={scan.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-cyan-900 text-cyan-400 rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-400/30 code-text"
                    data-testid="link-visit-current-site"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Site
                  </a>
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="terminal-card p-3 xs:p-4 sm:p-6 animate-slideInRight smooth-transition">
                <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6 text-sm sm:text-base">
                  <span className="text-purple-400 code-text">metrics:</span>
                  <span className="text-cyan-400 code-text">CoreWebVitals</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <span className="text-sm text-slate-400 code-text">lcp:</span>
                    <span className="font-semibold text-green-400 code-text" data-testid="text-lcp">
                      "{scores.coreWebVitals?.lcp || "null"}"
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <span className="text-sm text-slate-400 code-text">fid:</span>
                    <span className="font-semibold text-green-400 code-text" data-testid="text-fid">
                      "{scores.coreWebVitals?.fid || "null"}"
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <span className="text-sm text-slate-400 code-text">cls:</span>
                    <span className="font-semibold text-green-400 code-text" data-testid="text-cls">
                      "{scores.coreWebVitals?.cls || "null"}"
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <span className="text-sm text-slate-400 code-text">tbt:</span>
                    <span className="font-semibold text-green-400 code-text" data-testid="text-tbt">
                      "{scores.coreWebVitals?.tbt || "null"}"
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Issues */}
            {scores.topIssues && Array.isArray(scores.topIssues) && scores.topIssues.length > 0 && (
              <div className="mt-8 sm:mt-12 terminal-card p-4 sm:p-6 animate-slideInUp">
                <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6 text-sm sm:text-base">
                  <span className="text-purple-400 code-text">const</span>
                  <span className="text-blue-300 code-text">issues</span>
                  <span className="text-slate-400">=</span>
                  <span className="text-yellow-400 code-text">[</span>
                </div>
                <div className="space-y-4 pl-4 sm:pl-8">
                  {scores.topIssues.map((issue: Issue, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all hover:transform hover:scale-105"
                      data-testid={`issue-${index}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-black text-sm font-bold ${
                        issue.severity === "critical" ? "bg-red-400" : "bg-yellow-400"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm sm:text-base">
                          <span className="text-blue-300 code-text">title:</span>
                          <span className="text-green-400 code-text" data-testid={`issue-title-${index}`}>
                            "{issue.title}"
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start gap-2 mb-2 text-sm">
                          <span className="text-blue-300 code-text">desc:</span>
                          <span className="text-slate-400 code-text text-xs sm:text-sm" data-testid={`issue-description-${index}`}>
                            "{issue.description}"
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                          <span className="text-blue-300 code-text">severity:</span>
                          <span className={`code-text ${
                            issue.severity === "critical" ? "text-red-400" : "text-yellow-400"
                          }`} data-testid={`issue-severity-${index}`}>
                            "{issue.severity}"
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <span className="text-yellow-400 code-text pl-4 sm:pl-8">]</span>
                </div>
              </div>
            )}

            {/* Tiered Outcome Panel */}
            <OutcomePanel 
              scores={{
                performance: animatedScores.performance,
                accessibility: animatedScores.accessibility,
                bestPractices: animatedScores.bestPractices,
                seo: animatedScores.seo
              }}
              domain={scan.url ? new URL(scan.url).hostname : undefined}
              industry={(scan.brandElements as any)?.businessName ? 'custom' : undefined}
            />
          </div>
        </div>
      </div>

      {/* Lead Capture Section */}
      <section className="py-12 sm:py-16 px-4" id="lead-form-section">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-600 p-4 sm:p-6 lg:p-8 shadow-2xl">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-cyan-400 neon-text">
                Ready to Transform Your Website?
              </h2>
              <p className="text-base sm:text-lg text-slate-300">
                Get your full report and a custom quote to rebuild your site
                in just 7 days.
              </p>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 sm:p-6">
              <LeadForm scanId={scan.id} />
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                No spam, ever. Your information is secure and will only be
                used to send your report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-8 sm:py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-600">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-400">Not Ready Yet?</h3>
          <p className="text-base sm:text-lg mb-4 sm:mb-6 text-slate-300">
            View our packages and see what's possible
          </p>
          <button
            className="px-5 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-cyan-900 text-cyan-400 rounded-lg font-semibold text-sm sm:text-base transition-all hover:shadow-lg hover:shadow-cyan-400/30"
            data-testid="button-see-packages"
          >
            See Packages
          </button>
        </div>
      </section>
    </div>
  );
}