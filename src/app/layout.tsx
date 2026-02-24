import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'תרי"ג מצוות - Taryag',
    description: 'Real-time 613 mitzvot fulfillment tracker',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
          <html lang="he" dir="rtl">
                <body>{children}</body>body>
          </html>html>
        )
}</html>
