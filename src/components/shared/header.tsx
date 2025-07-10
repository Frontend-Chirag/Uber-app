'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronDown, GlobeIcon } from 'lucide-react';
import { Profile } from './profile';
import { useUserData } from '@/hooks/use-user';

// Helper to check for session cookie
function hasSessionCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('x-uber-session');
}


export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(hasSessionCookie());
  }, []);

  console.log(isAuthenticated)

  const { data: user, isLoading } = useUserData(isAuthenticated);

  return (
    <header
      className={cn(
        'w-full fixed top-0 left-0 z-10',
        isAuthenticated ? 'bg-white text-black' : 'bg-black text-white'
      )}
    >
      <div className='max-w-screen-2xl mx-auto  h-[64px] flex items-center justify-between px-20'>
        {/* Left nav */}
        <ul className="flex items-center gap-x-1">
          <li>
            <Link
              href="/"
              className={cn('text-2xl font-Rubik-Regular mr-4', isAuthenticated ? 'text-black' : 'text-white')}
            >
              Uber
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className={cn('text-2xl font-Rubik-Regular mr-4', isAuthenticated ? 'text-black' : 'text-white')}
            >
              blog
            </Link>
          </li>

          {['Ride', 'Drive', 'Business'].map((item) => (
            <li key={item}>
              <Link
                href="/"
                className={cn(
                  'text-sm font-Rubik-Regular transition duration-500 px-3 py-2  rounded-full',
                  isAuthenticated ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-neutral-800'
                )}
              >
                {item}
              </Link>
            </li>
          ))}

          <li>
            <Link
              href="/"
              className={cn(
                'text-sm font-Rubik-Regular transition duration-500 px-3 py-2 flex gap-2 items-center rounded-full',
                isAuthenticated ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-neutral-800 '
              )}
            >
              <span>
                About
              </span>
              <ChevronDown className="size-4" />
            </Link>
          </li>
        </ul>

        {/* Right nav */}
        <ul className="flex items-center gap-x-1">
          <li>
            <Link
              href="/"
              className={cn(
                'text-sm font-Rubik-Regular transition duration-500 px-3 py-2 flex gap-2 justify-center items-center rounded-full',
                isAuthenticated ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-neutral-800 '
              )}
            >
              <GlobeIcon className="size-4" />
              <span>EN</span>
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className={cn(
                'text-sm font-Rubik-Regular transition duration-500 px-3 py-2 rounded-full',
                isAuthenticated ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-neutral-800 '
              )}
            >
              Help
            </Link>
          </li>
          {isAuthenticated ? (
            isLoading ? (
              <li><div className="px-3 py-2">Loading...</div></li>
            ) : (
              <Profile user={user!} />
            )
          ) : (
            <>
              <li>
                <Link
                  href="/login"
                  className={cn(
                    'text-sm font-Rubik-Regular transition duration-500 px-3 py-2',
                    isAuthenticated ? 'text-black' : 'text-white hover:bg-neutral-800 rounded-full'
                  )}
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm font-Rubik-Regular transition duration-500 px-3 py-2 text-black bg-white hover:bg-neutral-200 rounded-full"
                >
                  Sign up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
