import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/DishEdit.module.css';

export default function EditBeverage() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    category_id: '',
    price: 0,
    status: 'active',
    display_order: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadBeverage();
    }
  }, [id]);

  const loadBeverage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/beverages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          description: data.description || '',
          image_url: data.image_url || '',
          category_id: data.category_id || '',
          price: data.price || 0,
          status: data.status || 'active',
          display_order: data.display_order || 0,
        });
      } else {
        console.error('Erro ao carregar bebida: Resposta não OK', res.status);
        alert('Erro ao carregar dados da bebida');
      }
    } catch (error) {
      console.error('Erro ao carregar bebida:', error);
      alert('Erro ao carregar dados da bebida. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Preparar valores com type assertion para evitar erro de TypeScript
      const priceValue = typeof formData.price === 'string' 
        ? Number((formData.price as string).replace(',', '.')) 
        : (typeof formData.price === 'number' ? formData.price : 0);
      
      const displayOrderValue = typeof formData.display_order === 'string' 
        ? Number(formData.display_order as string) 
        : (typeof formData.display_order === 'number' ? formData.display_order : 0);

      const res = await fetch(`/api/beverages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: priceValue,
          display_order: displayOrderValue,
          category_id: formData.category_id || null,
        }),
      });

      if (res.ok) {
        alert('Bebida atualizada com sucesso!');
        router.push('/admin');
      } else {
        alert('Erro ao atualizar bebida');
      }
    } catch (error) {
      alert('Erro ao atualizar bebida');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta bebida?')) return;

    try {
      const res = await fetch(`/api/beverages/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Bebida excluída com sucesso!');
        router.push('/admin');
      } else {
        alert('Erro ao excluir bebida');
      }
    } catch (error) {
      alert('Erro ao excluir bebida');
    }
  };

  if (loading) {
    return <div className={styles.container}>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Editar Bebida - Admin</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => router.push('/admin')}>← Voltar</button>
          <h1>Editar Bebida</h1>
          <button onClick={handleDelete} className={styles.deleteButton}>
            Excluir
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nome da Bebida</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label>URL da Imagem</label>
            <input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Valor (R$)</label>
            <input
              type="text"
              value={formData.price === 0 ? '' : (typeof formData.price === 'number' ? (formData.price as number).toFixed(2).replace('.', ',') : formData.price)}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, price: value === '' ? 0 : (value as any) });
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  const numValue = Number(value.replace(',', '.'));
                  if (!isNaN(numValue)) {
                    setFormData({ ...formData, price: numValue });
                  }
                } else {
                  setFormData({ ...formData, price: 0 });
                }
              }}
              placeholder="0,00"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
            </select>
          </div>


          <button type="submit" disabled={saving} className={styles.saveButton}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </>
  );
}
