import { NextResponse } from 'next/server';
import { ApiError } from './solana/constants';

export function formatApiResponse(data: any) {
  if (data instanceof ApiError) {
    return NextResponse.json(
      { error: data.message, details: data.details },
      { status: data.statusCode }
    );
  }

  if (data instanceof Error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}