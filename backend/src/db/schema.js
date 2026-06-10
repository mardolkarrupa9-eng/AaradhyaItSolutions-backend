import {
  pgTable, serial, varchar,
  text, boolean, integer, timestamp
} from 'drizzle-orm/pg-core';

// ─── ADMIN ───────────────────────────────────────
export const adminTable = pgTable('admin', {
  admin_id:           serial('admin_id').primaryKey(),
  username:           varchar('username', { length: 50 }).notNull().unique(),
  password_hash:      text('password_hash').notNull(),
  full_name:          varchar('full_name', { length: 100 }),
  email:              varchar('email', { length: 100 }),
  phone_no:           varchar('phone_no', { length: 20 }),
  avatar_path:        text('avatar_path'),
  role:               varchar('role', { length: 50 }).default('System Administrator'),
  two_factor_enabled: boolean('two_factor_enabled').default(false),
});

// ─── COMPANY INFO ─────────────────────────────────
export const companyInfoTable = pgTable('company_info', {
  company_id:         serial('company_id').primaryKey(),
  company_name:       varchar('company_name', { length: 100 }),
  legal_name:         varchar('legal_name', { length: 100 }),
  gstin:              varchar('gstin', { length: 20 }),
  incorporation_date: varchar('incorporation_date', { length: 20 }),
  logo_path:          text('logo_path'),
  support_email:      varchar('support_email', { length: 100 }),
  sales_email:        varchar('sales_email', { length: 100 }),
  primary_phone:      varchar('primary_phone', { length: 20 }),
  whatsapp_no:        varchar('whatsapp_no', { length: 20 }),
  address_line1:      varchar('address_line1', { length: 150 }),
  address_line2:      varchar('address_line2', { length: 150 }),
  city:               varchar('city', { length: 50 }),
  state:              varchar('state', { length: 50 }),
  pin_code:           varchar('pin_code', { length: 10 }),
  linkedin:           text('linkedin'),
  twitter:            text('twitter'),
  facebook:           text('facebook'),
});

// ─── CATEGORY ─────────────────────────────────────
export const categoryTable = pgTable('category', {
  cat_id: serial('cat_id').primaryKey(),
  name:   varchar('name', { length: 50 }).notNull().unique(),
});

// ─── PRODUCT ──────────────────────────────────────
export const productTable = pgTable('product', {
  prod_id:       serial('prod_id').primaryKey(),
  cat_id:        integer('cat_id').references(() => categoryTable.cat_id),
  name:          varchar('name', { length: 100 }).notNull(),
  type:          varchar('type', { length: 20 }).notNull(),
  short_desc:    text('short_desc'),
  full_desc:     text('full_desc'),
  image_path:    text('image_path'),
  catalogue_path: text('catalogue_path'),
  is_active:     boolean('is_active').default(true),
  display_order: integer('display_order').default(0),
  created_at:    timestamp('created_at').defaultNow(),
});

// ─── PRODUCT IMAGE ────────────────────────────────
export const productImageTable = pgTable('product_image', {
  img_id:   serial('img_id').primaryKey(),
  prod_id:  integer('prod_id').references(() => productTable.prod_id),
  img_path: text('img_path').notNull(),
  alt_text: varchar('alt_text', { length: 100 }),
});

// ─── PRODUCT FEATURE ──────────────────────────────
export const prodFeatureTable = pgTable('prod_feature', {
  feature_id:   serial('feature_id').primaryKey(),
  prod_id:      integer('prod_id').references(() => productTable.prod_id),
  feature_text: text('feature_text').notNull(),
});

// ─── PRODUCT SPEC ─────────────────────────────────
export const prodSpecTable = pgTable('prod_spec', {
  spec_id:    serial('spec_id').primaryKey(),
  prod_id:    integer('prod_id').references(() => productTable.prod_id),
  spec_key:   varchar('spec_key', { length: 50 }).notNull(),
  spec_value: text('spec_value').notNull(),
});

// ─── INQUIRY ──────────────────────────────────────
export const inquiryTable = pgTable('inquiry', {
  inquiry_id:    serial('inquiry_id').primaryKey(),
  prod_id:       integer('prod_id').references(() => productTable.prod_id),
  full_name:     varchar('full_name', { length: 100 }).notNull(),
  business_name: varchar('business_name', { length: 100 }),
  phone_no:      varchar('phone_no', { length: 20 }).notNull(),
  message:       text('message'),
  status:        varchar('status', { length: 20 }).default('New'),
  method:        varchar('method', { length: 20 }).default('Website'),
  inq_date:      timestamp('inq_date').defaultNow(),
});

// ─── SYSTEM CONFIG ────────────────────────────────
export const systemConfigTable = pgTable('system_config', {
  config_id:        serial('config_id').primaryKey(),
  maintenance_mode: boolean('maintenance_mode').default(false),
  primary_language: varchar('primary_language', { length: 50 }).default('English - India'),
  timezone:         varchar('timezone', { length: 50 }).default('IST - UTC+5:30'),
  gmaps_api_key:    text('gmaps_api_key'),
  whatsapp_api_key: text('whatsapp_api_key'),
  cloud_storage:    varchar('cloud_storage', { length: 50 }).default('AWS S3'),
  auto_backup:      boolean('auto_backup').default(true),
  backup_frequency: varchar('backup_frequency', { length: 20 }).default('Daily'),
  updated_at:       timestamp('updated_at').defaultNow(),
});

// ─── NOTIFICATION PREFS ───────────────────────────
export const notificationPrefsTable = pgTable('notification_prefs', {
  pref_id:              serial('pref_id').primaryKey(),
  admin_id:             integer('admin_id').references(() => adminTable.admin_id),
  new_inquiry_alerts:   boolean('new_inquiry_alerts').default(true),
  product_stock_alerts: boolean('product_stock_alerts').default(false),
  weekly_summary:       boolean('weekly_summary').default(true),
  customer_reviews:     boolean('customer_reviews').default(true),
  login_activity:       boolean('login_activity').default(true),
  security_updates:     boolean('security_updates').default(true),
  data_export_notif:    boolean('data_export_notif').default(false),
  whatsapp_forwarding:  boolean('whatsapp_forwarding').default(false),
});

// ─── PRODUCT BACKUPS ──────────────────────────────
export const productBackupsTable = pgTable('product_backups', {
  backup_id:    serial('backup_id').primaryKey(),
  backed_up_at: timestamp('backed_up_at').defaultNow(),
  label:        text('label').default('auto'),
  categories:   text('categories'),
  products:     text('products'),
  features:     text('features'),
  specs:        text('specs'),
  images:       text('images'),
});