import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const dishes = await query(
      `SELECT d.*, c.name as category_name 
       FROM dishes d 
       LEFT JOIN categories c ON d.category_id = c.id 
       WHERE d.status = 'active'
       ORDER BY d.display_order ASC, d.name ASC`
    );

    return res.status(200).json(dishes);
  } catch (error) {
    console.error('Erro ao buscar pratos públicos:', error);
    return res.status(500).json({ error: 'Erro ao buscar pratos' });
  }
}









