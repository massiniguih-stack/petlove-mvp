import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/authz';
import {
  planejarImportacao,
  validarArquivoMapeamento,
  type ParceiroExistente,
} from '@/lib/admin/mapeamentoImport';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const COLUNAS =
  'id, nome, tipo, cidade, endereco, telefone, whatsapp, instagram, website, avaliacao, lat, lng';
const PAGINA = 1000;
const LOTE = 100;

function faltaMigracao(mensagem: string) {
  return /whatsapp|origem/i.test(mensagem) && /column|schema cache/i.test(mensagem);
}

// POST: importa a planilha "mapeamento pet · maringá e região" para
// `partners`. Pode rodar mais de uma vez: quem já existe só tem os campos
// vazios completados (ver lib/admin/mapeamentoImport.ts).
// A lista vem no corpo da requisição (o admin escolhe o arquivo no
// navegador): ela tem WhatsApp de lojistas e não pode ficar no repositório.
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ error: 'O arquivo não é um JSON válido.' }, { status: 400 });
  }
  const validacao = validarArquivoMapeamento(corpo);
  if (!validacao.ok) {
    return NextResponse.json({ error: validacao.erro }, { status: 400 });
  }

  const linhas = validacao.linhas;
  const cidades = Array.from(new Set(linhas.map((l) => l.cidade)));
  const supabaseAdmin = getSupabaseAdmin();

  const existentes: ParceiroExistente[] = [];
  for (let inicio = 0; ; inicio += PAGINA) {
    const { data, error } = await supabaseAdmin
      .from('partners')
      .select(COLUNAS)
      .in('cidade', cidades)
      .order('id')
      .range(inicio, inicio + PAGINA - 1);

    if (error) {
      if (faltaMigracao(error.message)) {
        return NextResponse.json(
          {
            error:
              'Falta rodar a migração 20261113_partners_whatsapp_origem.sql no Supabase (SQL Editor) antes de importar.',
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    existentes.push(...((data || []) as ParceiroExistente[]));
    if (!data || data.length < PAGINA) break;
  }

  const plano = planejarImportacao(existentes, linhas);

  let inseridos = 0;
  for (let i = 0; i < plano.inserir.length; i += LOTE) {
    const lote = plano.inserir.slice(i, i + LOTE);
    const { error } = await supabaseAdmin.from('partners').insert(lote);
    if (error) {
      return NextResponse.json(
        { error: error.message, inseridos, hint: 'Pode rodar de novo: o que já entrou não duplica.' },
        { status: 500 },
      );
    }
    inseridos += lote.length;
  }

  let atualizados = 0;
  for (const { id, campos } of plano.atualizar) {
    const { error } = await supabaseAdmin.from('partners').update(campos).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message, inseridos, atualizados }, { status: 500 });
    }
    atualizados += 1;
  }

  return NextResponse.json({
    success: true,
    total: linhas.length,
    inseridos,
    atualizados,
    semMudanca: plano.semMudanca,
  });
}
