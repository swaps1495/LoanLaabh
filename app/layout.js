import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export const metadata = {
  title: 'LoanLaabh — Apply Smarter. Borrow Better.',
  description: "Don't risk your CIBIL. LoanLaabh uses FinMatrix AI™ to analyze your profile and compare it with lender eligibility criteria — helping you discover suitable loan options before you apply.",
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LoanLaabh',
  },
}

export const viewport = {
  themeColor: '#F7FAFF',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.className} antialiased bg-[#F7FAFF] text-[#071E41]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
