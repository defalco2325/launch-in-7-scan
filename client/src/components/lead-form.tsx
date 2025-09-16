import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientStorage } from "@/lib/storage-client";
import { clientPDFGenerator } from "@/lib/pdf-generator-client";

interface LeadFormProps {
  scanId: string;
}

export default function LeadForm({ scanId }: LeadFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    agree: false,
  });

  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLead = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Create lead record in client storage
      const lead = clientStorage.createLead({
        ...data,
        scanId,
      });

      // Get scan data for PDF generation
      const scan = clientStorage.getScan(scanId);
      if (!scan) {
        throw new Error('Scan data not found');
      }

      // Generate and download PDF report
      await clientPDFGenerator.downloadReport(scan, lead);

      // Submit to Netlify Forms for email capture
      const netlifyForm = new FormData();
      netlifyForm.append('form-name', 'lead-capture');
      netlifyForm.append('firstName', data.firstName);
      netlifyForm.append('lastName', data.lastName);
      netlifyForm.append('email', data.email);
      netlifyForm.append('phone', data.phone || '');
      netlifyForm.append('company', data.company || '');
      netlifyForm.append('scanId', scanId);
      netlifyForm.append('website', scan.url);

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(netlifyForm as any).toString()
      });

      toast({
        title: "Success!",
        description: "Your report has been downloaded and we'll send you additional insights via email.",
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        agree: false,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agree) {
      toast({
        title: "Agreement Required",
        description: "Please agree to receive the report",
        variant: "destructive",
      });
      return;
    }
    submitLead(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-2xl mx-auto space-y-4 sm:space-y-6"
    >
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label htmlFor="firstName" className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">
            First Name *
          </Label>
          <Input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="h-10 sm:h-12"
            data-testid="input-first-name"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">
            Last Name *
          </Label>
          <Input
            id="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="h-10 sm:h-12"
            data-testid="input-last-name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="h-12"
          data-testid="input-email"
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className="h-12"
          data-testid="input-phone"
        />
      </div>

      <div>
        <Label htmlFor="company" className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">
          Company Name
        </Label>
        <Input
          id="company"
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange("company", e.target.value)}
          className="h-12"
          data-testid="input-company"
        />
      </div>

      <div className="flex items-start gap-2 sm:gap-3">
        <Checkbox
          id="agree"
          checked={formData.agree}
          onCheckedChange={(checked) => handleInputChange("agree", !!checked)}
          data-testid="checkbox-agree"
        />
        <Label htmlFor="agree" className="text-xs sm:text-sm text-muted-foreground leading-5">
          I agree to receive the full website report and occasional updates
          about LaunchIn7 services. *
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full h-12 sm:h-14 bg-accent text-accent-foreground font-semibold text-base sm:text-lg hover:bg-accent/90"
        disabled={isSubmitting}
        data-testid="button-get-report"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Download className="w-5 h-5 mr-2" />
        )}
        Get My Full Report & Quote
      </Button>
    </form>
  );
}
