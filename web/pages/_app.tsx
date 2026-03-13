import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import DashboardLayout from '../components/DashboardLayout';

// Pages that do NOT use the dashboard layout
const NO_LAYOUT_PAGES: string[] = ['/'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const useLayout = !NO_LAYOUT_PAGES.includes(router.pathname);

  if (useLayout) {
    return (
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    );
  }

  return <Component {...pageProps} />;
}
