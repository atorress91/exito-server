export interface JwtPayload {
  sub: string;
  phone: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    phone: string;
  };
}
