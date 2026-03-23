import './globals.css';
import { AppShell } from '../components/layout/app-shell';

export const metadata = {
  title: 'Liquid Ops',
  description: 'Simulated trading platform foundation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
