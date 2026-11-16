import './globals.css';

export const metadata = {
  title: 'Unisanda Links',
  description: 'Unisanda links and reviews',
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('unisanda-theme')==='dark')document.documentElement.dataset.theme='dark';if(localStorage.getItem('unisanda-language')==='ar'){document.documentElement.lang='ar';document.documentElement.dir='rtl';document.documentElement.dataset.lang='ar'}}catch(e){}" }} />
        <meta name="theme-color" content="#5b222b" />
      </head>
      <body>{children}</body>
    </html>
  );
}
