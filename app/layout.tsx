import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chat App',
  description: 'Real-time chat application with user presence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
