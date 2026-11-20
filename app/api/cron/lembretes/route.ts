import { NextRequest, NextResponse } from 'next/server';
import { cronAuthorized } from '@/lib/authz';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendPushNotification } from '@/lib/push';
import { getAppUrl } from '@/lib/appUrl';
import { agoraNoFuso, chaveLembrete, minutosParaAvisar, textoLembrete, type ListaRotina } from '@/lib/lembretes';

// Lembretes da rotina (sino nos compromissos de Atividades e Ração).
//
// Quem chama: um "despertador" do Supabase (pg_cron + pg_net) a cada 5 min —
// ver supabase/migrations/20261119_lembretes_rotina.sql. O Vercel Cron do
// plano grátis só roda 1x por dia, o que não serve para horários.
//
// Autorização: o CRON_SECRET da Vercel OU o token guardado no próprio banco
// (app_segredo 'cron_lembretes'), que é o que o pg_cron envia.

const NOME_SEGREDO = 'cron_lembretes';

type Admin = ReturnType<typeof getSupabaseAdmin>;

async function autorizado(req: NextRequest, admin: Admin): Promise<boolean> {
  if (cronAuthorized(req)) return true;
  if (!(req.headers.get('authorization') || '').startsWith('Bearer ')) return false;
  const { data } = await admin.from('app_segredo').select('valor').eq('nome', NOME_SEGREDO).maybeSingle();
  return !!data?.valor && cronAuthorized(req, data.valor as string);
}

interface LinhaLembrete {
  id: string;
  pet_id: string;
  lista: ListaRotina;
  nome: string;
  hora: string;
  ultimo_envio_dia: string | null;
  pet: { nome: string; tutor_id: string } | { nome: string; tutor_id: string }[] | null;
}

async function rodar(req: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!(await autorizado(req, admin))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { dia, minutos } = agoraNoFuso(new Date());
  const naoAvisadoHoje = `ultimo_envio_dia.is.null,ultimo_envio_dia.neq.${dia}`;

  const { data: linhas, error } = await admin
    .from('lembrete_rotina')
    .select('id, pet_id, lista, nome, hora, ultimo_envio_dia, pet:pet_id(nome, tutor_id)')
    .or(naoAvisadoHoje);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const agora = ((linhas || []) as LinhaLembrete[])
    .map((l) => ({ ...l, pet: Array.isArray(l.pet) ? l.pet[0] : l.pet }))
    .map((l) => ({ ...l, faltam: minutosParaAvisar({ hora: l.hora, minutosAgora: minutos, hoje: dia, ultimoEnvioDia: l.ultimo_envio_dia }) }))
    .filter((l): l is typeof l & { faltam: number; pet: { nome: string; tutor_id: string } } => l.faltam !== null && !!l.pet);

  if (agora.length === 0) return NextResponse.json({ success: true, enviados: 0, total: 0 });

  // Compromisso já marcado como feito hoje → não precisa avisar.
  const petIds = Array.from(new Set(agora.map((l) => l.pet_id)));
  const { data: feitos } = await admin
    .from('checklist_item')
    .select('pet_id, lista, nome, hora')
    .eq('dia', dia)
    .eq('concluida', true)
    .in('pet_id', petIds);
  const jaFeito = new Set((feitos || []).map((f) => `${f.pet_id}|${f.lista}|${chaveLembrete(f.nome, f.hora)}`));

  const tutorIds = Array.from(new Set(agora.map((l) => l.pet.tutor_id)));
  const { data: subs } = await admin.from('push_subscriptions').select('user_id, token').in('user_id', tutorIds);
  const tokenDo = new Map((subs || []).map((s) => [s.user_id as string, s.token as string]));
  const tokensInvalidos = new Set<string>();

  let enviados = 0;
  let pulados = 0;
  let falhas = 0;

  for (const l of agora) {
    // "Reserva" o aviso de hoje antes de enviar: se duas execuções se
    // cruzarem, só uma consegue marcar e a outra não manda repetido.
    const { data: reservado } = await admin
      .from('lembrete_rotina')
      .update({ ultimo_envio_dia: dia })
      .eq('id', l.id)
      .or(naoAvisadoHoje)
      .select('id');
    if (!reservado || reservado.length === 0) continue;

    const token = tokenDo.get(l.pet.tutor_id);
    if (jaFeito.has(`${l.pet_id}|${l.lista}|${chaveLembrete(l.nome, l.hora)}`) || !token || tokensInvalidos.has(token)) {
      pulados++;
      continue;
    }

    const t = textoLembrete({ lista: l.lista, nome: l.nome, hora: l.hora, petNome: l.pet.nome, faltam: l.faltam });
    const { sent, tokenInvalido } = await sendPushNotification(token, t.titulo, t.corpo, `${getAppUrl()}${t.caminho}`);
    if (sent) {
      enviados++;
    } else if (tokenInvalido) {
      tokensInvalidos.add(token);
      await admin.from('push_subscriptions').delete().eq('user_id', l.pet.tutor_id);
      pulados++;
    } else {
      // Falha passageira (Firebase fora do ar): libera para tentar de novo
      // na próxima volta do despertador, ainda dentro da janela do aviso.
      await admin.from('lembrete_rotina').update({ ultimo_envio_dia: l.ultimo_envio_dia }).eq('id', l.id);
      falhas++;
    }
  }

  return NextResponse.json({ success: true, enviados, pulados, falhas, total: agora.length });
}

export const GET = rodar;
export const POST = rodar;
