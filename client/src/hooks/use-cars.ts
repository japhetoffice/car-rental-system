import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCarRequest, type UpdateCarRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCars(filters?: { status?: string; search?: string }) {
  const queryKey = [api.cars.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string manually since buildUrl handles path params
      const searchParams = new URLSearchParams();
      if (filters?.status) searchParams.append("status", filters.status);
      if (filters?.search) searchParams.append("search", filters.search);
      
      const url = `${api.cars.list.path}?${searchParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cars");
      return api.cars.list.responses[200].parse(await res.json());
    },
  });
}

export function useCar(id: number) {
  return useQuery({
    queryKey: [api.cars.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cars.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch car");
      return api.cars.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCarRequest) => {
      const res = await fetch(api.cars.create.path, {
        method: api.cars.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create car");
      }
      return api.cars.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({ title: "Success", description: "Vehicle added to fleet" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateCarRequest) => {
      const url = buildUrl(api.cars.update.path, { id });
      const res = await fetch(url, {
        method: api.cars.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update car");
      }
      return api.cars.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.cars.get.path, variables.id] });
      toast({ title: "Success", description: "Vehicle updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cars.delete.path, { id });
      const res = await fetch(url, {
        method: api.cars.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete car");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({ title: "Success", description: "Vehicle removed from fleet" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
