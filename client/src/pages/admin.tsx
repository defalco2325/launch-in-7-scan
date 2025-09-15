import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Users,
  Search as SearchIcon,
  BarChart3,
  TrendingUp,
  Download,
  Send,
  Trash2,
} from "lucide-react";

export default function Admin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Leads query with basic auth headers
  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/admin/leads"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const auth = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch("/api/admin/leads", {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("Authentication failed");
        }
        throw new Error("Failed to fetch leads");
      }
      return response.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      const auth = btoa(`${creds.username}:${creds.password}`);
      const response = await fetch("/api/admin/leads", {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const auth = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch(`/api/admin/leads/${leadId}/resend`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to resend report");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report resent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const auth = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete lead");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({ username: "", password: "" });
  };

  const exportLeads = () => {
    if (!leads) return;

    const csv = [
      "Name,Email,Company,Phone,Website,Date",
      ...leads.map(
        (lead: any) =>
          `"${lead.firstName} ${lead.lastName}","${lead.email}","${
            lead.company || ""
          }","${lead.phone || ""}","${lead.scanId || ""}","${
            lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""
          }"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                Launch<span className="text-secondary">In7</span> Admin
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enter your credentials to access the admin dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                  data-testid="input-admin-username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  data-testid="input-admin-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex-shrink-0">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                Launch<span className="text-secondary">In7</span>
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </nav>
      </header>

      <div className="py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6 shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Scans</p>
                    <p className="text-2xl sm:text-3xl font-bold" data-testid="stat-total-scans">
                      {leads?.length || 0}
                    </p>
                  </div>
                  <SearchIcon className="text-primary text-xl sm:text-2xl" />
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Leads Generated
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold" data-testid="stat-leads-generated">
                      {leads?.length || 0}
                    </p>
                  </div>
                  <Users className="text-secondary text-xl sm:text-2xl" />
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 sm:p-6 shadow-lg sm:col-span-2 md:col-span-1">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Conversion Rate
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold" data-testid="stat-conversion-rate">
                      100%
                    </p>
                  </div>
                  <TrendingUp className="text-accent text-xl sm:text-2xl" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leads Table */}
          <Card className="shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">Recent Leads</h2>
                  <Button
                    onClick={exportLeads}
                    disabled={!leads?.length}
                    data-testid="button-export-leads"
                  >
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-8 text-center">Loading leads...</div>
                ) : !leads?.length ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No leads found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead: any) => (
                        <TableRow key={lead.id} data-testid={`lead-row-${lead.id}`}>
                          <TableCell>
                            <div className="font-medium" data-testid={`lead-name-${lead.id}`}>
                              {lead.firstName} {lead.lastName}
                            </div>
                            {lead.company && (
                              <div className="text-sm text-muted-foreground" data-testid={`lead-company-${lead.id}`}>
                                {lead.company}
                              </div>
                            )}
                          </TableCell>
                          <TableCell data-testid={`lead-email-${lead.id}`}>{lead.email}</TableCell>
                          <TableCell data-testid={`lead-company-cell-${lead.id}`}>
                            {lead.company || "-"}
                          </TableCell>
                          <TableCell data-testid={`lead-date-${lead.id}`}>
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                                onClick={() => resendMutation.mutate(lead.id)}
                                disabled={resendMutation.isPending}
                                data-testid={`button-resend-${lead.id}`}
                              >
                                <Send className="w-4 h-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive h-8 w-8 sm:h-9 sm:w-9 p-0"
                                    data-testid={`button-delete-${lead.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this lead? This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(lead.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
