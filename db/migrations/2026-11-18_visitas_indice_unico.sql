-- Impede registros repetidos da mesma visita (mesma música, mesmo visitante, mesmo dia).
-- ATENÇÃO: o DELETE apaga definitivamente os registros duplicados. Faça um backup antes.

-- 1. Remove os duplicados, mantendo o registro mais antigo de cada grupo.
DELETE repetida
FROM musicas_visitas_log AS repetida
JOIN musicas_visitas_log AS original
  ON original.id_video = repetida.id_video
 AND original.ip_usuario = repetida.ip_usuario
 AND original.data_acesso = repetida.data_acesso
 AND original.id < repetida.id;

-- 2. Troca o índice comum por um índice único nas mesmas colunas.
ALTER TABLE musicas_visitas_log
  DROP INDEX idx_visitas_perf,
  ADD UNIQUE KEY uq_visita_por_dia (id_video, ip_usuario, data_acesso);
