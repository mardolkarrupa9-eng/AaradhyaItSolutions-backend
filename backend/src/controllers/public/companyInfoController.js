import { db } from "../../db/index.js";
import { companyInfoTable } from "../../db/schema.js";

export const getCompanyInfo = async (req, res) => {
  try {
    const rows = await db.select().from(companyInfoTable).limit(1);
    const c = rows[0];

    if (!c) {
      return res.json({
        companyName: '',
        supportEmail: '', salesEmail: '', primaryPhone: '', whatsapp: '',
        supportPhone1: '', supportPhone2: '', supportPhone3: '',
        salesPhone1: '', salesPhone2: '',
        address1: '', address2: '', city: '', state: '', pin: '',
        youtube: '', instagram: '', facebook: '', customSocials: '', logoPath: '',
        hoursWeekday: '9:00 AM - 7:00 PM', hoursWeekdayOpen: true,
        hoursSaturday: '10:00 AM - 5:00 PM', hoursSaturdayOpen: true,
        hoursSunday: 'Closed', hoursSundayOpen: false,
      });
    }

    res.json({
      companyName:    c.company_name || '',
      supportEmail:   c.support_email || '',
      salesEmail:     c.sales_email || '',
      primaryPhone:   c.primary_phone || '',
      whatsapp:       c.whatsapp_no || '',
      supportPhone1:  c.support_phone1 || '',
      supportPhone2:  c.support_phone2 || '',
      supportPhone3:  c.support_phone3 || '',
      salesPhone1:    c.sales_phone1 || '',
      salesPhone2:    c.sales_phone2 || '',
      address1:       c.address_line1 || '',
      address2:       c.address_line2 || '',
      city:           c.city || '',
      state:          c.state || '',
      pin:            c.pin_code || '',
      youtube:        c.youtube || '',
      instagram:      c.instagram || '',
      facebook:       c.facebook || '',
      customSocials:  c.custom_socials || '',
      logoPath:       c.logo_path || '',
      hoursWeekday:      c.hours_weekday || '',
      hoursWeekdayOpen:  c.hours_weekday_open,
      hoursSaturday:     c.hours_saturday || '',
      hoursSaturdayOpen: c.hours_saturday_open,
      hoursSunday:       c.hours_sunday || '',
      hoursSundayOpen:   c.hours_sunday_open,
    });
  } catch (error) {
    res.status(500).json({ message: "Error reading company info", error: error.message });
  }
};