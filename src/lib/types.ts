export type DayOffStatus = "pending" | "refused" | "accepted";

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
  token: string;
  user: User;
}
