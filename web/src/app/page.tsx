import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  WifiOff, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Database,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Listify Web',
    'operatingSystem': 'All',
    'applicationCategory': 'ProductivityApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'TRY'
    },
    'description': 'Kayıt ve giriş gerektirmeyen, local-first IndexedDB mimarisine ve 48 saatlik geçici canlı eşitlemeye sahip modern alışveriş ve yapılacaklar listesi web uygulaması.'
  };

  return (
    <>
      {/* SEO Yapılandırılmış Veri (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 3rem 1rem', maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)',
            padding: '8px'
          }}>
            <img
              src="/logo.png"
              alt="Listify Logo"
              width={72}
              height={72}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        <div className="badge badge-indigo" style={{ marginBottom: '1.25rem', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
          <Sparkles size={14} />
          <span>Local-First & Sıfır Üyelik Bariyeri</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem'
        }}>
          Kayıt Olmadan, Anında Liste Oluşturun ve <span style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Canlı Paylaşın.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          maxWidth: '700px',
          margin: '0 auto 2.5rem auto'
        }}>
          Listify Web; parola hatırlama ve hesap açma derdini bitirir. Verileriniz doğrudan cihazınızda (IndexedDB) saklanır, tek bir linkle 48 saatliğine canlı ortaklaşa kullanılır.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/lists" className="btn btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1.05rem' }}>
            <span>Hemen Liste Oluştur</span>
            <ArrowRight size={18} />
          </Link>
          <a href="#nasil-calisir" className="btn btn-secondary" style={{ padding: '0.85rem 1.85rem', fontSize: '1.05rem' }}>
            <span>Nasıl Çalışır?</span>
          </a>
        </div>
      </section>

      {/* İnteraktif Önizleme Kartı (Hero Mockup) */}
      <section style={{ maxWidth: '780px', margin: '0 auto 4rem auto' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, marginLeft: '0.35rem' }}>🛒 Hafta Sonu Pazarı & Market</span>
            </div>
            <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>Canlı • 47s 59d</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div className="item-row completed">
              <div className="custom-checkbox checked">✓</div>
              <span className="item-text" style={{ flex: 1, fontSize: '0.92rem' }}>2 Litre Günlük Süt</span>
              <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>Süt & Kahvaltılık</span>
            </div>
            <div className="item-row">
              <div className="custom-checkbox"></div>
              <span className="item-text" style={{ flex: 1, fontSize: '0.92rem' }}>1 kg Çeri Domates</span>
              <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>Meyve & Sebze</span>
            </div>
            <div className="item-row">
              <div className="custom-checkbox"></div>
              <span className="item-text" style={{ flex: 1, fontSize: '0.92rem' }}>Tam Buğday Ekmeği</span>
              <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>Fırın & Unlu Mamüller</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Temel Mimari Özellik */}
      <section id="nasil-calisir" style={{ marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Neden Listify Web?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Klasik hesap zorunluluğu olan bulut servisleri ile ilkel not defterleri arasındaki en güçlü köprü.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sıfır Üyelik (No-Auth)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Kullanıcı adı, şifre veya e-posta yok. Uygulamayı açtığınız anda anonim cihaz kimliğinizle doğrudan liste oluşturmaya başlayabilirsiniz.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Database size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Local-First (IndexedDB)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Verileriniz bulut yerine tarayıcınızın kendi güvenli veritabanında yaşar. İnternetiniz kopsa bile listeleriniz anında açılır ve kesintisiz çalışır.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>48 Saatlik Geçici Bulut (TTL)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Paylaşılan listeler sunucuda sonsuza kadar kalıp yer kaplamaz. 48 saat sonra buluttan silinir; cihazlarınızda ise bağımsız yerel liste olarak kalır.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <RefreshCw size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Canlı Eşitleme & LWW Çakışma Yönetimi</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Market arkadaşınızla aynı listeyi açın; o reyon A'da sütü işaretlerken siz reyon B'de domatesi ekleyin. Madde bazlı son yazan kazanır algoritmasıyla veri kaybı yaşanmaz.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Akıllı Kategorizasyon</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Yazdığınız ürün adlarını ("yoğurt", "elma", "deterjan") otomatik algılar ve sepetinizi reyon bazında gruplandırarak alışverişinizi hızlandırır.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <WifiOff size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Çevrimdışı & PWA Desteği</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Bodrum katındaki süpermarkette internet çekmese dahi listenizi rahatça yönetin. İster tarayıcıda kullanın, ister ana ekranınıza uygulama gibi yükleyin.
            </p>
          </div>
        </div>
      </section>

      {/* Karşılaştırma Tablosu */}
      <section style={{ maxWidth: '850px', margin: '0 auto 6rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Listify Web Farkı
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Geleneksel liste uygulamalarıyla karşılaştırın</p>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>↔️ Yatay kaydırarak tüm tabloyu inceleyebilirsiniz</div>
        </div>

        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Özellik</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Diğer Uygulamalar</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--accent-primary)', fontWeight: 800 }}>Listify Web</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Kayıt / Giriş Zorunluluğu</td>
                <td style={{ padding: '0.85rem 1rem', color: '#f87171' }}>❌ E-posta ve şifre şart</td>
                <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 700 }}>✓ Sıfır kayıt (No-Auth)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Çevrimdışı Çalışma Hızı</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>Bulut gecikmeli</td>
                <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 700 }}>✓ Anında (Local-First)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Paylaşım Şekli</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>İki tarafın da üye olması gerekir</td>
                <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 700 }}>✓ Tek tıkla URL linki</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Veri Gizliliği</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>Tüm veriler üçüncü parti sunucuda</td>
                <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 700 }}>✓ Yalnızca cihazınızda</td>
              </tr>
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Akıllı Türkçe Reyonlama</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>Yok / Manuel sıralama</td>
                <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 700 }}>✓ Otomatik eşleme</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SSS (Sıkça Sorulan Sorular) - SEO Odaklı */}
      <section style={{ maxWidth: '750px', margin: '0 auto 6rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Sıkça Sorulan Sorular
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Merak ettiğiniz mimari ve kullanım detayları</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>48 saat dolunca listelerim silinir mi?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Hayır! 48 saatlik süre yalnızca sunucu üzerindeki geçici paylaşım bağlantısı içindir. Süre dolduğunda liste sunucudan silinir ancak sizin ve arkadaşınızın tarayıcısında bağımsız yerel liste olarak güvenle saklanmaya devam eder.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Aynı anda iki kişi aynı maddeyi değiştirirse ne olur?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Listify Web, madde seviyesinde "Last-Write-Wins" (Son Yazan Kazanır) kuralını uygular. Milisaniye hassasiyetli zaman damgaları sayesinde, en son yapılan eylem geçerli sayılır ve diğer kullanıcının ekranına yansıtılır.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Uygulamayı kullanmak için herhangi bir ücret ödemem gerekir mi?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Hayır, Listify Web tamamen ücretsiz ve açık standartlarla geliştirilmiş bir web uygulamasıdır.
            </p>
          </div>
        </div>
      </section>

      {/* Son CTA */}
      <section className="glass-panel" style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 50%, rgba(2, 132, 199, 0.12) 100%), var(--bg-surface)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Alışverişlerinizi Kolaylaştırmaya Hazır mısınız?
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Hemen ilk listenizi oluşturun, ister markette ister günlük işlerinizde sürtünmesiz deneyimin tadını çıkarın.
        </p>
        <Link href="/lists" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
          <span>Listelerime Git</span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
