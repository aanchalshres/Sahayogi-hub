'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/app/lib/api';
import { markAttendance } from '@/app/lib/attendance';
import {
  Briefcase, Clock, MapPin, Inbox, AlertCircle,
  Calendar, Building2, LogIn, LogOut,
  CheckCircle2, Timer, ShieldCheck, Navigation,
  Loader2, LocateFixed, X,
} from 'lucide-react';
import {
  CONFIDENCE_LEVEL_COLORS,
  CONFIDENCE_LEVEL_LABELS,
  STATUS_LABELS,
} from '@/app/lib/attendance';
import type { AttendanceLog } from '@/app/lib/attendance';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AssignedTaskSkill { id: number; name: string; }
interface AssignedTaskCategory { id: number; name: string; }
interface AssignedTaskNgoUser { name: string; email: string; phone: string | null; }
interface AssignedTaskNgo {
  organization_name: string;
  office_location: string | null;
  website: string | null;
  user: AssignedTaskNgoUser;
}

interface AssignedTask {
  id: number;
  task_id: number;
  task: {
    id: number;
    title: string;
    description: string;
    location: string | null;
    city: string | null;
    latitude: string | null;
    longitude: string | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    required_volunteers: number | null;
    ngo: AssignedTaskNgo | null;
    skills: AssignedTaskSkill[];
    category: AssignedTaskCategory | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ConfidenceBadge({ level, score }: { level: string | null; score: number | null }) {
  if (!level) return null;
  const color = CONFIDENCE_LEVEL_COLORS[level] || 'bg-gray-100 text-gray-600';
  const label = CONFIDENCE_LEVEL_LABELS[level] || level;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}
      title={`GPS confidence score: ${score ?? 'N/A'}`}
    >
      <ShieldCheck size={11} />
      {label}
    </span>
  );
}

/**
 * GPS attendance modal — replaces the old QR scanner.
 * Requests location permission, then calls markAttendance().
 */
