import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getStats(): Promise<Stats> {
    const clients = await db.select().from(users).where(eq(users.role, "client"));
    return {
      clientCount: clients.length,
      activeProjects: 0, // To be implemented with projects table
      pendingInvoices: 0, // To be implemented with invoices table
      newInquiries: 0, // To be implemented with inquiries table
    };
  }

  async getClients(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "client"));
  }

  async getActivities(): Promise<Activity[]> {
    // To be implemented with activities table
    return [];
  }

  async getSettings(): Promise<any> {
    // To be implemented with settings table
    return {};
  }

  async updateSettings(settings: any): Promise<void> {
    // To be implemented with settings table
  }

  async syncFreshbooksData(data: any): Promise<void> {
    // To be implemented with Freshbooks integration
  }
}

export const storage = new DatabaseStorage();