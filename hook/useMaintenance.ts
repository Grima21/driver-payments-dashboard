import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
export interface Maintenance {
  id: string | number;
  vehicle_id: number;
  type: string;
  title: string;
  description?: string;
  cost: number;
  date: string;
  create_at?: string;
  vehicle?: {
    make_model: string;
    license_plate: string;
  };
}

export function useMaintenance() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const fetchMaintenances = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("maintenances")
      .select(
        `
            *,
            vehicle(
            make_model,
            license_plate
            )`,
      )
      .order("date", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setMaintenances(data as Maintenance[]);
    }
    setLoading(false);
  };

  const addMaintenance = async (
    newRecord: Omit<Maintenance, "id" | "create_at" | "vehicle">,
  ) => {
    const { data, error } = await supabase
      .from("maintenances")
      .insert([newRecord])
      .select();

    if (error) throw error;
    await fetchMaintenances();
    return data;
  };

  const deleteMaintenance = async (id: string | number) => {
    const { error } = await supabase.from("maintenances").delete().eq("id", id);
    if (error) throw error;
    await fetchMaintenances();
  };

  const updateMaintenance = async (
    id: string | number,
    updateRecord: Partial<Maintenance>,
  ) => {
    const { data, error } = await supabase
      .from("maintenances")
      .update(updateRecord)
      .eq("id", id)
      .select();
    if (error) throw error;
    await fetchMaintenances();
    return data;
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  return {
    maintenances,
    loading,
    error,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    refresh: fetchMaintenances,
  };
}
