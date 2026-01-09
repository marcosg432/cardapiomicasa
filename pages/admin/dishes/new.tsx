import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/DishEdit.module.css';

export default function NewDish() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    mini_presentation: '',
    image_url: '',
    full_description: '',
    category_id: '',
    price: '',
    display_order: '',
  });
  const [loading, setLoading] = useState(false);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mini_presentation || !formData.image_url) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_description || !formData.image_url) {
      alert('Preencha a descrição completa e a imagem');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? Number(formData.price.toString().replace(',', '.')) : 0,
          display_order: formData.display_order ? Number(formData.display_order.toString()) : 0,
          category_id: formData.category_id || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/dishes/${data.id}`);
      } else {
        alert('Erro ao criar prato');
      }
    } catch (error) {
      alert('Erro ao criar prato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Novo Prato - Admin</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => router.back()}>← Voltar</button>
          <h1>Novo Prato</h1>
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1} className={styles.form}>
            <h2>Etapa 1: Dados do Cardápio</h2>
            <div className={styles.formGroup}>
              <label>Nome do Prato *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mini Apresentação *</label>
              <textarea
                value={formData.mini_presentation}
                onChange={(e) => setFormData({ ...formData, mini_presentation: e.target.value })}
                required
                rows={3}
              />
            </div>
            <div className={styles.formGroup}>
              <label>URL da Imagem *</label>
              <input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                required
                placeholder="https://..."
              />
            </div>
            <button type="submit" className={styles.nextButton}>Próxima Etapa →</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className={styles.form}>
            <h2>Etapa 2: Página Privada do Prato</h2>
            <div className={styles.formGroup}>
              <label>Nome do Prato</label>
              <input value={formData.name} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Descrição Completa * (Máximo 8 linhas e 300 caracteres)</label>
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
                required
                rows={8}
                maxLength={300}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                {formData.full_description.split('\n').length}/8 linhas - {formData.full_description.length}/300 caracteres
              </small>
            </div>
            <div className={styles.formGroup}>
              <label>URL da Imagem *</label>
              <input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                required
              />
            </div>
            <div className={styles.buttons}>
              <button type="button" onClick={() => setStep(1)}>← Voltar</button>
              <button type="submit">Próxima Etapa →</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Etapa 3: Valor do Prato (Interno)</h2>
            <div className={styles.formGroup}>
              <label>Valor do Prato (R$) *</label>
              <input
                type="text"
                value={formData.price === '' ? '' : (typeof formData.price === 'string' && formData.price !== '' ? formData.price : (typeof formData.price === 'number' ? formData.price.toFixed(2).replace('.', ',') : ''))}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const numValue = Number(value.replace(',', '.'));
                    if (!isNaN(numValue)) {
                      setFormData({ ...formData, price: numValue.toFixed(2).replace('.', ',') });
                    }
                  }
                }}
                required
                placeholder="0,00"
              />
              <small>Este valor não aparece para o cliente</small>
            </div>
            <div className={styles.buttons}>
              <button type="button" onClick={() => setStep(2)}>← Voltar</button>
              <button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Prato'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
