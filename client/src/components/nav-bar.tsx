import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BrandingSettings } from "@shared/schema";

export function NavBar() {
  const { data: branding } = useQuery<BrandingSettings>({
    queryKey: ["/api/branding"],
  });

  return (
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
  );
}
