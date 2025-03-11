import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrandingSettingsSchema, type BrandingSettings } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PageContainer from "@/components/layout/page-container";
import { Loader2, Upload } from "lucide-react";

export default function BrandingPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<BrandingSettings>({
    queryKey: ["/api/branding"],
  });

  const form = useForm({
    resolver: zodResolver(insertBrandingSettingsSchema.partial()),
    values: settings || {
      companyName: "",
      primaryColor: "#000000",
      metaTitle: "",
      metaDescription: "",
      logo: "",
      favicon: "",
    },
  });

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
      form.setValue(type === "logo" ? "logo" : "favicon", data.url);
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
      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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

                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter site title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter site description"
                          className="resize-none"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}