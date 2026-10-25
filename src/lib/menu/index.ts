import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/session';
import { Role, Prisma } from '@prisma/client';
import { CategoryInputSchema, MenuItemInputSchema, MenuAddonInputSchema } from '@/lib/validations';

export function serializeMenuItem<T extends {
  id: string;
  name: string;
  nameAm?: string | null;
  nameEn?: string | null;
  description: string | null;
  descriptionAm?: string | null;
  descriptionEn?: string | null;
  price: Prisma.Decimal | number;
  imageUrl: string | null;
  isAvailable: boolean;
  isArchived: boolean;
  categoryId: string;
  createdAt?: Date;
  updatedAt?: Date;
}>(item: T) {
  return {
    id: item.id,
    name: item.name,
    nameAm: item.nameAm ?? null,
    nameEn: item.nameEn ?? null,
    description: item.description,
    descriptionAm: item.descriptionAm ?? null,
    descriptionEn: item.descriptionEn ?? null,
    price: Number(item.price),
    imageUrl: item.imageUrl,
    isAvailable: item.isAvailable,
    isArchived: item.isArchived,
    categoryId: item.categoryId,
    createdAt: item.createdAt ? item.createdAt.toISOString() : undefined,
    updatedAt: item.updatedAt ? item.updatedAt.toISOString() : undefined,
  };
}

export const MENU_CACHE_TAG = 'barch-menu';
export const CATEGORIES_CACHE_TAG = 'barch-categories';
export const SETTINGS_CACHE_TAG = 'barch-settings';

/**
 * Direct database query for public active menu data
 */
export async function fetchPublicMenuData() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      menuItems: {
        where: { isArchived: false },
        orderBy: { name: 'asc' },
        include: {
          addons: {
            include: { addon: true },
          },
          recommendations: {
            include: { recommendedItem: true },
          },
        },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    nameAm: cat.nameAm,
    nameEn: cat.nameEn,
    slug: cat.slug,
    description: cat.description,
    descriptionAm: cat.descriptionAm,
    descriptionEn: cat.descriptionEn,
    displayOrder: cat.displayOrder,
    items: cat.menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      nameAm: item.nameAm,
      nameEn: item.nameEn,
      description: item.description,
      descriptionAm: item.descriptionAm,
      descriptionEn: item.descriptionEn,
      price: Number(item.price),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      categoryId: item.categoryId,
      addons: item.addons
        .filter((a) => !a.addon.isArchived && a.addon.isAvailable)
        .map((a) => ({
          id: a.addon.id,
          name: a.addon.name,
          nameAm: a.addon.nameAm,
          nameEn: a.addon.nameEn,
          price: Number(a.addon.price),
          icon: a.addon.icon,
        })),
      recommendations: item.recommendations
        .filter((r) => !r.recommendedItem.isArchived && r.recommendedItem.isAvailable)
        .map((r) => ({
          id: r.recommendedItem.id,
          name: r.recommendedItem.name,
          nameAm: r.recommendedItem.nameAm,
          nameEn: r.recommendedItem.nameEn,
          description: r.recommendedItem.description,
          descriptionAm: r.recommendedItem.descriptionAm,
          descriptionEn: r.recommendedItem.descriptionEn,
          price: Number(r.recommendedItem.price),
          imageUrl: r.recommendedItem.imageUrl,
          categoryId: r.recommendedItem.categoryId,
          isAvailable: r.recommendedItem.isAvailable,
        })),
    })),
  }));
}

/**
 * Public cached retrieval of active menu items grouped by active categories.
 */
export const getPublicMenu = unstable_cache(
  fetchPublicMenuData,
  ['public-menu-cache'],
  { tags: [MENU_CACHE_TAG, CATEGORIES_CACHE_TAG], revalidate: 3600 }
);

/**
 * Public cached shop settings
 */
