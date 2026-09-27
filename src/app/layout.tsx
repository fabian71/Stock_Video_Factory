import type {Metadata} from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Stock Video Factory',
  description: 'Batch motion design generator for stock video assets',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
