import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  planejarImportacao,
  validarArquivoMapeamento,
  type LinhaMapeamento,
  type ParceiroExistente,
} from './mapeamentoImport';
import { ORIGEM_MAPEAMENTO_MARINGA, numeroWhatsappParceiro } from '@/lib/partnerWhatsapp';

// A lista real tem WhatsApp de lojistas e fica fora do git (repositório
// público). Os testes dela só rodam na máquina que tem o arquivo.
const ARQUIVO_LOCAL = join(process.cwd(), 'data', 'mapeamentoMaringa.json');
const mapeamento: unknown[] = existsSync(ARQUIVO_LOCAL)
  ? JSON.parse(readFileSync(ARQUIVO_LOCAL, 'utf8'))
  : [];
const temArquivoLocal = mapeamento.length > 0;

function linha(parcial: Partial<LinhaMapeamento>): LinhaMapeamento {
  return {
    nome: 'Pet Feliz',
    tipo: 'petshop',
    cidade: 'Maringá',
    endereco: 'Av. Brasil, 100',
    telefone: '(44) 99999-0000',
    whatsapp: '5544999990000',
    instagram: 'petfeliz',
    website: null,
    avaliacao: 4.8,
    servicos: ['Banho e tosa'],
    plantao24h: false,
    lat: -23.42,
    lng: -51.93,
    ...parcial,
  };
}

function existente(parcial: Partial<ParceiroExistente>): ParceiroExistente {
  return {
    id: 'p1',
    nome: 'Pet Feliz',
    tipo: 'petshop',
    cidade: 'Maringá',
    endereco: 'Av. Brasil, 100',
    telefone: null,
    whatsapp: null,
    instagram: null,
    website: null,
    avaliacao: null,
    lat: null,
    lng: null,
    ...parcial,
  };
}

describe('planejarImportacao', () => {
  it('cria linha nova como listagem grátis, marcada com a origem', () => {
    const plano = planejarImportacao([], [linha({})]);

    expect(plano.atualizar).toHaveLength(0);
    expect(plano.inserir).toHaveLength(1);
    expect(plano.inserir[0]).toMatchObject({
      nome: 'Pet Feliz',
      premium: false,
      destaque: false,
      status: 'pending',
      estado: 'PR',
      whatsapp: '5544999990000',
      origem: ORIGEM_MAPEAMENTO_MARINGA,
    });
  });

  it('completa só os campos vazios de quem já existe, sem sobrescrever', () => {
    const plano = planejarImportacao(
      [existente({ telefone: '(44) 3000-0000', avaliacao: 3.5 })],
      [linha({})],
    );

    expect(plano.inserir).toHaveLength(0);
    expect(plano.atualizar).toEqual([
      {
        id: 'p1',
        campos: { whatsapp: '5544999990000', instagram: 'petfeliz', lat: -23.42, lng: -51.93 },
      },
    ]);
  });

  it('reconhece a mesma loja com nome escrito diferente pelo endereço + tipo', () => {
    const plano = planejarImportacao(
      [existente({ nome: 'Prontodog', tipo: 'veterinario', endereco: 'Av. São Paulo, 1654' })],
      [linha({ nome: 'ProntoDog & Cat Clínica Veterinária', tipo: 'veterinario', endereco: 'Av. Sao Paulo, 1654' })],
    );

    expect(plano.inserir).toHaveLength(0);
    expect(plano.atualizar[0].id).toBe('p1');
  });

  it('mantém filiais de mesmo nome como lojas separadas', () => {
    const plano = planejarImportacao(
      [],
      [linha({ endereco: 'R. Santos Dumont, 2230' }), linha({ endereco: 'Av. Paraná, 1365' })],
    );

    expect(plano.inserir).toHaveLength(2);
  });

  it('rodar de novo depois de importar não duplica nada', () => {
    const linhas = temArquivoLocal
      ? (mapeamento as LinhaMapeamento[])
      : [linha({}), linha({ nome: 'Vet Sol', tipo: 'veterinario', endereco: 'Rua A, 1' })];
    const primeira = planejarImportacao([], linhas);
    expect(primeira.inserir).toHaveLength(linhas.length);

    const noBanco = primeira.inserir.map((row, i) => ({ id: `id-${i}`, ...row })) as unknown as ParceiroExistente[];
    const segunda = planejarImportacao(noBanco, linhas);

    expect(segunda.inserir).toHaveLength(0);
    expect(segunda.atualizar).toHaveLength(0);
    expect(segunda.semMudanca).toBe(linhas.length);
  });
});

