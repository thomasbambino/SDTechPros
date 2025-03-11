import { useAuth } from "@/hooks/use-auth";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import ClientList from "@/components/dashboard/client-list";
import PageContainer from "@/components/layout/page-container";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <PageContainer title="Dashboard">
      <div className="grid gap-6">
        <StatsCards />

        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivity />
          {isAdmin && <ClientList />}
        </div>
      </div>
    </PageContainer>
  );
}