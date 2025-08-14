import AdminLog from '../models/AdminLog.js';

export const logAdminAction = async (adminId, action) => {
  try {
    if (!adminId || !action) return;
    const log = new AdminLog({ admin: adminId, action });
    await log.save();
  } catch (error) {
    // Fail silently in production to not disrupt admin actions
    console.error('Failed to log admin action:', error);
  }
};