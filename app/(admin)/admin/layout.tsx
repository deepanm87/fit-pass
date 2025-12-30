import { Providers } from "@/components/providers/Providers"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </Providers>
  )
}