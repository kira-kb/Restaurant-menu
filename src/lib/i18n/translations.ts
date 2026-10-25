import { Language, TranslationDictionary } from './types';

export const translations: Record<Language, TranslationDictionary> = {
  am: {
    // Navigation & Common
    cafeSubtitle: 'የባህላዊና ጥራት ያለው ቡና መፍጫ',
    table: 'ጠረጴዛ',
    tableSelector: 'ጠረጴዛ:',
    allRoasts: 'ሁሉም',
    searchPlaceholder: 'ቡና፣ መጠጥ ወይም ቁርስ ይፈልጉ...',
    noItemsFound: 'ምንም አይነት እቃ አልተገኘም',
    noItemsFoundDesc: 'እባክዎ ፍለጋዎን ወይም የተመረጠውን ምድብ አስተካክለው ይሞክሩ።',
    loading: 'በመጫን ላይ...',
    timeTag: '3–5ደ',

    // Add to order & Detail modal
    addToOrder: 'ወደ ትዕዛዝ ጨምር',
    detailsAndCustomization: 'ዝርዝር እና ማስተካከያ',
    brewedFresh: 'ትኩስ ሆኖ የሚዘጋጅ (ከ3–5 ደቂቃ)',
    chooseAddons: 'ተጨማሪዎችን ይምረጡ',
    weRecommend: 'እኛ እንመክራለን',
    additionalNotes: 'ተጨማሪ ማስታወሻ',
    notesPlaceholder: 'ምሳሌ፦ በጣም የሞቀ፣ በረዶ ለብቻ...',
    addSubtotal: 'ድምር',

    // Cart & Checkout
    yourOrderReview: 'የትዕዛዝዎ ማጠቃለያ',
    selectedTable: 'የተመረጠ ጠረጴዛ',
    subtotal: 'ድምር',
    viewOrder: 'ትዕዛዝ ይመልከቱ',
    tableInstructions: 'የጠረጴዛ መመሪያዎች (አማራጭ)',
    instructionsPlaceholder: 'ምሳሌ፦ ቡናው ቀድሞ ይምጣ፣ ለብ ያለ ውሃ...',
    paymentNotice: 'የመስመር ላይ ክፍያ አያስፈልግም። አስተናጋጅ ክፍያውን (ጥሬ ገንዘብ ወይም በሞባይል ባንኪንግ/ቴሌብር) በጠረጴዛዎ ይሰበስባል።',
    totalAmount: 'ጠቅላላ ክፍያ',
    confirmAndPlaceOrder: 'ትዕዛዝ አረጋግጥ እና ላክ',
    sendingOrder: 'ትዕዛዝ ለባሪስታ እየተላከ ነው...',
    cartEmptyError: 'የእርስዎ ቅርጫት ባዶ ነው።',
    selectTableError: 'እባክዎ ትዕዛዝዎን ለመላክ ጠረጴዛ ይምረጡ።',

    // Order Status Tracking
    orderConfirmedTitle: 'ትዕዛዝዎ ተረጋግጧል',
    orderConfirmedDesc: 'ትዕዛዝዎ በቀጥታ ወደ ባሪስታ ክፍል ተልኳል።',
    orderNumber: 'የትዕዛዝ ቁጥር',
    payment: 'ክፍያ',
    paid: 'ተከፍሏል',
    payAtTable: 'በጠረጴዛዎ ይከፈላል (አስተናጋጅ ይሰበስባል)',
    prepStatus: 'የዝግጅት ሁኔታ',
    stepPlaced: 'ትዕዛዝ ተልኳል',
    stepPlacedDesc: 'በባሪስታ ክፍል ደርሷል',
    stepConfirmed: 'ተረጋግጧል',
    stepConfirmedDesc: 'ባሪስታ ትዕዛዝዎን ተቀብሏል',
    stepPreparing: 'በመዘጋጀት ላይ',
    stepPreparingDesc: 'ቡና በመፍጨትና በማፍላት ላይ',
    stepReady: 'ዝግጁ ነው',
    stepReadyDesc: 'ወደ ጠረጴዛዎ እየመጣ ነው',
    stepServed: 'ተጠናቋል',
    stepServedDesc: 'ትዕዛዙ ተጠናቆ ቀርቧል',
    orderCancelled: 'ትዕዛዙ ተሰርዟል',
    orderCancelledDesc: 'ይህ ትዕዛዝ ተሰርዟል። እባክዎ ለተጨማሪ መረጃ ባሪስታውን ያነጋግሩ።',
    itemsOrdered: 'የታዘዙ እቃዎች',
    orderMoreItems: 'ተጨማሪ እቃዎችን እዘዝ',

    // Staff Portal - Common
    staffPortal: 'የሰራተኞች ክፍል',
    baristaBar: 'የባሪስታ ክፍል',
    loggedInAs: 'በዚህ ስም ገብተዋል',
    adminPortal: 'አድሚን ክፍል',
    baristaCounter: 'ወደ ባሪስታ ክፍል',
    signOut: 'ውጣ',
    backToHome: 'ወደ ዋናው ገጽ ተመለስ',

    // Staff Portal - Login
    loginTitle: 'የሰራተኞች መግቢያ',
    loginSubtitle: 'ወደ ባሪስታ ወይም አድሚን ክፍል ለመግባት መለያዎን ያስገቡ',
    emailLabel: 'ኢሜይል አድራሻ',
    emailPlaceholder: 'barista@barchcoffee.com',
    passwordLabel: 'የይለፍ ቃል',
    passwordPlaceholder: '••••••••••••',
    signInButton: 'ግባ',
    signingInButton: 'በመግባት ላይ...',
    authorizedOnlyNotice: 'ለተፈቀደላቸው ሰራተኞች ብቻ። የህዝብ ምዝገባ ተዘግቷል።',

    // Staff Portal - Admin Sidebar
    adminOverview: 'አጠቃላይ እይታ',
    adminAudit: 'የባሪስታ ኦዲት',
    adminMenu: 'የሜኑ ዝርዝር',
    adminCategories: 'ምድቦች',
    adminAddons: 'ተጨማሪዎች',
    adminTables: 'ጠረጴዛዎች እና QR',
    adminStaff: 'የሰራተኞች መለያ',
    adminOrders: 'የትዕዛዝ ታሪክ',
    adminSettings: 'የካፌ ቅንብሮች',
    adminPortalTitle: 'Barch አድሚን',
    adminPortalSubtitle: 'የአስተዳደር ፖርታል',

    // Staff Portal - Admin Dashboard
    adminDashboardTitle: 'የካፌው የስራ እንቅስቃሴ',
    adminDashboardSubtitle: 'የንቁ ትዕዛዞች፣ የጠረጴዛ ክፍለ-ጊዜዎች እና የቅርብ ጊዜ የደንበኞች ማጠቃለያ የቀጥታ እይታ።',
    ordersInQueue: 'በተራ ላይ ያሉ ትዕዛዞች',
    awaitingAcceptance: 'ተቀባይነትን የሚጠብቁ',
    currentlyBrewing: 'በመዘጋጀት ላይ ያሉ',
    activeTableSessions: 'ንቁ የጠረጴዛ ክፍለ-ጊዜዎች',
    baristaCounterDesc: 'የቀጥታ ገቢ ትዕዛዞችን ያስተዳድሩ እና መጠጦችን ያዘጋጁ',
    baristaAuditDesc: 'የዛሬው የስራ ፈረቃ ምዝገባዎች እና ታሪክ',
    tablesAndQrDesc: 'የQR ማዘዣ ኮዶችን ያመንጩ እና ጠረጴዛዎችን ይቆጣጠሩ',
    menuManagementTitle: 'የምናሌ አስተዳደር',
    menuManagementDesc: 'ወቅታዊ የቡና አይነቶችን፣ ዋጋዎችን እና የምስል አገናኞችን ያዘጋጁ',
    recentOrdersTitle: 'የቅርብ ጊዜ ትዕዛዞች',
    recentOrdersSubtitle: 'በካፌው ጠረጴዛዎች በኩል የተቀበሏቸው የቅርብ ጊዜ ትዕዛዞች',
    viewAllOrders: 'ሁሉንም ትዕዛዞች ይመልከቱ',
    noRecentOrders: 'ምንም የቅርብ ጊዜ ትዕዛዞች አልተገኙም።',
    thOrderNumber: 'የትዕዛዝ ቁጥር',
    thTable: 'ጠረጴዛ',
    thItems: 'እቃዎች',
    thTotal: 'ጠቅላላ',
    thStatus: 'ሁኔታ',
    thTime: 'ሰዓት',

    // Pagination & Common Controls
    showingEntries: 'ከ {total} ውስጥ {from}–{to} በማሳየት ላይ',
    previousPage: 'ቀዳሚ',
    nextPage: 'ቀጣይ',
    perPage: 'በአንድ ገጽ:',
    page: 'ገጽ',

    // Staff Portal - Orders Tab
    ordersPageTitle: 'የትዕዛዝ ታሪክ እና ኦዲት',
    ordersPageSubtitle: 'ያለፉ ትዕዛዞችን፣ የዋጋ ዝርዝሮችን፣ ክፍያዎችን እና የሁኔታ ለውጦችን ይመርምሩ።',
    searchOrdersPlaceholder: 'የትዕዛዝ ቁጥር፣ ጠረጴዛ ወይም እቃ ይፈልጉ...',
    allStatuses: 'ሁሉም ሁኔታዎች',
    filterStatusPending: 'አዲስ (ተቀባይነት የሚጠብቅ)',
    filterStatusPreparing: 'በመዘጋጀት ላይ',
    filterStatusCompleted: 'የተጠናቀቀ',
    filterStatusCancelled: 'የተሰረዘ',
    thItemsSummary: 'የእቃዎች ማጠቃለያ',
    thPayment: 'ክፍያ',
    thDetails: 'ዝርዝር',
    noOrdersFound: 'የተመረጠውን መስፈርት የሚያሟላ ትዕዛዝ አልተገኘም።',
    orderPaid: 'ተከፍሏል',
    orderUnpaid: 'ያልተከፈለ',
    viewConsolidatedReceipt: 'የተጠቃለለ ደረሰኝ ይመልከቱ',
    itemsSnapshotAtOrder: 'በትዕዛዝ ወቅት የነበሩ እቃዎች',
    statusAuditTrail: 'የሁኔታ ሽግግር ኦዲት ታሪክ',
    noteLabel: 'ማስታወሻ:',

    // Staff Portal - Menu Tab
    menuPageTitle: 'የሜኑ አስተዳደር',
    menuPageSubtitle: 'ቡናዎችን ይጨምሩ፣ ወቅታዊ ዋጋዎችን ያሻሽሉ ወይም የእለቱን አቅርቦት ይቀይሩ።',
    searchProductsPlaceholder: 'ምርት በስም ወይም መግለጫ ይፈልጉ...',
    allCategoriesFilter: 'ሁሉም ምድቦች',
    cardsView: 'ካርዶች',
    tableView: 'ሰንጠረዥ',
    addProductBtn: 'አዲስ ምርት ጨምር',
    inStock: 'አለ',
    soldOut: 'አልቋል',
    changeImageLink: 'የምስል ሊንክ ቀይር',
    editProduct: 'ምርት አርትዕ',
    archiveProduct: 'ምርት አስወግድ',
    saveProduct: 'ምርት መዝግብ',
    savingProduct: 'በመመዝገብ ላይ...',
    createProductModalTitle: 'አዲስ የቡና ምርት ፍጠር',
    editProductModalTitle: 'ምርት አርትዕ',
    productNameEn: 'የምርት ስም (እንግሊዝኛ)',
    productNameAm: 'የምርት ስም (አማርኛ)',
    categoryLabel: 'ምድብ',
    priceLabel: 'ዋጋ',
    descEnLabel: 'መግለጫ (እንግሊዝኛ)',
    descAmLabel: 'መግለጫ (አማርኛ)',
    imageUrlLabel: 'የምስል ሊንክ (URL)',
    availableForOrdering: 'ለደንበኛ ትዕዛዝ ክፍት ነው',
    cancelBtn: 'ሰርዝ',
    noProductsFound: 'ምንም ምርቶች አልተገኙም',
    chooseAddonsForProduct: 'ለዚህ ምርት ተጨማሪዎችን ይምረጡ',
    noAddonsConfigured: 'ምንም ተጨማሪዎች አልተገኙም። አስቀድመው በ"ተጨማሪዎች" ገጽ ላይ ይፍጠሩ።',
    recommendationsForProduct: 'የሚመከሩ ተዛማጅ ምርቶች ("እንመክራለን")',
    searchMenuItemsPlaceholder: 'የሚመከሩ ምርቶችን ይፈልጉ...',
    noRecommendationsSelected: 'ምንም ምክሮች አልተመረጡም (ነባሪ የምድብ ምርቶች ይታያሉ)።',

    // Staff Portal - Addons Tab
    addonsPageTitle: 'ልዩ ተጨማሪዎች እና ምርጫዎች',
    addonsPageSubtitle: 'የወተት አማራጮች፣ ተጨማሪ ሾት፣ ሽሮፕ እና ቅመሞችን ያስተዳድሩ።',
    addNewAddon: 'አዲስ ተጨማሪ ጨምር',
    thIcon: 'ምልክት',
    thAddonName: 'የትርፍ ስም',
    thExtraPrice: 'ተጨማሪ ዋጋ',
    thAppliedToItems: 'የተመደቡ ምርቶች',
    createAddonModalTitle: 'አዲስ ልዩ ተጨማሪ ፍጠር',
    editAddonModalTitle: 'ልዩ ተጨማሪ አስተካክል',
    addonNameLabel: 'የትርፍ ስም',
    addonNameAmLabel: 'የአማርኛ ስም',
    addonNameEnLabel: 'የእንግሊዝኛ ስም',
    addonPriceLabel: 'ተጨማሪ ክፍያ (ETB)',
    addonIconLabel: 'ምልክት / ኢሞጂ (ለምሳሌ 🥛፣ ☕)',
    addonAvailableLabel: 'ለትእዛዝ ክፍት ነው',
    deleteAddonConfirm: 'ይህን ተጨማሪ ማስወገድ እርግጠኛ ነዎት?',
    noAddonsFound: 'ምንም ተጨማሪዎች አልተገኙም',
    searchAddonsPlaceholder: 'ተጨማሪዎችን በስም ፈልግ...',
    freeAddon: 'ነጻ',

    // Staff Portal - Categories Tab
    categoriesPageTitle: 'የሜኑ ምድቦች',
    categoriesPageSubtitle: 'በደንበኞች ዲጂታል ሜኑ ላይ የሚታዩ ምድቦችን ያስተዳድሩ እና ያደራጁ።',
    addCategoryBtn: 'አዲስ ምድብ ጨምር',
    thOrder: 'ቅደም ተከተል',
    thCategoryName: 'የምድብ ስም',
    thSlug: 'ስለግ (Slug)',
    thActiveProducts: 'ንቁ ምርቶች',
    thActions: 'እርምጃዎች',
    statusActive: 'ንቁ',
    statusInactive: 'ቦዝኗል',
    editCategory: 'አርትዕ',
    createCategoryModalTitle: 'አዲስ ምድብ ፍጠር',
    editCategoryModalTitle: 'ምድብ አርትዕ',
    categoryNameField: 'የምድብ ስም',
    categorySlugField: 'የመለያ አድራሻ (Slug)',
    displayOrderField: 'የማሳያ ቅደም ተከተል',
    descriptionField: 'መግለጫ',
    categoryActiveCheckbox: 'በደንበኛ ሜኑ ላይ ንቁ እና የሚታይ',
    saveCategory: 'ምድብ አስቀምጥ',
    savingCategory: 'በማስቀመጥ ላይ...',

    // Staff Portal - Tables Tab
    tablesPageTitle: 'ጠረጴዛዎች እና QR ኮዶች',
    tablesPageSubtitle: 'የካፌ ጠረጴዛዎችን ያስተዳድሩ፣ ንቁ ጉብኝቶችን ይቆጣጠሩ እና የQR ማዘዣ ካርዶችን ያትሙ።',
    addTableBtn: 'አዲስ ጠረጴዛ ጨምር',
    thTableNumber: 'የጠረጴዛ ቁጥር',
    thDisplayName: 'የማሳያ ስም',
    thActiveSession: 'ንቁ ክፍለ-ጊዜ',
    thQrCode: 'QR ኮድ',
    viewQrModal: 'QR ተመልከት',
    printTentCard: 'የጠረጴዛ ካርድ አትም',
    downloadQrPng: 'QR አውርድ (PNG)',
    noActiveSession: 'ምንም ንቁ ክፍለ-ጊዜ የለም',
    sessionActive: 'ንቁ ክፍለ-ጊዜ',
    ordersCount: 'ትዕዛዞች',
    createTableModalTitle: 'አዲስ ጠረጴዛ ፍጠር',
    editTableModalTitle: 'ጠረጴዛ አርትዕ',
    tableNumberField: 'የጠረጴዛ ቁጥር (ምሳሌ 1, 2, A1)',
    tableDisplayNameField: 'የማሳያ ስም (አማራጭ)',
    capacityField: 'የመቀመጫ ብዛት',
    saveTable: 'ጠረጴዛ መዝግብ',
    savingTable: 'በመመዝገብ ላይ...',

    // Staff Portal - Staff Tab
    staffPageTitle: 'የሰራተኞች መለያዎች',
    staffPageSubtitle: 'የባሪስታ እና የአድሚን መለያዎችን ያስተዳድሩ፣ ፈቃድ ይስጡ ወይም የይለፍ ቃል ይቀይሩ።',
    addStaffBtn: 'አዲስ ሰራተኛ ጨምር',
    thStaffName: 'ስም',
    thStaffEmail: 'ኢሜይል',
    thStaffRole: 'ሚና',
    thStaffLastLogin: 'የመጨረሻ መግቢያ',
    roleAdmin: 'አስተዳዳሪ (Admin)',
    roleBarista: 'ባሪስታ (Barista)',
    createStaffModalTitle: 'አዲስ ሰራተኛ መመዝገብ',
    resetPasswordModalTitle: 'የይለፍ ቃል ቀይር',
    staffFullNameField: 'ሙሉ ስም',
    staffEmailField: 'ኢሜይል አድራሻ',
    staffPasswordField: 'የይለፍ ቃል',
    staffRoleField: 'የስራ ሚና',
    saveStaff: 'ሰራተኛ መዝግብ',
    savingStaff: 'በመመዝገብ ላይ...',
    neverLoggedIn: 'እስካሁን አልገባም',

    // Staff Portal - Settings Tab
    settingsPageTitle: 'የካፌ ቅንብሮች',
    settingsPageSubtitle: 'የሱቁን ስም፣ አድራሻ፣ ስልክ፣ የገንዘብ ምንዛሬ እና የታተመ ደረሰኝ ማስታወሻ ያዋቅሩ።',
    shopNameLabel: 'የካፌው ስም',
    taglineLabel: 'መሪ ቃል (Tagline)',
    addressLabel: 'አድራሻ',
    phoneLabel: 'የስልክ ቁጥር',
    currencyLabel: 'የገንዘብ ምንዛሬ ኮድ',
    receiptHeaderLabel: 'የደረሰኝ ራስጌ ማስታወሻ',
    receiptFooterLabel: 'የደረሰኝ ግርጌ ማስታወሻ',
    saveSettingsBtn: 'ቅንብሮችን መዝግብ',
    savingSettingsBtn: 'በማስቀመጥ ላይ...',
    settingsSavedSuccess: 'ቅንብሮች በተሳካ ሁኔታ ተቀምጠዋል!',

    // Staff Portal - Audit Tab
    auditPageTitle: 'የባሪስታ ኦዲት እና ክንውን',
    auditPageSubtitle: 'የዛሬውን መጠጥ ዝግጅት፣ በካውንተር የተሰበሰቡ ክፍያዎችን እና ሙሉ የኦዲት ታሪክን ይመርምሩ።',
    todaysOperations: 'የዛሬ ክንውኖች',
    prepTimeAvg: 'አማካይ የዝግጅት ጊዜ',
    drinksPrepared: 'የተዘጋጁ መጠጦች',
    paymentsCollected: 'የተሰበሰበ ክፍያ',
    historicalAuditLog: 'የታሪክ ኦዲት ምዝግብ ማስታወሻ',
    filterStaffLabel: 'በሰራተኛ ለይ:',
    allStaffOption: 'ሁሉም ሰራተኞች',

    // Staff Portal - Barista Queue
    activeOrders: 'ንቁ ትዕዛዞች',
    allOrders: 'ሁሉም ትዕዛዞች',
    pendingFilter: 'አዲስ',
    preparingFilter: 'በመዘጋጀት ላይ',
    readyFilter: 'ዝግጁ',
    completedFilter: 'የተጠናቀቁ',
    startPreparing: 'ማዘጋጀት ጀምር',
    markReady: 'ዝግጁ ሆኗል',
    completeAndPay: 'ክፍያና ማጠናቀቅ',
    printReceipt: 'ደረሰኝ አትም',
    closeSession: 'ጠረጴዛ ዝጋ',
    refresh: 'አድስ',
    noActiveOrders: 'ምንም ንቁ ትዕዛዞች የሉም',

    // Home Page
    freshRoastedBadge: 'ትኩስ የተቆላ የኢትዮጵያ ምርጥ ቡና',
    heroTitle: 'ከጠረጴዛዎ በቀጥታ ይዘዙ።',
    heroSubtitle: 'የጠረጴዛዎን QR ኮድ ስካን ያድርጉ ወይም ከታች ጠረጴዛዎን ይምረጡና ልዩ ቡናዎቻችንን፣ ትኩስ መጠጦችን እና ምግቦችን ይዘዙ።',
    browseMenuCardTitle: 'ሜኑ ይመልከቱ',
    browseMenuCardDesc: 'ሁሉንም የቡና ዓይነቶች፣ የማፍያ መንገዶች እና ምግቦች ይመልከቱ። ክፍያ ሲፈጽሙ ጠረጴዛዎን ይምረጡ።',
    openDigitalMenuBtn: 'ዲጂታል ሜኑ ክፈት',
    quickTableCardTitle: 'ፈጣን የጠረጴዛ ምርጫ',
    quickTableCardDesc: 'ተቀምጠዋል? ጠረጴዛዎን በመምረጥ በቀጥታ ማዘዝ ይጀምሩ።',
    tel: 'ስልክ:',
    rightsReserved: 'መብቱ በህግ የተጠበቀ ነው።',
  },

  en: {
    // Navigation & Common
    cafeSubtitle: 'Artisan Coffee & Roastery',
    table: 'Table',
    tableSelector: 'Table:',
    allRoasts: 'All Roasts',
    searchPlaceholder: 'Search coffee, drinks, or breakfast...',
    noItemsFound: 'No coffee or items found',
    noItemsFoundDesc: 'Try adjusting your search query or roaster category.',
    loading: 'Loading...',
    timeTag: '3–5m',

    // Add to order & Detail modal
    addToOrder: 'Add to Order',
    detailsAndCustomization: 'Details & Customization',
    brewedFresh: 'Brewed fresh to order (approx. 3–5 min)',
    chooseAddons: 'Choose add-ons',
    weRecommend: 'We recommend',
    additionalNotes: 'Additional notes',
    notesPlaceholder: 'e.g. Extra hot, with ice on the side...',
    addSubtotal: 'Subtotal',

    // Cart & Checkout
    yourOrderReview: 'Your Order Review',
    selectedTable: 'Selected table',
    subtotal: 'Subtotal',
    viewOrder: 'View Order',
    tableInstructions: 'Table instructions (optional)',
    instructionsPlaceholder: 'e.g. Serve pour-over first, bring warm water...',
    paymentNotice: 'No online payment gateway needed. Staff will collect payment (Cash / Telebirr / Bank) at your table.',
    totalAmount: 'Total Amount',
    confirmAndPlaceOrder: 'Confirm & Place Order',
    sendingOrder: 'Sending order to barista...',
    cartEmptyError: 'Your cart is empty.',
    selectTableError: 'Please select a table to place your order.',

    // Order Status Tracking
    orderConfirmedTitle: 'Order Confirmed',
    orderConfirmedDesc: 'Your order has been queued directly with the espresso bar.',
    orderNumber: 'Order Number',
    payment: 'Payment',
    paid: 'Paid',
    payAtTable: 'Pay in person (Staff collects at table)',
    prepStatus: 'Preparation status',
    stepPlaced: 'Order Placed',
    stepPlacedDesc: 'Received by the espresso bar',
    stepConfirmed: 'Confirmed',
    stepConfirmedDesc: 'Barista queued your items',
    stepPreparing: 'Preparing',
    stepPreparingDesc: 'Grinding beans & brewing',
    stepReady: 'Ready',
    stepReadyDesc: 'Ready / on the way to table',
    stepServed: 'Served',
    stepServedDesc: 'Order complete',
    orderCancelled: 'Order Cancelled',
    orderCancelledDesc: 'This order was cancelled. Please speak with your barista for assistance.',
    itemsOrdered: 'Items ordered',
    orderMoreItems: 'Order more items',

    // Staff Portal - Common
    staffPortal: 'Staff portal',
    baristaBar: 'Barista bar',
    loggedInAs: 'Logged in as',
    adminPortal: 'Admin portal',
    baristaCounter: 'Barista counter',
    signOut: 'Sign out',
    backToHome: 'Back to cafe home',

    // Staff Portal - Login
    loginTitle: 'Staff portal',
    loginSubtitle: 'Sign in to access barista queue or administration',
    emailLabel: 'Email address',
    emailPlaceholder: 'barista@barchcoffee.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••••••',
    signInButton: 'Sign in',
    signingInButton: 'Signing in...',
    authorizedOnlyNotice: 'Authorized staff only. Public registration is disabled.',

    // Staff Portal - Admin Sidebar
    adminOverview: 'Overview',
    adminAudit: 'Barista audit',
    adminMenu: 'Menu items',
    adminCategories: 'Categories',
    adminAddons: 'Add-ons',
    adminTables: 'Tables & QR',
    adminStaff: 'Staff accounts',
    adminOrders: 'Order history',
    adminSettings: 'Cafe settings',
    adminPortalTitle: 'Barch Admin',
    adminPortalSubtitle: 'Management portal',

    // Staff Portal - Admin Dashboard
    adminDashboardTitle: 'Cafe operations',
    adminDashboardSubtitle: 'Live summary of active orders, table sessions, and recent customer submissions.',
    ordersInQueue: 'Orders in queue',
    awaitingAcceptance: 'Awaiting acceptance',
    currentlyBrewing: 'Currently brewing',
    activeTableSessions: 'Active table sessions',
    baristaCounterDesc: 'Manage live incoming queue & prepare drinks',
    baristaAuditDesc: "Today's shift logs & paginated history",
    tablesAndQrDesc: 'Generate QR ordering codes and monitor tables',
    menuManagementTitle: 'Menu management',
    menuManagementDesc: 'Set seasonal roasts, prices, and photo links',
    recentOrdersTitle: 'Recent orders',
    recentOrdersSubtitle: 'Latest orders received across cafe tables',
    viewAllOrders: 'View all orders',
    noRecentOrders: 'No recent orders found.',
    thOrderNumber: 'Order number',
    thTable: 'Table',
    thItems: 'Items',
    thTotal: 'Total',
    thStatus: 'Status',
    thTime: 'Time',

    // Pagination & Common Controls
    showingEntries: 'Showing {from}–{to} of {total}',
    previousPage: 'Previous',
    nextPage: 'Next',
    perPage: 'Per page:',
    page: 'Page',

    // Staff Portal - Orders Tab
    ordersPageTitle: 'Order history and audit',
    ordersPageSubtitle: 'Inspect historical orders, item pricing snapshots, payments, and status changes.',
    searchOrdersPlaceholder: 'Search order number, table, or item...',
    allStatuses: 'All statuses',
    filterStatusPending: 'Pending',
    filterStatusPreparing: 'Preparing',
    filterStatusCompleted: 'Completed',
    filterStatusCancelled: 'Cancelled',
    thItemsSummary: 'Items summary',
    thPayment: 'Payment',
    thDetails: 'Details',
    noOrdersFound: 'No orders match your filter criteria.',
    orderPaid: 'Paid',
    orderUnpaid: 'Unpaid',
    viewConsolidatedReceipt: 'View consolidated receipt',
    itemsSnapshotAtOrder: 'Items snapshot at order time',
    statusAuditTrail: 'Status transition audit trail',
    noteLabel: 'Note:',

    // Staff Portal - Menu Tab
    menuPageTitle: 'Menu management',
    menuPageSubtitle: 'Add coffees, update seasonal roast prices, or toggle daily availability.',
    searchProductsPlaceholder: 'Search products by name or description...',
    allCategoriesFilter: 'All categories',
    cardsView: 'Cards',
    tableView: 'Table',
    addProductBtn: 'Add product',
    inStock: 'In Stock',
    soldOut: 'Sold Out',
    changeImageLink: 'Change image link',
    editProduct: 'Edit product',
    archiveProduct: 'Archive product',
    saveProduct: 'Save product',
    savingProduct: 'Saving...',
    createProductModalTitle: 'Add coffee product',
    editProductModalTitle: 'Edit product',
    productNameEn: 'Product name (English)',
    productNameAm: 'Product name (Amharic)',
    categoryLabel: 'Category',
    priceLabel: 'Price',
    descEnLabel: 'Description (English)',
    descAmLabel: 'Description (Amharic)',
    imageUrlLabel: 'Image URL',
    availableForOrdering: 'Available for customer ordering',
    cancelBtn: 'Cancel',
    noProductsFound: 'No products found',
    chooseAddonsForProduct: 'Choose Add-ons for this Item',
    noAddonsConfigured: 'No add-ons available. Create add-ons in the Add-ons manager first.',
    recommendationsForProduct: 'Pairings & Recommendations ("We Recommend")',
    searchMenuItemsPlaceholder: 'Search menu items to recommend...',
    noRecommendationsSelected: 'No recommendations selected (will use category defaults).',

    // Staff Portal - Addons Tab
    addonsPageTitle: 'Specialty Add-ons & Customizations',
    addonsPageSubtitle: 'Manage customizable milk alternatives, extra espresso shots, syrups, and flavours.',
    addNewAddon: 'Add new add-on',
    thIcon: 'Icon',
    thAddonName: 'Add-on name',
    thExtraPrice: 'Extra charge',
    thAppliedToItems: 'Assigned items',
    createAddonModalTitle: 'Create specialty add-on',
    editAddonModalTitle: 'Edit specialty add-on',
    addonNameLabel: 'Add-on name',
    addonNameAmLabel: 'Amharic name',
    addonNameEnLabel: 'English name',
    addonPriceLabel: 'Extra charge (ETB)',
    addonIconLabel: 'Icon / Emoji (e.g. 🥛, ☕)',
    addonAvailableLabel: 'Available for ordering',
    deleteAddonConfirm: 'Are you sure you want to remove this add-on?',
    noAddonsFound: 'No add-ons found',
    searchAddonsPlaceholder: 'Search add-ons by name...',
    freeAddon: 'Free',

    // Staff Portal - Categories Tab
    categoriesPageTitle: 'Menu categories',
    categoriesPageSubtitle: 'Manage and organize categories shown on the customer digital menu.',
    addCategoryBtn: 'Add category',
    thOrder: 'Order',
    thCategoryName: 'Category name',
    thSlug: 'Slug',
    thActiveProducts: 'Active products',
    thActions: 'Actions',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    editCategory: 'Edit',
    createCategoryModalTitle: 'Create category',
    editCategoryModalTitle: 'Edit category',
    categoryNameField: 'Category name',
    categorySlugField: 'Slug (URL-friendly)',
    displayOrderField: 'Display order',
    descriptionField: 'Description',
    categoryActiveCheckbox: 'Active and visible on customer menu',
    saveCategory: 'Save category',
    savingCategory: 'Saving...',

    // Staff Portal - Tables Tab
    tablesPageTitle: 'Tables & QR codes',
    tablesPageSubtitle: 'Manage dining tables, inspect active visits, and print QR ordering tents.',
    addTableBtn: 'Add table',
    thTableNumber: 'Table number',
    thDisplayName: 'Display name',
    thActiveSession: 'Active session',
    thQrCode: 'QR code',
    viewQrModal: 'View QR',
    printTentCard: 'Print tent card',
    downloadQrPng: 'Download QR PNG',
    noActiveSession: 'No active visit',
    sessionActive: 'Active session',
    ordersCount: 'orders',
    createTableModalTitle: 'Add dining table',
    editTableModalTitle: 'Edit table',
    tableNumberField: 'Table number (e.g. 1, 2, A1)',
    tableDisplayNameField: 'Display name (optional)',
    capacityField: 'Seating capacity',
    saveTable: 'Save table',
    savingTable: 'Saving...',

    // Staff Portal - Staff Tab
    staffPageTitle: 'Staff accounts',
    staffPageSubtitle: 'Manage barista staff accounts, grant access, or update passwords.',
    addStaffBtn: 'Add staff member',
    thStaffName: 'Name',
    thStaffEmail: 'Email',
    thStaffRole: 'Role',
    thStaffLastLogin: 'Last login',
    roleAdmin: 'Administrator',
    roleBarista: 'Barista',
    createStaffModalTitle: 'Create staff account',
    resetPasswordModalTitle: 'Reset password',
    staffFullNameField: 'Full name',
    staffEmailField: 'Email address',
    staffPasswordField: 'Password',
    staffRoleField: 'Account role',
    saveStaff: 'Save staff',
    savingStaff: 'Saving...',
    neverLoggedIn: 'Never',

    // Staff Portal - Settings Tab
    settingsPageTitle: 'Cafe settings',
    settingsPageSubtitle: 'Configure shop name, location details, currency, and printed receipt footer.',
    shopNameLabel: 'Cafe name',
    taglineLabel: 'Tagline / Subtitle',
    addressLabel: 'Address',
    phoneLabel: 'Phone number',
    currencyLabel: 'Currency code',
    receiptHeaderLabel: 'Receipt header message',
    receiptFooterLabel: 'Receipt footer message',
    saveSettingsBtn: 'Save cafe settings',
    savingSettingsBtn: 'Saving changes...',
    settingsSavedSuccess: 'Settings saved successfully!',

    // Staff Portal - Audit Tab
    auditPageTitle: 'Barista audit & operations',
    auditPageSubtitle: "Inspect today's barista drink preparation, counter payments collected, and full paginated audit history.",
    todaysOperations: "Today's operations",
    prepTimeAvg: 'Avg prep time',
    drinksPrepared: 'Drinks prepared',
    paymentsCollected: 'Payments collected',
    historicalAuditLog: 'Historical audit log',
    filterStaffLabel: 'Filter by staff:',
    allStaffOption: 'All staff members',

    // Staff Portal - Barista Queue
    activeOrders: 'Active orders',
    allOrders: 'All orders',
    pendingFilter: 'Pending',
    preparingFilter: 'Preparing',
    readyFilter: 'Ready',
    completedFilter: 'Completed',
    startPreparing: 'Start Preparing',
    markReady: 'Mark Ready',
    completeAndPay: 'Complete & Pay',
    printReceipt: 'Print Receipt',
    closeSession: 'Close Session',
    refresh: 'Refresh',
    noActiveOrders: 'No active orders in queue',

    // Home Page
    freshRoastedBadge: 'Freshly roasted Ethiopian single origins',
    heroTitle: 'Order directly from your table.',
    heroSubtitle: 'Scan your table’s QR code or select your table below to browse our seasonal harvest coffees, signature drinks, and fresh breakfast items.',
    browseMenuCardTitle: 'Browse the menu',
    browseMenuCardDesc: 'Explore our full coffee lineup, brew methods, and breakfast items. Select your table at checkout.',
    openDigitalMenuBtn: 'Open digital menu',
    quickTableCardTitle: 'Quick table selection',
    quickTableCardDesc: 'Already seated? Jump directly into ordering with your table pre-selected.',
    tel: 'Tel:',
    rightsReserved: 'All rights reserved.',
  },
};

