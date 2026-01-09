import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Prato.module.css';

interface Dish {
  id: number;
  name: string;
  mini_presentation: string;
  full_description: string;
  image_url: string;
  category_name: string;
}

export default function PratoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const loadDish = async () => {
    try {
      const res = await fetch(`/api/dishes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDish(data);
      }
    } catch (error) {
      console.error('Erro ao carregar prato:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isDesktop && id) {
      loadDish();
    }
    
    // Desabilitar scroll na página apenas no mobile
    if (!isDesktop) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setLoading(false);
    }
    
    // Limpar quando sair da página
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isDesktop]);

  if (isDesktop) {
    return (
      <>
        <Head>
          <title>Cardápio</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundImage: 'url(/imagem/verde.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <h1 style={{ color: '#333', marginBottom: '20px', fontSize: '24px' }}>
              Este cardápio só pode ser acessado pelo celular
            </h1>
            <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
              Por favor, acesse pelo celular para visualizar o cardápio completo.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Prato não encontrado</div>
        <Link href="/">
          <button className={styles.backButton}>Voltar ao Cardápio</button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{dish.name} - Cardápio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          ← Voltar
        </Link>
        <img src="/logos/mi casa.png" alt="Mi Casa" className={styles.logo} />

        <div className={styles.section}>
          {dish.image_url && (
            <div className={styles.imageContainer}>
              <img src={dish.image_url} alt={dish.name} />
            </div>
          )}

          <div className={styles.content}>
            <h1 className={styles.dishTitle}>{dish.name}</h1>
            <p className={styles.description}>
              {(() => {
                const description = dish.full_description || dish.mini_presentation || '';
                // Limite de 400 caracteres para garantir espaço de segurança
                const maxLength = 400;
                if (description.length > maxLength) {
                  return description.substring(0, maxLength).trim() + '...';
                }
                return description;
              })()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}