export const getPublicShopSettings = unstable_cache(
  async () => {
    const settings = await prisma.shopSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      return {
        cafeName: 'Barch Coffee',
        tagline: 'Specialty Coffee & Artisan Roastery',
        address: 'Bole Medhanialem, Addis Ababa, Ethiopia',
        phone: '+251 91 123 4567',
        currency: 'ETB',
        receiptHeader: 'Welcome to Barch Coffee!',
        receiptFooter: 'Single-origin perfection in every cup.',
        taxRatePercent: 0,
      };
    }

    return {
      cafeName: settings.cafeName,
      tagline: settings.tagline,
      address: settings.address,
      phone: settings.phone,
      currency: settings.currency,
      receiptHeader: settings.receiptHeader,
      receiptFooter: settings.receiptFooter,
      taxRatePercent: Number(settings.taxRatePercent),
    };
  },
  ['public-settings-cache'],
  { tags: [SETTINGS_CACHE_TAG], revalidate: 3600 }
);

/* ========================================================================= */
/* ADMIN CATEGORY MANAGEMENT                                                 */
/* ========================================================================= */

export async function getAdminCategories() {
  await requireRole([Role.ADMIN]);
  return prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: { menuItems: { where: { isArchived: false } } },
      },
    },
  });
}

export async function createCategoryAction(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const rawData = {
    name: formData.get('name'),
    nameAm: formData.get('nameAm') || null,
    nameEn: formData.get('nameEn') || null,
    slug: formData.get('slug'),
    description: formData.get('description') || null,
    descriptionAm: formData.get('descriptionAm') || null,
    descriptionEn: formData.get('descriptionEn') || null,
    displayOrder: formData.get('displayOrder') || 0,
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
  };

  const validated = CategoryInputSchema.parse(rawData);

  // Check unique slug
  const existing = await prisma.category.findUnique({ where: { slug: validated.slug } });
  if (existing) {
    throw new Error(`A category with slug "${validated.slug}" already exists.`);
  }

  const category = await prisma.category.create({
    data: validated,
  });

  revalidateTag(CATEGORIES_CACHE_TAG, 'default');
  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return category;
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);

  const rawData = {
    name: formData.get('name'),
    nameAm: formData.get('nameAm') || null,
    nameEn: formData.get('nameEn') || null,
    slug: formData.get('slug'),
    description: formData.get('description') || null,
    descriptionAm: formData.get('descriptionAm') || null,
    descriptionEn: formData.get('descriptionEn') || null,
    displayOrder: formData.get('displayOrder') || 0,
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
  };

  const validated = CategoryInputSchema.parse(rawData);

  // Check unique slug conflict with other categories
  const conflict = await prisma.category.findFirst({
    where: { slug: validated.slug, NOT: { id } },
  });
  if (conflict) {
    throw new Error(`Another category already uses slug "${validated.slug}".`);
  }

  const updated = await prisma.category.update({
    where: { id },
    data: validated,
  });

  revalidateTag(CATEGORIES_CACHE_TAG, 'default');
  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return updated;
}

export async function toggleCategoryStatusAction(id: string) {
  await requireRole([Role.ADMIN]);

  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  const updated = await prisma.category.update({
    where: { id },
    data: { isActive: !category.isActive },
  });

  revalidateTag(CATEGORIES_CACHE_TAG, 'default');
  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return updated;
}

/* ========================================================================= */
/* ADMIN MENU ITEM MANAGEMENT                                                */
/* ========================================================================= */

