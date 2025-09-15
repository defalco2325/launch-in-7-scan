import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

  const leadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/lead", {
        ...data,
        scanId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
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
      // Invalidate admin leads query
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
    leadMutation.mutate(formData);
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
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">
            First Name *
          </Label>
          <Input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="h-12"
            data-testid="input-first-name"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">
            Last Name *
          </Label>
          <Input
            id="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="h-12"
            data-testid="input-last-name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-medium mb-2 block">
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
        <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
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
        <Label htmlFor="company" className="text-sm font-medium mb-2 block">
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

      <div className="flex items-start space-x-3">
        <Checkbox
          id="agree"
          checked={formData.agree}
          onCheckedChange={(checked) => handleInputChange("agree", !!checked)}
          data-testid="checkbox-agree"
        />
        <Label htmlFor="agree" className="text-sm text-muted-foreground leading-5">
          I agree to receive the full website report and occasional updates
          about LaunchIn7 services. *
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full h-14 bg-accent text-accent-foreground font-semibold text-lg hover:bg-accent/90"
        disabled={leadMutation.isPending}
        data-testid="button-get-report"
      >
        {leadMutation.isPending ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Download className="w-5 h-5 mr-2" />
        )}
        Get My Full Report & Quote
      </Button>
    </form>
  );
}
