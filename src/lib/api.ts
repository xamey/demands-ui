import type { AuthResponse, User } from "./types";
import type { DayOff } from "./types";

const API_URL = import.meta.env.PUBLIC_API_URL || "/api/v1";
const IS_MOCK = true;

// Mock data
const mockUser: User = {
  id: "1",
  email: "dev@example.com",
  name: "John Doe",
};

const mockSuperUser = Object.assign({}, mockUser, { superUser: true });

const mockDayOffs: DayOff[] = [
  {
    id: "1",
    userId: "1",
    date: new Date("2024-04-15"),
    status: "accepted",
    createdAt: "2024-04-01T10:00:00Z",
  },
  {
    id: "2",
    userId: "1",
    date: new Date("2024-04-16"),
    status: "pending",
    createdAt: "2024-04-01T10:00:00Z",
  },
];

const isBrowser = typeof window !== "undefined";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (isBrowser) {
      this.token = window.localStorage.getItem("token");
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (IS_MOCK) {
      return this.mockRequest(endpoint, options);
    }

    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    return response.json();
  }

  private async mockRequest(
    endpoint: string,
    options: RequestInit
  ): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (options.method === "DELETE") {
      return { success: true };
    }

    if (
      options.method === "POST" &&
      endpoint.includes("/dayoffs") &&
      (endpoint.includes("/refuse") || endpoint.includes("/accept"))
    ) {
      return { success: true };
    }

    switch (`${options.method || "GET"} ${endpoint}`) {
      case "POST /auth/login":
        const email = JSON.parse(options.body as string).email;

        if (email.includes("admin")) {
          return { token: "mock-token", user: mockSuperUser };
        }
        return { token: "mock-token", user: mockUser };
      case "POST /auth/reset-password":
        return { success: true };
      case "GET /dayoffs":
        return mockDayOffs;
      case "POST /dayoffs":
        const body = JSON.parse(options.body as string);
        return {
          id: Date.now(),
          date: new Date(body.date),
          status: "pending",
          createdAt: new Date().toISOString(),
        };
      default:
        throw new Error("Not implemented");
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.token = response.token;
    if (isBrowser) {
      window.localStorage.setItem("token", response.token);
    }
    return response;
  }

  async resetPassword(email: string): Promise<void> {
    await this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async getDayOffs(): Promise<DayOff[]> {
    return this.request("/dayoffs");
  }

  async createDayOff(date: Date): Promise<DayOff> {
    return this.request("/dayoffs", {
      method: "POST",
      body: JSON.stringify({ date }),
    });
  }

  async cancelDayOff(id: string): Promise<void> {
    await this.request(`/dayoffs/${id}`, {
      method: "DELETE",
    });
  }

  async acceptDayOff(id: string): Promise<void> {
    await this.request(`/dayoffs/${id}/accept`, {
      method: "POST",
    });
  }

  async refuseDayOff(id: string): Promise<void> {
    await this.request(`/dayoffs/${id}/refuse`, {
      method: "POST",
    });
  }

  logout() {
    this.token = null;
    if (isBrowser) {
      window.localStorage.removeItem("token");
    }
  }
}

export const api = new ApiClient();
