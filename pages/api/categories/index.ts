import type { NextApiRequest, NextApiResponse } from 'next';
import { query, run } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type } = req.query;
      
      let sql = 'SELECT * FROM categories WHERE 1=1';
      const params: any[] = [];

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      sql += ' ORDER BY order_index ASC, name ASC';

      const categories = await query(sql, params);
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, type, order_index } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }

      const result = await run(
        `INSERT INTO categories (name, type, order_index)
         VALUES (?, ?, ?)`,
        [name, type, order_index || 0]
      );

      return res.status(201).json({ id: result.lastID });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}









