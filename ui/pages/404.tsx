import { A } from '@solidjs/router';

import summary from '@/assets/404.md?raw';
import { BradyGPT } from '@/components/brady-gpt';
import { Badge } from '@/components/branding';
import { ProsefulPage } from '@/components/page';

const NotFoundPage = () => (
  <ProsefulPage>
    <section class='brady-prose'>
      <h2>
        The <Badge name='404 Not Found Page' />
      </h2>
      <p>
        looks like we can't find that page
        <br />
        can i interest you in a route{` `}
        <A class='text-blue-500 underline decoration-dotted' href='/'>
          home ↗
        </A>
        ?
      </p>
    </section>
    <hr />
    <section>
      <BradyGPT content={summary} />
    </section>
  </ProsefulPage>
);

export default NotFoundPage;
