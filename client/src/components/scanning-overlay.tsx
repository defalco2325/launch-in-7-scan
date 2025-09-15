import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";

interface ScanningOverlayProps {
  url: string;
}

interface ScanStep {
  id: string;
  label: string;
  status: "complete" | "progress" | "waiting";
}

export default function ScanningOverlay({ url }: ScanningOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ScanStep[]>([
    { id: "fetch", label: "Fetching website content", status: "complete" },
    { id: "extract", label: "Extracting brand elements", status: "progress" },
    { id: "performance", label: "Running performance tests", status: "waiting" },
    { id: "preview", label: "Generating preview", status: "waiting" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 800);

    const stepInterval = setInterval(() => {
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        const currentIndex = newSteps.findIndex(
          (step) => step.status === "progress"
        );
        if (currentIndex < newSteps.length - 1) {
          newSteps[currentIndex].status = "complete";
          newSteps[currentIndex + 1].status = "progress";
        }
        return newSteps;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background py-20 px-4 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center w-full">
        <div className="mb-8">
          <div className="loading-spinner w-16 h-16 border-4 border-muted border-t-primary rounded-full mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold mb-4">Analyzing Your Website</h2>
          <p className="text-muted-foreground text-lg">
            Scanning {url} - This will take about 30 seconds...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4 mb-8">
            {steps.map((step) => (
              <Card key={step.id} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      {step.status === "complete" ? (
                        <CheckCircle className="w-5 h-5 text-secondary mr-3" />
                      ) : step.status === "progress" ? (
                        <div className="loading-spinner w-5 h-5 border-2 border-muted border-t-primary rounded-full mr-3"></div>
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground mr-3" />
                      )}
                      <span
                        className={
                          step.status === "waiting"
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }
                      >
                        {step.label}
                      </span>
                    </span>
                    <span
                      className={
                        step.status === "complete"
                          ? "text-secondary font-semibold"
                          : step.status === "progress"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {step.status === "complete"
                        ? "Complete"
                        : step.status === "progress"
                        ? "In progress..."
                        : "Waiting..."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full progress-bar transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% Complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
