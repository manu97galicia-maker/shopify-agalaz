import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'agalaz-shopify',
    version: '2.0.0',
  });
}
