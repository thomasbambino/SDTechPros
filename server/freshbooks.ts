import { storage } from "./storage";

const FRESHBOOKS_API_URL = "https://api.freshbooks.com";

export class FreshbooksClient {
  private accessToken?: string;
  private refreshToken?: string;
  private expiresAt?: number;

  constructor() {
    this.loadTokens();
  }

  private async loadTokens() {
    const settings = await storage.getSettings();
    if (settings?.freshbooksToken) {
      this.accessToken = settings.freshbooksToken.accessToken;
      this.refreshToken = settings.freshbooksToken.refreshToken;
      this.expiresAt = settings.freshbooksToken.expiresAt;
    }
  }

  private async saveTokens() {
    await storage.updateSettings({
      freshbooksToken: {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresAt: this.expiresAt,
      },
    });
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) throw new Error("No refresh token available");

    const res = await fetch(`${FRESHBOOKS_API_URL}/auth/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: process.env.FRESHBOOKS_CLIENT_ID,
        client_secret: process.env.FRESHBOOKS_CLIENT_SECRET,
        refresh_token: this.refreshToken,
      }),
    });

    if (!res.ok) throw new Error("Failed to refresh token");

    const data = await res.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = Date.now() + data.expires_in * 1000;
    await this.saveTokens();
  }

  private async request(method: string, endpoint: string, data?: any) {
    if (!this.accessToken) throw new Error("Not authenticated with Freshbooks");
    if (this.expiresAt && Date.now() > this.expiresAt) {
      await this.refreshAccessToken();
    }

    const res = await fetch(`${FRESHBOOKS_API_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) throw new Error(`Freshbooks API error: ${res.statusText}`);
    return await res.json();
  }

  async getClients() {
    return this.request("GET", "/accounting/account/clients");
  }

  async getProjects() {
    return this.request("GET", "/projects/business/projects");
  }

  async getInvoices() {
    return this.request("GET", "/accounting/account/invoices");
  }

  // Add other Freshbooks API methods as needed
}

export const freshbooks = new FreshbooksClient();