export async function getAdminMenuItems(search?: string, categoryId?: string) {
  await requireRole([Role.ADMIN]);

  const items = await prisma.menuItem.findMany({
    where: {
      isArchived: false,
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { nameAm: { contains: search, mode: 'insensitive' } },
              { nameEn: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { descriptionAm: { contains: search, mode: 'insensitive' } },
              { descriptionEn: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: { displayOrder: 'asc' } }, { name: 'asc' }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      addons: { select: { addonId: true } },
      recommendations: { select: { recommendedItemId: true } },
    },
  });

  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    addonIds: item.addons.map((a) => a.addonId),
    recommendedItemIds: item.recommendations.map((r) => r.recommendedItemId),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

function parseIdArray(formData: FormData, fieldName: string): string[] {
  const rawValues = formData.getAll(fieldName);
  if (rawValues.length === 1 && typeof rawValues[0] === 'string' && rawValues[0].startsWith('[')) {
    try {
      const parsed = JSON.parse(rawValues[0]);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      // Fall through
    }
  }
  return rawValues.map(String).filter(Boolean);
}

export async function createMenuItemAction(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const rawData = {
    name: formData.get('name'),
    nameAm: formData.get('nameAm') || null,
    nameEn: formData.get('nameEn') || null,
    description: formData.get('description') || null,
    descriptionAm: formData.get('descriptionAm') || null,
    descriptionEn: formData.get('descriptionEn') || null,
    price: formData.get('price'),
    categoryId: formData.get('categoryId'),
    imageUrl: formData.get('imageUrl') || null,
    isAvailable: formData.get('isAvailable') === 'true' || formData.get('isAvailable') === 'on',
  };

  const validated = MenuItemInputSchema.parse(rawData);
  const addonIds = parseIdArray(formData, 'addonIds');
  const recommendedItemIds = parseIdArray(formData, 'recommendedItemIds');

  const item = await prisma.menuItem.create({
    data: {
      name: validated.name,
      nameAm: validated.nameAm,
      nameEn: validated.nameEn,
      description: validated.description,
      descriptionAm: validated.descriptionAm,
      descriptionEn: validated.descriptionEn,
      price: validated.price,
      categoryId: validated.categoryId,
      imageUrl: validated.imageUrl,
      isAvailable: validated.isAvailable,
      isArchived: false,
      addons: addonIds.length > 0 ? {
        create: addonIds.map((addonId) => ({ addonId })),
      } : undefined,
      recommendations: recommendedItemIds.length > 0 ? {
        create: recommendedItemIds.map((recommendedItemId) => ({ recommendedItemId })),
      } : undefined,
    },
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return serializeMenuItem(item);
}

export async function updateMenuItemAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);

  const rawData = {
    name: formData.get('name'),
    nameAm: formData.get('nameAm') || null,
    nameEn: formData.get('nameEn') || null,
    description: formData.get('description') || null,
    descriptionAm: formData.get('descriptionAm') || null,
    descriptionEn: formData.get('descriptionEn') || null,
    price: formData.get('price'),
    categoryId: formData.get('categoryId'),
    imageUrl: formData.get('imageUrl') || null,
    isAvailable: formData.get('isAvailable') === 'true' || formData.get('isAvailable') === 'on',
  };

  const validated = MenuItemInputSchema.parse(rawData);
  const addonIds = parseIdArray(formData, 'addonIds');
  const recommendedItemIds = parseIdArray(formData, 'recommendedItemIds');

  const updated = await prisma.$transaction(async (tx) => {
    // Sync addons
    await tx.menuItemAddon.deleteMany({ where: { menuItemId: id } });
    if (addonIds.length > 0) {
      await tx.menuItemAddon.createMany({
        data: addonIds.map((addonId) => ({ menuItemId: id, addonId })),
      });
    }

    // Sync recommendations
    await tx.menuItemRecommendation.deleteMany({ where: { menuItemId: id } });
    if (recommendedItemIds.length > 0) {
      await tx.menuItemRecommendation.createMany({
        data: recommendedItemIds.map((recId) => ({ menuItemId: id, recommendedItemId: recId })),
      });
    }

    return tx.menuItem.update({
      where: { id },
      data: {
        name: validated.name,
        nameAm: validated.nameAm,
        nameEn: validated.nameEn,
        description: validated.description,
        descriptionAm: validated.descriptionAm,
        descriptionEn: validated.descriptionEn,
        price: validated.price,
        categoryId: validated.categoryId,
        imageUrl: validated.imageUrl,
        isAvailable: validated.isAvailable,
      },
    });
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return serializeMenuItem(updated);
}

export async function toggleMenuItemAvailabilityAction(id: string) {
  await requireRole([Role.ADMIN]);

  const item = await prisma.menuItem.findUniqueOrThrow({ where: { id } });
  const updated = await prisma.menuItem.update({
    where: { id },
    data: { isAvailable: !item.isAvailable },
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return serializeMenuItem(updated);
}

export async function archiveMenuItemAction(id: string) {
  await requireRole([Role.ADMIN]);

  // We archive instead of deleting to preserve historical order integrity!
  const updated = await prisma.menuItem.update({
    where: { id },
    data: { isArchived: true, isAvailable: false },
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return serializeMenuItem(updated);
}

export async function updateMenuItemImageLinkAction(id: string, imageUrl: string | null) {
  await requireRole([Role.ADMIN]);

  const cleanUrl = imageUrl && imageUrl.trim().length > 0 ? imageUrl.trim() : null;
  const updated = await prisma.menuItem.update({
    where: { id },
    data: { imageUrl: cleanUrl },
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return serializeMenuItem(updated);
}

/* ========================================================================= */
/* ADMIN MENU ADD-ONS MANAGEMENT (FULL CRUD)                                 */
/* ========================================================================= */

export async function getAdminAddons() {
  await requireRole([Role.ADMIN]);

  const addons = await prisma.menuAddon.findMany({
    where: { isArchived: false },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { menuItems: true },
      },
    },
  });

  return addons.map((addon) => ({
    id: addon.id,
    name: addon.name,
    nameAm: addon.nameAm,
    nameEn: addon.nameEn,
    price: Number(addon.price),
    icon: addon.icon,
    displayOrder: addon.displayOrder,
    isAvailable: addon.isAvailable,
    menuItemCount: addon._count.menuItems,
    createdAt: addon.createdAt.toISOString(),
    updatedAt: addon.updatedAt.toISOString(),
  }));
}

export async function createAddonAction(formData: FormData) {
  await requireRole([Role.ADMIN]);

  const rawData = {
    name: formData.get('name'),
    nameAm: formData.get('nameAm') || null,
    nameEn: formData.get('nameEn') || null,
    price: formData.get('price') || 0,
    icon: formData.get('icon') || null,
    displayOrder: formData.get('displayOrder') || 0,
    isAvailable: formData.get('isAvailable') === 'true' || formData.get('isAvailable') === 'on',
  };

  const validated = MenuAddonInputSchema.parse(rawData);

  const addon = await prisma.menuAddon.create({
    data: {
      name: validated.name,
      nameAm: validated.nameAm,
      nameEn: validated.nameEn,
      price: validated.price,
      icon: validated.icon,
      displayOrder: validated.displayOrder,
      isAvailable: validated.isAvailable,
      isArchived: false,
    },
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return {
    ...addon,
    price: Number(addon.price),
  };
}

export async function updateAddonAction(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);

  const rawData = {
    name: formData.get('name'),
    nameAm: formData.get('nameAm') || null,
    nameEn: formData.get('nameEn') || null,
    price: formData.get('price') || 0,
    icon: formData.get('icon') || null,
    displayOrder: formData.get('displayOrder') || 0,
    isAvailable: formData.get('isAvailable') === 'true' || formData.get('isAvailable') === 'on',
  };

  const validated = MenuAddonInputSchema.parse(rawData);

  const updated = await prisma.menuAddon.update({
    where: { id },
    data: {
      name: validated.name,
      nameAm: validated.nameAm,
      nameEn: validated.nameEn,
      price: validated.price,
      icon: validated.icon,
      displayOrder: validated.displayOrder,
      isAvailable: validated.isAvailable,
    },
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return {
    ...updated,
    price: Number(updated.price),
  };
}

export async function toggleAddonAvailabilityAction(id: string) {
  await requireRole([Role.ADMIN]);

  const addon = await prisma.menuAddon.findUniqueOrThrow({ where: { id } });
  const updated = await prisma.menuAddon.update({
    where: { id },
    data: { isAvailable: !addon.isAvailable },
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return {
    ...updated,
    price: Number(updated.price),
  };
}

export async function archiveAddonAction(id: string) {
  await requireRole([Role.ADMIN]);

  const updated = await prisma.menuAddon.update({
    where: { id },
    data: { isArchived: true, isAvailable: false },
  });

  revalidateTag(MENU_CACHE_TAG, 'default');
  revalidatePath('/menu');
  return {
    ...updated,
    price: Number(updated.price),
  };
}
