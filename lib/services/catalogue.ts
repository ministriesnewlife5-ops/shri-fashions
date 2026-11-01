import { createPublicServerClient } from '@/lib/supabase/server';
import { Product, Category, Collection } from '@/lib/types/database';

export interface ProductFilterParams {
  category?: string;
  collection?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popularity';
  search?: string;
  limit?: number;
}

// Fetch active categories from Supabase
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.warn('Error fetching categories from Supabase:', error?.message);
      return [];
    }
    return data as Category[];
  } catch (err) {
    console.error('Failed to query categories:', err);
    return [];
  }
}

// Fetch published collections from Supabase
export async function getCollections(): Promise<Collection[]> {
  try {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.warn('Error fetching collections from Supabase:', error?.message);
      return [];
    }
    return data as Collection[];
  } catch (err) {
    console.error('Failed to query collections:', err);
    return [];
  }
}

// Fetch a single collection by slug from Supabase including its assigned products
export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const supabase = createPublicServerClient();
    const { data: collection, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !collection) {
      return null;
    }

    // Fetch associated collection products via junction table
    const { data: junction } = await supabase
      .from('collection_products')
      .select(`
        product_id,
        sort_order,
        product:products(
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        )
      `)
      .eq('collection_id', collection.id)
      .order('sort_order', { ascending: true });

    const products = (junction?.map((j: any) => j.product).filter(Boolean) as Product[]) || [];

    return {
      ...collection,
      products,
    };
  } catch (err) {
    console.error(`Failed to query collection by slug "${slug}":`, err);
    return null;
  }
}

// Fetch active products with category, images, and variants from Supabase
export async function getProducts(params?: ProductFilterParams): Promise<Product[]> {
  try {
    const supabase = createPublicServerClient();

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('status', 'active');

    // Filter by category if category parameter is a UUID or slug
    if (params?.category) {
      // Check if param is a UUID or slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.category);
      if (isUuid) {
        query = query.eq('category_id', params.category);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Error fetching products from Supabase:', error?.message);
      return [];
    }

    let filtered = data as Product[];

    // Filter by category slug if string slug was passed
    if (params?.category && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.category)) {
      filtered = filtered.filter((p) => p.category?.slug === params.category);
    }

    // Search query filter
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    // Size filter
    if (params?.size) {
      filtered = filtered.filter((p) =>
        p.variants?.some(
          (v) =>
            v.size.toLowerCase() === params.size?.toLowerCase() &&
            (params.inStockOnly ? v.stock_quantity > 0 : true)
        )
      );
    }

    // Color filter
    if (params?.color) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v) =>
          v.color_name.toLowerCase().includes(params.color!.toLowerCase())
        )
      );
    }

    // Price range filters
    if (params?.minPrice !== undefined) {
      filtered = filtered.filter((p) => {
        const prices = p.variants?.map((v) => v.price_paise) || [];
        const minVariantPrice = prices.length > 0 ? Math.min(...prices) : 0;
        return minVariantPrice >= params.minPrice!;
      });
    }

    if (params?.maxPrice !== undefined) {
      filtered = filtered.filter((p) => {
        const prices = p.variants?.map((v) => v.price_paise) || [];
        const minVariantPrice = prices.length > 0 ? Math.min(...prices) : 0;
        return minVariantPrice <= params.maxPrice!;
      });
    }

    // In stock only filter
    if (params?.inStockOnly) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v) => v.stock_quantity > 0 && v.is_active)
      );
    }

    // Sorting
    if (params?.sort) {
      switch (params.sort) {
        case 'price-asc':
          filtered.sort((a, b) => {
            const aPrice = Math.min(...(a.variants?.map((v) => v.price_paise) || [0]));
            const bPrice = Math.min(...(b.variants?.map((v) => v.price_paise) || [0]));
            return aPrice - bPrice;
          });
          break;
        case 'price-desc':
          filtered.sort((a, b) => {
            const aPrice = Math.min(...(a.variants?.map((v) => v.price_paise) || [0]));
            const bPrice = Math.min(...(b.variants?.map((v) => v.price_paise) || [0]));
            return bPrice - aPrice;
          });
          break;
        case 'newest':
        default:
          filtered.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
      }
    }

    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  } catch (err) {
    console.error('Failed to query products from Supabase:', err);
    return [];
  }
}

// Fetch single product by slug from Supabase
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Sort images by sort_order
    if (data.images && Array.isArray(data.images)) {
      data.images.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    return data as Product;
  } catch (err) {
    console.error(`Failed to query product by slug "${slug}":`, err);
    return null;
  }
}

// Fetch featured products
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  try {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .limit(limit);

    if (error || !data) {
      return [];
    }
    return data as Product[];
  } catch {
    return [];
  }
}

// Fetch best selling active products
export async function getBestSellers(limit = 4): Promise<Product[]> {
  const products = await getProducts({ limit });
  return products;
}

// Fetch related products for product details page
export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  try {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('status', 'active')
      .neq('id', productId)
      .limit(limit);

    if (error || !data) {
      return [];
    }
    return data as Product[];
  } catch {
    return [];
  }
}
