import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrandingSettingsSchema, type BrandingSettings } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PageContainer from "@/components/layout/page-container";
import { Loader2, Upload } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

type FormValues = {
  companyName: string;
  logo: string;
  favicon: string;
  logoSize: number;
  primaryColor: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: string;
  services: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  loginTitle: string;
  loginDescription: string;
  loginFeatures: string[];
  loginBackgroundGradient: {
    from: string;
    to: string;
  };
};

export default function BrandingPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<BrandingSettings>({
    queryKey: ["/api/branding"],
  });

  const form: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver(insertBrandingSettingsSchema.partial()),
    defaultValues: {
      companyName: "",
      logo: "",
      favicon: "",
      logoSize: 32,
      primaryColor: "#000000",
      metaTitle: "",
      metaDescription: "",
      heroTitle: "",
      heroDescription: "",
      services: [],
      ctaTitle: "",
      ctaDescription: "",
      ctaButtonText: "",
      loginTitle: "",
      loginDescription: "",
      loginFeatures: [],
      loginBackgroundGradient: {
        from: "#000000",
        to: "#000000",
      },
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<BrandingSettings>) => {
      const res = await apiRequest("PATCH", "/api/branding", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
      toast({
        title: "Settings updated",
        description: "Your branding changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadFile = async (file: File, type: "logo" | "favicon") => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/branding/upload/${type}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      form.setValue(type, data.url);
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });

      toast({
        title: "File uploaded",
        description: `${type === "logo" ? "Logo" : "Favicon"} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Branding Settings">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Branding Settings">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Logo</h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                    {settings?.logo ? (
                      <img
                        src={settings.logo}
                        alt="Company logo"
                        className="object-contain w-full h-full p-4"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFile(file, "logo");
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Favicon</h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                    {settings?.favicon ? (
                      <img
                        src={settings.favicon}
                        alt="Favicon"
                        className="object-contain w-full h-full p-4"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/x-icon,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFile(file, "favicon");
                    }}
                  />
                </div>
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="logoSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo Size (height in pixels)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={16}
                            max={64}
                            step={4}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                          />
                          <Input
                            type="number"
                            {...field}
                            className="w-20"
                            min={16}
                            max={64}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter company name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <Input type="color" {...field} className="w-24 h-10" />
                        <Input type="text" {...field} placeholder="#000000" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Homepage Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hero Section</h3>
                  <FormField
                    control={form.control}
                    name="heroTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter hero title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="heroDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter hero description"
                            className="resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Services Section</h3>
                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {Array.isArray(field.value) && field.value.map((service, index) => (
                              <div key={index} className="grid gap-4 p-4 border rounded-lg">
                                <Input
                                  placeholder="Service title"
                                  value={service.title}
                                  onChange={(e) => {
                                    const newServices = [...field.value];
                                    newServices[index].title = e.target.value;
                                    field.onChange(newServices);
                                  }}
                                />
                                <Textarea
                                  placeholder="Service description"
                                  value={service.description}
                                  onChange={(e) => {
                                    const newServices = [...field.value];
                                    newServices[index].description = e.target.value;
                                    field.onChange(newServices);
                                  }}
                                />
                                <Select
                                  value={service.icon}
                                  onValueChange={(value) => {
                                    const newServices = [...field.value];
                                    newServices[index].icon = value;
                                    field.onChange(newServices);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select icon" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MonitorCheck">IT Consulting</SelectItem>
                                    <SelectItem value="Network">Network</SelectItem>
                                    <SelectItem value="Shield">Security</SelectItem>
                                    <SelectItem value="Cloud">Cloud</SelectItem>
                                    <SelectItem value="Server">Server</SelectItem>
                                    <SelectItem value="Phone">Support</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => {
                                    const newServices = field.value.filter((_, i) => i !== index);
                                    field.onChange(newServices);
                                  }}
                                >
                                  Remove Service
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const currentServices = Array.isArray(field.value) ? field.value : [];
                                field.onChange([
                                  ...currentServices,
                                  { title: "", description: "", icon: "MonitorCheck" },
                                ]);
                              }}
                            >
                              Add Service
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">CTA Section</h3>
                  <FormField
                    control={form.control}
                    name="ctaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTA Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter CTA title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ctaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTA Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter CTA description"
                            className="resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ctaButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTA Button Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter button text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Page Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="loginTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login Page Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Welcome message for login page" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loginDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login Page Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Description text for login page"
                          className="resize-none"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loginFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login Page Features (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                          onChange={(e) => field.onChange(e.target.value.split('\n'))}
                          placeholder="Enter features, one per line"
                          className="resize-none"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="loginBackgroundGradient.from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gradient Start Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-4">
                            <Input type="color" {...field} className="w-24 h-10" />
                            <Input type="text" {...field} placeholder="#000000" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loginBackgroundGradient.to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gradient End Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-4">
                            <Input type="color" {...field} className="w-24 h-10" />
                            <Input type="text" {...field} placeholder="#000000" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </Form>
    </PageContainer>
  );
}