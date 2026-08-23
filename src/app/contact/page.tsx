'use client'; // Obrigatório no Next.js para usar useState e funções assíncronas

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending...");

    const formData = new FormData(event.target as HTMLFormElement);
    // Sua chave do Web3Forms já inserida com segurança aqui
    formData.append("access_key", "69381543-01eb-4b82-ae0e-d59a1a0ae3c9");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("Success! Your message has been sent.");
        (event.target as HTMLFormElement).reset(); // Limpa os campos após enviar
      } else {
        setResult("Error! Please try again later.");
      }
    } catch (error) {
      setResult("Error connecting to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '105px auto',
      padding: '30px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f1f5f9',
      backgroundColor: '#1e1e24', // Fundo cinza escuro
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      lineHeight: '1.6'
    }}>
      
      {/* LINK DE RETORNO NO TOPO */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" className="text-purple-400 hover:text-purple-300 hover:underline font-bold mt-[15]">
           ← Back to Homepage
        </Link>
      </div>

      <h1 style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', fontSize: '28px', color: '#ffffff' }}>
        Contact Support
      </h1>

      <p style={{ color: '#cbd5e1', marginTop: '15px', marginBottom: '20px' }}>
        If you have any questions, copyright/legal inquiries, or feedback regarding our analytical music charts, please use our secure message box below.
      </p>

      {/* SEU FORMULÁRIO COM SEU ON-SUBMIT */}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#fff', marginBottom: '4px' }}>Name / Organization:</label>
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="Your name or company"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#fff', marginBottom: '4px' }}>Your Email:</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="user@example.com"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#fff', marginBottom: '4px' }}>Message:</label>
          <textarea 
            name="message" 
            required 
            rows={5}
            placeholder="Type your detailed message here..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', resize: 'vertical', outline: 'none' }}
          ></textarea>
        </div>

        {/* MENSAGEM DE STATUS DO ENVIO (SEU <p>{result}</p> ESTILIZADO) */}
        {result && (
          <p style={{ 
            padding: '10px', 
            borderRadius: '6px', 
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: result.includes("Success") ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: result.includes("Success") ? '#4ade80' : '#f87171',
            border: result.includes("Success") ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {result}
          </p>
        )}

        <button 
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '12px 24px',
            backgroundColor: isSubmitting ? '#6b7280' : '#a78bfa',
            color: '#111',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            alignSelf: 'flex-start'
          }}
        >
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      </form>

     

    </div>
  );
}
