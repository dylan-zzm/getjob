import { ReactNode } from 'react';

export default function ActivityLayout({ children }: { children: ReactNode }) {
  return <main className="container py-6 md:py-8">{children}</main>;
}