// Item and Category Bilingual Dictionary
interface LocalizedContent {
  name: { am: string; en: string };
  description?: { am: string; en: string };
}

export const CATEGORY_TRANSLATIONS: Record<string, LocalizedContent> = {
  'special-breakfasts': {
    name: { am: 'ልዩ ቁርሶች', en: 'Special Breakfasts' },
    description: {
      am: 'ጣፋጭ እና ባህላዊ የቁርስ አማራጮች',
      en: 'Delicious traditional Ethiopian breakfast specialties',
    },
  },
  'hot-drinks': {
    name: { am: 'ትኩስ መጠጦች', en: 'Hot Drinks' },
    description: {
      am: 'ጥሩ መዓዛ ያላቸው ትኩስ የቡና፣ የሻይ እና የወተት መጠጦች',
      en: 'Aromatic hot coffees, herbal teas, and steamed milk drinks',
    },
  },
  'hot-coffees': {
    name: { am: 'ትኩስ ቡናዎች', en: 'Hot Coffees' },
    description: { am: 'የተመረጡ የሀገራችን ትኩስ ቡናዎች', en: 'Freshly roasted single-origin coffees' },
  },
  'cold-brews-iced': {
    name: { am: 'ቀዝቃዛ መጠጦች', en: 'Cold Brews & Iced' },
    description: { am: 'ቀዝቃዛ እና አሪፍ የቡና መጠጦች', en: 'Slow-steeped cold brews and iced coffees' },
  },
  'signature-specialty': {
    name: { am: 'ልዩ መጠጦች', en: 'Signature & Specialty' },
    description: { am: 'ልዩ የባሪስታ ድብልቆች', en: 'Artisan handcrafted barista creations' },
  },
  'pastries-bakery': {
    name: { am: 'ዳቦ እና ኬክ', en: 'Pastries & Bakery' },
    description: { am: 'ትኩስ ኬኮች እና ዳቦዎች', en: 'Freshly baked artisanal treats' },
  },
  'teas-refreshers': {
    name: { am: 'ሻይ እና ማደሻዎች', en: 'Teas & Refreshers' },
    description: { am: 'የተለያዩ የሻይ አማራጮች', en: 'Specialty loose-leaf teas and tonics' },
  },
};

