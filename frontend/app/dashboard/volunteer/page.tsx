'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost } from '@/app/lib/api'
import {
  User, Calendar, CheckCircle, Clock, Star,
  FileText, TrendingUp, Activity, ArrowRight,
  AlertCircle, PlusCircle, UserCheck,
  MapPin, Upload, Sparkles, Send, ShieldCheck, Zap,
  Layers, Briefcase
} from 'lucide-react'
import { getOverallScore, getMatchColor, generateExplanation, getScoreBarColor, formatScore, type MatchAnalysis } from '@/app/lib/scoring'

interface DashboardData {
  profile: {
    name: string
    email: string
    city: string | null
    country: string | null
    availability: string | null
    skills: string[]
    bio: string | null
    profile_photo: string | null
  }
  stats: {
    total_applications: number
    accepted_applications: number
    pending_applications: number
    total_service_hours: number
    average_rating: number
    total_reviews: number
  }
  profile_completion: number
  is_profile_complete: boolean
  document_status: string
  upcoming_tasks: {
    id: number
    title: string
    ngo: string
    location: string | null
    status: string
    date: string
  }[]
  recent_activity: {
    type: string
    text: string
    date: string
  }[]
  pending_applications_list: {
    id: number
    title: string
    days: number
  }[]
  recommended_opportunities: (MatchAnalysis & Record<string, any>)[]
}

