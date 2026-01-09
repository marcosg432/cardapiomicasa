import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { code } = req.query;
    
    let sql = 'SELECT * FROM receipts WHERE 1=1';
    const params: any[] = [];

    if (code) {
      sql += ' AND code LIKE ?';
      params.push(`%${code}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const receipts = await query(sql, params);

    // Parse items JSON
    const parsedReceipts = receipts.map((receipt: any) => ({
      ...receipt,
      items: JSON.parse(receipt.items || '[]'),
    }));

    return res.status(200).json(parsedReceipts);
  } catch (error) {
    console.error('Erro ao buscar vias:', error);
    return res.status(500).json({ error: 'Erro ao buscar vias' });
  }
}









