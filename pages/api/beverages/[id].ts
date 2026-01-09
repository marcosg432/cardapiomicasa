import type { NextApiRequest, NextApiResponse } from 'next';
import { query, run, get } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const beverage = await get(
        `SELECT b.*, c.name as category_name 
         FROM beverages b 
         LEFT JOIN categories c ON b.category_id = c.id 
         WHERE b.id = ? AND b.status != 'deleted'`,
        [id]
      );

      if (!beverage) {
        return res.status(404).json({ error: 'Bebida não encontrada' });
      }

      return res.status(200).json(beverage);
    } catch (error) {
      console.error('Erro ao buscar bebida:', error);
      return res.status(500).json({ error: 'Erro ao buscar bebida' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, description, image_url, category_id, price, status, display_order } = req.body;

      await run(
        `UPDATE beverages 
         SET name = ?, description = ?, image_url = ?, 
             category_id = ?, price = ?, status = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, description, image_url, category_id, price, status, display_order, id]
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao atualizar bebida:', error);
      return res.status(500).json({ error: 'Erro ao atualizar bebida' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await run(`UPDATE beverages SET status = 'deleted' WHERE id = ?`, [id]);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao excluir bebida:', error);
      return res.status(500).json({ error: 'Erro ao excluir bebida' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}









