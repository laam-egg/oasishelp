import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import { GlobalToast, GlobalToastContextProvider } from '@/contexts/GlobalToastContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OASIS Helper',
  description: 'Generate your Java classes with Javadoc autofill',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <PrimeReactProvider>
        <GlobalToastContextProvider>
          <body className={inter.className}>
            <h1>{'Generate your Java classes with Javadoc autofill'}</h1>
            <small style={{ wordWrap: 'break-word' }}>
              <span>{"Since November 6th 2023 this app saves your Java classes in your browser so that you won't lose them when closing this tab."}</span>
              <br />
              <span>{"Also, when you open multiple tabs of this app, then changes in a tab will be synchronized in others."}</span>
              <br />
              <a href='https://github.com/laam-egg/oasishelp' target='_blank'>{'View source code on GitHub.'}</a>
            </small>
            <br />
            <br />
            {children}
            <br />
            <GlobalToast />
          </body>
        </GlobalToastContextProvider>
      </PrimeReactProvider>
    </html>
  )
}
