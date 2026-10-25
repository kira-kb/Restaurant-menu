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

  // 4. Categories (Scraped from https://magenta-cat-894924.netlify.app/)
  const categoryData = [
    {
      name: 'ልዩ ቁርሶች',
      nameAm: 'ልዩ ቁርሶች',
      nameEn: 'Special Breakfasts',
      slug: 'special-breakfasts',
      description: 'ጣፋጭ እና ባህላዊ የቁርስ አማራጮች',
      descriptionAm: 'ጣፋጭ እና ባህላዊ የቁርስ አማራጮች',
      descriptionEn: 'Delicious traditional Ethiopian breakfast specialties',
      displayOrder: 1,
    },
    {
      name: 'ትኩስ መጠጦች',
      nameAm: 'ትኩስ መጠጦች',
      nameEn: 'Hot Drinks',
      slug: 'hot-drinks',
      description: 'ጥሩ መዓዛ ያላቸው ትኩስ የቡና፣ የሻይ እና የወተት መጠጦች',
      descriptionAm: 'ጥሩ መዓዛ ያላቸው ትኩስ የቡና፣ የሻይ እና የወተት መጠጦች',
      descriptionEn: 'Aromatic hot coffees, herbal teas, and steamed milk drinks',
      displayOrder: 2,
    },
  ];

  // Deactivate any legacy categories so only current scraped categories appear active
  await prisma.category.updateMany({
    where: {
      slug: { notIn: categoryData.map((c) => c.slug) },
    },
    data: { isActive: false },
  });

  const categoryMap = new Map<string, string>();
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameAm: cat.nameAm,
        nameEn: cat.nameEn,
        description: cat.description,
        descriptionAm: cat.descriptionAm,
        descriptionEn: cat.descriptionEn,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        nameAm: cat.nameAm,
        nameEn: cat.nameEn,
        slug: cat.slug,
        description: cat.description,
        descriptionAm: cat.descriptionAm,
        descriptionEn: cat.descriptionEn,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
    });
    categoryMap.set(c.slug, c.id);
  }
  console.log(`✓ ${categoryMap.size} categories seeded`);

  // 5. Menu Items (Scraped from https://magenta-cat-894924.netlify.app/)
  const menuItems = [
    // 🍽️ ልዩ ቁርሶች
    {
      categorySlug: 'special-breakfasts',
      name: 'ቆጮ/እርጥብ',
      nameAm: 'ቆጮ/እርጥብ',
      nameEn: 'Kocho / Ertib',
      description: 'በልዩ ቅቤ እና በርበሬ የተዘጋጀ',
      descriptionAm: 'በልዩ ቅቤ እና በርበሬ የተዘጋጀ',
      descriptionEn: 'Traditional enset flatbread served moist with spiced clarified butter and berbere',
      price: 150.0,
      imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'special-breakfasts',
      name: 'ጨጨብሳ',
      nameAm: 'ጨጨብሳ',
      nameEn: 'Chechebsa (Kita Firfir)',
      description: 'ጣፋጭ እና ለስላሳ የቤት ውስጥ ጨጨብሳ',
      descriptionAm: 'ጣፋጭ እና ለስላሳ የቤት ውስጥ ጨጨብሳ',
      descriptionEn: 'Torn pieces of homemade flatbread tossed in spiced clarified butter and berbere, served warm',
      price: 150.0,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'special-breakfasts',
      name: 'ፋታ (ፍርፍር)',
      nameAm: 'ፋታ (ፍርፍር)',
      nameEn: 'Fata (Bread Firfir)',
      description: 'በቀይ ሽንኩርት፣ ቅቤ እና ቅመማቅመም የተዘጋጀ',
      descriptionAm: 'በቀይ ሽንኩርት፣ ቅቤ እና ቅመማቅመም የተዘጋጀ',
      descriptionEn: 'Crusty bread pieces tossed in a rich, spiced tomato and herb sauce with clarified butter',
      price: 200.0,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },

    // ☕ ትኩስ መጠጦች
    {
      categorySlug: 'hot-drinks',
      name: 'ቡና',
      nameAm: 'ቡና',
      nameEn: 'Traditional Coffee',
      description: 'ጥሩ መዓዛ ያለው የሀገራችን ባህላዊ ቡና',
      descriptionAm: 'ጥሩ መዓዛ ያለው የሀገራችን ባህላዊ ቡና',
      descriptionEn: 'Freshly roasted traditional Ethiopian organic coffee brewed to aromatic perfection',
      price: 30.0,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'hot-drinks',
      name: 'ሻይ',
      nameAm: 'ሻይ',
      nameEn: 'Spiced Black Tea',
      description: 'ትኩስ እና ጣፋጭ ሻይ',
      descriptionAm: 'ትኩስ እና ጣፋጭ ሻይ',
      descriptionEn: 'Freshly steeped Ethiopian highland black tea infused with fragrant spices',
      price: 30.0,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'hot-drinks',
      name: 'ወተት',
      nameAm: 'ወተት',
      nameEn: 'Steamed Milk',
      description: 'ትኩስ እና ጣፋጭ ወተት',
      descriptionAm: 'ትኩስ እና ጣፋጭ ወተት',
      descriptionEn: 'Warm whole steamed milk with velvety micro-foam and subtle sweetness',
      price: 50.0,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
    },
    {
      categorySlug: 'hot-drinks',
      name: 'ልዩ የተጣራ ቡና (Pour-Over Coffee)',
      nameAm: 'ልዩ የተጣራ ቡና',
      nameEn: 'Pour-Over Coffee',
      description: 'የተመረጠ የይርጋጨፌ የተጣራ ቡና ከጣፋጭ የአበባ መዓዛ ጋር (Yirgacheffe Single-Origin Pour-Over)',
      descriptionAm: 'የተመረጠ የይርጋጨፌ የተጣራ ቡና ከጣፋጭ የአበባ መዓዛ ጋር',
      descriptionEn: 'Selected Yirgacheffe single-origin pour-over coffee with sweet floral jasmine & bergamot notes',
      price: 60.0,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
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
          nameAm: item.nameAm,
          nameEn: item.nameEn,
          description: item.description,
          descriptionAm: item.descriptionAm,
          descriptionEn: item.descriptionEn,
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
          nameAm: item.nameAm,
          nameEn: item.nameEn,
          description: item.description,
          descriptionAm: item.descriptionAm,
          descriptionEn: item.descriptionEn,
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
