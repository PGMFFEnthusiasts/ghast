import { Link } from '@tanstack/react-router';
import { Copy } from 'lucide-react';

import { Discord } from '@/src/components/icons/discord';
import { Button } from '@/src/components/ui/button';
import { authClient } from '@/src/lib/auth-client';

export default function Header() {
  return (
      <header className='flex h-16 items-center px-4 text-white'>
        <div className='container mx-auto flex items-center'>
          <div className='flex flex-1 items-center'>
            <Link to='/'>
              <h1 className='inline-flex items-center gap-1 text-xl font-semibold'>
                <img className='size-9.5' src='/assets/brady_logo.png' /> Fireballs
              </h1>
            </Link>
          </div>

          <div className='flex flex-1 items-center justify-center'></div>
          <div className='flex flex-1 items-center justify-end gap-2'>
            <Button className='max-md:hidden' size='lg' variant='secondary'>
              <Copy /> tombrady.fireballs.me
            </Button>
            <Button
              className='bg-[#5865F2] text-white'
              onClick={async () => {
                await authClient.signIn.social({
                  provider: `discord`,
                });
              }}
              size='sm'
            >
              Sign In with <Discord className='ml-0.5 size-4' />
            </Button>
          </div>
        </div>
      </header>
  );
}
