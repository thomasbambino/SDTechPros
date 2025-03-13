import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useBranding } from "@/hooks/use-branding";
import { Menu, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Default logo SVG as a data URL
const DEFAULT_LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='20'%3ESD Tech Pros%3C/text%3E%3C/svg%3E`;

export function UnifiedNavBar() {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const { branding } = useBranding();
  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <img
              src={branding?.logo || DEFAULT_LOGO}
              alt={branding?.companyName || "Company Logo"}
              style={{ height: `${branding?.logoSize || 32}px` }}
              className="w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, {user.name}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4 mr-2" />
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/branding">Branding Settings</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-4">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4">
                          {(branding?.services || []).map((service) => (
                            <li key={service.title} className="flex gap-2 items-start">
                              <div>
                                <h4 className="text-sm font-medium">{service.title}</h4>
                                <p className="text-xs text-muted-foreground">{service.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/about">About</Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/contact">Contact</Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              <Button asChild>
                <Link href="/auth">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}