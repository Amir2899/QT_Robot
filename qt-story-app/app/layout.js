import './globals.css';

export const metadata = {
  title: 'QT Robot Raconte des Histoires',
  description: 'Application de lecture d\'histoires pour QT Robot',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
} 