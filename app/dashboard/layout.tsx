import { Sidebar } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
