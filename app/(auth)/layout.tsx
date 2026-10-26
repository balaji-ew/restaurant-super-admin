import { type ReactNode } from 'react';

/**
 * The signed-out frame.
 *
 * A plum ground rather than the console's grey: it makes the boundary between
 * "you are out" and "you are in" unmistakable, and it is the one screen where
 * the brand should be doing the talking.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-plum-gradient p-4">
      {children}
    </div>
  );
}