export const MENU_ITEM_TRANSLATIONS: Record<string, LocalizedContent> = {
  'ቆጮ/እርጥብ': {
    name: { am: 'ቆጮ/እርጥብ', en: 'Kocho / Ertib' },
    description: {
      am: 'በልዩ ቅቤ እና በርበሬ የተዘጋጀ',
      en: 'Traditional Enset flatbread prepared with spiced clarified butter and berbere',
    },
  },
  'ጨጨብሳ': {
    name: { am: 'ጨጨብሳ', en: 'Chechebsa' },
    description: {
      am: 'ጣፋጭ እና ለስላሳ የቤት ውስጥ ጨጨብሳ',
      en: 'Tender pan-fried flatbread pieces drenched in seasoned spiced butter and pure honey',
    },
  },
  'ፋታ (ፍርፍር)': {
    name: { am: 'ፋታ (ፍርፍር)', en: 'Fata (Firfir)' },
    description: {
      am: 'በቀይ ሽንኩርት፣ ቅቤ እና ቅመማቅመም የተዘጋጀ',
      en: 'Savory bread firfir seasoned with caramelised red onions, spiced butter, and herbs',
    },
  },
  'ቡና': {
    name: { am: 'ቡና', en: 'Traditional Coffee' },
    description: {
      am: 'ጥሩ መዓዛ ያለው የሀገራችን ባህላዊ ቡና',
      en: 'Aromatic Ethiopian single-origin coffee traditionally brewed over charcoal',
    },
  },
  'ሻይ': {
    name: { am: 'ሻይ', en: 'Spiced Tea' },
    description: {
      am: 'ትኩስ እና ጣፋጭ ሻይ',
      en: 'Freshly brewed black tea infused with fragrant cardamom and cinnamon',
    },
  },
  'ወተት': {
    name: { am: 'ወተት', en: 'Steamed Milk' },
    description: {
      am: 'ትኩስ እና ጣፋጭ ወተት',
      en: 'Warm whole steamed milk with velvety micro-foam and subtle sweetness',
    },
  },
  'ልዩ የተጣራ ቡና (Pour-Over Coffee)': {
    name: { am: 'ልዩ የተጣራ ቡና (Pour-Over Coffee)', en: 'Pour-Over Coffee (Yirgacheffe)' },
    description: {
      am: 'የተመረጠ የይርጋጨፌ የተጣራ ቡና ከጣፋጭ የአበባ መዓዛ ጋር (Yirgacheffe Single-Origin Pour-Over)',
      en: 'Selected Yirgacheffe single-origin pour-over coffee with sweet floral jasmine & bergamot notes',
    },
  },
};

