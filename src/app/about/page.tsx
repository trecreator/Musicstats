import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About, Data Methodology & Privacy Policy | Musical Stats',
  description: 'Learn more about our database infrastructure, YouTube API integration, internal metrics, and privacy policies.',
  robots: 'index, follow',
};

export default function AboutPage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '25px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f1f5f9', // Letras claras para o fundo escuro
      backgroundColor: '#1e1e24', // Fundo cinza escuro sutil
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      lineHeight: '1.6'
    }}>
      
      {/* LINK NO TOPO */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" className="text-purple-400 hover:text-purple-300 hover:underline ml-1 font-bold">
           ← Back to Homepage
        </Link>
      </div>

      <h1 style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px', fontSize: '28px', color: '#ffffff' }}>
        About, Data Methodology & Privacy Policy
      </h1>

      {/* SEÇÃO 1: SOBRE E INFRAESTRUTURA */}
      <section style={{ marginBottom: '30px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '20px', color: '#a78bfa' }}>1. About the Platform & Architecture</h2>
        <p style={{ color: '#cbd5e1' }}>
          This platform is an independent music statistics aggregator designed to help users track, analyze, and visualize global music trends. Our system utilizes a highly secure and scalable cloud infrastructure powered by a dedicated <strong>Aiven Database</strong> to ensure high availability and fast performance when processing public metrics.
        </p>
      </section>

      {/* SEÇÃO 2: ORIGEM DOS DADOS (YOUTUBE API) */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', color: '#a78bfa' }}>2. Data Sources & YouTube API Compliance</h2>
        <p style={{ color: '#cbd5e1' }}>
          Transparency is our core value. All base metrics displayed on this website are fetched and synchronized from public data provided directly by the <strong>Official YouTube Services via API</strong>.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          Every single piece of data retrieved—such as video titles, baseline view counts, likes, and comment metrics—is entirely public information that anyone can access directly on YouTube. To ensure full compliance and attribution, the direct official link to the original video is clearly displayed on each individual music/video page within our platform. 
        </p>
        <div style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #a78bfa', margin: '15px 0' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0' }}>
            This platform strictly operates as a data visualizer and complies with the <strong>YouTube API Services Terms of Service</strong>. We do not download, host, modify, or cache any underlying media or private video assets.
          </p>
        </div>
      </section>

      {/* SEÇÃO 3: VALOR AGREGADO E MÉTRICAS CALCULADAS */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', color: '#a78bfa' }}>3. Proprietary Analytics & Calculated Metrics</h2>
        <p style={{ color: '#cbd5e1' }}>
          To provide unique insights beyond raw data, our server processes historical records and aggregates daily statistics. The advanced metrics displayed on our analytical charts include:
        </p>
        <ul style={{ paddingLeft: '20px', margin: '10px 0', color: '#cbd5e1' }}>
          <li style={{ marginBottom: '5px' }}><strong style={{ color: '#fff' }}>Views/Likes/Comments Yesterday:</strong> Comparative daily deltas calculated by comparing current snapshots against the previous day's stored records.</li>
          <li style={{ marginBottom: '5px' }}><strong style={{ color: '#fff' }}>Current Month Statistics:</strong> Aggregated data showcasing performance, milestones, and traction gained over the current calendar month.</li>
          <li style={{ marginBottom: '5px' }}><strong style={{ color: '#fff' }}>Database Update History:</strong> A transparent log displaying precise timestamps of when statistics were last refreshed from the public API.</li>
          <li style={{ marginBottom: '5px' }}><strong style={{ color: '#fff' }}>Page Traffic Analytics:</strong> Internal counters that monitor total page visits to rank internal popularity trends.</li>
        </ul>
        <p style={{ color: '#cbd5e1' }}>
          To facilitate navigation through these analytical charts, an internal search feature is available, allowing users to query and filter indexed music data instantaneously.
        </p>
      </section>

      {/* SEÇÃO 4: PRIVACIDADE DOS USUÁRIOS */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', color: '#a78bfa' }}>4. Privacy Policy & Zero User Data Collection</h2>
        <p style={{ color: '#cbd5e1' }}>
          We are deeply committed to user privacy. <strong style={{ color: '#fff' }}>We do not collect, harvest, store, or sell any personal data from our visitors.</strong> You can browse our charts, use our search engine, and check music statistics with absolute anonymity. No sign-ups or personal logs are required.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          However, this website integrates third-party advertising services to sustain server costs. Companies like <strong>Google AdSense</strong> may use cookies (small text files placed on your browser) to collect non-personally identifiable browsing data (such as IP anonymization or visit frequency) to serve personalized advertisements based on your visits to this or other websites across the internet.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          You can choose to opt out of personalized advertising at any time by configuring your preferences directly on the <a href="https://google.com" target="_blank" rel="noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Google Ads Settings</a> page.
        </p>
      </section>

      {/* SEÇÃO 5: CONTATO SEGURO REDIRECIONANDO PARA /CONTACT */}
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', color: '#a78bfa' }}>5. Contact Information</h2>
        <p style={{ color: '#cbd5e1' }}>
          If you have any questions, legal inquiries, feedback regarding our analytical data, or API compliance, please contact our team through our official support panel:
        </p>
        <div style={{ marginTop: '15px' }}>
          <Link href="/contact" className="text-purple-400 hover:text-purple-300 hover:underline font-bold text-lg">
             ✉️ Open Official Contact Form
          </Link>
        </div>
      </section>

      {/* LINK NO FINAL E RODAPÉ */}
      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <Link href="/" className="text-purple-400 hover:text-purple-300 hover:underline ml-1 font-bold">
           Back to Homepage
        </Link>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          © {new Date().getFullYear()} - All base video data is public and property of its respective creators.
        </span>
      </div>

    </div>
  );
}
