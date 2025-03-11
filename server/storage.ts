import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
}

interface Stats {
  clientCount: number;
  activeProjects: number;
  pendingInvoices: number;
  newInquiries: number;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getStats(): Promise<Stats>;
  getClients(): Promise<User[]>;
  getActivities(): Promise<Activity[]>;
  getSettings(): Promise<any>;
  updateSettings(settings: any): Promise<void>;
  syncFreshbooksData(data: any): Promise<void>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  private settings: any;
  sessionStore: session.Store;
  currentId: number;
  currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.settings = {};
    this.currentId = 1;
    this.currentActivityId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "pending",
      createdAt: now
    };
    this.users.set(id, user);

    // Add activity
    this.activities.set(this.currentActivityId++, {
      id: this.currentActivityId,
      type: "user",
      description: `New user ${user.name} registered`,
      createdAt: now.toISOString()
    });

    return user;
  }

  async getStats(): Promise<Stats> {
    const clients = Array.from(this.users.values()).filter(
      (user) => user.role === "client"
    );

    return {
      clientCount: clients.length,
      activeProjects: 0, // Placeholder until projects are implemented
      pendingInvoices: 0, // Placeholder until invoices are implemented
      newInquiries: 0, // Placeholder until inquiries are implemented
    };
  }

  async getClients(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "client"
    );
  }

  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSettings(): Promise<any> {
    return this.settings;
  }

  async updateSettings(settings: any): Promise<void> {
    this.settings = { ...this.settings, ...settings };
  }

  async syncFreshbooksData(data: any): Promise<void> {
    // Placeholder for Freshbooks sync implementation
    // This would update local data based on Freshbooks data
    this.activities.set(this.currentActivityId++, {
      id: this.currentActivityId,
      type: "sync",
      description: "Synchronized data with Freshbooks",
      createdAt: new Date().toISOString()
    });
  }
}

export const storage = new MemStorage();