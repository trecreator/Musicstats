export async function GET() {
  return Response.json({
    ok: true,
    DB_HOST: process.env.DB_HOST || null,
  });
}