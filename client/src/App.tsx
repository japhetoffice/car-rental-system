import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import CarDetails from "@/pages/CarDetails";
import Bookings from "@/pages/Bookings";
import AdminDashboard from "@/pages/AdminDashboard";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useLocation } from "wouter";

const AdminRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, isLoading, isAuthenticated, setLocation, toast]);

  if (isLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") return null;

  return <Component />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/cars/:id" component={CarDetails} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/admin">
        <AdminRoute component={AdminDashboard} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
