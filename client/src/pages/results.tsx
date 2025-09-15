import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Eye,
  Monitor,
  Clock,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import LeadForm from "@/components/lead-form";
import BrandPreview from "@/components/brand-preview";
import ScanningOverlay from "@/components/scanning-overlay";
import DeviceToggle from "@/components/device-toggle";
import type { Scan, CoreWebVitals, Issue } from "@shared/schema";

export default function Results() {
  const { id } = useParams();
  const [activeView, setActiveView] = useState<"scan" | "preview">("scan");
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");

  const { data: scan, isLoading } = useQuery<Scan & { status: string; progress: number }>({
    queryKey: ["/api/scan", id],
    refetchInterval: (data) => {
      return (data as any)?.status === "complete" ? false : 2000;
    },
  });

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
    if (score >= 80) return "text-secondary";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-secondary";
    if (score >= 60) return "bg-accent";
    return "bg-destructive";
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
          </div>
        </nav>
      </header>

      {/* Sticky Navigation */}
      <div className="sticky top-16 z-40 bg-background border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">
              Results for{" "}
              <span className="text-primary" data-testid="text-scanned-url">
                {new URL(scan.url).hostname}
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Device Toggle */}
            <DeviceToggle device={device} onDeviceChange={setDevice} />

            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={activeView === "scan" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("scan")}
                className="toggle-switch"
                data-testid="button-scan-view"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Scan Results
              </Button>
              <Button
                variant={activeView === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("preview")}
                className="toggle-switch"
                data-testid="button-preview-view"
              >
                <Eye className="w-4 h-4 mr-2" />
                LaunchIn7 Preview
              </Button>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90"
            onClick={scrollToLeadForm}
            data-testid="button-rebuild-site"
          >
            Rebuild my site in 7 days
          </Button>
        </div>
      </div>

      {/* Scan Results View */}
      {activeView === "scan" && (
        <div className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Performance Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 text-center shadow-lg metric-card">
                <CardContent className="p-0">
                  <div
                    className={`text-3xl font-bold mb-2 ${getScoreColor(
                      scores.performanceScore
                    )}`}
                    data-testid="score-performance"
                  >
                    {scores.performanceScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Performance ({device})
                  </div>
                  <Progress
                    value={scores.performanceScore}
                    className="h-2"
                  />
                </CardContent>
              </Card>

              <Card className="p-6 text-center shadow-lg metric-card">
                <CardContent className="p-0">
                  <div
                    className={`text-3xl font-bold mb-2 ${getScoreColor(
                      scores.accessibilityScore
                    )}`}
                    data-testid="score-accessibility"
                  >
                    {scores.accessibilityScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Accessibility ({device})
                  </div>
                  <Progress
                    value={scores.accessibilityScore}
                    className="h-2"
                  />
                </CardContent>
              </Card>

              <Card className="p-6 text-center shadow-lg metric-card">
                <CardContent className="p-0">
                  <div
                    className={`text-3xl font-bold mb-2 ${getScoreColor(
                      scores.bestPracticesScore
                    )}`}
                    data-testid="score-best-practices"
                  >
                    {scores.bestPracticesScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Best Practices ({device})
                  </div>
                  <Progress
                    value={scores.bestPracticesScore}
                    className="h-2"
                  />
                </CardContent>
              </Card>

              <Card className="p-6 text-center shadow-lg metric-card">
                <CardContent className="p-0">
                  <div
                    className={`text-3xl font-bold mb-2 ${getScoreColor(
                      scores.seoScore
                    )}`}
                    data-testid="score-seo"
                  >
                    {scores.seoScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">SEO ({device})</div>
                  <Progress value={scores.seoScore} className="h-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Current Website Screenshot */}
              <Card className="p-6 shadow-lg">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Monitor className="w-5 h-5 mr-3 text-primary" />
                    Current Website
                  </h3>
                  <div className="border rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
                    {scan.screenshot ? (
                      <img
                        src={`data:image/png;base64,${scan.screenshot}`}
                        alt="Current website screenshot"
                        className="w-full h-full object-cover"
                        data-testid="img-current-website"
                      />
                    ) : (
                      <div className="text-muted-foreground flex items-center">
                        <Monitor className="w-8 h-8 mr-2" />
                        <span>Screenshot not available</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={scan.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="link-visit-current-site"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Current Site
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Core Web Vitals */}
              <Card className="p-6 shadow-lg">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-primary" />
                    Core Web Vitals ({device})
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Largest Contentful Paint</span>
                      <span
                        className="font-semibold"
                        data-testid="text-lcp"
                      >
                        {scores.coreWebVitals?.lcp || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">First Input Delay</span>
                      <span
                        className="font-semibold"
                        data-testid="text-fid"
                      >
                        {scores.coreWebVitals?.fid || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cumulative Layout Shift</span>
                      <span
                        className="font-semibold"
                        data-testid="text-cls"
                      >
                        {scores.coreWebVitals?.cls || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Blocking Time</span>
                      <span
                        className="font-semibold"
                        data-testid="text-tbt"
                      >
                        {scores.coreWebVitals?.tbt || "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Issues */}
            {scores.topIssues && Array.isArray(scores.topIssues) && scores.topIssues.length > 0 && (
              <Card className="mt-8 p-6 shadow-lg">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-3 text-accent" />
                    Top Issues to Fix ({device})
                  </h3>
                  <div className="space-y-4">
                    {scores.topIssues.map((issue: Issue, index: number) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-muted rounded-lg"
                        data-testid={`issue-${index}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${
                            issue.severity === "critical"
                              ? "bg-destructive"
                              : "bg-accent"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold" data-testid={`issue-title-${index}`}>
                            {issue.title}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`issue-description-${index}`}>
                            {issue.description}
                          </p>
                          <Badge
                            variant={
                              issue.severity === "critical"
                                ? "destructive"
                                : "secondary"
                            }
                            className="mt-2"
                            data-testid={`issue-severity-${index}`}
                          >
                            {issue.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* LaunchIn7 Preview View */}
      {activeView === "preview" && (
        <BrandPreview brandElements={scan.brandElements} />
      )}

      {/* Lead Capture Section */}
      <section className="py-16 px-4 bg-muted" id="lead-form-section">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-lg">
            <CardContent className="p-0">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Transform Your Website?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get your full report and a custom quote to rebuild your site
                  in just 7 days.
                </p>
              </div>
              <LeadForm scanId={scan.id} />
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  No spam, ever. Your information is secure and will only be
                  used to send your report.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-12 px-4 gradient-bg text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Not Ready Yet?</h3>
          <p className="text-lg mb-6 opacity-90">
            View our packages and see what's possible
          </p>
          <Button
            variant="secondary"
            className="bg-white text-primary font-semibold hover:bg-gray-100"
            data-testid="button-see-packages"
          >
            See Packages
          </Button>
        </div>
      </section>
    </div>
  );
}
