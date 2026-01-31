import { Link } from "wouter";
import { type Car } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fuel, Gauge, Settings2 } from "lucide-react";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 hover:shadow-lg hover:border-border transition-all duration-300">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={car.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80"} 
          alt={`${car.make} ${car.model}`}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={car.status === 'available' ? 'default' : 'secondary'}>
            {car.status}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-muted-foreground">{car.year} • {car.color}</p>
          </div>
          <div className="text-right">
            <span className="block font-bold text-primary text-lg">${Number(car.dailyRate).toFixed(0)}</span>
            <span className="text-xs text-muted-foreground">/day</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-border/50">
          <div className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <Settings2 className="w-4 h-4" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground border-x border-border/50">
            <Fuel className="w-4 h-4" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <Gauge className="w-4 h-4" />
            <span>Unlimited</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link href={`/cars/${car.id}`} className="w-full">
          <Button className="w-full font-semibold" size="lg">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
