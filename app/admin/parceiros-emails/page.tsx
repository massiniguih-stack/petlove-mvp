'use client';

import { useState, useEffect } from 'react';

interface PartnerEmail {
  id: string;
  email: string;
  nome: string;
  tipo: string;
  cidade: string;
}

const STORAGE_KEY = 'petlove_partner_emails';

function loadPartnerEmails(): PartnerEmail[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePartnerEmails(emails: PartnerEmail[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
}

export default function AdminPartnerEmailsPage() {
  const [partners, setPartners] = useState<PartnerEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newNome, setNewNome] = useState('');
  const [newTipo, setNewTipo] = useState('veterinario');
  const [newCidade, setNewCidade] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  const [subject, setSubject] = useState('PetLove - Parceiro exclusivo para seu negocio 🐾');
  const [body, setBody] = useState(`<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 40px 30px; text-align: center; border-radius: 0 0 24px 24px;">
    <div style="font-size: 48px; margin-bottom: 12px;">🐾</div>
    <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">PetLove</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0 0;">Cuidados premium para quem ama pets</p>
  </div>

  <div style="padding: 40px 30px;">
    <p style="color: #334155; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">Ola, <strong>{nome}</strong>!</p>

    <p style="color: #334155; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
      Somos o <strong>PetLove</strong>, uma plataforma digital que conecta tutores de pets a servicos de qualidade. Estamos expandindo e queremos Voce como nosso parceiro.
    </p>

    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0;">
      <h3 style="color: #1e293b; font-size: 18px; font-weight: 800; margin: 0 0 16px 0;">Por que ser parceiro PetLove?</h3>

      <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
        <div style="background: #ede9fe; border-radius: 10px; padding: 8px; min-width: 36px; text-align: center; font-size: 18px;">📈</div>
        <div>
          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0;">Mais clientes</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Apareca para milhares de tutores que buscam servicos na sua regiao</p>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
        <div style="background: #fef3c7; border-radius: 10px; padding: 8px; min-width: 36px; text-align: center; font-size: 18px;">💰</div>
        <div>
          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0;">Precos exclusivos</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Condicoes especiais para parceiros em todas as funcionalidades</p>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start;">
        <div style="background: #dcfce7; border-radius: 10px; padding: 8px; min-width: 36px; text-align: center; font-size: 18px;">⭐</div>
        <div>
          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0;">Perfil premium</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Destaque seu estabelecimento com selo premium e maior visibilidade</p>
        </div>
      </div>

      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <div style="background: #fce7f3; border-radius: 10px; padding: 8px; min-width: 36px; text-align: center; font-size: 18px;">📱</div>
        <div>
          <p style="color: #1e293b; font-size: 15px; font-weight: 700; margin: 0;">Voce tambem pode usar</p>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Gerencie seus proprios pets com plano alimentar, saude e exercicios</p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://petlove-mvp.vercel.app/parceiros/cadastro" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #9333ea); color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; letter-spacing: -0.3px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);">
        Quero ser parceiro
      </a>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Conheca nosso app:</p>
      <a href="https://petlove-mvp.vercel.app/app" style="color: #7c3aed; font-size: 15px; font-weight: 700; text-decoration: none;">petlove-mvp.vercel.app/app</a>
    </div>

    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
      Qualquer duvida, responda este email. Estamos aqui para ajudar!
    </p>
  </div>

  <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">PetLove - Cuidados premium para quem ama pets</p>
    <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
      <a href="https://petlove-mvp.vercel.app" style="color: #7c3aed; text-decoration: none;">petlove-mvp.vercel.app</a>
    </p>
  </div>
</div>`);

  useEffect(() => {
    setPartners(loadPartnerEmails());
  }, []);

  function addPartner() {
    if (!newEmail || !newNome) return;
    const partner: PartnerEmail = {
      id: Date.now().toString(),
      email: newEmail,
      nome: newNome,
      tipo: newTipo,
      cidade: newCidade,
    };
    const updated = [...partners, partner];
    setPartners(updated);
    savePartnerEmails(updated);
    setNewEmail('');
    setNewNome('');
    setNewCidade('');
    setShowForm(false);
  }

  function removePartner(id: string) {
    const updated = partners.filter(p => p.id !== id);
    setPartners(updated);
    savePartnerEmails(updated);
  }

  function addBulkEmails() {
    const lines = bulkEmails.split('\n').filter(l => l.trim());
    const newPartners = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        id: Date.now().toString() + Math.random(),
        email: parts[0] || '',
        nome: parts[1] || 'Parceiro',
        tipo: parts[2] || 'veterinario',
        cidade: parts[3] || '',
      };
    }).filter(p => p.email && p.email.includes('@'));

    const updated = [...partners, ...newPartners];
    setPartners(updated);
    savePartnerEmails(updated);
    setBulkEmails('');
    setBulkMode(false);
  }

  async function sendEmail(to: string, nome: string) {
    const personalizedBody = body.replace('{nome}', nome);
    setSending(true);
    try {
      const res = await fetch('/api/admin/partner-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          html: personalizedBody,
        }),
      });
      if (res.ok) {
        setSent(prev => [...prev, to]);
      }
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  }

  async function sendToAll() {
    for (const partner of partners) {
      if (!sent.includes(partner.email)) {
        await sendEmail(partner.email, partner.nome);
      }
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Emails Parceiros</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Envie emails para seus parceiros cadastrados</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total de Parceiros</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{partners.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Ja enviados</p>
          <p className="mt-1 text-3xl font-black text-emerald-700 dark:text-emerald-300">{sent.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Pendentes</p>
          <p className="mt-1 text-3xl font-black text-amber-700 dark:text-amber-300">{partners.length - sent.length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl"
        >
          + Adicionar parceiro
        </button>
        <button
          onClick={() => setBulkMode(!bulkMode)}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          📋 Adicionar em massa
        </button>
        <button
          onClick={sendToAll}
          disabled={sending || partners.length === 0}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-xl disabled:opacity-50"
        >
          {sending ? 'Enviando...' : `📤 Enviar para todos (${partners.length})`}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Adicionar parceiro</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email *"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Nome *"
              value={newNome}
              onChange={e => setNewNome(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <select
              value={newTipo}
              onChange={e => setNewTipo(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="veterinario">Veterinario</option>
              <option value="petshop">Pet Shop</option>
              <option value="creche">Creche</option>
              <option value="hotel">Hotel</option>
              <option value="parque">Parque</option>
            </select>
            <input
              type="text"
              placeholder="Cidade"
              value={newCidade}
              onChange={e => setNewCidade(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={addPartner}
              disabled={!newEmail || !newNome}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Bulk Form */}
      {bulkMode && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Adicionar em massa</h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Um email por linha. Formato: <code>email, nome, tipo, cidade</code> (so email e obrigatorio)
          </p>
          <textarea
            placeholder={`exemplo@email.com, Nome do Parceiro, veterinario, Sao Paulo\noutro@email.com, Pet Shop Legal, petshop, Rio de Janeiro`}
            value={bulkEmails}
            onChange={e => setBulkEmails(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={addBulkEmails}
              disabled={!bulkEmails.trim()}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Adicionar
            </button>
            <button
              onClick={() => setBulkMode(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Email Editor */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Editar email</h3>
        <input
          type="text"
          placeholder="Assunto"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <textarea
          placeholder="Conteudo do email (HTML). Use {nome} para personalizar com o nome do parceiro."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={10}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Dica: Use {'{nome}'} no corpo do email para inserir o nome do parceiro automaticamente.
        </p>
      </div>

      {/* Partners List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {partners.length} parceiros
          </p>
        </div>
        {partners.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhum parceiro cadastrado. Adicione parceiros acima.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {partners.map(partner => (
              <div key={partner.id} className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-sm font-bold text-white">
                    {partner.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{partner.nome}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {partner.email} · {partner.tipo} · {partner.cidade || 'Sem cidade'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sent.includes(partner.email) ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                      ✓ Enviado
                    </span>
                  ) : (
                    <button
                      onClick={() => sendEmail(partner.email, partner.nome)}
                      disabled={sending}
                      className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-900 dark:text-amber-300"
                    >
                      {sending ? '...' : '📤 Enviar'}
                    </button>
                  )}
                  <button
                    onClick={() => removePartner(partner.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
