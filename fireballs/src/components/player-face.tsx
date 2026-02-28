import type { ComponentProps } from 'react';

import { cn } from '@/src/lib/utils';

const PlayerFace = ({
  className,
  uuid,
  ...props
}: Omit<ComponentProps<`img`>, `src`> & { uuid: string }) => (
  <img
    className={cn(`[image-rendering:pixelated]`, className)}
    src={`https://nmsr.nickac.dev/face/${uuid}`}
    {...props}
  />
);

export { PlayerFace };
