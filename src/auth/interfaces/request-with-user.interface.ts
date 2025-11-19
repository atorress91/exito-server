import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}
