import { createFileRoute } from '@tanstack/react-router';

import { Map } from '@/src/components/map';

const RouteComponent = () => (
  <>
    <section>
      <div className='mx-auto flex flex-col px-48'>
        <Map
          events={[
            {
              killer: `70a5d8ec-3bd2-45b9-807a-aad6b3f9e1aa`,
              player: `e419983c-bb20-438d-b900-717f131a272f`,
              timestamp: 185,
              type: `death`,
              x: 55,
              y: 32,
            },
            {
              player: `1c6ea6c0-3400-4ea4-942a-8e204d6aa576`,
              points: 6,
              timestamp: 305,
              type: `score`,
              x: 5,
              y: 38,
            },
          ]}
          map='fbbowl'
        />
        <Map
          events={[
            {
              killer: `70a5d8ec-3bd2-45b9-807a-aad6b3f9e1aa`,
              player: `e419983c-bb20-438d-b900-717f131a272f`,
              timestamp: 185,
              type: `death`,
              x: 55,
              y: 32,
            },
            {
              player: `1c6ea6c0-3400-4ea4-942a-8e204d6aa576`,
              points: 6,
              timestamp: 305,
              type: `score`,
              x: 5,
              y: 38,
            },
          ]}
          map='exp-12'
        />
      </div>
    </section>
  </>
);
export const Route = createFileRoute(`/matches/$match`)({
  component: RouteComponent,
});
