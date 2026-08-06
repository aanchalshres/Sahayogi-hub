'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiGet } from '@/app/lib/api'
import {
  ArrowLeft, MapPin, Calendar, Users, Clock,
  AlertTriangle, Globe, Edit3, Trash2,
  Sparkles, Target, Brain, Zap, Navigation, Shield,
  CheckCircle, ShieldCheck, Star, UserCheck, AlertCircle,
  Inbox, Hourglass, CheckCircle2, XCircle, ChevronDown, ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import { getMatchColor, getScoreBarColor, formatScore, getScoreLabel } from '@/app/lib/scoring'

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

interface RecommendedVolunteer {
  id: number
  user_id: number
  rank: number | null
  name: string
  email: string
  phone: string
  bio: string
  city: string
  country: string
  availability: string | null
  total_service_hours: number
  average_rating: number
  is_verified: boolean
  skills: { id: number; name: string; proficiency_level: string | null }[]
  recommendation_score: number
  semantic_match_score: number
  distance_score: number
  skill_overlap_score: number
  availability_score: number
  trust_score: number
  matched_skills: { id: number; name: string }[]
  missing_skills: { id: number; name: string }[]
  distance_km: number | null
  recommendation_reason: string
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
  priority_score: number
  recommendation_score: number
  semantic_match_score: number
  distance_score: number
  skill_overlap_score: number
  availability_score: number
  trust_score: number
  matched_skills: { id: number; name: string }[]
  missing_skills: { id: number; name: string }[]
  distance_km: number | null
  recommendation_reason: string
}

type Tab = 'details' | 'recommended' | 'applications'

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = Number(params.id)

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [volunteers, setVolunteers] = useState<RecommendedVolunteer[]>([])
  const [volLoading, setVolLoading] = useState(false)
  const [volError, setVolError] = useState<string | null>(null)
  const [expandedVol, setExpandedVol] = useState<number | null>(null)
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
    if (activeTab !== 'recommended') return
    if (volunteers.length > 0) return // already loaded
    const load = async () => {
      try {
        setVolLoading(true)
        setVolError(null)
        const res = await apiGet<{ data: RecommendedVolunteer[] }>(`/api/ngo/tasks/${taskId}/recommended-volunteers`)
        setVolunteers(res.data ?? [])
      } catch (err: any) {
        setVolError(err.message || 'Failed to load recommendations')
      } finally {
        setVolLoading(false)
      }
    }
    load()
  }, [activeTab, taskId])

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
          {(['details', 'recommended', 'applications'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px capitalize ${
                activeTab === tab
                  ? 'text-[#4F46C8] border-[#4F46C8]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab === 'recommended' && <Sparkles size={14} />}
              {tab === 'applications' && <Inbox size={14} />}
              {tab === 'details' ? 'Task Details' : tab === 'recommended' ? 'Recommended Volunteers' : 'Applications'}
              {tab === 'recommended' && (
                <span className="bg-[#EEF0FF] text-[#4F46C8] text-[10px] font-bold px-1.5 py-0.5 rounded-full">AI</span>
              )}
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

        {/* Recommended Volunteers Tab */}
        {activeTab === 'recommended' && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#4F46C8]" />
              <h2 className="text-sm font-bold text-gray-900">Top Recommended Volunteers</h2>
              <span className="text-xs text-[#6B7280] ml-auto">Ranked by Hybrid Recommendation Algorithm · Top 10</span>
            </div>
            <p className="text-xs text-[#6B7280] mb-5">
              These volunteers have not yet applied. Scores reflect semantic similarity, skills, distance, availability, and trust.
            </p>

            {volLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-9 h-9 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
              </div>
            ) : volError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle size={28} className="mx-auto text-red-500 mb-2" />
                <p className="text-sm text-red-700">{volError}</p>
                <p className="text-xs text-red-500 mt-1">Ensure the task has been processed by TF-IDF before requesting recommendations.</p>
              </div>
            ) : volunteers.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-10 text-center">
                <Sparkles size={28} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-600">No recommended volunteers found</p>
                <p className="text-xs text-gray-400 mt-1">This may mean the task lacks a TF-IDF vector or all eligible volunteers have already applied.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {volunteers.map((vol) => {
                  const isExpanded = expandedVol === vol.id
                  const overallScore = vol.recommendation_score

                  return (
                    <div key={vol.id} className="bg-white border border-black/5 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                      {/* Rank stripe */}
                      <div className={`h-1 w-full ${overallScore >= 70 ? 'bg-green-500' : overallScore >= 40 ? 'bg-yellow-400' : 'bg-gray-300'}`} />

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Rank badge */}
                            <div className="w-8 h-8 rounded-full bg-[#4F46C8]/10 flex items-center justify-center shrink-0 text-xs font-black text-[#4F46C8]">
                              #{vol.rank ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-900">{vol.name}</p>
                                {vol.is_verified && (
                                  <ShieldCheck size={14} className="text-green-600 shrink-0" aria-label="Verified" />
                                )}
                                {vol.availability && (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    vol.availability === 'Available' ? 'bg-green-50 text-green-700' :
                                    vol.availability === 'Busy' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                  }`}>
                                    {vol.availability}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-2 flex-wrap">
                                {vol.city && <><MapPin size={10} className="inline" />{vol.city}</>}
                                {vol.distance_km != null && <><span>·</span>{vol.distance_km} km away</>}
                                {vol.total_service_hours > 0 && <><span>·</span>{vol.total_service_hours}h service</>}
                                {vol.average_rating > 0 && (
                                  <><span>·</span><Star size={10} className="inline text-amber-400" /> {vol.average_rating.toFixed(1)}</>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Overall score badge */}
                          <div className="shrink-0 text-center">
                            <div className={`text-base font-black px-3 py-1.5 rounded-xl border ${getMatchColor(overallScore)}`}>
                              {Math.round(overallScore)}%
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5 font-medium">{getScoreLabel(overallScore)}</div>
                          </div>
                        </div>

                        {/* Score mini-bars */}
                        <div className="mt-3 grid grid-cols-5 gap-1">
                          {[
                            { label: 'Sem.', value: vol.semantic_match_score },
                            { label: 'Skill', value: vol.skill_overlap_score },
                            { label: 'Dist.', value: vol.distance_score },
                            { label: 'Avail.', value: vol.availability_score },
                            { label: 'Trust', value: vol.trust_score },
                          ].map((s) => (
                            <div key={s.label} className="text-center">
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-0.5">
                                <div
                                  className={`h-full rounded-full ${getScoreBarColor(s.value ?? 0)}`}
                                  style={{ width: `${Math.round((s.value ?? 0) * 100)}%` }}
                                />
                              </div>
                              <div className="text-[9px] text-gray-400">{s.label}</div>
                              <div className="text-[10px] font-bold text-gray-700">{formatScore(s.value)}%</div>
                            </div>
                          ))}
                        </div>

                        {/* Matched/Missing skills compact view */}
                        {(vol.matched_skills.length > 0 || vol.missing_skills.length > 0) && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {vol.matched_skills.map((s) => (
                              <span key={s.id} className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                <CheckCircle size={8} /> {s.name}
                              </span>
                            ))}
                            {vol.missing_skills.map((s) => (
                              <span key={s.id} className="text-[10px] font-medium bg-gray-50 text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                                · {s.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Recommendation reason */}
                        {vol.recommendation_reason && (
                          <p className="mt-2 text-[11px] text-[#6B7280] italic leading-relaxed">
                            {vol.recommendation_reason}
                          </p>
                        )}

                        {/* Expand toggle */}
                        <button
                          onClick={() => setExpandedVol(isExpanded ? null : vol.id)}
                          className="mt-3 text-xs font-medium text-[#4F46C8] hover:text-[#3f39a8]"
                        >
                          {isExpanded ? 'Hide details ↑' : 'View details ↓'}
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                            {vol.email && <p><span className="text-gray-400">Email:</span> {vol.email}</p>}
                            {vol.phone && <p><span className="text-gray-400">Phone:</span> {vol.phone}</p>}
                            {vol.bio && <p><span className="text-gray-400">Bio:</span> {vol.bio}</p>}
                            {vol.skills.length > 0 && (
                              <div>
                                <span className="text-gray-400">All skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {vol.skills.map((s) => (
                                    <span key={s.id} className="bg-[#EEF0FF] text-[#4F46C8] px-2 py-0.5 rounded-full text-[10px]">
                                      {s.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
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

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Inbox size={16} className="text-[#4F46C8]" />
              <h2 className="text-sm font-bold text-gray-900">Applications</h2>
              <span className="text-xs text-[#6B7280] ml-auto">Sorted by recommendation score</span>
            </div>
            <p className="text-xs text-[#6B7280] mb-5">
              Applicants ranked by the Hybrid Recommendation Algorithm. Makes decisions easier — does not auto-accept or reject.
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
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  app.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                  app.status === 'Accepted' ? 'bg-green-50 text-green-700' :
                                  app.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-2 flex-wrap">
                                {app.applied_at && <><Clock size={10} className="inline" />{new Date(app.applied_at).toLocaleDateString()}</>}
                                {app.distance_km != null && <><span>·</span>{app.distance_km} km</>}
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

                        {/* Score mini bars */}
                        <div className="mt-3 grid grid-cols-5 gap-1">
                          {[
                            { label: 'Sem.', value: app.semantic_match_score },
                            { label: 'Skill', value: app.skill_overlap_score },
                            { label: 'Dist.', value: app.distance_score },
                            { label: 'Avail.', value: app.availability_score },
                            { label: 'Trust', value: app.trust_score },
                          ].map((s) => (
                            <div key={s.label} className="text-center">
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-0.5">
                                <div
                                  className={`h-full rounded-full ${getScoreBarColor(s.value ?? 0)}`}
                                  style={{ width: `${Math.round((s.value ?? 0) * 100)}%` }}
                                />
                              </div>
                              <div className="text-[9px] text-gray-400">{s.label}</div>
                              <div className="text-[10px] font-bold text-gray-700">{formatScore(s.value)}%</div>
                            </div>
                          ))}
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
