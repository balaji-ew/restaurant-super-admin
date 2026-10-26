import { redirect } from 'next/navigation';

/**
 * The console has no landing page of its own — signed in you want the
 * dashboard, signed out the protected layout bounces you to `/signin`. This
 * redirects rather than rendering so `/` never flashes an empty frame.
 */
export default function RootPage() {
  redirect('/dashboard');
}
