export function BlankLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-gray-50 text-gray-900">
      {children}
    </div>
  )
}



