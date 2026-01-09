import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Admin.module.css';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dishes');

  useEffect(() => {
    // Inicializar admin na primeira vez
    fetch('/api/init', { method: 'POST' }).catch(() => {});
    
    // No mobile, iniciar com 'orders'
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setActiveTab('orders');
    }
    
    // Listener para mudanças de tamanho da tela
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setActiveTab((currentTab) => currentTab !== 'orders' ? 'orders' : currentTab);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Head>
        <title>Painel Administrativo</title>
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Painel Administrativo</h1>
        </header>

        <nav className={styles.tabs}>
          <button
            className={activeTab === 'dishes' ? styles.activeTab : ''}
            onClick={() => setActiveTab('dishes')}
          >
            Pratos & Bebidas
          </button>
          <button
            className={activeTab === 'orders' ? styles.activeTab : ''}
            onClick={() => setActiveTab('orders')}
          >
            Ficha de Pedido
          </button>
          <button
            className={activeTab === 'spreadsheet' ? styles.activeTab : ''}
            onClick={() => setActiveTab('spreadsheet')}
          >
            Planilha
          </button>
          <button
            className={activeTab === 'receipts' ? styles.activeTab : ''}
            onClick={() => setActiveTab('receipts')}
          >
            Vias
          </button>
        </nav>

        <main className={styles.main}>
          {activeTab === 'dishes' && <div className="desktop-only"><DishesTab /></div>}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'spreadsheet' && <div className="desktop-only"><SpreadsheetTab /></div>}
          {activeTab === 'receipts' && <div className="desktop-only"><ReceiptsTab /></div>}
        </main>
      </div>
    </>
  );
}

// Componente de Pratos e Bebidas
function DishesTab() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [beverages, setBeverages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filter !== 'all') params.append('status', filter);

      const [dishesRes, beveragesRes] = await Promise.all([
        fetch(`/api/dishes?${params.toString()}`),
        fetch(`/api/beverages?${params.toString()}`),
      ]);

      setDishes(await dishesRes.json());
      setBeverages(await beveragesRes.json());
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className={styles.searchInput}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={styles.filterSelect}>
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="paused">Pausados</option>
        </select>
        <button onClick={handleSearch} className={styles.searchButton}>Buscar</button>
        <Link href="/admin/dishes/new">
          <button className={styles.addButton}>+ Novo Prato</button>
        </Link>
        <Link href="/admin/beverages/new">
          <button className={styles.addButton} style={{ background: '#3b82f6' }}>+ Nova Bebida</button>
        </Link>
      </div>

      <h2>Pratos</h2>
      <div className={styles.itemsGrid}>
        {dishes.length === 0 ? (
          <p>Nenhum prato cadastrado</p>
        ) : (
          dishes.map((dish) => (
            <Link key={dish.id} href={`/admin/dishes/${dish.id}`}>
              <div className={styles.itemCard}>
                {dish.image_url && <img src={dish.image_url} alt={dish.name} />}
                <h3>{dish.name}</h3>
                <span className={styles.status}>{dish.status}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <h2>Bebidas</h2>
      <div className={styles.itemsGrid}>
        {beverages.length === 0 ? (
          <p>Nenhuma bebida cadastrada</p>
        ) : (
          beverages.map((beverage) => (
            <Link key={beverage.id} href={`/admin/beverages/${beverage.id}`}>
              <div className={styles.itemCard}>
                {beverage.image_url && <img src={beverage.image_url} alt={beverage.name} />}
                <h3>{beverage.name}</h3>
                <span className={styles.status}>{beverage.status}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// Componente de Fichas de Pedido
function OrdersTab() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      const res = await fetch('/api/orders?status=active');
      const data = await res.json();
      setSheets(data);
    } catch (error) {
      console.error('Erro ao carregar fichas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSheet = async (sheetId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Tem certeza que deseja excluir esta ficha de pedido?')) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${sheetId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadSheets();
      } else {
        alert('Erro ao excluir ficha');
      }
    } catch (error) {
      console.error('Erro ao excluir ficha:', error);
      alert('Erro ao excluir ficha');
    }
  };

  return (
    <div className={styles.tabContent}>
      <Link href="/admin/orders/new">
        <button className={styles.addButton}>+ Nova Ficha de Pedido</button>
      </Link>
      <div className={styles.sheetsList}>
        {sheets.map((sheet) => (
          <div key={sheet.id} style={{ position: 'relative' }}>
            <Link href={`/admin/orders/${sheet.id}`}>
              <div className={styles.sheetCard}>
                <h3>Mesa {sheet.table_number}</h3>
                {sheet.customer_name && <p>Cliente: {sheet.customer_name}</p>}
                <p>Total: R$ {sheet.total?.toFixed(2) || '0.00'}</p>
              </div>
            </Link>
            <button
              onClick={(e) => handleDeleteSheet(sheet.id, e)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              × Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Planilha
function SpreadsheetTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpreadsheet();
  }, []);

  const loadSpreadsheet = async () => {
    try {
      const res = await fetch('/api/spreadsheet');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar planilha:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tabContent}>
      <h2>Planilha de Valores</h2>
      <table className={styles.spreadsheetTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.type}-${item.id}`}>
              <td>{item.name}</td>
              <td>{item.type === 'dish' ? 'Prato' : 'Bebida'}</td>
              <td>R$ {item.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente de Vias
function ReceiptsTab() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const params = searchCode ? `?code=${searchCode}` : '';
      const res = await fetch(`/api/receipts${params}`);
      const data = await res.json();
      setReceipts(data);
    } catch (error) {
      console.error('Erro ao carregar vias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadReceipts();
  };

  const handleDeleteReceipt = async (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Tem certeza que deseja excluir esta via?')) {
      return;
    }

    try {
      const res = await fetch(`/api/receipts/${code}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadReceipts();
      } else {
        alert('Erro ao excluir via');
      }
    } catch (error) {
      console.error('Erro ao excluir via:', error);
      alert('Erro ao excluir via');
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar por código..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>Buscar</button>
      </div>
      <div className={styles.receiptsList}>
        {receipts.map((receipt) => (
          <div key={receipt.id} style={{ position: 'relative' }}>
            <Link href={`/admin/receipts/${receipt.code}`}>
              <div className={styles.receiptCard}>
                <h3>Código: {receipt.code}</h3>
                <p>Mesa: {receipt.table_number}</p>
                {receipt.customer_name && <p>Cliente: {receipt.customer_name}</p>}
                <p>Total: R$ {receipt.total.toFixed(2)}</p>
              </div>
            </Link>
            <button
              onClick={(e) => handleDeleteReceipt(receipt.code, e)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              × Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

