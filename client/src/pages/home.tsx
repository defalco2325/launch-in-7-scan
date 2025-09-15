import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, Search, Eye, Lock, BarChart3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ScanningOverlay from "@/components/scanning-overlay";

export default function Home() {
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
    if (!url) return;
    
    try {
      new URL(url);
      scanMutation.mutate(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
    }
  };

  if (scanMutation.isPending) {
    return <ScanningOverlay url={url} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" 
         style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      
      {/* Terminal Window */}
      <div className="w-full max-w-5xl mx-auto">
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
            <div className="flex items-center space-x-4">
              <a
                href="/admin"
                className="text-slate-400 hover:text-white transition-colors text-sm"
                data-testid="link-admin"
              >
                <Lock className="w-4 h-4 mr-1 inline" />
                Admin
              </a>
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
                <span className="text-green-400">"launching..."</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-purple-400">deployment</span>
                <span className="text-slate-400">:</span>
                <span className="text-orange-400">"7 days"</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-blue-300">guarantee</span>
                <span className="text-slate-400">:</span>
                <span className="text-green-400">true</span>
              </div>
            </div>

            {/* Health Check Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-300 text-xl font-sans">Website Health Check</h3>
                <span className="text-cyan-400 text-lg font-sans">Ready to Launch</span>
              </div>
              
              {/* URL Input Form */}
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400 font-mono">{'>'}</span>
                    <input
                      type="url"
                      placeholder="https://your-website.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 bg-transparent text-green-400 font-mono text-lg placeholder-slate-500 outline-none"
                      required
                      data-testid="input-website-url"
                    />
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-sans font-semibold transition-colors flex items-center space-x-2"
                      disabled={scanMutation.isPending}
                      data-testid="button-scan-now"
                    >
                      <Search className="w-4 h-4" />
                      <span>Scan Now</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              
              {/* Performance Analysis */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-sans">
                    <h4 className="text-white text-lg font-semibold">Performance Analysis</h4>
                    <p className="text-slate-400 text-sm">Core Web Vitals & speed metrics</p>
                  </div>
                </div>
              </div>

              {/* Brand Extraction */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-sans">
                    <h4 className="text-white text-lg font-semibold">Brand Extraction</h4>
                    <p className="text-slate-400 text-sm">Colors, fonts & visual identity</p>
                  </div>
                </div>
              </div>

              {/* SEO & Accessibility */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-sans">
                    <h4 className="text-white text-lg font-semibold">SEO & Accessibility</h4>
                    <p className="text-slate-400 text-sm">WCAG compliance & search optimization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-slate-400 font-sans text-lg mb-2">
                Enter your website URL above to start the health check
              </p>
              <p className="text-slate-500 font-sans text-sm">
                If it flops, we'll rebuild it—fast. 7-day guarantee.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
