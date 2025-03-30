import '@/app/globals.css'
import { AnimeNavBar } from '@/components/ui/anime-navbar'
import { Web3Provider } from '@/providers/web3-provider'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { FirebaseAuthProvider } from '@/context/FirebaseAuthContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ETH Voting App',
  description: 'Decentralized governance made simple',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <FirebaseAuthProvider>
            <AuthProvider>
              <AnimeNavBar />
              <main className="min-h-screen bg-gray-950 text-white">
                {children}
              </main>
              <Toaster position="bottom-right" />
            </AuthProvider>
          </FirebaseAuthProvider>
        </Web3Provider>
      </body>
    </html>
  )
} 