import type { NextApiRequest, NextApiResponse } from 'next';
import { query, run, get } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Garantir que id é um número ou string válido
      const dishId = Array.isArray(id) ? id[0] : id;
      if (!dishId) {
        return res.status(400).json({ error: 'ID do prato é obrigatório' });
      }

      console.log('Buscando prato com ID:', dishId);
      const dish = await get(
        `SELECT d.*, c.name as category_name 
         FROM dishes d 
         LEFT JOIN categories c ON d.category_id = c.id 
         WHERE d.id = ? AND d.status != 'deleted'`,
        [dishId]
      );

      console.log('Prato encontrado:', dish ? 'Sim' : 'Não');

      if (!dish) {
        return res.status(404).json({ error: 'Prato não encontrado' });
      }

      return res.status(200).json(dish);
    } catch (error) {
      console.error('Erro ao buscar prato:', error);
      return res.status(500).json({ error: 'Erro ao buscar prato' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const dishId = Array.isArray(id) ? id[0] : id;
      if (!dishId) {
        return res.status(400).json({ error: 'ID do prato é obrigatório' });
      }

      const { name, mini_presentation, full_description, image_url, category_id, price, status, display_order } = req.body;

      await run(
        `UPDATE dishes 
         SET name = ?, mini_presentation = ?, full_description = ?, image_url = ?, 
             category_id = ?, price = ?, status = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, mini_presentation, full_description, image_url, category_id, price, status, display_order, dishId]
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao atualizar prato:', error);
      return res.status(500).json({ error: 'Erro ao atualizar prato' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const dishId = Array.isArray(id) ? id[0] : id;
      if (!dishId) {
        return res.status(400).json({ error: 'ID do prato é obrigatório' });
      }

      await run(`UPDATE dishes SET status = 'deleted' WHERE id = ?`, [dishId]);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao excluir prato:', error);
      return res.status(500).json({ error: 'Erro ao excluir prato' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}









