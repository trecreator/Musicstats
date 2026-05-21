import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About, Data Methodology & Privacy Policy | Musical Stats',
  description: 'Learn more about our database infrastructure, YouTube API integration, internal metrics, and privacy policies.',
  robots: 'index, follow',
};

export default function AboutPageYoutube() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '25px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f1f5f9', // Letras bem claras (cinza esbranquiçado) para o fundo escuro
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
        About Youtube
      </h1>

      {/* SEÇÃO 1: SOBRE E INFRAESTRUTURA */}
      <section style={{ marginBottom: '30px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '20px', color: '#a78bfa' }}>1. About Data</h2>
        <p style={{ color: '#cbd5e1' }}>
          We use public data provided by the YouTube API to produce other data. Sometimes, a song's trend can change abruptly, causing our data to lose credibility.

          In addition, users and the YouTube system itself can remove comments, views, and likes from a video overnight, causing data values ​​to become negative from one scan to another in some cases. However, we always strive to be as realistic as possible with the data calculated internally by Musicalstats.com.
        </p>
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
