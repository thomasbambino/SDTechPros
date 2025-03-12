import { NavBar } from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BrandingSettings } from "@shared/schema";
import {
  MonitorCheck,
  Network,
  Shield,
  Cloud,
  Server,
  Phone,
} from "lucide-react";

const defaultServices = [
  {
    icon: <MonitorCheck className="h-8 w-8" />,
    title: "IT Consulting",
    description: "Strategic technology planning and implementation to align with your business goals.",
  },
  {
    icon: <Network className="h-8 w-8" />,
    title: "Network Solutions",
    description: "Secure and reliable network infrastructure design and maintenance.",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Cybersecurity",
    description: "Comprehensive security solutions to protect your business assets.",
  },
  {
    icon: <Cloud className="h-8 w-8" />,
    title: "Cloud Services",
    description: "Cloud migration and management for improved scalability.",
  },
  {
    icon: <Server className="h-8 w-8" />,
    title: "Server Management",
    description: "Proactive server monitoring and maintenance services.",
  },
  {
    icon: <Phone className="h-8 w-8" />,
    title: "IT Support",
    description: "24/7 technical support and help desk services.",
  },
];

const getIconComponent = (iconName: string) => {
  const icons = {
    MonitorCheck,
    Network,
    Shield,
    Cloud,
    Server,
    Phone,
  };
  const IconComponent = icons[iconName as keyof typeof icons] || MonitorCheck;
  return <IconComponent className="h-8 w-8" />;
};

export default function HomePage() {
  const { data: branding } = useQuery<BrandingSettings>({
    queryKey: ["/api/branding"],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {branding?.heroTitle || "Professional IT Solutions for Your Business"}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {branding?.heroDescription || 
              "SD Tech Pros delivers enterprise-grade IT consulting and support services to help your business thrive in the digital age."}
          </p>
          <Button asChild size="lg">
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(branding?.services || defaultServices).map((service, index) => (
              <ServiceCard
                key={index}
                icon={typeof service.icon === 'string' ? getIconComponent(service.icon) : defaultServices[index].icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            {branding?.ctaTitle || "Ready to Get Started?"}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {branding?.ctaDescription || 
              "Contact us today to learn how SD Tech Pros can help transform your business with professional IT solutions."}
          </p>
          <Button asChild size="lg">
            <Link href="/auth">
              {branding?.ctaButtonText || "Contact Us"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}