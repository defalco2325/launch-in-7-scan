import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Clock, Shield } from "lucide-react";

interface BrandPreviewProps {
  brandElements: any;
}

export default function BrandPreview({ brandElements }: BrandPreviewProps) {
  const {
    businessName = "YourBusiness",
    tagline = "Your business tagline here",
    primaryColor = "#3B82F6",
    secondaryColor = "#10B981",
    fontFamily = "Inter",
  } = brandElements || {};

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6 shadow-lg mb-8">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center">
                <Star className="w-5 h-5 mr-3 text-primary" />
                LaunchIn7 Preview
              </h3>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                Demo Only - Illustrative Layout
              </Badge>
            </div>

            {/* Brand Elements Extracted */}
            <div className="bg-muted rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">Extracted Brand Elements:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Primary Color:</span>
                  <div className="flex items-center mt-1">
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: primaryColor }}
                      data-testid="color-primary"
                    ></div>
                    <span data-testid="text-primary-color">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Secondary Color:</span>
                  <div className="flex items-center mt-1">
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: secondaryColor }}
                      data-testid="color-secondary"
                    ></div>
                    <span data-testid="text-secondary-color">{secondaryColor}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Font:</span>
                  <div className="mt-1" data-testid="text-font">
                    {fontFamily}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Logo:</span>
                  <div className="mt-1 text-secondary" data-testid="text-logo-status">
                    ✓ Extracted
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Container */}
            <div className="brand-preview-container rounded-lg p-6">
              {/* Mock LaunchIn7 Website Preview */}
              <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
                {/* Header */}
                <header
                  className="text-white p-6"
                  style={{
                    backgroundColor: primaryColor,
                    fontFamily,
                  }}
                >
                  <nav className="flex justify-between items-center">
                    <div className="text-2xl font-bold" data-testid="text-business-name">
                      {businessName}
                    </div>
                    <div className="hidden md:flex space-x-6 text-sm">
                      <a href="#" className="hover:opacity-80 transition-opacity">
                        Home
                      </a>
                      <a href="#" className="hover:opacity-80 transition-opacity">
                        Services
                      </a>
                      <a href="#" className="hover:opacity-80 transition-opacity">
                        About
                      </a>
                      <a href="#" className="hover:opacity-80 transition-opacity">
                        Contact
                      </a>
                    </div>
                  </nav>
                </header>

                {/* Hero Section */}
                <section
                  className="text-white p-12 text-center"
                  style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                    fontFamily,
                  }}
                >
                  <h1 className="text-4xl font-bold mb-4" data-testid="text-tagline">
                    {tagline}
                  </h1>
                  <p className="text-xl mb-8 opacity-90">
                    Professional services that deliver results
                  </p>
                  <Button
                    className="text-white font-semibold hover:opacity-90"
                    style={{ backgroundColor: "#FCD34D", color: "#1F2937" }}
                  >
                    Get Started
                  </Button>
                </section>

                {/* Value Props */}
                <section className="p-12 bg-gray-50" style={{ fontFamily }}>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Star className="text-xl" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Quality Service
                      </h3>
                      <p className="text-gray-600">
                        Professional quality in everything we do
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        <Clock className="text-xl" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Fast Delivery
                      </h3>
                      <p className="text-gray-600">
                        Quick turnaround times you can count on
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: "#FCD34D", color: "#1F2937" }}
                      >
                        <Shield className="text-xl" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Trusted Results
                      </h3>
                      <p className="text-gray-600">
                        Reliable solutions for your business needs
                      </p>
                    </div>
                  </div>
                </section>

                {/* Contact Form */}
                <section className="p-12" style={{ fontFamily }}>
                  <h2 className="text-3xl font-bold text-center mb-8">
                    Get In Touch
                  </h2>
                  <div className="max-w-md mx-auto">
                    <div className="space-y-4">
                      <Input placeholder="Your Name" className="h-12" />
                      <Input
                        type="email"
                        placeholder="Your Email"
                        className="h-12"
                      />
                      <Textarea
                        placeholder="Your Message"
                        rows={4}
                        className="resize-none"
                      />
                      <Button
                        className="w-full h-12 font-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Send Message
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
