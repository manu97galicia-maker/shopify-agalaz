import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PARTNER_ID = '5c330464-b605-44a3-af87-8ed68084c24c';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const PRODUCTS = [
  { id: 1,  name: 'Camiseta Básica Blanca',   price: 1999, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', cat: 'top',       color: 'white',   style: 'casual' },
  { id: 2,  name: 'Camiseta Oversize Negra',  price: 2499, img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', cat: 'top',       color: 'black',   style: 'streetwear' },
  { id: 3,  name: 'Camiseta Rayas Azul',      price: 2250, img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80', cat: 'top',       color: 'blue',    style: 'casual' },
  { id: 4,  name: 'Polo Clásico Verde',       price: 2999, img: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80', cat: 'top',       color: 'green',   style: 'classic' },
  { id: 5,  name: 'Jeans Slim Azul',          price: 4999, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', cat: 'bottom',    color: 'blue',    style: 'casual' },
  { id: 6,  name: 'Pantalón Chino Beige',     price: 4499, img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80', cat: 'bottom',    color: 'brown',   style: 'classic' },
  { id: 7,  name: 'Jogger Gris',              price: 3499, img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', cat: 'bottom',    color: 'grey',    style: 'streetwear' },
  { id: 8,  name: 'Pantalón Cargo Verde',     price: 5499, img: 'https://images.unsplash.com/photo-1551854838-212c9a5e4b43?w=800&q=80', cat: 'bottom',    color: 'green',   style: 'streetwear' },
  { id: 9,  name: 'Chaqueta Bomber Negra',    price: 7999, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', cat: 'outerwear', color: 'black',   style: 'streetwear' },
  { id: 10, name: 'Parka Invierno',           price: 11999,img: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80', cat: 'outerwear', color: 'neutral', style: 'classic' },
  { id: 11, name: 'Cazadora Vaquera',         price: 6999, img: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&q=80', cat: 'outerwear', color: 'blue',    style: 'casual' },
  { id: 12, name: 'Sudadera con Capucha',     price: 3999, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', cat: 'outerwear', color: 'grey',    style: 'streetwear' },
];

const SIZES = ['S', 'M', 'L'];

function handleFromName(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function run() {
  const now = new Date().toISOString();

  const rows = PRODUCTS.map((p) => ({
    partner_id: PARTNER_ID,
    shopify_product_id: String(p.id),
    handle: handleFromName(p.name),
    title: p.name,
    description: `${p.name} — prenda de prueba para el test ecommerce.`,
    vendor: 'Test Store',
    product_type: p.cat,
    tags: [p.cat, p.color, p.style],
    featured_image_url: p.img,
    status: 'active',
    primary_category: p.cat,
    style: p.style,
    color_family: p.color,
    classified_at: now,
    synced_at: now,
  }));

  const { data: inserted, error } = await admin
    .from('products')
    .upsert(rows, { onConflict: 'partner_id,shopify_product_id' })
    .select('id, shopify_product_id, title');

  if (error) { console.error('Product upsert error:', error); process.exit(1); }
  console.log(`✅ Upserted ${inserted.length} products`);

  const variantRows = [];
  for (const row of inserted) {
    const product = PRODUCTS.find((p) => String(p.id) === row.shopify_product_id);
    if (!product) continue;
    SIZES.forEach((size, idx) => {
      variantRows.push({
        product_id: row.id,
        shopify_variant_id: `${product.id}${idx + 1}`,
        title: `${product.name} / ${size}`,
        price_cents: product.price,
        currency: 'EUR',
        available: true,
        size,
        color: product.color,
      });
    });
  }

  const { error: varErr, count } = await admin
    .from('product_variants')
    .upsert(variantRows, { onConflict: 'product_id,shopify_variant_id', count: 'exact' });

  if (varErr) { console.error('Variant upsert error:', varErr); process.exit(1); }
  console.log(`✅ Upserted ${variantRows.length} variants`);

  const { count: total } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', PARTNER_ID);
  console.log(`📊 Partner now has ${total} products total`);
}

run().catch((e) => { console.error(e); process.exit(1); });
