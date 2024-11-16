export type DayOffStatus = "pending" | "refused" | "approved";

export interface DayOff {
  id: string;
  userId: string;
  date: Date;
  status: DayOffStatus;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  superUser?: boolean;
}

export interface AuthResponse {
  user: {
    token: string;
    email: string;
    name: string;
    superUser: boolean;
  };
}
