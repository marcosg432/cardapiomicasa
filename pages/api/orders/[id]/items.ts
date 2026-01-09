import type { NextApiRequest, NextApiResponse } from 'next';
import { query, run, get } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { item_type, item_id, quantity, observation } = req.body;

      if (!item_type || !item_id || !quantity) {
        return res.status(400).json({ error: 'Tipo, ID do item e quantidade são obrigatórios' });
      }

      // Buscar preço do item
      let price = 0;
      if (item_type === 'dish') {
        const dish = await get('SELECT price FROM dishes WHERE id = ?', [item_id]);
        price = dish?.price || 0;
      } else if (item_type === 'beverage') {
        const beverage = await get('SELECT price FROM beverages WHERE id = ?', [item_id]);
        price = beverage?.price || 0;
      }

      const unit_price = price;
      const total_price = unit_price * quantity;

      const result = await run(
        `INSERT INTO order_items (sheet_id, item_type, item_id, quantity, observation, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, item_type, item_id, quantity, observation || '', unit_price, total_price]
      );

      return res.status(201).json({ id: result.lastID });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return res.status(500).json({ error: 'Erro ao adicionar item' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}









