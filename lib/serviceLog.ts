import { z } from 'zod';

// Regras comuns para registrar um atendimento (service_logs), seja o tutor
// confirmando em /mapa ou o parceiro registrando em /parceiro/dashboard.
// Sem isso dava pra gravar texto gigante, datas no futuro ou de 1990 e
// inflar o gráfico de um parceiro.

const MAX_DAYS_BACK = 365;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Aceita "AAAA-MM-DD" de até 1 ano atrás até amanhã (folga de fuso horário). */
export function isReasonableServiceDate(value: string, now: Date = new Date()): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayMs = 24 * 60 * 60 * 1000;
  return date.getTime() <= today + dayMs && date.getTime() >= today - MAX_DAYS_BACK * dayMs;
}

const tipoServico = z.string().trim().min(1).max(60);
const dataServico = z
  .string()
  .refine((v) => isReasonableServiceDate(v), 'Data inválida (use uma data do último ano)');
const uuid = z.string().uuid();

export const tutorServiceLogSchema = z.object({
  partnerId: uuid,
  petId: uuid,
  tipoServico,
  data: dataServico,
});

export const partnerServiceLogSchema = z.object({
  tipoServico,
  data: dataServico,
  clienteNome: z.string().trim().max(120).optional().nullable(),
  observacao: z.string().trim().max(500).optional().nullable(),
});
