import { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BrandingSettings } from "@shared/schema";

type BrandingContextType = {
  branding: BrandingSettings | null;
  isLoading: boolean;
};

const BrandingContext = createContext<BrandingContextType | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: branding, isLoading } = useQuery<BrandingSettings>({
    queryKey: ["/api/branding"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Apply branding colors and metadata
  useEffect(() => {
    if (branding) {
      // Set primary color as CSS variable
      if (branding.primaryColor) {
        document.documentElement.style.setProperty('--branding-primary', branding.primaryColor);
      }

      // Set favicon if available
      if (branding.favicon) {
        const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = branding.favicon;
        document.head.appendChild(link);
      }

      // Set page title
      if (branding.metaTitle) {
        document.title = branding.metaTitle;
      } else if (branding.companyName) {
        document.title = branding.companyName;
      }

      // Set login background gradient if available
      if (branding.loginBackgroundGradient) {
        document.documentElement.style.setProperty('--branding-gradient-from', branding.loginBackgroundGradient.from);
        document.documentElement.style.setProperty('--branding-gradient-to', branding.loginBackgroundGradient.to);
      }
    }
  }, [branding]);

  return (
    <BrandingContext.Provider value={{ branding: branding || null, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}