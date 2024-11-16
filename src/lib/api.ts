import type { AuthResponse, User } from "./types";
import type { DayOff } from "./types";

const API_URL = "http://localhost:3000";
const IS_MOCK = false;

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
    status: "approved",
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
  token: string | null = null;
  user: User | null = null;

  constructor() {
    if (isBrowser) {
      this.token = window.localStorage.getItem("token");
      this.user = JSON.parse(window.localStorage.getItem("user") || "{}");
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
    const response = (await this.request("/users/login", {
      method: "POST",
      body: JSON.stringify({ user: { email, password } }),
    })) as AuthResponse;
    this.token = response.user.token;
    if (isBrowser) {
      window.localStorage.setItem("token", this.token);
      window.localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  }

  async resetPassword(email: string): Promise<void> {
    await this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async getUsers(): Promise<User[]> {
    return (await this.request("/users")).users;
  }

  async getDayOffs(): Promise<DayOff[]> {
    return (await this.request("/dayoffs")).dayOffs.map((dayOff) => ({
      ...dayOff,
      date: new Date(dayOff.date),
    }));
  }

  async getDayOffsForUser(userId: string): Promise<DayOff[]> {
    return (await this.request(`/dayoffs/${userId}`)).dayOffs.map((dayOff) => ({
      ...dayOff,
      date: new Date(dayOff.date),
    }));
  }

  async createDayOff(date: Date): Promise<DayOff> {
    const dayOff = (
      await this.request("/dayoffs", {
        method: "POST",
        body: JSON.stringify({ dayoff: { date } }),
      })
    ).dayOff;

    return {
      ...dayOff,
      date: new Date(dayOff.date),
    };
  }

  async cancelDayOff(id: string): Promise<void> {
    await this.request(`/dayoffs/${id}`, {
      method: "DELETE",
    });
  }

  async acceptDayOff(id: string): Promise<void> {
    await this.request(`/dayoffs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ dayoff: { status: "approved" } }),
    });
  }

  async refuseDayOff(id: string): Promise<void> {
    await this.request(`/dayoffs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ dayoff: { status: "refused" } }),
    });
  }

  getMaxDayOffs(): number {
    return 9;
  }

  logout() {
    this.token = null;
    if (isBrowser) {
      window.localStorage.removeItem("token");
    }
  }
}

export const api = new ApiClient();
