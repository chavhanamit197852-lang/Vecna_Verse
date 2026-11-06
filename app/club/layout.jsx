import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ClubSidebar from "@/components/ClubSidebar";

export default async function ClubLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <ClubSidebar />
      <main className="min-h-screen ml-64 overflow-x-hidden">{children}</main>
    </div>
  );
}
