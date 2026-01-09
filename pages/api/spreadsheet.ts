import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Buscar todos os pratos e bebidas ativos
    const dishes = await query(
      `SELECT id, name, price, 'dish' as type FROM dishes WHERE status = 'active' ORDER BY name ASC`
    );

    const beverages = await query(
      `SELECT id, name, price, 'beverage' as type FROM beverages WHERE status = 'active' ORDER BY name ASC`
    );

    const items = [...dishes, ...beverages].map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      type: item.type,
    }));

    return res.status(200).json(items);
  } catch (error) {
    console.error('Erro ao buscar planilha:', error);
    return res.status(500).json({ error: 'Erro ao buscar planilha' });
  }
}









