import { BradyGPT } from '@/components/brady-gpt';
import { A } from '@solidjs/router';
import summary from '@/assets/404.md?raw';

const NotFoundPage = () => (
  <div class='container min-h-screen p-4'>
    <div class='mx-auto max-w-xl space-y-4 py-4 lg:py-8'>
      <h1 class='text-2xl font-black'>
        The{` `}
        <span class='rounded bg-red-500/50 px-2 py-1 font-black'>OFFICIAL</span>
        {` `}
        TB "Work In Progress" 404 Not Found Page
      </h1>
      <p>
        looks like we can't find that page
        <br />
        can i interest you in a route{` `}
        <A class='text-blue-500 underline decoration-dotted' href='/'>
          home ↗
        </A>
        ?
      </p>
      <hr />
      <BradyGPT content={summary} />
    </div>
  </div>
);

export default NotFoundPage;
