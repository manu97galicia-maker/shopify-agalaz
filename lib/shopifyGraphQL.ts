const API_VERSION = '2024-10';

export async function shopifyGraphQL<T = any>(
  shop: string,
  accessToken: string,
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify GraphQL ${res.status}: ${text.substring(0, 300)}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors).substring(0, 300)}`);
  }
  return json.data;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: string;
  featuredImage: { url: string } | null;
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        price: string;
        availableForSale: boolean;
        selectedOptions: { name: string; value: string }[];
      };
    }[];
  };
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, query: "status:active") {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          description
          vendor
          productType
          tags
          status
          featuredImage { url }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price
                availableForSale
                selectedOptions { name value }
              }
            }
          }
        }
      }
    }
  }
`;

export async function* iterateAllProducts(
  shop: string,
  accessToken: string,
  pageSize: number = 100,
): AsyncGenerator<ShopifyProduct[]> {
  let cursor: string | null = null;
  while (true) {
    const data: any = await shopifyGraphQL(shop, accessToken, PRODUCTS_QUERY, {
      first: pageSize,
      after: cursor,
    });
    const edges = data?.products?.edges || [];
    const batch: ShopifyProduct[] = edges.map((e: any) => e.node);
    if (batch.length > 0) yield batch;
    if (!data?.products?.pageInfo?.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
}

const SINGLE_PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      handle
      title
      description
      vendor
      productType
      tags
      status
      featuredImage { url }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price
            availableForSale
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

export async function fetchProduct(
  shop: string,
  accessToken: string,
  productGid: string,
): Promise<ShopifyProduct | null> {
  const data: any = await shopifyGraphQL(shop, accessToken, SINGLE_PRODUCT_QUERY, { id: productGid });
  return data?.product || null;
}

export function shopifyGidToId(gid: string): string {
  const parts = gid.split('/');
  return parts[parts.length - 1];
}
