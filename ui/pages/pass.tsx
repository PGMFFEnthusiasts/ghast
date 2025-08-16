import { buttonStyles } from '@/components/button';
import { ProsefulPage } from '@/components/page';
import { Discord } from '@/icons';
import { discordLink } from '@/utils/const';

const PassPage = () => (
  <ProsefulPage>
    <section class='brady-prose prose-lg py-16 text-center'>
      <h1>
        👋 Hey!{` `}
        <span class='text-secondary'>Read the following carefully...</span>
      </h1>

      {/*<div class='my-8 rounded outline-2 outline-current/20'>
        <div class='mx-auto h-36 w-0.5 bg-gradient-to-b from-current/20 to-current/0' />
        <div class='flex flex-row items-center'>
          <div class='h-0.5 flex-1 bg-gradient-to-r from-current/20 to-current/0' />
          <div class='text-center'>
            <span class='py-8 text-center text-3xl font-black text-black dark:text-white'>
              ⚠️ This is important ⚠️ <br />
              You will not skip this document.
            </span>
          </div>
          <div class='h-0.5 flex-1 bg-gradient-to-l from-current/20 to-current/0' />
        </div>
        <div class='mx-auto h-36 w-0.5 bg-gradient-to-t from-current/20 to-current/0' />
      </div>*/}

      <hr />

      <h1 class='text-secondary'>
        <span class='text-primary'>
          So, you've committed a Brady Faux Pas 😳...
        </span>
        {` `}
        What happened?
      </h1>

      <hr />

      <h1 class='text-secondary'>
        We have a house rule called the{` `}
        <span class='text-primary'>One Pass Rule</span>. 🤓
      </h1>

      <h2>It's really quite simple.</h2>

      <hr />

      <h1 class='text-primary'>
        Teams must pass once per possession before scoring.
      </h1>

      <h2>Seriously. It's that simple.</h2>

      <hr />

      <h1 class='text-secondary'>
        🚩 There are <span class='text-primary'>two</span> exceptions:
      </h1>

      <ol>
        <li>
          The flag is stripped inside an endzone, causing a touchdown. No one
          pass rule is required here!
        </li>
        <li>
          The flag carrier is knocked by the opposing team into the endzone.
          It's the fault of the other team for own-goaling.
        </li>
      </ol>

      <hr />

      <h1 class='text-secondary'>
        ❌ <span class='text-primary'>No, you cannot self-pass</span>. The ball
        must come from a teammate to touchdown.
      </h1>

      <hr />

      <h1>Any questions? 🙂</h1>
      <div class='not-prose'>
        <a
          class={`${buttonStyles(`bg-button`)} gap-2`}
          href={discordLink}
          target='_blank'
        >
          <Discord />
          Discord ↗
        </a>
      </div>
    </section>
  </ProsefulPage>
);

export default PassPage;
