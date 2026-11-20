import { describe, expect, it } from 'vitest';
import {
  agoraNoFuso,
  chaveLembrete,
  extrasDaRotina,
  horaParaMinutos,
  jaPassouDoAviso,
  minutosParaAvisar,
  textoLembrete,
} from './lembretes';

describe('horaParaMinutos', () => {
  it('converte horários válidos', () => {
    expect(horaParaMinutos('07:30')).toBe(450);
    expect(horaParaMinutos('00:00')).toBe(0);
    expect(horaParaMinutos('23:59')).toBe(1439);
  });
  it('recusa lixo', () => {
    expect(horaParaMinutos('24:00')).toBeNull();
    expect(horaParaMinutos('7h')).toBeNull();
    expect(horaParaMinutos('')).toBeNull();
  });
});

describe('agoraNoFuso', () => {
  it('usa o horário de Brasília, não o do servidor', () => {
    // 10:00 UTC = 07:00 em Brasília (UTC-3)
    expect(agoraNoFuso(new Date('2026-11-19T10:00:00Z'))).toEqual({ dia: '2026-11-19', minutos: 420 });
  });
  it('vira o dia certo perto da meia-noite', () => {
    // 02:30 UTC do dia 20 = 23:30 do dia 19 em Brasília
    expect(agoraNoFuso(new Date('2026-11-20T02:30:00Z'))).toEqual({ dia: '2026-11-19', minutos: 1410 });
  });
});

describe('minutosParaAvisar', () => {
  const base = { hora: '07:00', hoje: '2026-11-19', ultimoEnvioDia: null };
  it('avisa a partir de 15 min antes', () => {
    expect(minutosParaAvisar({ ...base, minutosAgora: 6 * 60 + 45 })).toBe(15);
    expect(minutosParaAvisar({ ...base, minutosAgora: 6 * 60 + 50 })).toBe(10);
  });
  it('não avisa cedo demais', () => {
    expect(minutosParaAvisar({ ...base, minutosAgora: 6 * 60 + 44 })).toBeNull();
  });
  it('ainda avisa logo depois do horário (atraso do despertador)', () => {
    expect(minutosParaAvisar({ ...base, minutosAgora: 7 * 60 + 5 })).toBe(-5);
  });
  it('não avisa muito depois do horário', () => {
    expect(minutosParaAvisar({ ...base, minutosAgora: 7 * 60 + 11 })).toBeNull();
  });
  it('avisa só uma vez por dia', () => {
    expect(minutosParaAvisar({ ...base, minutosAgora: 6 * 60 + 50, ultimoEnvioDia: '2026-11-19' })).toBeNull();
    expect(minutosParaAvisar({ ...base, minutosAgora: 6 * 60 + 50, ultimoEnvioDia: '2026-11-18' })).toBe(10);
  });
});

describe('jaPassouDoAviso', () => {
  it('detecta horário que já passou hoje', () => {
    expect(jaPassouDoAviso('07:00', 7 * 60 + 1)).toBe(true);
    expect(jaPassouDoAviso('07:00', 6 * 60 + 59)).toBe(false);
  });
});

describe('textoLembrete', () => {
  it('fala quanto falta e leva para a tela certa', () => {
    const t = textoLembrete({ lista: 'atividade', nome: 'Passeio matinal', hora: '07:00', petNome: 'Mel', faltam: 15 });
    expect(t.titulo).toBe('Passeio matinal de Mel em 15 min 🐾');
    expect(t.caminho).toBe('/atividades');
  });
  it('diz "agora" quando está na hora', () => {
    const t = textoLembrete({ lista: 'refeicao', nome: 'Jantar', hora: '18:00', petNome: 'Thor', faltam: 0 });
    expect(t.titulo).toBe('Jantar de Thor agora 🍽️');
    expect(t.caminho).toBe('/racao');
  });
});

describe('extrasDaRotina', () => {
  it('traz só os compromissos com sino que não estão no padrão', () => {
    const padrao = [{ nome: 'Passeio matinal', hora: '07:00' }];
    const lembretes = [
      { nome: 'passeio matinal', hora: '07:00', detalhe: '🐕' },
      { nome: 'Remédio', hora: '21:00', detalhe: '💊' },
    ];
    expect(extrasDaRotina(padrao, lembretes)).toEqual([{ nome: 'Remédio', hora: '21:00', detalhe: '💊' }]);
  });
  it('chave ignora maiúsculas e espaços', () => {
    expect(chaveLembrete(' Jantar ', '18:00')).toBe(chaveLembrete('jantar', '18:00'));
  });
});
