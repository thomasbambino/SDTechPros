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