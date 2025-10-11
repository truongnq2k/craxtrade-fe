import { Header } from './Header'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 text-gray-900">
      <Header />
      <main className="container mx-auto p-4 flex-1 w-full">
        {children}
      </main>
      <footer className="border-t bg-white">
        <div className="container mx-auto p-4 text-sm text-gray-500">
          Craxtrade FE
        </div>
      </footer>
    </div>
  )
}



