// Blog kategorileri endpoint'i
import { NextResponse } from 'next/server';
import type { BlogCategory } from '@/types/blog';

const categories: BlogCategory[] = [
  { id: '1', name: 'Kariyer', slug: 'kariyer' },
  { id: '2', name: 'Tasarım', slug: 'tasarim' },
  { id: '3', name: 'Productivity', slug: 'productivity' },
];

export async function GET() {
  return NextResponse.json(categories);
}
