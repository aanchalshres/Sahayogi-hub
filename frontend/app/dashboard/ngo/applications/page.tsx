'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost } from '@/app/lib/api'
import {
  User, Clock, CheckCircle2, XCircle, Hourglass,
  Inbox, ChevronDown, ChevronUp, Filter, X,
  ShieldCheck, ShieldAlert, Sparkles, ArrowUpDown,
  CheckCircle, Brain, Target, Navigation, Zap, Shield,
} from 'lucide-react'
import { getMatchColor, getScoreBarColor, formatScore, getScoreLabel } from '@/app/lib/scoring'

interface Application {
  id: number
  task_id: number
  volunteer_profile_id: number
  status: string
  applied_at: string
  reviewed_at: string | null
  remarks: string | null
  // Recommendation scores (populated by backend)
  recommendation_score: number | null
  semantic_match_score: number | null
  skill_overlap_score: number | null
  distance_score: number | null
  availability_score: number | null
  trust_score: number | null
  matched_skills: { id: number; name: string }[]
  missing_skills: { id: number; name: string }[]
  distance_km: number | null
  recommendation_reason: string | null
  is_verified: boolean
  task: { id: number; title: string; status: string }
  volunteer: {
    id: number
    skills: { id: number; name: string }[]
    documents: { id: number; status: string }[]
    user: { id: number; name: string; email: string; phone: string }
  }
}

interface Task {
  id: number
  title: string
}

interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

type SortBy = 'recommendation_score' | 'trust_score' | 'distance_score' | 'skill_overlap_score' | 'created_at'

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Hourglass, label: 'Pending' },
  Accepted: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Accepted' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle, label: 'Cancelled' },
}

const SORT_LABELS: Record<SortBy, string> = {
  recommendation_score: 'Overall Score',
  trust_score: 'Trust',
  distance_score: 'Distance',
  skill_overlap_score: 'Skill Match',
  created_at: 'Apply Date',
}

