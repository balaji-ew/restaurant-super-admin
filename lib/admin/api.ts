/**
 * Admin API clients and endpoints for the template foundation.
 *
 * Provides staff account management (profile updates, password changes),
 * image/media uploads, and foundation methods for new modules.
 */
import { API_BASE_URL, API_ORIGIN } from '@/config/api.config';
import {
  apiDelete,
  apiGet,
  apiGetWithMeta,
  apiPatch,
  apiPost,
  apiPut,
  axiosInstance,
} from '@/lib/api';

type Dict = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/**
 * Staff self-service account management endpoints.
 */
export const staffAccountApi = {
  /**
   * Changes the signed-in staff member's password.
   */
  changePassword: (currentPassword: string, newPassword: string) =>
    apiPost('/admin/staff/me/change-password', { currentPassword, newPassword }),

  /**
   * Updates the signed-in staff member's profile details.
   */
  updateProfile: (name: string, email: string, phone: string) =>
    apiPatch('/admin/staff/me/profile', { firstName: name, lastName: '', email, phone }),
};

/**
 * Media and file upload utility.
 */
export const mediaApi = {
  upload: async (file: File): Promise<{ url: string; imageId: string }> => {
    const ticket = (await apiPost('/admin/images/upload-url', {})) as Dict;
    const imageId = str(ticket.imageId);
    const uploadUrl = str(ticket.uploadUrl);
    const deliveryUrl = str(ticket.deliveryUrl);

    if (!imageId || !uploadUrl) {
      throw new Error('The image service did not return an upload ticket.');
    }

    if (uploadUrl.startsWith(API_ORIGIN)) {
      await axiosInstance.post(uploadUrl.slice(API_BASE_URL.length), file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });
    } else {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }
    }

    return { url: deliveryUrl || uploadUrl, imageId };
  },
};

export {
  apiGet,
  apiGetWithMeta,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  axiosInstance,
};
