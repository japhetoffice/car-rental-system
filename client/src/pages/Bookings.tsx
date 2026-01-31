import { Layout } from "@/components/Layout";
import { useBookings } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarRange, Car as CarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();

  // Redirect if not auth handled by page logic or wrapper generally, 
  // but let's show a clear state here.

  if (isLoading || isLoadingAuth) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <div className="bg-muted p-4 rounded-full">
            <AlertTriangle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground max-w-md">Please sign in to view your booking history.</p>
          <a href="/api/login">
            <Button>Sign In</Button>
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">My Bookings</h1>

        {bookings?.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <CalendarRange className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No bookings yet</h3>
            <p className="text-muted-foreground mt-2">You haven't made any reservations.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings?.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 md:h-auto bg-muted">
                    <img 
                      src={booking.car.imageUrl} 
                      alt={booking.car.model} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CarIcon className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{booking.car.make} {booking.car.model}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.car.year} • {booking.car.color}</p>
                      </div>
                      <Badge variant={
                        booking.status === 'confirmed' ? 'default' : 
                        booking.status === 'completed' ? 'secondary' : 'outline'
                      } className="w-fit capitalize">
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-border/50">
                      <div>
                        <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Dates</span>
                        <span className="font-medium">
                          {format(new Date(booking.startDate), "MMM dd")} - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Total Paid</span>
                        <span className="font-bold text-primary text-lg">${Number(booking.totalPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
