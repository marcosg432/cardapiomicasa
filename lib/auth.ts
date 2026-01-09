import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: number;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  
  if (!user) {
    return null;
  }

  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export function generateToken(user: User): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}









