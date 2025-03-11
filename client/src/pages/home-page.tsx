import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BrandingSettings } from "@shared/schema";

export default function HomePage() {
  const { data: branding } = useQuery<BrandingSettings>({
    queryKey: ["/api/branding"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {branding?.logo ? (
              <img
                src={branding.logo}
                alt={branding?.companyName || "Company Logo"}
                className="h-8 w-auto"
              />
            ) : (
              <h1 className="text-xl font-bold">{branding?.companyName || "SD Tech Pros"}</h1>
            )}
          </div>
          <nav>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to {branding?.companyName || "SD Tech Pros"}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {branding?.metaDescription || "Access your projects, track progress, and manage invoices all in one place."}
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
