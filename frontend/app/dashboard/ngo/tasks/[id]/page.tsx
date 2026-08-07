'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiGet } from '@/app/lib/api'
import {
  ArrowLeft, MapPin, Calendar, Users, Clock,
  AlertTriangle, Globe, Edit3, Trash2,
  CheckCircle, AlertCircle, Inbox,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import { getMatchColor, getScoreLabel } from '@/app/lib/scoring'

interface TaskDetail {
  id: number
  title: string
  slug: string
  description: string
  category_id: number | null
  task_type: string
  selection_logic: string | null
  location: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  required_volunteers: number
  start_date: string
  end_date: string | null
  application_deadline: string | null
  urgency_level: string
  status: string
  cover_image: string | null
  created_at: string
  updated_at: string
  total_applications: number
  pending_applications: number
  accepted_applications: number
  skills: { id: number; name: string }[]
  category: { id: number; name: string } | null
  ngo: { id: number; organization_name: string; logo: string | null; city: string | null; country: string | null }
}

interface ApplicationItem {
  id: number
  task_id: number
  volunteer_profile_id: number
  volunteer_name: string
  volunteer_email: string
  status: string
  applied_at: string
  remarks: string | null
  recommendation_score: number
  trust_score: number
  matched_skills: { id: number; name: string }[]
  missing_skills: { id: number; name: string }[]
  distance_km: number | null
  recommendation_reason: string
}

type Tab = 'details' | 'applications'

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = Number(params.id)

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [appLoading, setAppLoading] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)
  const [expandedApp, setExpandedApp] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiGet<{ data: TaskDetail }>(`/api/ngo/tasks/${taskId}`)
        setTask(res.data)
      } catch (err: any) {
        setError(err.message || 'Failed to load task')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [taskId])

  useEffect(() => {
    if (activeTab !== 'applications') return
    if (applications.length > 0) return
    const load = async () => {
      try {
        setAppLoading(true)
        setAppError(null)
        const res = await apiGet<{ data: ApplicationItem[] }>(`/api/ngo/tasks/${taskId}/prioritized-applications`)
        setApplications(res.data ?? [])
      } catch (err: any) {
        setAppError(err.message || 'Failed to load applications')
      } finally {
        setAppLoading(false)
      }
    }
    load()
  }, [activeTab, taskId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600 font-medium mb-2">Failed to load opportunity</p>
        <p className="text-sm text-[#6B7280]">{error}</p>
        <button onClick={() => router.push('/dashboard/ngo/tasks')} className="mt-4 bg-[#4F46C8] text-white px-4 py-2 rounded-lg text-sm font-medium">
          Back to Tasks
        </button>
      </div>
    )
  }

  if (!task) return null

  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700',
    Open: 'bg-green-100 text-green-700',
    Ongoing: 'bg-blue-100 text-blue-700',
    Completed: 'bg-purple-100 text-purple-700',
    Cancelled: 'bg-red-100 text-red-700',
  }

  const urgencyColors: Record<string, string> = {
    Low: 'bg-gray-50 text-gray-500 border border-gray-200',
    Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
    High: 'bg-red-50 text-red-600 border border-red-200',
  }

  const remaining = task.required_volunteers - task.accepted_applications

  const appStatusStyle = (status: string) => {
    if (status === 'Pending') return 'bg-amber-50 text-amber-700'
    if (status === 'Accepted') return 'bg-green-50 text-green-700'
    if (status === 'Rejected') return 'bg-red-50 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white border border-black/5 rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-600'}`}>
                  {task.status}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${urgencyColors[task.urgency_level] || ''}`}>
                  {task.urgency_level}
                </span>
                {task.category && (
                  <span className="text-xs bg-[#EEF0FF] text-[#4F46C8] px-2.5 py-0.5 rounded-full">
                    {task.category.name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <p className="text-sm text-[#6B7280] mt-1">Created {new Date(task.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/ngo/tasks/edit/${task.id}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                <Edit3 size={14} /> Edit
              </Link>
              <Link href={`/dashboard/ngo/tasks/delete/${task.id}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                <Trash2 size={14} /> Delete
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['details', 'applications'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-[#4F46C8] border-[#4F46C8]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab === 'applications' && <Inbox size={14} />}
              {tab === 'details' ? 'Task Details' : 'Applications'}
              {tab === 'applications' && task.pending_applications > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{task.pending_applications}</span>
              )}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-sm text-[#6B7280] whitespace-pre-wrap">{task.description || 'No description'}</p>
              </div>

              {task.skills && task.skills.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {task.skills.map((s) => (
                      <span key={s.id} className="text-xs bg-[#EEF0FF] text-[#4F46C8] px-3 py-1 rounded-full">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">Details</h2>

                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Users size={16} className="text-[#4F46C8] shrink-0" />
                  <span><strong className="text-gray-900">{task.required_volunteers}</strong> volunteers needed</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Users size={16} className="text-green-600 shrink-0" />
                  <span><strong className="text-gray-900">{task.accepted_applications}</strong> assigned</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Clock size={16} className="text-amber-600 shrink-0" />
                  <span><strong className="text-gray-900">{task.pending_applications}</strong> pending reviews</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Users size={16} className="text-blue-600 shrink-0" />
                  <span><strong className={`${remaining > 0 ? 'text-blue-600' : 'text-green-600'}`}>{remaining > 0 ? `${remaining} remaining` : 'Filled'}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Calendar size={16} className="text-[#4F46C8] shrink-0" />
                  <span>{task.start_date ? new Date(task.start_date).toLocaleDateString() : 'TBD'}{task.end_date ? ` - ${new Date(task.end_date).toLocaleDateString()}` : ''}</span>
                </div>

                {task.application_deadline && (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Clock size={16} className="text-red-500 shrink-0" />
                    <span>Deadline: {new Date(task.application_deadline).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Globe size={16} className="text-[#4F46C8] shrink-0" />
                  <span>{task.task_type}</span>
                </div>

                {task.selection_logic && (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Users size={16} className="text-[#4F46C8] shrink-0" />
                    <span>Selection: {task.selection_logic}</span>
                  </div>
                )}
              </div>

              {(task.location || task.city) && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h2 className="text-sm font-semibold text-gray-900">Location</h2>
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <MapPin size={16} className="text-[#4F46C8] shrink-0" />
                    <span>{[task.city, task.location, task.country].filter(Boolean).join(', ')}</span>
                  </div>
                  {task.latitude && task.longitude && (
                    <p className="text-xs text-[#6B7280]">{task.latitude}, {task.longitude}</p>
                  )}
                </div>
              )}

              {task.ngo && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h2 className="text-sm font-semibold text-gray-900">Organization</h2>
                  <p className="text-sm font-medium text-gray-900">{task.ngo.organization_name}</p>
                  {(task.ngo.city || task.ngo.country) && (
                    <p className="text-xs text-[#6B7280]">{[task.ngo.city, task.ngo.country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Inbox size={16} className="text-[#4F46C8]" />
              <h2 className="text-sm font-bold text-gray-900">Applicants</h2>
            </div>
            <p className="text-xs text-[#6B7280] mb-5">
              Approved applicants become assignments. You can review and decide for this opportunity on the
              <Link href="/dashboard/ngo/applications" className="text-[#4F46C8] font-medium mx-1 hover:underline">
                Recommended Applicants
              </Link>
              page.
            </p>

            {appLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-9 h-9 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
              </div>
            ) : appError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle size={28} className="mx-auto text-red-500 mb-2" />
                <p className="text-sm text-red-700">{appError}</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-10 text-center">
                <Inbox size={28} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-600">No applications yet</p>
                <p className="text-xs text-gray-400 mt-1">Applications will appear here once volunteers apply.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, idx) => {
                  const isExpanded = expandedApp === app.id
                  const overallScore = app.recommendation_score

                  return (
                    <div key={app.id} className="bg-white border border-black/5 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                      <div className={`h-1 w-full ${overallScore >= 70 ? 'bg-green-500' : overallScore >= 40 ? 'bg-yellow-400' : 'bg-gray-300'}`} />

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#4F46C8]/10 flex items-center justify-center shrink-0 text-xs font-black text-[#4F46C8]">
                              #{idx + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-900">{app.volunteer_name}</p>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${appStatusStyle(app.status)}`}>
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-2 flex-wrap">
                                {app.applied_at && <><Clock size={10} className="inline" />Applied {new Date(app.applied_at).toLocaleDateString()}</>}
                                {app.distance_km != null && <><span>·</span>{app.distance_km} km away</>}
                                {app.trust_score != null && <><span>·</span>Trust {Math.round(app.trust_score * 100)}%</>}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-center">
                            <div className={`text-base font-black px-3 py-1.5 rounded-xl border ${getMatchColor(overallScore)}`}>
                              {Math.round(overallScore)}%
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5 font-medium">{getScoreLabel(overallScore)}</div>
                          </div>
                        </div>

                        {/* Matched/Missing skills */}
                        {(app.matched_skills?.length > 0 || app.missing_skills?.length > 0) && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {app.matched_skills?.map((s) => (
                              <span key={s.id} className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                <CheckCircle size={8} /> {s.name}
                              </span>
                            ))}
                            {app.missing_skills?.map((s) => (
                              <span key={s.id} className="text-[10px] font-medium bg-gray-50 text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                                · {s.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Recommendation reason */}
                        {app.recommendation_reason && (
                          <p className="mt-2 text-[11px] text-[#6B7280] italic leading-relaxed">
                            {app.recommendation_reason}
                          </p>
                        )}

                        <button
                          onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                          className="mt-3 text-xs font-medium text-[#4F46C8] hover:text-[#3f39a8]"
                        >
                          {isExpanded ? 'Hide details ↑' : 'View details ↓'}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                            <p><span className="text-gray-400">Email:</span> {app.volunteer_email}</p>
                            <p><span className="text-gray-400">Status:</span> <span className="font-medium">{app.status}</span></p>
                            <p><span className="text-gray-400">Applied:</span> {new Date(app.applied_at).toLocaleDateString()}</p>
                            {app.remarks && <p><span className="text-gray-400">Remarks:</span> {app.remarks}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
