import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { timingSafeEqual, createHash } from 'crypto';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const expectedToken = process.env.REVALIDATE_TOKEN;

  if (!expectedToken) {
    return NextResponse.json({ error: 'server misconfiguration' }, { status: 500 });
  }

  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const tokenHash = createHash('sha256').update(token).digest();
  const expectedHash = createHash('sha256').update(expectedToken).digest();

  if (!timingSafeEqual(tokenHash, expectedHash)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  revalidatePath('/transportes');
  return NextResponse.json({ revalidated: true }, { status: 200 });
}
