import summary from '@/assets/facts.md?raw';
import { BradyGPT } from '@/components/brady-gpt';
import { Badge, ServerFacts } from '@/components/branding';
import { buttonStyles } from '@/components/button';
import { ProsefulPage } from '@/components/page';
import { Discord } from '@/icons';
import { discordLink } from '@/utils/const';

const DiscordPage = () => (
  <ProsefulPage>
    <section class='brady-prose'>
      <h2>
        The <Badge name='Discord' />
      </h2>
      <p>Hi there! You can find our Discord server link here:</p>
    </section>
    {/* this is cooked and out of prev section bc not-prose doesn't reset currentColor */}
    <section>
      <a
        class={`${buttonStyles(`bg-button`)} gap-2`}
        href={discordLink}
        target='_blank'
      >
        <Discord />
        Discord ↗
      </a>
    </section>
    <hr />
    <section class='brady-prose'>
      <h2>Server Facts</h2>
      <p>You can briefly read about our server here:</p>
      <ServerFacts />
    </section>
    <hr />
    <section>
      <BradyGPT content={summary} />
    </section>
  </ProsefulPage>
);

export default DiscordPage;