export default function VolunteerDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animatedStats, setAnimatedStats] = useState({
    applications: 0,
    accepted: 0,
    hours: 0,
    rating: 0,
  })
  const [recommendations, setRecommendations] = useState<(MatchAnalysis & Record<string, any>)[]>([])
  const [recsLoading, setRecsLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await apiGet<{ data: DashboardData }>('/volunteer/dashboard')
        setData(res.data)
        setRecommendations((res.data.recommended_opportunities ?? []).slice(0, 5))
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
        setRecsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!data) return
    const duration = 1500
    const start = performance.now()
    const targets = {
      applications: data.stats.total_applications,
      accepted: data.stats.accepted_applications,
      hours: data.stats.total_service_hours,
      rating: data.stats.average_rating,
    }

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setAnimatedStats({
        applications: Math.floor(eased * targets.applications),
        accepted: Math.floor(eased * targets.accepted),
        hours: Math.floor(eased * targets.hours),
        rating: +(eased * targets.rating).toFixed(1),
      })
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [data])

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAvailabilityDot = (avail: string | null) => {
    switch (avail) {
      case 'Available': return 'bg-green-500'
      case 'Busy': return 'bg-yellow-500'
      case 'Unavailable': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getVerificationLabel = (status: string) => {
    if (status === 'verified') return '✓ Verified'
    if (status === 'rejected') return '✗ Rejected'
    if (status === 'pending') return 'Pending'
    return 'Not uploaded'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-[#111827] font-medium mb-1">Failed to load dashboard</p>
          <p className="text-sm text-[#6B7280]">{error || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#4F46C8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const { profile, stats, upcoming_tasks, recent_activity, pending_applications_list } = data

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4F46C8] to-[#7683D6] flex items-center justify-center text-white text-2xl font-bold">
                {profile.name?.charAt(0) || 'V'}
              </div>
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getAvailabilityDot(profile.availability)}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Welcome back, {profile.name?.split(' ')[0] || 'Volunteer'}!
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(data.document_status)}`}>
                  {getVerificationLabel(data.document_status)}
                </span>
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin size={14} /> {profile.city || 'Location not set'}{profile.country ? `, ${profile.country}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/volunteer/tasks')}
            className="flex items-center gap-2 bg-[#4F46C8] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#4338CA] transition"
          >
            <PlusCircle size={16} /> Find Opportunities
          </button>
        </div>

        {/* ── PROFILE INCOMPLETE BANNER ── */}
        {!data.is_profile_complete && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Profile Incomplete</p>
                <p className="text-xs text-amber-700">Complete your profile to unlock all features and start applying to opportunities.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/volunteer/profile')}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FileText}
            label="Applications"
            value={animatedStats.applications}
            sub={`${stats.pending_applications} pending`}
            color="text-[#4F46C8]"
            bg="bg-[#EEF0FF]"
          />
          <StatCard
            icon={UserCheck}
            label="Accepted"
            value={animatedStats.accepted}
            sub="by NGOs"
            color="text-green-700"
            bg="bg-green-50"
          />
          <StatCard
            icon={Clock}
            label="Hours contributed"
            value={animatedStats.hours}
            sub="lifetime"
            color="text-amber-700"
            bg="bg-amber-50"
          />
          <StatCard
            icon={Star}
            label="Avg. rating"
            value={animatedStats.rating}
            sub={`from ${stats.total_reviews} reviews`}
            color="text-rose-700"
            bg="bg-rose-50"
          />
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Main content (2 cols) */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── RECOMMENDED OPPORTUNITIES ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-[#4F46C8]" /> Recommended Opportunities
                </h2>
                <button
                  onClick={() => router.push('/dashboard/volunteer/tasks')}
                  className="text-sm font-semibold text-[#4F46C8] hover:underline flex items-center gap-1"
                >
                  See all <ArrowRight size={14} />
                </button>
              </div>

              {recsLoading ? (
                <div className="flex items-center justify-center py-10 bg-white rounded-xl border border-black/5 shadow-sm">
                  <div className="w-7 h-7 border-3 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
                </div>
              ) : recommendations.length === 0 ? (
                <div className="bg-white border border-black/5 rounded-xl p-6 text-center shadow-sm">
                  <Sparkles size={24} className="mx-auto text-[#4F46C8]/30 mb-2" />
                  <p className="text-sm text-[#6B7280]">Complete your profile to get personalised recommendations.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((task: any, idx) => {
                    const overallScore = getOverallScore(task)
                    const reasons = task.recommendation_reason
                      ? [task.recommendation_reason]
                      : generateExplanation(task)
                    const matchedSkills: any[] = task.matched_skills ?? []
                    const missingSkills: any[] = task.missing_skills ?? []
                    const allSkills: any[] = task.skills ?? []
                    const hasTrustReq = task.trust_score != null && task.trust_score > 0
                    const urgencyKey = (task.urgency_level || 'low').toLowerCase()
                    const urgencyColors: Record<string, string> = {
                      high: 'bg-red-50 text-red-600 border border-red-200',
                      medium: 'bg-amber-50 text-amber-600 border border-amber-200',
                      low: 'bg-blue-50 text-blue-600 border border-blue-200',
                    }

                    return (
                      <div
                        key={task.id}
                        className="bg-white border border-black/5 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#7683D6]/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#6B7280]">#{idx + 1}</span>
                              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{task.title}</h3>
                              {task.urgency_level && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${urgencyColors[urgencyKey] || urgencyColors.low}`}>
                                  {urgencyKey}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1.5 flex-wrap">
                              {task.ngo?.organization_name && (
                                <span className="font-medium text-gray-700">{task.ngo.organization_name}</span>
                              )}
                              {task.category?.name && (
                                <><span>·</span><Layers size={11} className="inline" />{task.category.name}</>
                              )}
                              {(task.city || task.location) && (
                                <><span>·</span><MapPin size={11} className="inline" />{task.city || task.location}</>
                              )}
                              {task.start_date && (
                                <><span>·</span><Calendar size={11} className="inline" />{new Date(task.start_date).toLocaleDateString()}</>
                              )}
                              {task.distance_km != null && (
                                <><span>·</span>{task.distance_km} km</>
                              )}
                              {hasTrustReq && (
                                <><span>·</span><ShieldCheck size={11} className="inline text-green-600" /> Trust: {formatScore(task.trust_score)}%</>
                              )}
                            </p>
                          </div>

                          {/* Match Score Badge */}
                          <div className="shrink-0 text-center">
                            <div className={`text-base font-black px-3 py-1.5 rounded-xl border ${getMatchColor(overallScore)}`}>
                              {Math.round(overallScore)}%
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5 font-medium">match</div>
                          </div>
                        </div>

                        {/* Score breakdown bars */}
                        <div className="grid grid-cols-5 gap-1 mb-3">
                          {[
                            { label: 'Profile', value: task.semantic_match_score },
                            { label: 'Skills', value: task.skill_overlap_score },
                            { label: 'Distance', value: task.distance_score },
                            { label: 'Avail.', value: task.availability_score },
                            { label: 'Trust', value: task.trust_score },
                          ].map((s) => (
                            <div key={s.label} className="text-center">
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                                <div
                                  className={`h-full rounded-full transition-all ${getScoreBarColor(s.value ?? 0)}`}
                                  style={{ width: `${Math.round((s.value ?? 0) * 100)}%` }}
                                />
                              </div>
                              <div className="text-[9px] text-gray-400">{s.label}</div>
                              <div className="text-[10px] font-semibold text-gray-700">{formatScore(s.value)}%</div>
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        <p className="text-[11px] text-[#6B7280] italic mb-3 leading-relaxed">
                          {reasons[0]}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {matchedSkills.length > 0 && matchedSkills.map((s: any) => (
                            <span key={`m-${s.id}`} className="inline-flex items-center gap-1 text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                              <CheckCircle size={9} /> {s.name}
                            </span>
                          ))}
                          {missingSkills.length > 0 && missingSkills.map((s: any) => (
                            <span key={`ms-${s.id}`} className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
                              · {s.name}
                            </span>
                          ))}
                          {allSkills.length > 0 && matchedSkills.length === 0 && missingSkills.length === 0 && (
                            <span className="text-[10px] text-gray-400 font-medium">Required: {allSkills.map((s: any) => s.name).join(', ')}</span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/volunteer/apply/${task.id}`)}
                            className="flex-1 text-xs font-medium border border-[#CACDD3] text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                          >
                            Details
                          </button>
                          {task.application_status ? (
                            <div className={`flex-1 text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 border ${
                              task.application_status === 'Accepted'
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : task.application_status === 'Rejected'
                                ? 'bg-red-50 border-red-200 text-red-500'
                                : 'bg-[#F0F1F3] border-[#CACDD3] text-[#6B7280]'
                            }`}>
                              <CheckCircle size={11} />
                              {task.application_status === 'Accepted'
                                ? 'Accepted'
                                : task.application_status === 'Rejected'
                                ? 'Rejected'
                                : 'Applied'}
                            </div>
                          ) : (
                            <button
                              onClick={async () => {
                                setApplying(task.id)
                                try {
                                  await apiPost(`/volunteer/tasks/${task.id}/apply`, {})
                                  router.push('/dashboard/volunteer/applications')
                                } catch {
                                  alert('Failed to apply. You may have already applied.')
                                } finally {
                                  setApplying(null)
                                }
                              }}
                              disabled={applying === task.id}
                              className="flex-1 text-xs font-semibold bg-[#4F46C8] text-white py-2 rounded-lg hover:bg-[#4338CA] transition disabled:opacity-60 flex items-center justify-center gap-1"
                            >
                              {applying === task.id ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <><Send size={11} /> Apply</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Upcoming Opportunities */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-[#4F46C8]" /> Upcoming Opportunities
                </h2>
                <button
                  onClick={() => router.push('/dashboard/volunteer/tasks')}
                  className="text-sm font-semibold text-[#4F46C8] hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>
              {upcoming_tasks.length === 0 ? (
                <div className="bg-white border border-black/5 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-[#6B7280]">No upcoming tasks yet. Browse available tasks to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming_tasks.map((item) => (
                    <div key={item.id} className="bg-white border border-black/5 rounded-xl p-4 flex flex-wrap items-center justify-between shadow-sm">
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                          <MapPin size={14} /> {item.location || 'Location not specified'}
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{item.ngo}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-400">{item.date || 'Date TBD'}</p>
                        <button
                          onClick={() => router.push(`/dashboard/volunteer/tasks`)}
                          className="bg-[#4F46C8]/10 text-[#4F46C8] text-sm font-medium px-3 py-1 rounded-lg hover:bg-[#4F46C8]/20 transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>


            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={20} className="text-[#4F46C8]" /> Recent Activity
                </h2>
              </div>
              {recent_activity.length === 0 ? (
                <div className="bg-white border border-black/5 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-[#6B7280]">No recent activity. Start by applying to a task!</p>
                </div>
              ) : (
                <div className="bg-white border border-black/5 rounded-xl divide-y divide-black/5 shadow-sm">
                  {recent_activity.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {item.type === 'application' ? (
                          <FileText size={16} className="text-gray-600" />
                        ) : (
                          <CheckCircle size={16} className="text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.text}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-8">

            {/* Profile Completion */}
            <section className="bg-white border border-black/5 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[#4F46C8]" /> Profile Strength
              </h3>
              <div className="relative pt-1">
                <div className="flex mb-1 items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">{data.profile_completion}%</span>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                  <div
                    style={{ width: `${data.profile_completion}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#4F46C8] to-[#7683D6]"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" /> Basic info {profile.bio ? 'filled' : 'pending'}
                </div>
                <div className="flex items-center gap-2">
                  {profile.skills.length > 0 ? (
                    <><CheckCircle size={14} className="text-green-500" /> Skills added ({profile.skills.length})</>
                  ) : (
                    <><AlertCircle size={14} className="text-yellow-500" /> No skills added</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {data.document_status === 'none' ? (
                    <><AlertCircle size={14} className="text-yellow-500" /> No documents uploaded</>
                  ) : data.document_status === 'verified' ? (
                    <><CheckCircle size={14} className="text-green-500" /> Documents verified</>
                  ) : data.document_status === 'rejected' ? (
                    <><AlertCircle size={14} className="text-red-500" /> Documents rejected</>
                  ) : (
                    <><AlertCircle size={14} className="text-yellow-500" /> Documents pending</>
                  )}
                </div>
                <button
                  onClick={() => router.push('/dashboard/volunteer/profile')}
                  className="mt-3 w-full text-center text-sm font-medium text-[#4F46C8] bg-[#EEF0FF] px-3 py-1.5 rounded-lg hover:bg-[#E0E5FF] transition"
                >
                  Complete your profile
                </button>
              </div>
            </section>

            {/* Pending Applications */}
            <section className="bg-white border border-black/5 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Clock size={16} className="text-amber-500" /> Pending Applications
                <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {stats.pending_applications}
                </span>
              </h3>
              {pending_applications_list.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No pending applications.</p>
              ) : (
                <div className="space-y-3">
                  {pending_applications_list.map((app) => (
                    <div key={app.id} className="border-l-2 border-amber-400 pl-3 py-1">
                      <p className="text-sm font-medium text-gray-800">{app.title}</p>
                      <p className="text-xs text-gray-400">Pending for {app.days} days</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => router.push('/dashboard/volunteer/applications')}
                className="mt-4 w-full text-center text-sm font-medium text-[#4F46C8] hover:underline"
              >
                View all applications
              </button>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-2">
              <button
                onClick={() => router.push('/dashboard/volunteer/documents')}
                className="flex flex-col items-center justify-center bg-white border border-black/5 rounded-xl p-3 shadow-sm hover:shadow-md transition"
              >
                <Upload size={18} className="text-[#4F46C8] mb-1" />
                <span className="text-xs font-medium text-gray-700">Upload Document</span>
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color, bg }: any) {
  return (
    <div className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={color} />
        </div>
        <div>
          <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
        </div>
      </div>
    </div>
  )
}
