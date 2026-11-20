'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ANTECEDENCIA_MIN, agoraNoFuso, chaveLembrete, horaParaMinutos, jaPassouDoAviso, type ListaRotina } from '@/lib/lembretes';
import type { SuporteNotificacao } from '@/lib/useNotifications';

export interface LembreteRotina {
  id: string;
  nome: string;
  hora: string;
  detalhe: string | null;
}

/** Lembretes (sinos ligados) de um pet numa lista. */
export async function buscarLembretes(petId: string, lista: ListaRotina): Promise<LembreteRotina[]> {
  const { data } = await createClient()
    .from('lembrete_rotina')
    .select('id, nome, hora, detalhe')
    .eq('pet_id', petId)
    .eq('lista', lista);
  return (data || []) as LembreteRotina[];
}

// Se o horário de hoje já passou, marca hoje como "avisado" — senão o
// despertador mandaria um aviso atrasado logo depois de ligar o sino.
function envioInicial(hora: string): string | null {
  const agora = agoraNoFuso(new Date());
  return jaPassouDoAviso(hora, agora.minutos) ? agora.dia : null;
}

/** Liga/desliga o sino dos compromissos de um pet (vale para todos os dias). */
export function useLembretesRotina(petId: string | undefined, lista: ListaRotina) {
  const [lembretes, setLembretes] = useState<LembreteRotina[]>([]);

  useEffect(() => {
    if (!petId) return;
    let ativo = true;
    buscarLembretes(petId, lista).then((l) => ativo && setLembretes(l));
    return () => {
      ativo = false;
    };
  }, [petId, lista]);

  const achar = useCallback(
    (nome: string, hora: string) => lembretes.find((l) => chaveLembrete(l.nome, l.hora) === chaveLembrete(nome, hora)),
    [lembretes]
  );

  const ligado = useCallback((nome: string, hora: string) => !!achar(nome, hora), [achar]);

  /** Retorna true se o sino ficou ligado. */
  const alternar = useCallback(
    async (item: { nome: string; hora: string; detalhe?: string | null }): Promise<boolean> => {
      if (!petId) return false;
      const supabase = createClient();
      const existente = achar(item.nome, item.hora);
      if (existente) {
        setLembretes((prev) => prev.filter((l) => l.id !== existente.id));
        await supabase.from('lembrete_rotina').delete().eq('id', existente.id);
        return false;
      }
      const novo: LembreteRotina = { id: crypto.randomUUID(), nome: item.nome, hora: item.hora, detalhe: item.detalhe ?? null };
      setLembretes((prev) => [...prev, novo]);
      const { error } = await supabase.from('lembrete_rotina').insert({
        ...novo,
        pet_id: petId,
        lista,
        ultimo_envio_dia: envioInicial(item.hora),
      });
      if (error) {
        setLembretes((prev) => prev.filter((l) => l.id !== novo.id));
        return false;
      }
      return true;
    },
    [petId, lista, achar]
  );

  /** O compromisso mudou de horário: o sino acompanha. */
  const mudarHora = useCallback(
    (nome: string, horaAntiga: string, horaNova: string) => {
      const existente = achar(nome, horaAntiga);
      if (!existente || horaParaMinutos(horaNova) === null) return;
      setLembretes((prev) => prev.map((l) => (l.id === existente.id ? { ...l, hora: horaNova } : l)));
      createClient()
        .from('lembrete_rotina')
        .update({ hora: horaNova, ultimo_envio_dia: envioInicial(horaNova) })
        .eq('id', existente.id)
        .then();
    },
    [achar]
  );

  /** O compromisso foi removido da rotina: para de avisar. */
  const remover = useCallback(
    (nome: string, hora: string) => {
      const existente = achar(nome, hora);
      if (!existente) return;
      setLembretes((prev) => prev.filter((l) => l.id !== existente.id));
      createClient().from('lembrete_rotina').delete().eq('id', existente.id).then();
    },
    [achar]
  );

  return { ligado, alternar, mudarHora, remover };
}

/**
 * Ao ligar um sino: garante que este aparelho pode receber notificações.
 * Precisa rodar ANTES de qualquer await (o iPhone só mostra o pedido de
 * permissão logo após o toque). Retorna o recado para mostrar ao tutor.
 */
export async function prepararAvisos(notif: {
  suporte: SuporteNotificacao;
  permission: NotificationPermission;
  requestPermission: () => Promise<string | null>;
}): Promise<{ ok: boolean; recado: string }> {
  const certo = `Pronto! Você recebe um aviso ${ANTECEDENCIA_MIN} min antes, todo dia.`;
  if (notif.suporte === 'instalar-no-iphone') {
    return { ok: false, recado: 'Lembrete salvo. No iPhone, adicione o Patinha à Tela de Início para receber o aviso.' };
  }
  if (notif.suporte === 'nao') {
    return { ok: false, recado: 'Lembrete salvo, mas este navegador não recebe notificações.' };
  }
  if (notif.permission === 'granted') return { ok: true, recado: certo };
  if (notif.permission === 'denied') {
    return { ok: false, recado: 'Lembrete salvo, mas as notificações estão bloqueadas. Libere nos ajustes do aparelho.' };
  }
  const token = await notif.requestPermission();
  return token
    ? { ok: true, recado: certo }
    : { ok: false, recado: 'Lembrete salvo, mas as notificações não foram ativadas. Veja em Minha conta.' };
}
