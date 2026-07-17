import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Roda uma vez por dia via Vercel Cron (ver vercel.json). Manda um e-mail
// de lembrete para vacinas pendentes que vencem nos próximos 3 dias (ou já
// venceram ontem), uma única vez por vacina — controlado por
// momento.lembrete_enviado_em.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const emTresDias = new Date(hoje);
  emTresDias.setDate(emTresDias.getDate() + 3);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const { data: vacinas, error } = await supabaseAdmin
    .from('momento')
    .select('id, titulo, data_agendada, pet:pet_id(nome, tutor:tutor_id(nome, email))')
    .eq('categoria', 'vacina')
    .eq('status_vacina', 'pendente')
    .is('lembrete_enviado_em', null)
    .gte('data_agendada', fmt(ontem))
    .lte('data_agendada', fmt(emTresDias));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let enviados = 0;
  let falhas = 0;

  for (const v of vacinas || []) {
    const pet = Array.isArray(v.pet) ? v.pet[0] : v.pet;
    const tutor = pet ? (Array.isArray(pet.tutor) ? pet.tutor[0] : pet.tutor) : null;
    if (!tutor?.email) continue;

    const dataFormatada = v.data_agendada
      ? new Date(v.data_agendada + 'T00:00:00').toLocaleDateString('pt-BR')
      : '';

    try {
      await resend.emails.send({
        from: 'PetLove <onboarding@resend.dev>',
        to: tutor.email,
        subject: `Lembrete: vacina de ${pet?.nome || 'seu pet'} está chegando`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed;">Lembrete de Vacina 🐾</h1>
            <p>Oi${tutor.nome ? ` ${tutor.nome}` : ''}! A vacina <strong>${v.titulo}</strong> de <strong>${pet?.nome || 'seu pet'}</strong> está agendada para <strong>${dataFormatada}</strong>.</p>
            <p>Não esqueça de agendar a consulta com o veterinário!</p>
            <a href="https://petlove-mvp.vercel.app/vida" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
              Ver linha do tempo
            </a>
          </div>
        `,
      });
      await supabaseAdmin.from('momento').update({ lembrete_enviado_em: new Date().toISOString() }).eq('id', v.id);
      enviados++;
    } catch (err) {
      console.error('Falha ao enviar lembrete de vacina:', err);
      falhas++;
    }
  }

  return NextResponse.json({ success: true, enviados, falhas, total: (vacinas || []).length });
}