// Add-ons bilingual dictionary
export const ADDON_TRANSLATIONS: Record<string, { am: string; en: string }> = {
  'Oat Milk': { am: 'የአጃ ወተት', en: 'Oat Milk' },
  'Extra Shot': { am: 'ተጨማሪ ሾት', en: 'Extra Shot' },
  'Vanilla Bean': { am: 'ቫኒላ', en: 'Vanilla Bean' },
  'Sweet Cream': { am: 'ጣፋጭ ክሬም', en: 'Sweet Cream' },
  'No Sugar': { am: 'ያለ ስኳር', en: 'No Sugar' },
  'Cardamom': { am: 'ኮረሪማ / ሄል', en: 'Cardamom' },
};

/**
 * Translates a category given its slug or fallback name and optional bilingual fields
 */
export function getLocalizedCategory(
  slug: string,
  rawName: string,
  rawDesc: string | null,
  lang: Language,
  nameAm?: string | null,
  nameEn?: string | null,
  descriptionAm?: string | null,
  descriptionEn?: string | null
): { name: string; description: string | null } {
  // If language-specific database field exists, prioritize it!
  if (lang === 'am') {
    const directName = nameAm?.trim();
    const directDesc = descriptionAm?.trim();
    if (directName) {
      return {
        name: directName,
        description: directDesc || rawDesc,
      };
    }
  } else if (lang === 'en') {
    const directName = nameEn?.trim();
    const directDesc = descriptionEn?.trim();
    if (directName) {
      return {
        name: directName,
        description: directDesc || rawDesc,
      };
    }
  }

  const match = CATEGORY_TRANSLATIONS[slug];
  if (match) {
    return {
      name: match.name[lang] || rawName,
      description: match.description ? match.description[lang] : rawDesc,
    };
  }

  // Look up by rawName if slug didn't match directly
  for (const item of Object.values(CATEGORY_TRANSLATIONS)) {
    if (item.name.am === rawName || item.name.en === rawName) {
      return {
        name: item.name[lang] || rawName,
        description: item.description ? item.description[lang] : rawDesc,
      };
    }
  }

  return {
    name: (lang === 'am' ? nameAm : nameEn)?.trim() || rawName,
    description: (lang === 'am' ? descriptionAm : descriptionEn)?.trim() || rawDesc,
  };
}

