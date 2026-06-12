import { db } from "../../db/index.js";
import { announcementsTable } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

// ─── ADMIN: GET all announcements ─────────────────
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await db
      .select()
      .from(announcementsTable)
      .orderBy(desc(announcementsTable.created_at));

    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── ADMIN: POST create announcement ──────────────
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, is_active } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // If new one is set active, deactivate all others first
    if (is_active) {
      await db
        .update(announcementsTable)
        .set({ is_active: false });
    }

    const [newAnnouncement] = await db
      .insert(announcementsTable)
      .values({ title, message, is_active: is_active || false })
      .returning();

    res.status(201).json({ success: true, data: newAnnouncement });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── ADMIN: PUT update announcement ───────────────
export const updateAnnouncement = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, message, is_active } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // If activating this one, deactivate all others first
    if (is_active) {
      await db
        .update(announcementsTable)
        .set({ is_active: false });
    }

    const [updated] = await db
      .update(announcementsTable)
      .set({ title, message, is_active: is_active || false, updated_at: new Date() })
      .where(eq(announcementsTable.announcement_id, id))
      .returning();

    if (!updated) return res.status(404).json({ message: "Announcement not found" });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── ADMIN: PATCH toggle active ───────────────────
export const toggleAnnouncement = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { is_active } = req.body;

    // Only one can be active at a time — deactivate all others
    if (is_active) {
      await db
        .update(announcementsTable)
        .set({ is_active: false });
    }

    const [updated] = await db
      .update(announcementsTable)
      .set({ is_active, updated_at: new Date() })
      .where(eq(announcementsTable.announcement_id, id))
      .returning();

    if (!updated) return res.status(404).json({ message: "Announcement not found" });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── ADMIN: DELETE announcement ───────────────────
export const deleteAnnouncement = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [deleted] = await db
      .delete(announcementsTable)
      .where(eq(announcementsTable.announcement_id, id))
      .returning();

    if (!deleted) return res.status(404).json({ message: "Announcement not found" });

    res.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUBLIC: GET active announcement ──────────────
// Called by the customer-facing site to show the ticker
export const getActiveAnnouncement = async (req, res) => {
  try {
    const [active] = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.is_active, true))
      .limit(1);

    // Return null data when nothing is active — frontend hides ticker
    res.json({ success: true, data: active || null });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};