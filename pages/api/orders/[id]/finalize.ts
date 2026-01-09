import type { NextApiRequest, NextApiResponse } from 'next';
import { query, run, get } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Buscar ficha
    const sheet = await get('SELECT * FROM order_sheets WHERE id = ? AND status = ?', [id, 'active']);
    
    if (!sheet) {
      return res.status(404).json({ error: 'Ficha não encontrada ou já finalizada' });
    }

    // Buscar itens
    const items = await query(
      `SELECT oi.*, 
              CASE 
                WHEN oi.item_type = 'dish' THEN d.name
                WHEN oi.item_type = 'beverage' THEN b.name
              END as item_name
       FROM order_items oi
       LEFT JOIN dishes d ON oi.item_type = 'dish' AND oi.item_id = d.id
       LEFT JOIN beverages b ON oi.item_type = 'beverage' AND oi.item_id = b.id
       WHERE oi.sheet_id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(400).json({ error: 'Ficha vazia' });
    }

    const total = items.reduce((sum: number, item: any) => sum + item.total_price, 0);

    // Gerar código único
    const code = uuidv4().substring(0, 8).toUpperCase();

    // Criar via
    await run(
      `INSERT INTO receipts (code, sheet_id, table_number, customer_name, total, items)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [code, id, sheet.table_number, sheet.customer_name || '', total, JSON.stringify(items)]
    );

    // Atualizar status da ficha
    await run(
      `UPDATE order_sheets SET status = 'completed', total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [total, id]
    );

    return res.status(200).json({ code, receipt: { ...sheet, items, total } });
  } catch (error) {
    console.error('Erro ao finalizar ficha:', error);
    return res.status(500).json({ error: 'Erro ao finalizar ficha' });
  }
}









