export type Language = 'am' | 'en';

export interface TranslationDictionary {
  // Navigation & Common
  cafeSubtitle: string;
  table: string;
  tableSelector: string;
  allRoasts: string;
  searchPlaceholder: string;
  noItemsFound: string;
  noItemsFoundDesc: string;
  loading: string;
  timeTag: string;

  // Add to order & Detail modal
  addToOrder: string;
  detailsAndCustomization: string;
  brewedFresh: string;
  chooseAddons: string;
  weRecommend: string;
  additionalNotes: string;
  notesPlaceholder: string;
  addSubtotal: string;

  // Cart & Checkout
  yourOrderReview: string;
  selectedTable: string;
  subtotal: string;
  viewOrder: string;
  tableInstructions: string;
  instructionsPlaceholder: string;
  paymentNotice: string;
  totalAmount: string;
  confirmAndPlaceOrder: string;
  sendingOrder: string;
  cartEmptyError: string;
  selectTableError: string;

  // Order Status Tracking
  orderConfirmedTitle: string;
  orderConfirmedDesc: string;
  orderNumber: string;
  payment: string;
  paid: string;
  payAtTable: string;
  prepStatus: string;
  stepPlaced: string;
  stepPlacedDesc: string;
  stepConfirmed: string;
  stepConfirmedDesc: string;
  stepPreparing: string;
  stepPreparingDesc: string;
  stepReady: string;
  stepReadyDesc: string;
  stepServed: string;
  stepServedDesc: string;
  orderCancelled: string;
  orderCancelledDesc: string;
  itemsOrdered: string;
  orderMoreItems: string;

  // Staff Portal - Common
  staffPortal: string;
  baristaBar: string;
  loggedInAs: string;
  adminPortal: string;
  baristaCounter: string;
  signOut: string;
  backToHome: string;

  // Staff Portal - Login
  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  signInButton: string;
  signingInButton: string;
  authorizedOnlyNotice: string;

  // Staff Portal - Admin Sidebar
  adminOverview: string;
  adminAudit: string;
  adminMenu: string;
  adminCategories: string;
  adminAddons: string;
  adminTables: string;
  adminStaff: string;
  adminOrders: string;
  adminSettings: string;
  adminPortalTitle: string;
  adminPortalSubtitle: string;

  // Staff Portal - Admin Dashboard
  adminDashboardTitle: string;
  adminDashboardSubtitle: string;
  ordersInQueue: string;
  awaitingAcceptance: string;
  currentlyBrewing: string;
  activeTableSessions: string;
  baristaCounterDesc: string;
  baristaAuditDesc: string;
  tablesAndQrDesc: string;
  menuManagementTitle: string;
  menuManagementDesc: string;
  recentOrdersTitle: string;
  recentOrdersSubtitle: string;
  viewAllOrders: string;
  noRecentOrders: string;
  thOrderNumber: string;
  thTable: string;
  thItems: string;
  thTotal: string;
  thStatus: string;
  thTime: string;

  // Pagination & Common Controls
  showingEntries: string;
  previousPage: string;
  nextPage: string;
  perPage: string;
  page: string;

  // Staff Portal - Orders Tab
  ordersPageTitle: string;
  ordersPageSubtitle: string;
  searchOrdersPlaceholder: string;
  allStatuses: string;
  filterStatusPending: string;
  filterStatusPreparing: string;
  filterStatusCompleted: string;
  filterStatusCancelled: string;
  thItemsSummary: string;
  thPayment: string;
  thDetails: string;
  noOrdersFound: string;
  orderPaid: string;
  orderUnpaid: string;
  viewConsolidatedReceipt: string;
  itemsSnapshotAtOrder: string;
  statusAuditTrail: string;
  noteLabel: string;

  // Staff Portal - Menu Tab
  menuPageTitle: string;
  menuPageSubtitle: string;
  searchProductsPlaceholder: string;
  allCategoriesFilter: string;
  cardsView: string;
  tableView: string;
  addProductBtn: string;
  inStock: string;
  soldOut: string;
  changeImageLink: string;
  editProduct: string;
  archiveProduct: string;
  saveProduct: string;
  savingProduct: string;
  createProductModalTitle: string;
  editProductModalTitle: string;
  productNameEn: string;
  productNameAm: string;
  categoryLabel: string;
  priceLabel: string;
  descEnLabel: string;
  descAmLabel: string;
  imageUrlLabel: string;
  availableForOrdering: string;
  cancelBtn: string;
  noProductsFound: string;
  chooseAddonsForProduct: string;
  noAddonsConfigured: string;
  recommendationsForProduct: string;
  searchMenuItemsPlaceholder: string;
  noRecommendationsSelected: string;

