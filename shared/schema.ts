import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "client", "pending"] }).notNull().default("pending"),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  freshbooksId: text("freshbooks_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  freshbooksId: text("freshbooks_id"),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "completed", "on_hold"] }).notNull(),
  budget: integer("budget"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  logo: text("logo"),
  theme: json("theme").$type<{
    primary: string;
    mode: "light" | "dark";
  }>(),
  freshbooksToken: json("freshbooks_token").$type<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }>(),
});

export const brandingSettings = pgTable("branding_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  logo: text("logo_url"),
  favicon: text("favicon_url"),
  logoSize: integer("logo_size").notNull().default(32),
  primaryColor: text("primary_color").notNull().default("#000000"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),

  heroTitle: text("hero_title"),
  heroDescription: text("hero_description"),
  services: json("services").$type<Array<{
    title: string;
    description: string;
    icon: string;
  }>>(),
  ctaTitle: text("cta_title"),
  ctaDescription: text("cta_description"),
  ctaButtonText: text("cta_button_text"),

  loginTitle: text("login_title"),
  loginDescription: text("login_description"),
  loginFeatures: json("login_features").$type<string[]>(),
  loginBackgroundGradient: json("login_background_gradient").$type<{
    from: string;
    to: string;
  }>(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  status: true,
  createdAt: true
});

export const insertBrandingSettingsSchema = createInsertSchema(brandingSettings).omit({
  id: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

export type Settings = typeof settings.$inferSelect;
export type BrandingSettings = typeof brandingSettings.$inferSelect;
export type InsertBrandingSettings = z.infer<typeof insertBrandingSettingsSchema>;