export default function NgoApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [taskFilter, setTaskFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('recommendation_score')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (taskFilter) params.set('task_id', taskFilter)
      params.set('page', String(page))
      params.set('per_page', '20')
      params.set('sort_by', sortBy)

      const res = await apiGet<{ data: Application[]; meta: Meta }>(`/api/ngo/applications?${params}`)
      setApplications(res.data)
      setMeta(res.meta)
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, taskFilter, page, sortBy])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await apiGet<{ data: Task[] }>('/api/ngo/tasks')
        setTasks(res.data)
      } catch {}
    }
    loadTasks()
  }, [])

  const updateStatus = async (id: number, action: 'accept' | 'reject') => {
    try {
      await apiPost(`/api/ngo/applications/${id}/${action}`, {})
      load()
    } catch (err: any) {
      alert(err.message || `Failed to ${action} application`)
    }
  }

  const cancelAssignment = async (id: number) => {
    if (!confirm('Cancel this assignment?')) return
    try {
      await apiPost(`/api/ngo/applications/${id}/cancel`, {})
      load()
    } catch (err: any) {
      alert(err.message || 'Failed to cancel assignment')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-[#6B7280]">
          Sorted by recommendation score — algorithm assists decision-making only.
          <span className="text-xs font-medium ml-2 text-[#4F46C8]">({meta.total} total)</span>
        </p>
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <select
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] flex-1 min-w-[140px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] flex-1 min-w-[140px]"
          value={taskFilter}
          onChange={(e) => { setTaskFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Opportunities</option>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <ArrowUpDown size={14} className="text-gray-400" />
          <span className="text-gray-500 text-xs">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortBy); setPage(1) }}
            className="outline-none bg-transparent text-sm font-medium text-gray-700"
          >
            {(Object.keys(SORT_LABELS) as SortBy[]).map((k) => (
              <option key={k} value={k}>{SORT_LABELS[k]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-10 text-center">
          <Inbox size={36} className="mx-auto text-[#6B7280] mb-3" />
          <p className="text-gray-900 font-medium mb-1">No applications found</p>
          <p className="text-[#6B7280] text-sm">Adjust filters or wait for volunteers to apply.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((app, idx) => {
              const status = STATUS_STYLES[app.status] || STATUS_STYLES.Pending
              const StatusIcon = status.icon
              const title = app.task?.title || `Task #${app.task_id}`
              const isExpanded = expandedId === app.id
              const vol = app.volunteer
              const volUser = vol?.user
              const hasScore = app.recommendation_score != null

              return (
                <div key={app.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                  {/* Score stripe */}
                  {hasScore && (
                    <div
                      className={`h-0.5 w-full ${
                        app.recommendation_score! >= 70 ? 'bg-green-400' :
                        app.recommendation_score! >= 40 ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Rank */}
                        {hasScore && (
                          <div className="w-8 h-8 rounded-full bg-[#4F46C8]/10 flex items-center justify-center shrink-0 text-[10px] font-black text-[#4F46C8]">
                            #{(meta.current_page - 1) * meta.per_page + idx + 1}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">{volUser?.name || 'Unknown'}</p>
                            {app.is_verified ? (
                              <ShieldCheck size={14} className="text-green-600 shrink-0" aria-label="Verified" />
                            ) : (
                              <ShieldAlert size={14} className="text-gray-400 shrink-0" aria-label="Not verified" />
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280] truncate">Applied for: {title}</p>
                          <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                            <Clock size={12} />
                            <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Recommendation score badge */}
                        {hasScore && (
                          <div className="text-center">
                            <div className={`text-sm font-black px-2.5 py-1 rounded-lg border ${getMatchColor(app.recommendation_score!)}`}>
                              {Math.round(app.recommendation_score!)}%
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5">{getScoreLabel(app.recommendation_score!)}</div>
                          </div>
                        )}
                        {!hasScore && (
                          <div className="text-center">
                            <div className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-400">No score</div>
                          </div>
                        )}

                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Score mini bars */}
                    {hasScore && (
                      <div className="grid grid-cols-5 gap-1 mb-3">
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
                            <div className="text-[9px] font-bold text-gray-600">{formatScore(s.value)}%</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Matched/missing skills compact */}
                    {hasScore && (app.matched_skills?.length > 0 || app.missing_skills?.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
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
                      <p className="text-[11px] text-[#6B7280] italic mb-3 leading-relaxed">
                        <Sparkles size={9} className="inline mr-1 text-[#4F46C8]" />
                        {app.recommendation_reason}
                      </p>
                    )}

                    {volUser && (
                      <button onClick={() => setExpandedId(isExpanded ? null : app.id)} className="flex items-center gap-1.5 text-xs font-medium text-[#4F46C8] hover:text-[#3f39a8] mb-2">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? 'Hide details' : 'View details'}
                      </button>
                    )}

                    {isExpanded && volUser && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2.5">
                        <p><span className="text-[#6B7280]">Email:</span> <span className="text-gray-900">{volUser.email}</span></p>
                        <p><span className="text-[#6B7280]">Phone:</span> <span className="text-gray-900">{volUser.phone || 'N/A'}</span></p>
                        <p><span className="text-[#6B7280]">Verification:</span>
                          <span className={`ml-1 font-medium ${app.is_verified ? 'text-green-600' : 'text-gray-500'}`}>
                            {app.is_verified ? 'Documents Verified' : 'Not Verified'}
                          </span>
                        </p>
                        {app.distance_km != null && (
                          <p><span className="text-[#6B7280]">Distance:</span> <span className="text-gray-900">{app.distance_km} km</span></p>
                        )}
                        {vol.skills && vol.skills.length > 0 && (
                          <p>
                            <span className="text-[#6B7280]">Skills:</span>
                            <span className="flex flex-wrap gap-1 mt-1">
                              {vol.skills.map((s) => (
                                <span key={s.id} className="text-xs bg-[#EEF0FF] text-[#4F46C8] px-2 py-0.5 rounded-full">{s.name}</span>
                              ))}
                            </span>
                          </p>
                        )}
                        <p><span className="text-[#6B7280]">Opportunity:</span> <span className="text-gray-900">{title} ({app.task?.status})</span></p>
                      </div>
                    )}

                    {app.status === 'Pending' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => updateStatus(app.id, 'accept')} className="flex-1 bg-[#4F46C8] hover:bg-[#3f39a8] text-white text-sm font-medium py-2 rounded-lg transition">
                          Approve
                        </button>
                        <button onClick={() => updateStatus(app.id, 'reject')} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 text-sm font-medium py-2 rounded-lg transition">
                          Reject
                        </button>
                      </div>
                    )}
                    {app.status === 'Accepted' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => cancelAssignment(app.id)} className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-sm font-medium py-2 rounded-lg transition">
                          Cancel Assignment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Previous
              </button>
              <span className="text-sm text-[#6B7280]">Page {meta.current_page} of {meta.last_page}</span>
              <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
