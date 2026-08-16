'use client'
import { useParams } from 'next/navigation'
import NgoTaskForm from '@/app/components/ui-custom/NgoTaskForm'

export default function EditTaskPage() {
  const params = useParams()
  const taskId = Number(params.id)

  return <NgoTaskForm mode="edit" taskId={taskId} />
}
