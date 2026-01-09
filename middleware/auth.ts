import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: number;
    email: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const user = verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    return handler(req, res);
  };
}









