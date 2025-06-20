/**
 * Query Key Factory - Centralized query key management
 * Following the Query Key Factory pattern for ultimate maintainability
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

// Base query keys
const queryKeys = {
  // Shops query keys
  shops: {
    all: ['shops'] as const,
    lists: () => [...queryKeys.shops.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.shops.lists(), { ...filters }] as const,
    details: () => [...queryKeys.shops.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.shops.details(), id] as const,

    // Specific shop queries
    featured: () => [...queryKeys.shops.all, 'featured'] as const,
    recommended: () => [...queryKeys.shops.all, 'recommended'] as const,
    byCategory: (categoryId: string) =>
      [...queryKeys.shops.lists(), { category: categoryId }] as const,
    bySubcategory: (subcategoryId: string) =>
      [...queryKeys.shops.lists(), { subcategory: subcategoryId }] as const,
    byIds: (ids: string[]) =>
      [...queryKeys.shops.lists(), { ids: ids.sort().join(',') }] as const, // Sort IDs for consistent cache key
    search: (query: string) =>
      [...queryKeys.shops.all, 'search', query] as const,
  },

  // Categories query keys
  categories: {
    all: ['categories'] as const,
    main: () => [...queryKeys.categories.all, 'main'] as const,
    byId: (id: string) => [...queryKeys.categories.all, 'detail', id] as const,
  },

  // Special offers query keys
  specialOffers: {
    all: ['specialOffers'] as const,
    lists: () => [...queryKeys.specialOffers.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.specialOffers.lists(), { ...filters }] as const,
    details: () => [...queryKeys.specialOffers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.specialOffers.details(), id] as const,

    // Specific offer queries
    active: () =>
      [...queryKeys.specialOffers.lists(), { active: true }] as const,
    byCategory: (category: string) =>
      [...queryKeys.specialOffers.lists(), { category }] as const,
  },
} as const;

export default queryKeys;

// Export individual query key factories for convenience
export const shopKeys = queryKeys.shops;
export const categoryKeys = queryKeys.categories;
export const specialOfferKeys = queryKeys.specialOffers;

// Utility types for better TypeScript support
export type ShopQueryKey =
  | typeof queryKeys.shops.all
  | ReturnType<typeof queryKeys.shops.lists>
  | ReturnType<typeof queryKeys.shops.list>
  | ReturnType<typeof queryKeys.shops.details>
  | ReturnType<typeof queryKeys.shops.detail>
  | ReturnType<typeof queryKeys.shops.featured>
  | ReturnType<typeof queryKeys.shops.recommended>
  | ReturnType<typeof queryKeys.shops.byCategory>
  | ReturnType<typeof queryKeys.shops.bySubcategory>
  | ReturnType<typeof queryKeys.shops.byIds>
  | ReturnType<typeof queryKeys.shops.search>;

export type CategoryQueryKey =
  | typeof queryKeys.categories.all
  | ReturnType<typeof queryKeys.categories.main>
  | ReturnType<typeof queryKeys.categories.byId>;

export type SpecialOfferQueryKey =
  | typeof queryKeys.specialOffers.all
  | ReturnType<typeof queryKeys.specialOffers.lists>
  | ReturnType<typeof queryKeys.specialOffers.list>
  | ReturnType<typeof queryKeys.specialOffers.details>
  | ReturnType<typeof queryKeys.specialOffers.detail>
  | ReturnType<typeof queryKeys.specialOffers.active>
  | ReturnType<typeof queryKeys.specialOffers.byCategory>;