  // Staff Portal - Addons Tab
  addonsPageTitle: string;
  addonsPageSubtitle: string;
  addNewAddon: string;
  thIcon: string;
  thAddonName: string;
  thExtraPrice: string;
  thAppliedToItems: string;
  createAddonModalTitle: string;
  editAddonModalTitle: string;
  addonNameLabel: string;
  addonNameAmLabel: string;
  addonNameEnLabel: string;
  addonPriceLabel: string;
  addonIconLabel: string;
  addonAvailableLabel: string;
  deleteAddonConfirm: string;
  noAddonsFound: string;
  searchAddonsPlaceholder: string;
  freeAddon: string;

  // Staff Portal - Categories Tab
  categoriesPageTitle: string;
  categoriesPageSubtitle: string;
  addCategoryBtn: string;
  thOrder: string;
  thCategoryName: string;
  thSlug: string;
  thActiveProducts: string;
  thActions: string;
  statusActive: string;
  statusInactive: string;
  editCategory: string;
  createCategoryModalTitle: string;
  editCategoryModalTitle: string;
  categoryNameField: string;
  categorySlugField: string;
  displayOrderField: string;
  descriptionField: string;
  categoryActiveCheckbox: string;
  saveCategory: string;
  savingCategory: string;

  // Staff Portal - Tables Tab
  tablesPageTitle: string;
  tablesPageSubtitle: string;
  addTableBtn: string;
  thTableNumber: string;
  thDisplayName: string;
  thActiveSession: string;
  thQrCode: string;
  viewQrModal: string;
  printTentCard: string;
  downloadQrPng: string;
  noActiveSession: string;
  sessionActive: string;
  ordersCount: string;
  createTableModalTitle: string;
  editTableModalTitle: string;
  tableNumberField: string;
  tableDisplayNameField: string;
  capacityField: string;
  saveTable: string;
  savingTable: string;

  // Staff Portal - Staff Tab
  staffPageTitle: string;
  staffPageSubtitle: string;
  addStaffBtn: string;
  thStaffName: string;
  thStaffEmail: string;
  thStaffRole: string;
  thStaffLastLogin: string;
  roleAdmin: string;
  roleBarista: string;
  createStaffModalTitle: string;
  resetPasswordModalTitle: string;
  staffFullNameField: string;
  staffEmailField: string;
  staffPasswordField: string;
  staffRoleField: string;
  saveStaff: string;
  savingStaff: string;
  neverLoggedIn: string;

  // Staff Portal - Settings Tab
  settingsPageTitle: string;
  settingsPageSubtitle: string;
  shopNameLabel: string;
  taglineLabel: string;
  addressLabel: string;
  phoneLabel: string;
  currencyLabel: string;
  receiptHeaderLabel: string;
  receiptFooterLabel: string;
  saveSettingsBtn: string;
  savingSettingsBtn: string;
  settingsSavedSuccess: string;

  // Staff Portal - Audit Tab
  auditPageTitle: string;
  auditPageSubtitle: string;
  todaysOperations: string;
  prepTimeAvg: string;
  drinksPrepared: string;
  paymentsCollected: string;
  historicalAuditLog: string;
  filterStaffLabel: string;
  allStaffOption: string;

  // Staff Portal - Barista Queue
  activeOrders: string;
  allOrders: string;
  pendingFilter: string;
  preparingFilter: string;
  readyFilter: string;
  completedFilter: string;
  startPreparing: string;
  markReady: string;
  completeAndPay: string;
  printReceipt: string;
  closeSession: string;
  refresh: string;
  noActiveOrders: string;

  // Home Page
  freshRoastedBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  browseMenuCardTitle: string;
  browseMenuCardDesc: string;
  openDigitalMenuBtn: string;
  quickTableCardTitle: string;
  quickTableCardDesc: string;
  tel: string;
  rightsReserved: string;
}