/**
 * Translates a menu item given its name, description, and optional bilingual fields
 */
export function getLocalizedMenuItem(
  rawName: string,
  rawDesc: string | null,
  lang: Language,
  nameAm?: string | null,
  nameEn?: string | null,
  descriptionAm?: string | null,
  descriptionEn?: string | null
): { name: string; description: string | null } {
  // 1. Direct language override if stored in database
  if (lang === 'am') {
    const directName = nameAm?.trim();
    const directDesc = descriptionAm?.trim();
    if (directName) {
      return {
        name: directName,
        description: directDesc || (descriptionEn?.trim() ?? rawDesc),
      };
    }
  } else if (lang === 'en') {
    const directName = nameEn?.trim();
    const directDesc = descriptionEn?.trim();
    if (directName) {
      return {
        name: directName,
        description: directDesc || (descriptionAm?.trim() ?? rawDesc),
      };
    }
  }

  // 2. Dictionary match
  const match = MENU_ITEM_TRANSLATIONS[rawName];
  if (match) {
    return {
      name: match.name[lang] || rawName,
      description: match.description ? match.description[lang] : rawDesc,
    };
  }

  // 3. Search across values in case rawName matches either English or Amharic
  for (const item of Object.values(MENU_ITEM_TRANSLATIONS)) {
    if (item.name.am === rawName || item.name.en === rawName) {
      return {
        name: item.name[lang] || rawName,
        description: item.description ? item.description[lang] : rawDesc,
      };
    }
  }

  // 4. Fallback to secondary optional language or primary
  const fallbackName =
    (lang === 'am' ? nameAm : nameEn)?.trim() ||
    rawName ||
    (lang === 'am' ? nameEn : nameAm)?.trim() ||
    '';
  const fallbackDesc =
    (lang === 'am' ? descriptionAm : descriptionEn)?.trim() ||
    rawDesc ||
    (lang === 'am' ? descriptionEn : descriptionAm)?.trim() ||
    null;

  return { name: fallbackName, description: fallbackDesc };
}

/**
 * Formats currency label based on language
 */
export function getLocalizedCurrency(rawCurrency: string, lang: Language): string {
  if (lang === 'am') {
    return rawCurrency === 'ETB' ? 'ብር' : rawCurrency;
  }
  return rawCurrency === 'ብር' ? 'ETB' : rawCurrency;
}
