import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { useCar } from "@/hooks/use-cars";
import { useBookings, useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays, addDays } from "date-fns";
import { CalendarIcon, Fuel, Gauge, Settings2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function CarDetails() {
  const [, params] = useRoute("/cars/:id");
  const id = parseInt(params?.id || "0");
  const { data: car, isLoading: isLoadingCar } = useCar(id);
  const { isAuthenticated } = useAuth();
  const { mutate: createBooking, isPending: isBooking } = useCreateBooking();
  const { toast } = useToast();

  const [date, setDate] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (isLoadingCar) {
    return (
      <Layout>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center flex-col gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Vehicle not found</h2>
          <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  const days = date.from && date.to ? differenceInDays(date.to, date.from) : 0;
  const totalPrice = days * Number(car.dailyRate);

  const handleBooking = () => {
    if (!date.from || !date.to) return;
    
    createBooking({
      carId: car.id,
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
    }, {
      onSuccess: () => setIsConfirmOpen(false),
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Image & Details */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-muted aspect-[4/3] shadow-lg mb-8">
              <img 
                src={car.imageUrl} 
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-display font-bold">{car.make} {car.model}</h1>
                <p className="text-muted-foreground text-lg">{car.year} • {car.color}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-border/50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                  <Settings2 className="w-6 h-6 text-primary" />
                  <span className="font-medium text-sm">{car.transmission}</span>
                </div>
                <div className="bg-card border border-border/50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                  <Fuel className="w-6 h-6 text-primary" />
                  <span className="font-medium text-sm">{car.fuelType}</span>
                </div>
                <div className="bg-card border border-border/50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                  <Gauge className="w-6 h-6 text-primary" />
                  <span className="font-medium text-sm">Unlimited Km</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {car.features?.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {(!car.features || car.features.length === 0) && (
                    <span className="text-muted-foreground italic">Standard features included</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {car.description || "Experience the thrill of driving this premium vehicle. Perfect for weekend getaways or business trips, offering a blend of comfort, style, and performance."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card border border-border shadow-xl rounded-2xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-border/50">
                <div>
                  <span className="text-3xl font-bold text-primary">${Number(car.dailyRate).toFixed(0)}</span>
                  <span className="text-muted-foreground"> / day</span>
                </div>
                <Badge variant={car.status === 'available' ? 'default' : 'secondary'} className="px-3 py-1">
                  {car.status === 'available' ? 'Available' : 'Unavailable'}
                </Badge>
              </div>

              <div className="space-y-6">
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Select Dates</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-12",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate as any}
                        numberOfMonths={2}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">${Number(car.dailyRate)} x {days} days</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>$25.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Insurance</span>
                    <span>$15.00</span>
                  </div>
                  <div className="pt-3 border-t border-border/50 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${(totalPrice + 40).toFixed(2)}</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg" 
                        className="w-full text-lg font-semibold h-12"
                        disabled={car.status !== 'available' || days <= 0}
                      >
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Booking</DialogTitle>
                        <DialogDescription>
                          You are about to book {car.make} {car.model} for {days} days.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex justify-between">
                          <span className="font-medium">Dates:</span>
                          <span>{date.from && format(date.from, "MMM dd")} - {date.to && format(date.to, "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total Price:</span>
                          <span className="font-bold text-primary text-xl">${(totalPrice + 40).toFixed(2)}</span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleBooking} disabled={isBooking}>
                          {isBooking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                            </>
                          ) : "Confirm & Pay"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <a href="/api/login" className="block w-full">
                    <Button size="lg" className="w-full text-lg font-semibold h-12" variant="secondary">
                      Sign in to Book
                    </Button>
                  </a>
                )}
                
                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground">
                    You need an account to make a reservation.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
