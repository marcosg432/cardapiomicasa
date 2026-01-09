import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const beverages = await query(
      `SELECT b.*, c.name as category_name 
       FROM beverages b 
       LEFT JOIN categories c ON b.category_id = c.id 
       WHERE b.status = 'active'
       ORDER BY b.display_order ASC, b.name ASC`
    );

    return res.status(200).json(beverages);
  } catch (error) {
    console.error('Erro ao buscar bebidas públicas:', error);
    return res.status(500).json({ error: 'Erro ao buscar bebidas' });
  }
}









