import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