describe.skipIf(!temArquivoLocal)('arquivo do mapeamento (só na máquina local)', () => {
  const linhas = mapeamento as LinhaMapeamento[];

  it('passa na conferência que o servidor faz antes de importar', () => {
    expect(validarArquivoMapeamento(mapeamento)).toMatchObject({ ok: true });
  });

  it('tem as 631 lojas das 4 cidades, 385 com WhatsApp', () => {
    expect(linhas).toHaveLength(631);
    expect(new Set(linhas.map((l) => l.cidade))).toEqual(
      new Set(['Maringá', 'Sarandi', 'Paiçandu', 'Marialva']),
    );
    expect(linhas.filter((l) => l.whatsapp)).toHaveLength(385);
  });

  it('não leva telefone nenhum para o mapa: fixo é descartado e celular fica só no WhatsApp do admin', () => {
    expect(linhas.filter((l) => l.telefone)).toHaveLength(0);
    const fixos = linhas.filter((l) => l.whatsapp && !/^55\d{2}9\d{8}$/.test(l.whatsapp));
    expect(fixos.map((l) => l.nome)).toEqual(['Inuvet - Clínica Veterinária']);
  });

  it('só usa tipos que o mapa sabe desenhar e WhatsApp só com dígitos', () => {
    const tipos = new Set(['veterinario', 'petshop', 'creche', 'hotel', 'adestrador']);
    for (const l of linhas) {
      expect(tipos.has(l.tipo)).toBe(true);
      if (l.whatsapp) expect(l.whatsapp).toMatch(/^55\d{10,11}$/);
      if (l.instagram) expect(l.instagram).toMatch(/^[A-Za-z0-9._]+$/);
    }
  });
});

describe('validarArquivoMapeamento', () => {
  it('aceita uma lista bem formada e devolve as linhas', () => {
    const r = validarArquivoMapeamento([linha({ telefone: null })]);
    expect(r).toEqual({ ok: true, linhas: [linha({ telefone: null })] });
  });

  it('recusa o que não é uma lista, ou lista vazia', () => {
    expect(validarArquivoMapeamento({ nome: 'x' })).toMatchObject({ ok: false });
    expect(validarArquivoMapeamento([])).toMatchObject({ ok: false });
  });

  it('recusa telefone: o mapa mostraria o número na listagem grátis', () => {
    const r = validarArquivoMapeamento([linha({})]);
    expect(r).toMatchObject({ ok: false });
    if (!r.ok) expect(r.erro).toMatch(/linha 1.*telefone/i);
  });

  it('recusa tipo que o mapa não desenha, WhatsApp fora do padrão e coordenada inválida', () => {
    for (const ruim of [
      { tipo: 'farmacia' },
      { whatsapp: '(44) 99999-0000' },
      { instagram: 'perfil com espaço' },
      { lat: Number.NaN },
      { nome: '' },
      { website: 'javascript:alert(1)' },
      { avaliacao: 7 },
    ]) {
      expect(validarArquivoMapeamento([linha({ telefone: null, ...ruim })])).toMatchObject({ ok: false });
    }
  });

  it('aceita campos opcionais vazios', () => {
    const r = validarArquivoMapeamento([
      linha({ telefone: null, endereco: null, whatsapp: null, instagram: null, avaliacao: null, servicos: null }),
    ]);
    expect(r).toMatchObject({ ok: true });
  });
});

describe('numeroWhatsappParceiro', () => {
  it('usa a coluna whatsapp quando existe', () => {
    expect(numeroWhatsappParceiro({ whatsapp: '5544999990000', telefone: '(44) 3000-0000' })).toBe('5544999990000');
  });

  it('loja do mapeamento sem WhatsApp fica fora da fila (telefone fixo)', () => {
    expect(
      numeroWhatsappParceiro({ whatsapp: null, telefone: '(44) 3028-8687', origem: ORIGEM_MAPEAMENTO_MARINGA }),
    ).toBeNull();
  });

  it('parceiro antigo continua usando o telefone', () => {
    expect(numeroWhatsappParceiro({ telefone: '(44) 99999-0000' })).toBe('5544999990000');
    expect(numeroWhatsappParceiro({ telefone: 'sadsa' })).toBeNull();
  });
});
