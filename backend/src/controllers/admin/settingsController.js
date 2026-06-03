import bcrypt from "bcryptjs";
import { db } from "../../db/index.js";
import supabase from "../../db/supabase.js";
import {
  adminTable, companyInfoTable,
  notificationPrefsTable, systemConfigTable
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

// ─── PROFILE ──────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const [admin] = await db.select()
      .from(adminTable)
      .where(eq(adminTable.admin_id, req.admin.admin_id));

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({
  fullName:   admin.full_name || '',
  email:      admin.email || '',
  phone:      admin.phone_no || '',
  role:       admin.role || '',
  avatarPath: admin.avatar_path || '',
});
  } catch (error) {
    res.status(500).json({ message: "Error reading profile", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, role, avatarPath } = req.body;
await db.update(adminTable)
  .set({ full_name: fullName, email, phone_no: phone, role, avatar_path: avatarPath })
  .where(eq(adminTable.admin_id, req.admin.admin_id));
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// ─── PASSWORD ──────────────────────────────────────────────
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const [admin] = await db.select()
      .from(adminTable)
      .where(eq(adminTable.admin_id, req.admin.admin_id));

    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update(adminTable)
      .set({ password_hash: newHash })
      .where(eq(adminTable.admin_id, req.admin.admin_id));

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
};

// ─── COMPANY ──────────────────────────────────────────────
export const getCompany = async (req, res) => {
  try {
    const rows = await db.select().from(companyInfoTable).limit(1);
    const c = rows[0];

    if (!c) {
      return res.json({
        companyName: '', legalName: '', gstin: '', incorporationDate: '',
        supportEmail: '', salesEmail: '', primaryPhone: '', whatsapp: '',
        address1: '', address2: '', city: '', state: '', pin: '',
        linkedin: '', twitter: '', facebook: ''
      });
    }

    res.json({
  companyName:       c.company_name || '',
  legalName:         c.legal_name || '',
  gstin:             c.gstin || '',
  incorporationDate: c.incorporation_date || '',
  supportEmail:      c.support_email || '',
  salesEmail:        c.sales_email || '',
  primaryPhone:      c.primary_phone || '',
  whatsapp:          c.whatsapp_no || '',
  address1:          c.address_line1 || '',
  address2:          c.address_line2 || '',
  city:              c.city || '',
  state:             c.state || '',
  pin:               c.pin_code || '',
  linkedin:          c.linkedin || '',
  twitter:           c.twitter || '',
  facebook:          c.facebook || '',
  logoPath:          c.logo_path || '',
});
  } catch (error) {
    res.status(500).json({ message: "Error reading company info", error: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const data = {
      company_name:      req.body.companyName,
      legal_name:        req.body.legalName,
      gstin:             req.body.gstin,
      incorporation_date: req.body.incorporationDate,
      support_email:     req.body.supportEmail,
      sales_email:       req.body.salesEmail,
      primary_phone:     req.body.primaryPhone,
      whatsapp_no:       req.body.whatsapp,
      address_line1:     req.body.address1,
      address_line2:     req.body.address2,
      city:              req.body.city,
      state:             req.body.state,
      pin_code:          req.body.pin,
      linkedin:          req.body.linkedin,
      twitter:           req.body.twitter,
      facebook:          req.body.facebook,
      logo_path: req.body.logoPath
    };

    const rows = await db.select().from(companyInfoTable).limit(1);
    if (rows.length === 0) {
      await db.insert(companyInfoTable).values(data);
    } else {
      await db.update(companyInfoTable)
        .set(data)
        .where(eq(companyInfoTable.company_id, rows[0].company_id));
    }

    res.json({ message: "Company info updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating company info", error: error.message });
  }
};

// ─── NOTIFICATIONS ────────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const rows = await db.select()
      .from(notificationPrefsTable)
      .where(eq(notificationPrefsTable.admin_id, req.admin.admin_id))
      .limit(1);

    const n = rows[0];
    if (!n) {
      return res.json({
        newInquiry: true, stockAlerts: false, weeklySummary: true,
        customerReviews: true, loginActivity: true, securityUpdates: true,
        dataExport: false, whatsappForwarding: false
      });
    }

    res.json({
      newInquiry:         n.new_inquiry_alerts,
      stockAlerts:        n.product_stock_alerts,
      weeklySummary:      n.weekly_summary,
      customerReviews:    n.customer_reviews,
      loginActivity:      n.login_activity,
      securityUpdates:    n.security_updates,
      dataExport:         n.data_export_notif,
      whatsappForwarding: n.whatsapp_forwarding,
    });
  } catch (error) {
    res.status(500).json({ message: "Error reading notifications", error: error.message });
  }
};

export const updateNotifications = async (req, res) => {
  try {
    const admin_id = req.admin.admin_id;
    const data = {
      new_inquiry_alerts:   req.body.newInquiry,
      product_stock_alerts: req.body.stockAlerts,
      weekly_summary:       req.body.weeklySummary,
      customer_reviews:     req.body.customerReviews,
      login_activity:       req.body.loginActivity,
      security_updates:     req.body.securityUpdates,
      data_export_notif:    req.body.dataExport,
      whatsapp_forwarding:  req.body.whatsappForwarding,
    };

    const rows = await db.select()
      .from(notificationPrefsTable)
      .where(eq(notificationPrefsTable.admin_id, admin_id))
      .limit(1);

    if (rows.length === 0) {
      await db.insert(notificationPrefsTable).values({ ...data, admin_id });
    } else {
      await db.update(notificationPrefsTable)
        .set(data)
        .where(eq(notificationPrefsTable.admin_id, admin_id));
    }

    res.json({ message: "Notifications updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications", error: error.message });
  }
};

// ─── SYSTEM ───────────────────────────────────────────────
export const getSystem = async (req, res) => {
  try {
    const rows = await db.select().from(systemConfigTable).limit(1);
    const s = rows[0];

    if (!s) {
      return res.json({
        maintenanceMode: false, language: 'English - India',
        timezone: 'IST - UTC+5:30', googleMapsKey: '',
        cloudStorage: 'AWS S3', autoBackup: true, backupFrequency: 'Daily'
      });
    }

    res.json({
      maintenanceMode: s.maintenance_mode,
      language:        s.primary_language,
      timezone:        s.timezone,
      googleMapsKey:   s.gmaps_api_key || '',
      cloudStorage:    s.cloud_storage,
      autoBackup:      s.auto_backup,
      backupFrequency: s.backup_frequency,
    });
  } catch (error) {
    res.status(500).json({ message: "Error reading system config", error: error.message });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ message: "No file provided" })

    const filename = `logo_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`
    const { error } = await supabase.storage
      .from('company-assets')
      .upload(filename, file.buffer, { contentType: file.mimetype, upsert: true })

    if (error) return res.status(500).json({ message: error.message })

    const { data } = supabase.storage.from('company-assets').getPublicUrl(filename)
    res.json({ success: true, url: data.publicUrl })
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message })
  }
}

export const updateSystem = async (req, res) => {
  try {
    const data = {
      maintenance_mode: req.body.maintenanceMode,
      primary_language: req.body.language,
      timezone:         req.body.timezone,
      gmaps_api_key:    req.body.googleMapsKey,
      cloud_storage:    req.body.cloudStorage,
      auto_backup:      req.body.autoBackup,
      backup_frequency: req.body.backupFrequency,
      updated_at:       new Date(),
    };

    const rows = await db.select().from(systemConfigTable).limit(1);
    if (rows.length === 0) {
      await db.insert(systemConfigTable).values(data);
    } else {
      await db.update(systemConfigTable)
        .set(data)
        .where(eq(systemConfigTable.config_id, rows[0].config_id));
    }

    res.json({ message: "System config updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating system config", error: error.message });
  }
};