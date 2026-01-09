import type { NextApiRequest, NextApiResponse } from 'next';
import { query, run } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, category, status } = req.query;
      
      let sql = `SELECT b.*, c.name as category_name 
                 FROM beverages b 
                 LEFT JOIN categories c ON b.category_id = c.id 
                 WHERE b.status != 'deleted'`;
      const params: any[] = [];

      if (status && status !== 'all') {
        sql += ` AND b.status = ?`;
        params.push(status);
      }

      if (search) {
        sql += ` AND b.name LIKE ?`;
        params.push(`%${search}%`);
      }

      if (category) {
        sql += ` AND b.category_id = ?`;
        params.push(category);
      }

      sql += ` ORDER BY b.display_order ASC, b.name ASC`;

      const beverages = await query(sql, params);
      return res.status(200).json(beverages);
    } catch (error) {
      console.error('Erro ao buscar bebidas:', error);
      return res.status(500).json({ error: 'Erro ao buscar bebidas' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, image_url, category_id, price, display_order } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const result = await run(
        `INSERT INTO beverages (name, description, image_url, category_id, price, display_order, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [name, description || '', image_url || '', category_id || null, price || 0, display_order || 0]
      );

      return res.status(201).json({ id: result.lastID });
    } catch (error) {
      console.error('Erro ao criar bebida:', error);
      return res.status(500).json({ error: 'Erro ao criar bebida' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}









