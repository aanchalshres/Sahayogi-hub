'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost, apiPut } from '@/app/lib/api'
import {
  ArrowLeft, PlusCircle, AlertTriangle, CheckCircle2, ChevronDown, Save
} from 'lucide-react'
import SkillSelector from '@/app/components/ui-custom/SkillSelector'
import LocationPicker from '@/app/components/ui-custom/LocationPicker'

interface Skill {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

export interface NgoTaskFormValues {
  id?: number
  title: string
  description: string
  category_id: number | null
  task_type: string
  location: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  required_volunteers: number
  start_date: string
  end_date: string | null
  application_deadline: string | null
  urgency_level: string
  status: string
  selection_logic: string | null
  skills?: { id: number; name: string }[]
}

interface NgoTaskFormProps {
  mode: 'create' | 'edit'
  taskId?: number
  backHref?: string
}

const inputClass = (hasError?: boolean) =>
  `w-full px-3 py-2.5 bg-white border ${hasError ? 'border-red-400' : 'border-gray-200'} rounded-lg text-sm outline-none focus:border-[#4F46C8] focus:ring-1 focus:ring-[#4F46C8]/30 transition`

export default function NgoTaskForm({ mode, taskId, backHref }: NgoTaskFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'

  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(isEdit)
  const [notFound, setNotFound] = useState(false)
  const [saved, setSaved] = useState(false)

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [initialLat, setInitialLat] = useState<number | null>(null)
  const [initialLng, setInitialLng] = useState<number | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    task_type: 'one_time',
    required_volunteers: '1',
    start_date: '',
    end_date: '',
    application_deadline: '',
    urgency_level: 'medium',
    selection_logic: 'manual',
    status: 'draft',
    skills: [] as number[],
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [skillsRes, categoriesRes] = await Promise.all([
          apiGet<{ data: Skill[] }>('/api/skills'),
          apiGet<{ data: Category[] }>('/api/categories'),
        ])
        setSkills(skillsRes.data)
        setCategories(categoriesRes.data)
      } catch {
        // Non-critical
      }
    }
    load()

    if (isEdit && taskId) {
      loadTask(taskId)
    }
  }, [isEdit, taskId])

  const loadTask = async (id: number) => {
    try {
      const res = await apiGet<{ data: NgoTaskFormValues }>(`/api/ngo/tasks/${id}`)
      const task = res.data
      setForm({
        title: task.title,
        description: task.description,
        category_id: task.category_id ? String(task.category_id) : '',
        task_type: task.task_type,
        required_volunteers: String(task.required_volunteers),
        start_date: task.start_date?.slice(0, 10) || '',
        end_date: task.end_date?.slice(0, 10) || '',
        application_deadline: task.application_deadline?.slice(0, 10) || '',
        urgency_level: task.urgency_level,
        selection_logic: task.selection_logic || 'manual',
        status: task.status,
        skills: task.skills?.map((s) => s.id) || [],
      })
      if (task.latitude && task.longitude) {
        setSelectedLocation({ lat: task.latitude, lng: task.longitude, address: task.location || '' })
        setInitialLat(task.latitude)
        setInitialLng(task.longitude)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSkillsChange = (skillIds: number[]) => {
    setForm((prev) => ({ ...prev, skills: skillIds }))
    setSaved(false)
    setFieldErrors((prev) => ({ ...prev, skills: '' }))
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.title.trim()) errors.title = 'Title is required'
    if (!form.description.trim()) errors.description = 'Description is required'
    if (!isEdit && !form.category_id) errors.category_id = 'Category is required'
    if (!form.start_date) errors.start_date = 'Start date is required'
    if (!selectedLocation) errors.location = 'Please select a location on the map'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildPayload = (status: string) => {
    return {
      title: form.title,
      description: form.description,
      category_id: form.category_id ? Number(form.category_id) : null,
      task_type: form.task_type,
      location: selectedLocation?.address || '',
      city: '',
      latitude: selectedLocation ? selectedLocation.lat : null,
      longitude: selectedLocation ? selectedLocation.lng : null,
      required_volunteers: Number(form.required_volunteers),
      start_date: form.start_date?.slice(0, 10) || form.start_date,
      end_date: form.end_date?.slice(0, 10) || form.end_date || null,
      application_deadline: form.application_deadline?.slice(0, 10) || form.application_deadline || null,
      urgency_level: form.urgency_level,
      selection_logic: form.selection_logic,
      status,
      skills: form.skills,
    }
  }

  const handleSubmit = async (status: string) => {
    if (!validate()) return
    setSubmitting(true)
    setError(null)
    try {
      if (isEdit && taskId) {
        await apiPut(`/api/ngo/tasks/${taskId}`, buildPayload(status))
        setSaved(true)
        setTimeout(() => router.push('/dashboard/ngo/tasks'), 700)
      } else {
        await apiPost('/api/ngo/tasks', buildPayload(status))
        router.push('/dashboard/ngo/tasks?created=true')
      }
    } catch (err: any) {
      setError(err.message || (isEdit ? 'Failed to update task' : 'Failed to create task'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center p-8">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-10 text-center max-w-md">
          <AlertTriangle size={36} className="mx-auto text-red-500 mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Task not found</h1>
          <p className="text-[#6B7280] mb-6">This task may have already been deleted or the link is invalid.</p>
          <button onClick={() => router.push('/dashboard/ngo/tasks')}
            className="bg-[#4F46C8] hover:bg-[#3f39a8] transition text-white px-5 py-2.5 rounded-lg font-medium">
            Back to Manage Tasks
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-5 md:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push(backHref || (isEdit ? '/dashboard/ngo/tasks' : '/dashboard/ngo'))}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
              {isEdit ? (
                <Save size={20} className="text-[#4F46C8]" />
              ) : (
                <PlusCircle size={20} className="text-[#4F46C8]" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {isEdit ? 'Edit Task' : 'Create New Opportunity'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEdit
                  ? 'Update the details for this volunteer opportunity.'
                  : 'Fill in the details below to post a new volunteer opportunity.'}
              </p>
            </div>
          </div>

          {error && <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded p-3 mb-6"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title <span className="text-red-500">*</span></label>
              <input type="text" className={inputClass(!!fieldErrors.title)} placeholder="e.g., Beach Cleanup Drive" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
              {fieldErrors.title && <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description <span className="text-red-500">*</span></label>
              <textarea rows={4} className={inputClass(!!fieldErrors.description)} placeholder="Describe what volunteers will do..." value={form.description} onChange={(e) => updateField('description', e.target.value)} />
              {fieldErrors.description && <p className="text-xs text-red-500 mt-1">{fieldErrors.description}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category {!isEdit && <span className="text-red-500">*</span>}</label>
              <div className="relative">
                <select className={`${inputClass(!!fieldErrors.category_id)} appearance-none`} value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {fieldErrors.category_id && <p className="text-xs text-red-500 mt-1">{fieldErrors.category_id}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Task Type</label>
              <select className={`${inputClass()} appearance-none`} value={form.task_type} onChange={(e) => updateField('task_type', e.target.value)}>
                <option value="one_time">One-Time</option>
                <option value="ongoing">Ongoing</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <LocationPicker
                latitude={initialLat}
                longitude={initialLng}
                onChange={setSelectedLocation}
                error={fieldErrors.location}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Required Volunteers {!isEdit && <span className="text-red-500">*</span>}</label>
              <input type="number" min="1" className={inputClass()} value={form.required_volunteers} onChange={(e) => updateField('required_volunteers', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Urgency Level</label>
              <select className={`${inputClass()} appearance-none`} value={form.urgency_level} onChange={(e) => updateField('urgency_level', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass(!!fieldErrors.start_date)} value={form.start_date} onChange={(e) => updateField('start_date', e.target.value)} />
              {fieldErrors.start_date && <p className="text-xs text-red-500 mt-1">{fieldErrors.start_date}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <input type="date" className={inputClass()} value={form.end_date} onChange={(e) => updateField('end_date', e.target.value || null)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Application Deadline</label>
              <input type="date" className={inputClass()} value={form.application_deadline} onChange={(e) => updateField('application_deadline', e.target.value || null)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Selection Logic</label>
              <select className={`${inputClass()} appearance-none`} value={form.selection_logic} onChange={(e) => updateField('selection_logic', e.target.value)}>
                <option value="manual">Manual Review</option>
                <option value="auto_accept">Auto Accept</option>
              </select>
            </div>
            {isEdit && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select className={`${inputClass()} appearance-none`} value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-6">
            <SkillSelector
              skills={skills}
              selectedIds={form.skills}
              onChange={handleSkillsChange}
              loading={skills.length === 0}
            />
          </div>

          {isEdit ? (
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => handleSubmit(form.status)} disabled={submitting}
                className="flex items-center gap-2 bg-[#4F46C8] hover:bg-[#3f39a8] transition text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60">
                <Save size={16} />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => router.push('/dashboard/ngo/tasks')}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition">
                Discard
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium ml-2">
                  <CheckCircle2 size={16} /> Saved
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => handleSubmit('draft')} disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-60">
                Save as Draft
              </button>
              <button onClick={() => handleSubmit('open')} disabled={submitting}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#4F46C8] hover:bg-[#4338CA] transition disabled:opacity-60">
                {submitting ? 'Publishing...' : 'Publish Now'}
                <PlusCircle size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
