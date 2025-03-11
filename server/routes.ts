import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { freshbooks } from "./freshbooks";
import { insertBrandingSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Clients endpoint
  app.get("/api/clients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const clients = await storage.getClients();
    res.json(clients);
  });

  // Activities endpoint
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const activities = await storage.getActivities();
    res.json(activities);
  });

  // Freshbooks OAuth endpoints
  app.get("/api/freshbooks/connect", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const url = `https://auth.freshbooks.com/oauth/authorize?client_id=${
      process.env.FRESHBOOKS_CLIENT_ID
    }&response_type=code&redirect_uri=${encodeURIComponent(
      process.env.FRESHBOOKS_REDIRECT_URI || ""
    )}`;
    
    res.json({ url });
  });

  app.get("/api/freshbooks/callback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { code } = req.query;
    if (!code) return res.status(400).send("Missing authorization code");

    try {
      // Exchange code for tokens and store them
      // Implementation depends on Freshbooks API client
      res.redirect("/");
    } catch (error) {
      res.status(500).send("Failed to connect to Freshbooks");
    }
  });

  app.post("/api/freshbooks/sync", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const clients = await freshbooks.getClients();
      const projects = await freshbooks.getProjects();
      const invoices = await freshbooks.getInvoices();

      // Sync data with local storage
      await storage.syncFreshbooksData({ clients, projects, invoices });
      
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send("Failed to sync with Freshbooks");
    }
  });

  // Branding settings endpoints
  app.get("/api/branding", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);

    const settings = await storage.getBrandingSettings();
    res.json(settings || {});
  });

  app.patch("/api/branding", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);

    const parsed = insertBrandingSettingsSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid settings data" });
    }

    const updated = await storage.updateBrandingSettings(parsed.data);
    res.json(updated);
  });

  const httpServer = createServer(app);
  return httpServer;
}