import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/DishEdit.module.css';

export default function EditDish() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    name: '',
    mini_presentation: '',
    full_description: '',
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
      loadDish();
    }
  }, [id]);

  const loadDish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dishes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          mini_presentation: data.mini_presentation || '',
          full_description: data.full_description || '',
          image_url: data.image_url || '',
          category_id: data.category_id || '',
          price: data.price || 0,
          status: data.status || 'active',
          display_order: data.display_order || 0,
        });
      } else {
        console.error('Erro ao carregar prato: Resposta não OK', res.status);
        alert('Erro ao carregar dados do prato');
      }
    } catch (error) {
      console.error('Erro ao carregar prato:', error);
      alert('Erro ao carregar dados do prato. Verifique o console.');
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

      const res = await fetch(`/api/dishes/${id}`, {
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
        alert('Prato atualizado com sucesso!');
        router.push('/admin');
      } else {
        alert('Erro ao atualizar prato');
      }
    } catch (error) {
      alert('Erro ao atualizar prato');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este prato?')) return;

    try {
      const res = await fetch(`/api/dishes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Prato excluído com sucesso!');
        router.push('/admin');
      } else {
        alert('Erro ao excluir prato');
      }
    } catch (error) {
      alert('Erro ao excluir prato');
    }
  };

  if (loading) {
    return <div className={styles.container}>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Editar Prato - Admin</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => router.push('/admin')}>← Voltar</button>
          <h1>Editar Prato</h1>
          <button onClick={handleDelete} className={styles.deleteButton}>
            Excluir
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nome do Prato</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mini Apresentação</label>
            <textarea
              value={formData.mini_presentation}
              onChange={(e) => setFormData({ ...formData, mini_presentation: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Descrição Completa (Máximo 8 linhas e 300 caracteres)</label>
            <textarea
              value={formData.full_description}
              onChange={(e) => {
                const text = e.target.value;
                const lines = text.split('\n');
                // Prioridade: primeiro verifica linhas, depois caracteres
                if (lines.length > 8) {
                  // Se exceder 8 linhas, não permite
                  return;
                }
                if (text.length <= 300) {
                  setFormData({ ...formData, full_description: text });
                }
              }}
              onKeyDown={(e) => {
                const text = (e.target as HTMLTextAreaElement).value;
                const lines = text.split('\n');
                // Bloqueia Enter se já tiver 8 linhas
                if (lines.length >= 8 && e.key === 'Enter') {
                  e.preventDefault();
                  return;
                }
                // Bloqueia qualquer tecla se tiver 300 caracteres (exceto Backspace/Delete)
                if (text.length >= 300 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
                  e.preventDefault();
                }
              }}
              rows={8}
              maxLength={300}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              {formData.full_description.split('\n').length}/8 linhas - {formData.full_description.length}/300 caracteres
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>URL da Imagem</label>
            <input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              required
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
