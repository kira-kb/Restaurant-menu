import { z } from 'zod';
import { Role, PaymentMethod } from '@prisma/client';

export const CategoryInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  nameAm: z.string().max(100).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  nameEn: z.string().max(100).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(250).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  descriptionAm: z.string().max(250).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  descriptionEn: z.string().max(250).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const MenuItemInputSchema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character').max(100),
  nameAm: z.string().max(100).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  nameEn: z.string().max(100).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  description: z.string().max(500).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  descriptionAm: z.string().max(500).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  descriptionEn: z.string().max(500).optional().nullable().transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  price: z.coerce.number().positive('Price must be greater than zero'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  isAvailable: z.boolean().default(true),
});

export const TableInputSchema = z.object({
  tableNumber: z
    .string()
    .min(1, 'Table identifier is required')
    .max(20)
    .trim(),
  displayName: z.string().max(100).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const StaffCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(Role).default(Role.BARISTA),
});

export const StaffPasswordChangeSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const StaffUpdateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  isActive: z.boolean(),
  role: z.nativeEnum(Role),
});

export const OrderItemSubmissionSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50),
  notes: z.string().max(200).optional().nullable(),
});

export const OrderSubmissionSchema = z.object({
  tableId: z.string().min(1, 'Table selection is required'),
  items: z.array(OrderItemSubmissionSchema).min(1, 'Order must contain at least one item'),
  notes: z.string().max(500).optional().nullable(),
  idempotencyKey: z.string().max(100).optional().nullable(),
});

export const PaymentRecordSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  orderId: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Payment amount must be greater than 0'),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(250).optional().nullable(),
});

export const ShopSettingsSchema = z.object({
  cafeName: z.string().min(1, 'Cafe name is required').max(100),
  tagline: z.string().max(150).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  currency: z.string().min(1).max(10).default('ETB'),
  receiptHeader: z.string().max(250).optional().nullable(),
  receiptFooter: z.string().max(250).optional().nullable(),
  taxRatePercent: z.coerce.number().min(0).max(100).default(0),
});
