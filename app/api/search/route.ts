import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    const supabase = await createClient();

    let queryBuilder = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('status', 'active');

    if (query) {
      // Search by product name, description, or fabric
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,fabric.ilike.%${query}%`
      );
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(8);

    if (error || !data) {
      return NextResponse.json({ products: [] });
    }

    return NextResponse.json({ products: data });
  } catch (err: any) {
    console.error('Search API exception:', err);
    return NextResponse.json({ products: [] });
  }
}
