import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => (
  <>
    <section>
      <div className='container mx-auto flex flex-col'>
        <div className='flex aspect-video w-full grow flex-col gap-4 rounded-xl bg-secondary p-4'>
          <div className='flex items-center'>
            <h2 className='text-xl font-black'>Draft Tournament XXI</h2>
          </div>
          <img
            className='rounded sm:rounded-sm md:rounded-md lg:rounded-lg xl:rounded-xl'
            src='exp-12.webp'
          />
        </div>
      </div>
    </section>
  </>
);
export const Route = createFileRoute(`/events/`)({
  component: RouteComponent,
});
