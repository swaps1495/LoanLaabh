import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'LoanLaabh - Smart Loan Matching for India',
  description: 'Compare 15+ top lenders, check eligibility instantly, and get matched with the best loan offers for personal, home, business, auto & education loans.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
