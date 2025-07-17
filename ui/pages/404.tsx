import { A } from '@solidjs/router';

const NotFoundPage = () => (
  <div class='container min-h-screen p-4'>
    <div class='mx-auto max-w-xl space-y-4 py-4 lg:py-8'>
      <h1 class='text-2xl font-bold'>lol oops</h1>
      <p>
        looks like we can't find that page
        <br />
        can i interest you in a route{` `}
        <A class='text-blue-500 underline decoration-dotted' href='/'>
          home ↗
        </A>
        ?
      </p>
    </div>
  </div>
);

export default NotFoundPage;
