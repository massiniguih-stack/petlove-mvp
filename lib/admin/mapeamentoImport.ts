// Decide o que fazer com cada linha da planilha de mapeamento ao importar
// para `partners`: criar uma linha nova ou só completar uma que já existe.
// Função pura (sem banco) para dar pra testar e rodar de novo sem duplicar.

import { ORIGEM_MAPEAMENTO_MARINGA } from '@/lib/partnerWhatsapp';
import { TIPOS_SERVICO_MAPA } from '@/lib/tiposServico';

export interface LinhaMapeamento {
  nome: string;
  tipo: string;
  cidade: string;
  endereco: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  avaliacao: number | null;
  servicos: string[] | null;
  plantao24h: boolean;
  lat: number;
  lng: number;
}

export interface ParceiroExistente {
  id: string;
  nome: string;
  tipo: string | null;
  cidade: string | null;
  endereco: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  avaliacao: number | null;
  lat: number | null;
  lng: number | null;
}

// Campos que a planilha pode completar numa linha que já existia. Só entra
// onde está vazio: nunca sobrescreve o que a equipe ou o parceiro já editou.
const CAMPOS_COMPLETAVEIS = [
  'whatsapp',
  'telefone',
  'instagram',
  'website',
  'avaliacao',
  'endereco',
  'lat',
  'lng',
] as const;

type CampoCompletavel = (typeof CAMPOS_COMPLETAVEIS)[number];

export interface PlanoImportacao {
  inserir: Record<string, unknown>[];
  atualizar: { id: string; campos: Partial<Record<CampoCompletavel, unknown>> }[];
  semMudanca: number;
}

