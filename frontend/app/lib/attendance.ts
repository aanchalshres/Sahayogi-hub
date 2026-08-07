import { apiGet, apiPost } from '@/app/lib/api';

// ---------------------------------------------------------------------------
// Mark Attendance (GPS-verified presence — does NOT complete the task)
// ---------------------------------------------------------------------------

export interface MarkAttendanceResult {
  message: string;
  data: AttendanceLog;
}

/**
 * Sends the volunteer's GPS coordinates to the backend.
 * The backend verifies they are within the configured radius of the task
 * using the Haversine Distance algorithm, then records attendance.
 *
 * This records PRESENCE ONLY. Task completion is handled by the NGO.
 */
export async function markAttendance(
  taskId: number,
  latitude: number,
  longitude: number,
  gpsAccuracy: number,
  deviceInfo?: Record<string, string>
): Promise<MarkAttendanceResult> {
  return apiPost<MarkAttendanceResult>('/volunteer/attendance/mark', {
    task_id: taskId,
    latitude,
    longitude,
    gps_accuracy: gpsAccuracy,
    device_info: deviceInfo,
  });
}

// ---------------------------------------------------------------------------
// Secure Check-In (GPS-only, kept for backwards compatibility)
// ---------------------------------------------------------------------------

export async function secureCheckIn(
  taskId: number,
  latitude: number,
  longitude: number,
  gpsAccuracy: number,
  deviceInfo?: Record<string, string>
) {
  return apiPost<{
    message: string;
    data: AttendanceLog;
  }>('/volunteer/attendance/secure-check-in', {
    task_id: taskId,
    latitude,
    longitude,
    gps_accuracy: gpsAccuracy,
    device_info: deviceInfo,
  });
}

// ---------------------------------------------------------------------------
// Secure Check-Out (GPS-only — does NOT mark task as completed)
// ---------------------------------------------------------------------------

export async function secureCheckOut(
  latitude: number,
  longitude: number,
  gpsAccuracy: number,
  deviceInfo?: Record<string, string>
) {
  return apiPost<{
    message: string;
    data: AttendanceLog;
  }>('/volunteer/attendance/secure-check-out', {
    latitude,
    longitude,
    gps_accuracy: gpsAccuracy,
    device_info: deviceInfo,
  });
}

// ---------------------------------------------------------------------------
// Status & History
// ---------------------------------------------------------------------------

export async function getAttendanceStatus() {
  return apiGet<{
    checked_in: boolean;
    message: string;
    data?: {
      id: number;
      task_id: number;
      task_title: string;
      task_ngo: string;
      check_in_time: string;
      elapsed_minutes: number;
      confidence_score: number | null;
      confidence_level: string | null;
    };
  }>('/volunteer/attendance/status');
}

export async function getSecureHistory() {
  return apiGet<{
    data: AttendanceLog[];
  }>('/volunteer/attendance/secure-history');
}

export async function getAttendanceAnalytics() {
  return apiGet<{
    data: {
      total_sessions: number;
      total_hours: number;
      completed_sessions: number;
      active_sessions: number;
      absent_sessions: number;
      average_confidence: number | null;
      high_confidence_sessions: number;
    };
  }>('/volunteer/attendance/analytics');
}

// ---------------------------------------------------------------------------
// NGO QR management (retained — NGO dashboard still manages QR codes)
// ---------------------------------------------------------------------------

export async function generateTaskQr(taskId: number) {
  return apiPost<{
    message: string;
    data: {
      token: string;
      task_id: number;
      task_title: string;
      expires_at: string;
    };
  }>('/ngo/attendance/generate-qr', { task_id: taskId });
}

export async function listQrCodes() {
  return apiGet<{
    data: {
      id: number;
      task_id: number;
      task_title: string;
      expires_at: string;
      is_active: boolean;
      is_expired: boolean;
      created_at: string;
    }[];
  }>('/ngo/attendance/qr-codes');
}

export async function revokeQrCode(id: number) {
  const { apiDelete } = await import('@/app/lib/api');
  return apiDelete<{ message: string }>(`/ngo/attendance/qr-codes/${id}`);
}

export async function getNgoAttendanceAnalytics() {
  return apiGet<{
    data: {
      total_sessions: number;
      total_hours: number;
      completed_sessions: number;
      active_sessions: number;
      absent_sessions: number;
      average_confidence: number | null;
      confidence_distribution: {
        high: number;
        medium: number;
        low: number;
        manual_review: number;
      };
    };
  }>('/ngo/attendance/analytics');
}

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

export interface AttendanceLog {
  id: number;
  task_id: number;
  task_title: string;
  task_ngo: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  hours: number | null;
  verification_method: string | null;
  confidence_score: number | null;
  confidence_level: string | null;
  check_in_distance: number | null;
  check_out_distance: number | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  created_at: string;
}

export const CONFIDENCE_LEVEL_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-orange-100 text-orange-700',
  manual_review: 'bg-red-100 text-red-700',
};

export const CONFIDENCE_LEVEL_LABELS: Record<string, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
  manual_review: 'Manual Review',
};

export const STATUS_LABELS: Record<string, string> = {
  assigned: 'Assigned',
  active: 'Active — Present',
  completed: 'Completed',
  absent: 'Absent',
};
