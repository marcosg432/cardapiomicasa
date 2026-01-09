import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Cardapio.module.css';

interface Dish {
  id: number;
  name: string;
  mini_presentation: string;
  image_url: string;
}

interface Beverage {
  id: number;
  name: string;
  image_url: string;
}

export default function Cardapio() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
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

  useEffect(() => {
    if (!isDesktop) {
      loadData();
    }
  }, [isDesktop]);

  const loadData = async () => {
    try {
      const [dishesRes, beveragesRes] = await Promise.all([
        fetch('/api/dishes/public'),
        fetch('/api/beverages/public'),
      ]);

      let dishesData = [];
      let beveragesData = [];

      if (dishesRes.ok) {
        try {
          dishesData = await dishesRes.json();
        } catch (e) {
          console.error('Erro ao parsear pratos:', e);
        }
      }

      if (beveragesRes.ok) {
        try {
          beveragesData = await beveragesRes.json();
        } catch (e) {
          console.error('Erro ao parsear bebidas:', e);
        }
      }

      // Garantir que sempre seja um array
      setDishes(Array.isArray(dishesData) ? dishesData : []);
      setBeverages(Array.isArray(beveragesData) ? beveragesData : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Em caso de erro, garantir arrays vazios
      setDishes([]);
      setBeverages([]);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <Head>
        <title>Cardápio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div className={styles.container}>
        {/* Banner Section */}
        <section className={styles.bannerSection}></section>

        {/* Bebidas */}
        {beverages.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Bebidas</h2>
            <div className={styles.horizontalScroll}>
              {beverages.map((beverage) => (
                <div key={beverage.id} className={styles.beverageCard}>
                  {beverage.image_url && (
                    <img src={beverage.image_url} alt={beverage.name} />
                  )}
                  <h3>{beverage.name}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pratos */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pratos</h2>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : (
            <div className={styles.dishesGrid}>
              {Array.isArray(dishes) && dishes.map((dish) => (
                <div key={dish.id} className={styles.dishCard}>
                  {dish.image_url && (
                    <img src={dish.image_url} alt={dish.name} />
                  )}
                  <div className={styles.dishCardContent}>
                    <h3>{dish.name}</h3>
                    <p>{dish.mini_presentation}</p>
                    <div className={styles.dishCardFooter}>
                      <Link href={`/prato/${dish.id}`}>
                        <button className={styles.viewButton}>
                        <svg className={styles.clocheIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="none">
                          {/* Vapor */}
                          <path d="M26 8c1.5 2 1.5 4 0 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M32 6c1.5 2.5 1.5 5 0 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M38 8c1.5 2 1.5 4 0 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          {/* Tampa */}
                          <path d="M16 28a16 16 0 0 1 32 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                          {/* Puxador */}
                          <circle cx="32" cy="12" r="2" fill="currentColor"/>
                          {/* Base */}
                          <line x1="14" y1="32" x2="50" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                          <line x1="18" y1="36" x2="46" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                          Ver Prato
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