export function normalizar(texto: string | null | undefined): string {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const chaveCompleta = (nome: string, cidade: string | null, endereco: string | null) =>
  `${normalizar(nome)}|${normalizar(cidade)}|${normalizar(endereco)}`;
const chaveNome = (nome: string, cidade: string | null) =>
  `${normalizar(nome)}|${normalizar(cidade)}`;
// Endereço só identifica um lugar se tiver número ("Av. Brasil" sozinho não).
const chaveEndereco = (endereco: string | null, cidade: string | null, tipo: string | null) =>
  endereco && /\d/.test(endereco)
    ? `${normalizar(endereco)}|${normalizar(cidade)}|${tipo || ''}`
    : null;

function agrupar<T>(itens: T[], chave: (item: T) => string | null): Map<string, T[]> {
  const mapa = new Map<string, T[]>();
  for (const item of itens) {
    const k = chave(item);
    if (!k) continue;
    const lista = mapa.get(k);
    if (lista) lista.push(item);
    else mapa.set(k, [item]);
  }
  return mapa;
}

function linhaNova(linha: LinhaMapeamento): Record<string, unknown> {
  return {
    tipo: linha.tipo,
    nome: linha.nome,
    endereco: linha.endereco,
    bairro: null,
    cidade: linha.cidade,
    estado: 'PR',
    telefone: linha.telefone,
    whatsapp: linha.whatsapp,
    instagram: linha.instagram,
    website: linha.website,
    avaliacao: linha.avaliacao,
    premium: false,
    // Mesmo status do funil de convites: aparece no mapa como listagem grátis.
    status: 'pending',
    lat: linha.lat,
    lng: linha.lng,
    servicos: linha.servicos,
    horario: null,
    destaque: false,
    plantao24h: linha.plantao24h,
    origem: ORIGEM_MAPEAMENTO_MARINGA,
  };
}

export function planejarImportacao(
  existentes: ParceiroExistente[],
  linhas: LinhaMapeamento[],
): PlanoImportacao {
  const porChaveCompleta = agrupar(existentes, (p) => chaveCompleta(p.nome, p.cidade, p.endereco));
  const porNome = agrupar(existentes, (p) => chaveNome(p.nome, p.cidade));
  const porEndereco = agrupar(existentes, (p) => chaveEndereco(p.endereco, p.cidade, p.tipo));
  const vezesNaPlanilha = agrupar(linhas, (l) => chaveNome(l.nome, l.cidade));

  const usados = new Set<string>();
  const livre = (lista: ParceiroExistente[] | undefined) => lista?.find((p) => !usados.has(p.id));

  const plano: PlanoImportacao = { inserir: [], atualizar: [], semMudanca: 0 };

  for (const linha of linhas) {
    const nomeCidade = chaveNome(linha.nome, linha.cidade);
    const candidatosNome = porNome.get(nomeCidade);
    // Mesmo nome na mesma cidade só vale como "é a mesma loja" quando não há
    // filiais com esse nome (nem no banco, nem na planilha).
    const nomeUnico =
      candidatosNome?.length === 1 && vezesNaPlanilha.get(nomeCidade)?.length === 1;
    const enderecoTipo = chaveEndereco(linha.endereco, linha.cidade, linha.tipo);

    const existente =
      livre(porChaveCompleta.get(chaveCompleta(linha.nome, linha.cidade, linha.endereco))) ||
      (nomeUnico ? livre(candidatosNome) : undefined) ||
      (enderecoTipo ? livre(porEndereco.get(enderecoTipo)) : undefined);

    if (!existente) {
      plano.inserir.push(linhaNova(linha));
      continue;
    }

    usados.add(existente.id);
    const campos: Partial<Record<CampoCompletavel, unknown>> = {};
    for (const campo of CAMPOS_COMPLETAVEIS) {
      const atual = existente[campo];
      const novo = linha[campo];
      if ((atual === null || atual === undefined || atual === '') && novo !== null) {
        campos[campo] = novo;
      }
    }
    if (Object.keys(campos).length === 0) plano.semMudanca += 1;
    else plano.atualizar.push({ id: existente.id, campos });
  }

  return plano;
}

// ---------------------------------------------------------------------------
// Conferência do arquivo enviado pelo admin. A lista real fica fora do git
// (tem WhatsApp de lojistas e o repositório é público), então chega pelo
// navegador e precisa ser checada linha a linha antes de tocar no banco.

const MAX_LINHAS = 5000;

export type ResultadoValidacao =
  | { ok: true; linhas: LinhaMapeamento[] }
  | { ok: false; erro: string };

const textoOuNulo = (v: unknown, max: number) =>
  v === null || v === undefined || (typeof v === 'string' && v.length <= max);
const numeroFinito = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function problemaNaLinha(l: Record<string, unknown>): string | null {
  if (typeof l.nome !== 'string' || !l.nome.trim() || l.nome.length > 200) return 'nome vazio ou longo demais';
  if (typeof l.tipo !== 'string' || !(TIPOS_SERVICO_MAPA as readonly string[]).includes(l.tipo))
    return `tipo "${String(l.tipo)}" não existe no mapa`;
  if (typeof l.cidade !== 'string' || !l.cidade.trim() || l.cidade.length > 100) return 'cidade vazia';
  if (!textoOuNulo(l.endereco, 300)) return 'endereço inválido';
  if (l.telefone !== null && l.telefone !== undefined)
    return 'tem telefone (o mapa mostraria o número na listagem grátis; use só a coluna whatsapp)';
  if (l.whatsapp != null && (typeof l.whatsapp !== 'string' || !/^55\d{10,11}$/.test(l.whatsapp)))
    return 'WhatsApp fora do padrão 55 + DDD + número, só dígitos';
  if (l.instagram != null && (typeof l.instagram !== 'string' || !/^[A-Za-z0-9._]{1,30}$/.test(l.instagram)))
    return 'Instagram inválido';
  if (l.website != null && (typeof l.website !== 'string' || l.website.length > 300 || !/^https?:\/\//i.test(l.website)))
    return 'site precisa começar com http:// ou https://';
  if (l.avaliacao != null && (!numeroFinito(l.avaliacao) || l.avaliacao < 0 || l.avaliacao > 5))
    return 'avaliação fora de 0 a 5';
  if (l.servicos != null && (!Array.isArray(l.servicos) || l.servicos.some((s) => typeof s !== 'string' || s.length > 100)))
    return 'serviços precisa ser uma lista de textos';
  if (l.plantao24h != null && typeof l.plantao24h !== 'boolean') return 'plantao24h precisa ser true/false';
  if (!numeroFinito(l.lat) || l.lat < -90 || l.lat > 90 || !numeroFinito(l.lng) || l.lng < -180 || l.lng > 180)
    return 'coordenadas (lat/lng) inválidas';
  return null;
}

export function validarArquivoMapeamento(entrada: unknown): ResultadoValidacao {
  if (!Array.isArray(entrada)) return { ok: false, erro: 'O arquivo precisa ser uma lista de lojas (JSON começando com "[").' };
  if (entrada.length === 0) return { ok: false, erro: 'O arquivo está vazio.' };
  if (entrada.length > MAX_LINHAS) return { ok: false, erro: `O arquivo passa de ${MAX_LINHAS} lojas.` };

  const linhas: LinhaMapeamento[] = [];
  for (let i = 0; i < entrada.length; i++) {
    const l = entrada[i];
    if (!l || typeof l !== 'object' || Array.isArray(l)) return { ok: false, erro: `Linha ${i + 1}: não é uma loja.` };
    const r = l as Record<string, unknown>;
    const problema = problemaNaLinha(r);
    if (problema) return { ok: false, erro: `Linha ${i + 1} (${String(r.nome ?? '?')}): ${problema}.` };
    linhas.push({
      nome: r.nome as string,
      tipo: r.tipo as string,
      cidade: r.cidade as string,
      endereco: (r.endereco as string | null | undefined) ?? null,
      telefone: null,
      whatsapp: (r.whatsapp as string | null | undefined) ?? null,
      instagram: (r.instagram as string | null | undefined) ?? null,
      website: (r.website as string | null | undefined) ?? null,
      avaliacao: (r.avaliacao as number | null | undefined) ?? null,
      servicos: (r.servicos as string[] | null | undefined) ?? null,
      plantao24h: r.plantao24h === true,
      lat: r.lat as number,
      lng: r.lng as number,
    });
  }
  return { ok: true, linhas };
}
