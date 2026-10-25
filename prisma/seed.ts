import { PrismaClient, Role } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Barch Coffee Database ---');

  // 1. Shop Settings
  const settings = await prisma.shopSettings.upsert({
    where: { id: 'default' },
    update: {
      cafeName: 'Barch Coffee',
      tagline: 'Specialty Ethiopian Coffee & Artisan Roastery',
      address: 'Bole Medhanialem, Next to Edna Mall, Addis Ababa, Ethiopia',
      phone: '+251 91 123 4567',
      currency: 'ETB',
      receiptHeader: 'Welcome to Barch Coffee! Single-origin perfection in every cup.',
      receiptFooter: 'Thank you for your visit. Visit again soon! • barchcoffee.com',
      taxRatePercent: 0,
    },
    create: {
      id: 'default',
      cafeName: 'Barch Coffee',
      tagline: 'Specialty Ethiopian Coffee & Artisan Roastery',
      address: 'Bole Medhanialem, Next to Edna Mall, Addis Ababa, Ethiopia',
      phone: '+251 91 123 4567',
      currency: 'ETB',
      receiptHeader: 'Welcome to Barch Coffee! Single-origin perfection in every cup.',
      receiptFooter: 'Thank you for your visit. Visit again soon! • barchcoffee.com',
      taxRatePercent: 0,
    },
  });
  console.log('✓ Shop settings configured:', settings.cafeName);

  // 2. Initial Admin Account
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@barchcoffee.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'BarchAdmin2026!Secure';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Barch Administrator';

  const adminHash = await hash(adminPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: Role.ADMIN,
      isActive: true,
      passwordHash: adminHash,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: adminHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✓ Admin account created/updated: ${adminUser.email} (Role: ${adminUser.role})`);

  // 3. Barista Staff Account
  const baristaEmail = 'barista@barchcoffee.com';
  const baristaPassword = 'Barista2026!Coffee';
  const baristaHash = await hash(baristaPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const baristaUser = await prisma.user.upsert({
    where: { email: baristaEmail },
    update: {
      name: 'Selamawit (Lead Barista)',
      role: Role.BARISTA,
      isActive: true,
    },
    create: {
      email: baristaEmail,
      name: 'Selamawit (Lead Barista)',
      passwordHash: baristaHash,
      role: Role.BARISTA,
      isActive: true,
    },
  });
  console.log(`✓ Barista account created/updated: ${baristaUser.email} (Role: ${baristaUser.role})`);

  // 4. Categories
  const categoryData = [
    {
      name: 'Hot Coffees',
      slug: 'hot-coffees',
      description: 'Handcrafted espresso beverages and pour-overs using Ethiopian highland beans.',
      displayOrder: 1,
    },
    {
      name: 'Cold Brews & Iced',
      slug: 'cold-brews-iced',
      description: 'Slow-steeped 16-hour single-origin cold brews and refreshing chilled coffees.',
      displayOrder: 2,
    },
    {
      name: 'Signature Specialty',
      slug: 'signature-specialty',
      description: 'Exclusive house creations infused with native Ethiopian spices and botanical extracts.',
      displayOrder: 3,
    },
    {
      name: 'Pastries & Bakery',
      slug: 'pastries-bakery',
      description: 'Artisan baked goods, flaky croissants, and spiced brioche prepared daily.',
      displayOrder: 4,
    },
    {
      name: 'Teas & Refreshers',
      slug: 'teas-refreshers',
      description: 'Loose leaf herbal infusions, cascara coffee-cherry teas, and botanical refreshers.',
      displayOrder: 5,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
    });
    categoryMap.set(c.slug, c.id);
  }
  console.log(`✓ ${categoryMap.size} categories seeded`);

  // 5. Menu Items (with authentic Ethiopian specialty offerings and ETB pricing)
  const menuItems = [
    // Hot Coffees
    {
      categorySlug: 'hot-coffees',
      name: 'Yirgacheffe Single-Origin Pour-Over',
      description: 'Washed G1 beans from Gedeb, Yirgacheffe. Delicate floral jasmine notes with bright bergamot and lemon zest finish.',
      price: 190.0,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'hot-coffees',
      name: 'Sidama Natural Espresso',
      description: 'Sun-dried high altitude Heirloom cultivar. Velvety crema with rich notes of wild blueberry jam and dark 80% cocoa.',
      price: 130.0,
      imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'hot-coffees',
      name: 'Traditional Ethiopian Macchiato',
      description: 'The iconic Addis Ababa layered macchiato. Double ristretto with velvety steamed milk foam in a clear glass.',
      price: 150.0,
      imageUrl: 'https://images.unsplash.com/photo-1557006021-b85fad4bc732?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'hot-coffees',
      name: 'Artisan Flat White',
      description: 'Double shot of Guji honey-processed espresso folded seamlessly into glossy microfoam milk.',
      price: 170.0,
      imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'hot-coffees',
      name: 'Spanish Cortado',
      description: 'Equal parts dense espresso and warm textured milk for an intense, balanced coffee kick.',
      price: 160.0,
      imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // Cold Brews & Iced
    {
      categorySlug: 'cold-brews-iced',
      name: 'Honey-Process Guji Cold Brew',
      description: 'Steeped for 18 hours in cold filtered spring water. Naturally sweet with crisp white peach and elderflower notes.',
      price: 220.0,
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'cold-brews-iced',
      name: 'Iced Barch Spanish Latte',
      description: 'Slow-pulled double espresso poured over chilled whole milk, condensed milk drizzle, and clear ice blocks.',
      price: 240.0,
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'cold-brews-iced',
      name: 'Vanilla Sweet Cream Cold Brew',
      description: 'Single-origin iced brew crowned with house-whipped Madagascar vanilla bean sweet cream.',
      price: 230.0,
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // Signature Specialty
    {
      categorySlug: 'signature-specialty',
      name: 'Cardamom Shakerato',
      description: 'Fresh espresso vigorously shaken over ice with house-infused green cardamom syrup and candied orange peel twist.',
      price: 250.0,
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'signature-specialty',
      name: 'Barch Korerima Mocha',
      description: 'Rich dark artisan chocolate blended with double espresso and a subtle aromatic pinch of Ethiopian black cardamom.',
      price: 260.0,
      imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'signature-specialty',
      name: 'Cascara Sparkling Spritz',
      description: 'Cold-extracted dried coffee-cherry tea blended with sparkling soda, fresh mint, and lime twist.',
      price: 200.0,
      imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // Pastries & Bakery
    {
      categorySlug: 'pastries-bakery',
      name: 'Freshly Baked Cardamom Brioche',
      description: 'Soft golden braided butter brioche studded with freshly crushed cardamom seeds and pearl sugar crystals.',
      price: 140.0,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'pastries-bakery',
      name: 'Almond Twice-Baked Croissant',
      description: 'Crisp laminated French butter croissant filled with frangipane almond cream and toasted sliced almonds.',
      price: 180.0,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'pastries-bakery',
      name: 'Dark Chocolate Sea Salt Cookie',
      description: 'Soft-baked Belgian dark chocolate chunk cookie with a pinch of flaky Lake Assal sea salt.',
      price: 120.0,
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // Teas & Refreshers
    {
      categorySlug: 'teas-refreshers',
      name: 'Hibiscus Mint Chilled Infusion',
      description: 'Vibrant ruby herbal tea brewed from wild hibiscus calyces, fresh garden mint, and wildflower honey.',
      price: 160.0,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'teas-refreshers',
      name: 'Ginger Lemongrass Herbal Brew',
      description: 'Warming pot of fresh crushed ginger root, wild highland lemongrass, and fresh lemon slices.',
      price: 150.0,
      imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
  ];

  for (const item of menuItems) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    const existing = await prisma.menuItem.findFirst({
      where: { name: item.name, categoryId },
    });

    if (existing) {
      await prisma.menuItem.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          isArchived: false,
        },
      });
    } else {
      await prisma.menuItem.create({
        data: {
          categoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          isArchived: false,
        },
      });
    }
  }
  console.log(`✓ ${menuItems.length} menu items seeded`);

  // 6. Cafe Tables
  const tables = [
    { tableNumber: 'T-01', displayName: 'Table 1 (Window Corner, 2 seats)' },
    { tableNumber: 'T-02', displayName: 'Table 2 (Espresso Bar, 2 seats)' },
    { tableNumber: 'T-03', displayName: 'Table 3 (Courtyard Garden, 4 seats)' },
    { tableNumber: 'T-04', displayName: 'Table 4 (Communal Oak, 6 seats)' },
    { tableNumber: 'T-05', displayName: 'Table 5 (Library Nook, 2 seats)' },
    { tableNumber: 'T-06', displayName: 'Table 6 (Patio Lounge, 4 seats)' },
  ];

  for (const t of tables) {
    await prisma.cafeTable.upsert({
      where: { tableNumber: t.tableNumber },
      update: {
        displayName: t.displayName,
        isActive: true,
      },
      create: {
        tableNumber: t.tableNumber,
        displayName: t.displayName,
        isActive: true,
      },
    });
  }
  console.log(`✓ ${tables.length} tables seeded`);

  console.log('--- Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
