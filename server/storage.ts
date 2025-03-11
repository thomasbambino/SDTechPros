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
  getUserByEmail(email: string): Promise<User | undefined>;
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
    try {
      console.log(`Fetching user by ID: ${id}`);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log(`Fetching user by email: ${email}`);
      const [user] = await db.select().from(users).where(eq(users.email, email));
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log('Creating new user:', { ...insertUser, password: '[REDACTED]' });
      const [user] = await db.insert(users).values(insertUser).returning();
      console.log('Created user:', { ...user, password: '[REDACTED]' });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getStats(): Promise<Stats> {
    try {
      const clients = await db.select().from(users).where(eq(users.role, "client"));
      return {
        clientCount: clients.length,
        activeProjects: 0,
        pendingInvoices: 0,
        newInquiries: 0,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  async getClients(): Promise<User[]> {
    try {
      return db.select().from(users).where(eq(users.role, "client"));
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async getActivities(): Promise<Activity[]> {
    return [];
  }

  async getSettings(): Promise<any> {
    return {};
  }

  async updateSettings(settings: any): Promise<void> {}

  async syncFreshbooksData(data: any): Promise<void> {}
}

export const storage = new DatabaseStorage();