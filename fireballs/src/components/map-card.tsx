import { Calendar, RulerDimensionLine, Users, X } from 'lucide-react';

import { PlayerFace } from '@/src/components/player-face';

type MapCardData = {
  authors: Array<{ name: string; uuid: string }>;
  contributors: Array<{ contribution: string; name: string; uuid: string }>;
  image: string;
  stats: {
    maxPlayers: string;
    releaseDate: string;
    size: { height: number; width: number };
  };
  title: string;
};

const MapCard = ({ data }: { data: MapCardData }) => (
  <div className='flex flex-1 flex-col gap-4 overflow-clip rounded-md bg-secondary lg:rounded-lg xl:rounded-xl'>
    <div className='relative flex flex-col'>
      <img
        className='sm:rounded-sm md:rounded-md lg:rounded-lg xl:rounded-xl'
        src={data.image}
      />
      {/* mobile */}
      <div className='flex flex-col gap-4 p-4 lg:hidden'>
        <h3 className='font-medium'>{data.title}</h3>
        <div className='flex flex-wrap gap-4'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col'>
              <span className='text-xs font-bold uppercase'>Authors</span>
              <div className='flex flex-col gap-2 font-bold'>
                {data.authors.map((author) => (
                  <span
                    className='flex items-center gap-2 text-sm'
                    key={author.uuid}
                  >
                    <PlayerFace className='size-7' uuid={author.uuid} />
                    {author.name}
                  </span>
                ))}
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <span className='text-xs font-black uppercase'>Contributors</span>
              <div className='flex flex-col gap-2'>
                {data.contributors.map((contributor) => (
                  <span
                    className='flex items-center gap-2'
                    key={contributor.uuid}
                  >
                    <PlayerFace className='size-7' uuid={contributor.uuid} />
                    <span className='text-sm font-bold'>
                      {contributor.name}
                    </span>
                    {` `}
                    <span className='text-sm italic'>
                      {contributor.contribution}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col'>
                <span className='flex items-center gap-1 text-sm font-bold text-foreground/80'>
                  <RulerDimensionLine className='size-5' /> Size
                </span>
                <span className='flex items-center gap-1 text-lg font-bold'>
                  {data.stats.size.width} <X className='size-4 stroke-3' />
                  {` `}
                  {data.stats.size.height}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='flex items-center gap-1 text-sm font-bold text-foreground/80'>
                  <Users className='size-5' /> Max Players
                </span>
                <span className='flex items-center gap-1 text-lg font-bold'>
                  {data.stats.maxPlayers}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='flex items-center gap-1 text-sm font-bold text-foreground/80'>
                  <Calendar className='size-5' /> Release Date
                </span>
                <span className='flex items-center gap-1 text-lg font-bold'>
                  {data.stats.releaseDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* desktop */}
      <h3 className='absolute top-4 left-4 items-center rounded-md bg-secondary px-4 py-2 text-3xl max-lg:hidden'>
        {data.title}
      </h3>
      <div className='absolute inset-x-4 bottom-4 flex items-end gap-2 max-lg:hidden'>
        <div className='flex flex-col'>
          <span className='ml-2 w-fit rounded-t-md bg-secondary px-2 py-1 text-xs font-black uppercase'>
            Authors
          </span>
          <div className='flex flex-col gap-2 rounded-md bg-background p-4 font-bold'>
            {data.authors.map((author) => (
              <span className='flex items-center gap-2' key={author.uuid}>
                <PlayerFace className='size-8' uuid={author.uuid} />
                {author.name}
              </span>
            ))}
          </div>
        </div>
        {data.contributors.length > 0 && (
          <div className='flex flex-col'>
            <span className='ml-2 w-fit rounded-t-md bg-secondary px-2 py-1 text-xs font-black uppercase'>
              Contributors
            </span>
            <div className='flex flex-col gap-2 rounded-md bg-background p-4'>
              {data.contributors.map((contributor) => (
                <span
                  className='flex items-center gap-2'
                  key={contributor.uuid}
                >
                  <PlayerFace className='size-8' uuid={contributor.uuid} />
                  <span className='font-bold'>{contributor.name}</span>
                  {` `}
                  <span className='italic'>{contributor.contribution}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className='ml-auto flex flex-col'>
          <span className='mr-2 ml-auto w-fit rounded-t-md bg-secondary px-2 py-1 text-xs font-black uppercase'>
            Stats
          </span>
          <div className='flex flex-col gap-2 rounded-md bg-background p-4'>
            <div className='flex flex-col'>
              <span className='flex items-center gap-1 text-sm font-bold text-foreground/80'>
                <RulerDimensionLine className='size-5' /> Size
              </span>
              <span className='flex items-center gap-1 text-lg font-bold'>
                {data.stats.size.width} <X className='size-4 stroke-3' />
                {` `}
                {data.stats.size.height}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='flex items-center gap-1 text-sm font-bold text-foreground/80'>
                <Users className='size-5' /> Max Players
              </span>
              <span className='flex items-center gap-1 text-lg font-bold'>
                {data.stats.maxPlayers}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='flex items-center gap-1 text-sm font-bold text-foreground/80'>
                <Calendar className='size-5' /> Release Date
              </span>
              <span className='flex items-center gap-1 text-lg font-bold'>
                {data.stats.releaseDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export { MapCard };
export type { MapCardData };
