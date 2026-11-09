-- Limite de tentativas compartilhado entre todas as instâncias da Vercel.
-- Antes, a contagem ficava na memória de cada função serverless, então um
-- atacante "furava" o limite só por cair em instâncias diferentes.
--
-- Usado por lib/authz.ts (rateLimitShared). Se esta migração ainda não foi
-- aplicada, o código cai de volta para a contagem em memória.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key        text PRIMARY KEY,
  count      integer     NOT NULL,
  reset_at   timestamptz NOT NULL
);

-- Ninguém do lado do cliente lê ou escreve aqui: só a função abaixo
-- (SECURITY DEFINER), chamada pelo servidor com a service role.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

-- Conta uma tentativa para `p_key` e devolve quantos segundos faltam para
-- liberar (0 = permitido). Atômico: um único UPSERT por chamada.
CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count    integer;
  v_reset_at timestamptz;
BEGIN
  INSERT INTO public.rate_limits AS r (key, count, reset_at)
  VALUES (p_key, 1, now() + make_interval(secs => p_window_seconds))
  ON CONFLICT (key) DO UPDATE
    SET count    = CASE WHEN r.reset_at <= now() THEN 1 ELSE r.count + 1 END,
        reset_at = CASE WHEN r.reset_at <= now() THEN now() + make_interval(secs => p_window_seconds) ELSE r.reset_at END
  RETURNING count, reset_at INTO v_count, v_reset_at;

  -- Faxina leve: ~1% das chamadas apaga janelas vencidas.
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE reset_at < now() - interval '1 hour';
  END IF;

  IF v_count > p_limit THEN
    RETURN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_reset_at - now())))::integer);
  END IF;
  RETURN 0;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(text, integer, integer) TO service_role;
