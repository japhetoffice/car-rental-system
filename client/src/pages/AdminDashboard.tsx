import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCars, useCreateCar, useDeleteCar, useUpdateCar } from "@/hooks/use-cars";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, DollarSign, Users, Car, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCarSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Schema for form - ensuring string numbers are parsed
const carFormSchema = insertCarSchema.extend({
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  dailyRate: z.coerce.number().positive(),
});

type CarFormValues = z.infer<typeof carFormSchema>;

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: cars, isLoading: isLoadingCars } = useCars();
  const { data: bookings, isLoading: isLoadingBookings } = useBookings();
  
  const { mutate: createCar, isPending: isCreating } = useCreateCar();
  const { mutate: updateCar, isPending: isUpdating } = useUpdateCar();
  const { mutate: deleteCar, isPending: isDeleting } = useDeleteCar();
  const { mutate: updateStatus } = useUpdateBookingStatus();
  
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      transmission: "automatic",
      fuelType: "petrol",
      dailyRate: 0,
      imageUrl: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80",
      status: "available",
      description: "",
      features: ["Bluetooth", "Navigation", "Backup Camera"]
    }
  });

  const { toast } = useToast();

  const handleEdit = (car: any) => {
    setEditingCar(car);
    form.reset({
      ...car,
      dailyRate: Number(car.dailyRate),
      features: car.features || []
    });
    setIsCarModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCar(null);
    form.reset({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      transmission: "automatic",
      fuelType: "petrol",
      dailyRate: 0,
      imageUrl: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80",
      status: "available",
      description: "",
      features: ["Bluetooth", "Navigation"]
    });
    setIsCarModalOpen(true);
  };

  const onSubmit = (data: CarFormValues) => {
    // Convert dailyRate to string to match backend decimal expectations
    const payload = { ...data, dailyRate: data.dailyRate.toFixed(2) } as any;
    if (editingCar) {
      updateCar({ id: editingCar.id, ...payload }, {
        onSuccess: () => setIsCarModalOpen(false)
      });
    } else {
      createCar(payload, {
        onSuccess: () => setIsCarModalOpen(false)
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-bold">Admin Access Required</h2>
          <Button onClick={() => window.location.href = "/api/login"}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  // Calculate stats
  const totalRevenue = bookings?.reduce((acc: number, b: any) => acc + Number(b.totalPrice), 0) || 0;
  const activeBookings = bookings?.filter((b: any) => b.status === 'confirmed').length || 0;
  const totalCars = cars?.length || 0;

  // Chart data
  const revenueData = [
    { name: 'Jan', total: 1200 },
    { name: 'Feb', total: 2100 },
    { name: 'Mar', total: 1800 },
    { name: 'Apr', total: 2400 },
    { name: 'May', total: totalRevenue }, // Use real total for current month mock
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings}</div>
              <p className="text-xs text-muted-foreground">+2 since yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCars}</div>
              <p className="text-xs text-muted-foreground">All vehicles operational</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cars" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cars">Cars Management</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="cars" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate/Day</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCars ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : cars?.map((car: any) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img src={car.imageUrl} alt="Car" className="w-10 h-10 rounded object-cover" />
                          <div>
                            <div className="font-bold">{car.make} {car.model}</div>
                            <div className="text-xs text-muted-foreground">{car.year} • {car.color}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={car.status === 'available' ? 'default' : 'secondary'}>
                          {car.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${Number(car.dailyRate).toFixed(2)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(car)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => {
                           if(confirm("Are you sure?")) deleteCar(car.id);
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Car</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBookings ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                    </TableRow>
                  ) : bookings?.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell>#{booking.id}</TableCell>
                      <TableCell>{booking.car.make} {booking.car.model}</TableCell>
                      <TableCell className="font-mono text-xs">{booking.userId.substring(0, 8)}...</TableCell>
                      <TableCell>${Number(booking.totalPrice).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{booking.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={booking.status} 
                          onValueChange={(val) => updateStatus({ id: booking.id, status: val })}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue placeholder="Update" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Car Modal */}
      <Dialog open={isCarModalOpen} onOpenChange={setIsCarModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCar ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Make</label>
                <Input {...form.register("make")} placeholder="Toyota" />
                {form.formState.errors.make && <p className="text-destructive text-xs">{form.formState.errors.make.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Input {...form.register("model")} placeholder="Camry" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Input type="number" {...form.register("year")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Input {...form.register("color")} placeholder="Silver" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Transmission</label>
                <Select onValueChange={(val) => form.setValue("transmission", val)} defaultValue={form.getValues("transmission")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fuel Type</label>
                <Select onValueChange={(val) => form.setValue("fuelType", val)} defaultValue={form.getValues("fuelType")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Rate ($)</label>
                <Input type="number" step="0.01" {...form.register("dailyRate")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select onValueChange={(val) => form.setValue("status", val)} defaultValue={form.getValues("status")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input {...form.register("imageUrl")} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea {...form.register("description")} placeholder="Vehicle description..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCarModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : null}
                Save Vehicle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
