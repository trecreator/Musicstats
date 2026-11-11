// O mysql2 não reconhece o parâmetro "ssl-mode" da URL (formato Aiven/PlanetScale etc.)
// e gera o aviso "Ignoring invalid configuration option ... ssl-mode" em toda requisição.
// Aqui removemos o parâmetro da URL e configuramos o SSL do jeito que o mysql2 entende.
export function configDaDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get("ssl-mode") ?? url.searchParams.get("sslmode");
  url.searchParams.delete("ssl-mode");
  url.searchParams.delete("sslmode");

  const usarSsl = sslMode !== null && sslMode.toUpperCase() !== "DISABLED";
  return {
    uri: url.toString(),
    ...(usarSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}