function GpsAttendanceModal({
  task,
  onSuccess,
  onClose,
}: {
  task: { id: number; title: string };
  onSuccess: (log: AttendanceLog) => void;
  onClose: () => void;
}) {
  type Phase = 'requesting' | 'submitting' | 'denied' | 'error';
  const [phase, setPhase] = useState<Phase>('requesting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!navigator.geolocation) {
      setPhase('denied');
      setErrorMsg('Your browser does not support geolocation. Please use a modern browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled) return;
        setPhase('submitting');
        try {
          const deviceInfo = {
            user_agent: navigator.userAgent,
            platform: navigator.platform,
          };
          const result = await markAttendance(
            task.id,
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy,
            deviceInfo
          );
          if (!cancelled) onSuccess(result.data);
        } catch (err: any) {
          if (!cancelled) {
            setPhase('error');
            setErrorMsg(err?.message || 'Attendance could not be recorded. Please try again.');
          }
        }
      },
      (err) => {
        if (cancelled) return;
        setPhase('denied');
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg('Location permission was denied. Please allow location access and try again.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setErrorMsg('Your location could not be determined. Please ensure GPS is enabled.');
        } else {
          setErrorMsg(`Location error: ${err.message}`);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => { cancelled = true; };
  }, [task.id, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <LocateFixed size={18} className="text-[#4F46C8]" />
            Mark Attendance
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <p className="text-xs text-[#6B7280] mb-5">
          <span className="font-medium text-[#111827]">{task.title}</span>
        </p>

        {/* Phase: requesting GPS */}
        {phase === 'requesting' && (
          <>
            <Loader2 size={44} className="mx-auto text-[#4F46C8] animate-spin mb-4" />
            <p className="text-[#111827] font-semibold mb-1">Retrieving your location…</p>
            <p className="text-xs text-[#6B7280]">
              Please allow location access when your browser asks.
            </p>
          </>
        )}

        {/* Phase: submitting to backend */}
        {phase === 'submitting' && (
          <>
            <Navigation size={44} className="mx-auto text-[#4F46C8] mb-4 animate-pulse" />
            <p className="text-[#111827] font-semibold mb-1">Verifying location…</p>
            <p className="text-xs text-[#6B7280]">
              Comparing your position with the task location.
            </p>
          </>
        )}

        {/* Phase: permission denied or GPS unavailable */}
        {phase === 'denied' && (
          <>
            <AlertCircle size={44} className="mx-auto text-amber-500 mb-4" />
            <p className="text-[#111827] font-semibold mb-2">Location Unavailable</p>
            <p className="text-xs text-[#6B7280] mb-5">{errorMsg}</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-[#4F46C8] hover:bg-[#3f39a8] text-white text-sm font-medium rounded-xl transition"
            >
              Close
            </button>
          </>
        )}

        {/* Phase: backend error (wrong location, task no coords, etc.) */}
        {phase === 'error' && (
          <>
            <AlertCircle size={44} className="mx-auto text-red-500 mb-4" />
            <p className="text-[#111827] font-semibold mb-2">Attendance Not Recorded</p>
            <p className="text-xs text-[#6B7280] mb-5">{errorMsg}</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-[#4F46C8] hover:bg-[#3f39a8] text-white text-sm font-medium rounded-xl transition"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function VolunteerParticipationsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // GPS modal state
  const [gpsTask, setGpsTask] = useState<{ id: number; title: string } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksRes, attendanceRes, hoursRes] = await Promise.all([
        apiGet<{ data: AssignedTask[] }>('/volunteer/assigned-tasks'),
        apiGet<{ data: AttendanceLog[] }>('/volunteer/attendance/secure-history'),
        apiGet<{ total_hours: number }>('/volunteer/attendance/hours'),
      ]);
      setTasks(tasksRes.data ?? []);
      setAttendanceLogs(attendanceRes.data ?? []);
      setTotalHours(hoursRes.total_hours ?? 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function getServiceLogForTask(taskId: number): AttendanceLog | null {
    const taskLogs = attendanceLogs.filter((l) => l.task_id === taskId);
    if (taskLogs.length === 0) return null;
    return taskLogs.reduce((latest, log) =>
      new Date(log.check_in_time || log.created_at) > new Date(latest.check_in_time || latest.created_at)
        ? log
        : latest
    );
  }

  const handleAttendanceSuccess = useCallback(
    async (log: AttendanceLog) => {
      setGpsTask(null);
      showToast('Attendance marked successfully! Your presence has been recorded.', 'success');
      await loadData();
    },
    [loadData, showToast]
  );

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F1F3] p-6 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-medium">Failed to load</p>
          <p className="text-sm text-[#6B7280] mt-1">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 bg-[#4F46C8] hover:bg-[#3f39a8] text-white px-5 py-2 rounded-xl font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success'
              ? <CheckCircle2 size={18} />
              : <AlertCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      {/* GPS Attendance Modal */}
      {gpsTask && (
        <GpsAttendanceModal
          task={gpsTask}
          onSuccess={handleAttendanceSuccess}
          onClose={() => setGpsTask(null)}
        />
      )}

      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">My Participations</h1>
            <p className="text-[#6B7280] text-sm mt-1">
              Mark your attendance with GPS verification when you arrive at the task location.
            </p>
          </div>
          {totalHours > 0 && (
            <div className="flex items-center gap-2 bg-white border border-[#CACDD3] rounded-xl px-4 py-2.5">
              <Timer size={18} className="text-[#4F46C8]" />
              <span className="text-sm font-semibold text-[#111827]">{totalHours} hrs</span>
            </div>
          )}
        </div>

        {/* Empty state */}
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#CACDD3] p-10 text-center">
            <Inbox size={36} className="mx-auto text-[#6B7280] mb-3" />
            <p className="text-[#111827] font-medium mb-1">No assigned tasks yet</p>
            <p className="text-[#6B7280] text-sm mb-5">
              Once your applications are accepted, your assigned tasks will appear here.
            </p>
            <button
              onClick={() => router.push('/dashboard/volunteer/tasks')}
              className="bg-[#4F46C8] hover:bg-[#3f39a8] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              Browse Tasks
            </button>
          </div>
        ) : (
          <>
            {/* Task cards */}
            <div className="space-y-4 mb-10">
              {tasks.map((app) => {
                const task = app.task;
                if (!task) return null;

                const ngo = task.ngo;
                const log = getServiceLogForTask(task.id);
                const hasAttendance = log?.status === 'active' || log?.status === 'completed';
                const isCompleted = log?.status === 'completed';
                const hasCoords = !!(task.latitude && task.longitude);

                return (
                  <div key={app.id} className="bg-white rounded-2xl border border-[#CACDD3] p-5">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#4F46C8]/10 flex items-center justify-center shrink-0">
                          <Briefcase size={18} className="text-[#4F46C8]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#111827]">{task.title}</p>
                          {ngo && (
                            <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                              <Building2 size={12} />
                              {ngo.organization_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {log?.confidence_level && (
                          <ConfidenceBadge level={log.confidence_level} score={log.confidence_score} />
                        )}
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          hasAttendance && !isCompleted ? 'bg-green-100 text-green-700' :
                          isCompleted                  ? 'bg-blue-100 text-blue-700'  :
                                                         'bg-gray-100 text-gray-600'
                        }`}>
                          {hasAttendance && !isCompleted
                            ? 'Present'
                            : isCompleted
                            ? 'Completed'
                            : 'Assigned'}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-sm text-[#6B7280] mt-3 line-clamp-2">{task.description}</p>
                    )}

                    {/* Task meta */}
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6B7280]">
                      {task.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(task.start_date).toLocaleDateString()}
                          {task.end_date && ` – ${new Date(task.end_date).toLocaleDateString()}`}
                        </span>
                      )}
                      {(task.location || task.city) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {task.city || task.location}
                        </span>
                      )}
                      {log?.check_in_distance != null && (
                        <span className="flex items-center gap-1">
                          <Navigation size={12} />
                          {Math.round(log.check_in_distance)}m from task
                        </span>
                      )}
                    </div>

                    {/* Attendance log details */}
                    {log && (
                      <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-1 text-xs text-[#6B7280]">
                        {log.check_in_time && (
                          <p className="flex items-center gap-1">
                            <LogIn size={12} />
                            Attendance marked: {new Date(log.check_in_time).toLocaleString()}
                          </p>
                        )}
                        {log.check_out_time && (
                          <p className="flex items-center gap-1">
                            <LogOut size={12} />
                            Session ended: {new Date(log.check_out_time).toLocaleString()}
                          </p>
                        )}
                        {isCompleted && log.hours && (
                          <p className="flex items-center gap-1 text-blue-600 font-medium">
                            <Clock size={12} />
                            Hours logged: {log.hours}
                          </p>
                        )}
                        {log.confidence_score !== null && (
                          <p className="flex items-center gap-1">
                            <ShieldCheck size={12} />
                            GPS confidence: {log.confidence_score}%
                            {' '}({CONFIDENCE_LEVEL_LABELS[log.confidence_level || ''] || log.confidence_level})
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action button */}
                    <div className="mt-4">
                      {!hasAttendance && (
                        <div className="flex flex-col gap-2">
                          <button
                            id={`mark-attendance-${task.id}`}
                            onClick={() => setGpsTask({ id: task.id, title: task.title })}
                            className="inline-flex items-center justify-center gap-2 bg-[#4F46C8] hover:bg-[#3f39a8] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors w-full sm:w-auto"
                          >
                            <LocateFixed size={16} />
                            Mark Attendance
                          </button>
                          {!hasCoords && (
                            <p className="text-xs text-amber-600 flex items-center gap-1.5">
                              <AlertCircle size={12} />
                              This task has no location set — attendance will be rejected until the NGO configures it.
                            </p>
                          )}
                        </div>
                      )}
                      {hasAttendance && !isCompleted && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                          <CheckCircle2 size={15} />
                          Attendance recorded — awaiting task completion by NGO
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-blue-700 font-medium px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                          <CheckCircle2 size={15} />
                          Task completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attendance history */}
            {attendanceLogs.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#111827] mb-4">Attendance History</h2>
                <div className="bg-white rounded-2xl border border-[#CACDD3] divide-y divide-[#E5E7EB]">
                  {attendanceLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#111827]">
                          {log.task_title || `Task #${log.task_id}`}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{log.task_ngo || 'NGO'}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-[#6B7280]">
                          {log.check_in_time && (
                            <span className="flex items-center gap-1">
                              <LogIn size={11} />
                              {new Date(log.check_in_time).toLocaleString()}
                            </span>
                          )}
                          {log.check_in_distance != null && (
                            <span className="flex items-center gap-1">
                              <Navigation size={11} />
                              {Math.round(log.check_in_distance)}m
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {log.confidence_level && (
                          <ConfidenceBadge level={log.confidence_level} score={log.confidence_score} />
                        )}
                        {log.hours && Number(log.hours) > 0 && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            {log.hours}h
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          log.status === 'active'    ? 'bg-green-100 text-green-700' :
                          log.status === 'completed' ? 'bg-blue-100 text-blue-700'  :
                          log.status === 'absent'    ? 'bg-red-100 text-red-700'    :
                                                       'bg-gray-100 text-gray-600'
                        }`}>
                          {STATUS_LABELS[log.status] || log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
