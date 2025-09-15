import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Zap, Smartphone, Search as SearchIcon, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                Launch<span className="text-secondary">In7</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-admin"
              >
                <Lock className="w-4 h-4 mr-2 inline" />
                Admin
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Check Your Website Health in{" "}
            <span className="text-accent">30 Seconds</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            If it flops, we'll rebuild it—fast.
          </p>

          {/* URL Input Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="p-6 shadow-2xl">
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="Enter your website URL (e.g., https://yoursite.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="text-lg h-12"
                      required
                      data-testid="input-website-url"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-accent text-accent-foreground font-semibold hover:bg-accent/90 text-lg"
                    disabled={scanMutation.isPending}
                    data-testid="button-scan-now"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Scan Now
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
            <div className="flex items-center" data-testid="badge-lighthouse">
              <Zap className="w-5 h-5 text-accent mr-2" />
              Target 100/100 Lighthouse
            </div>
            <div className="flex items-center" data-testid="badge-mobile-first">
              <Smartphone className="w-5 h-5 text-accent mr-2" />
              Mobile-first
            </div>
            <div className="flex items-center" data-testid="badge-seo-ready">
              <SearchIcon className="w-5 h-5 text-accent mr-2" />
              SEO-ready
            </div>
            <div className="flex items-center" data-testid="badge-secure">
              <Lock className="w-5 h-5 text-accent mr-2" />
              Secure & Fast
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            What We Check
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 shadow-lg metric-card">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Performance</h3>
                <p className="text-muted-foreground">
                  Core Web Vitals, load times, and optimization opportunities
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 shadow-lg metric-card">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Accessibility</h3>
                <p className="text-muted-foreground">
                  WCAG compliance and inclusive design standards
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 shadow-lg metric-card">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-6">
                  <SearchIcon className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">SEO</h3>
                <p className="text-muted-foreground">
                  Meta tags, structured data, and search visibility
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
