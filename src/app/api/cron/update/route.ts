import { NextResponse } from 'next/server';
import { atualizarYoutube } from '@/scripts/updateYoutubeStats';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const key = searchParams.get('key');

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Cron iniciado...');

    await atualizarYoutube();

    return NextResponse.json({
      success: true,
      message: 'Updater executado com sucesso',
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}