import { A } from '@solidjs/router';

import factSummary from '@/assets/facts.md?raw';
import { BradyGPT } from '@/components/brady-gpt';
import { Badge, ServerFacts } from '@/components/branding';
import { buttonStyles } from '@/components/button';
import { ProsefulPage } from '@/components/page';
import { discordLink } from '@/utils/const';

const LanderPage = () => (
  <ProsefulPage>
    <section class='brady-prose'>
      <h2>
        The <Badge name='Homepage' />
      </h2>
      <p>
        This page is pretty work in progress, please excuse the mess! It'll get
        sorted eventually, hopefully.
      </p>
    </section>
    <hr />
    <section class='brady-prose'>
      <h2>Server Facts</h2>
      <p>
        I've cut this out of the cardboard box the server came in. Of course,
        you should join the{` `}
        <a href={discordLink} target='_blank'>
          Discord
        </a>
        {` `}
        for even more information.
      </p>
      <ServerFacts />
    </section>
    <BradyGPT content={factSummary} />
    <hr />
    <A class={buttonStyles(`bg-button`)} href='/matches'>
      View Recent Matches ↗
    </A>
    <A class={buttonStyles(`bg-button`)} href='/tournaments'>
      View Tournaments ↗
    </A>
    <hr />
    <section class='brady-prose'>
      <h2>DISCLAIMER:</h2>
      <p>
        If you are on a page{` `}
        <b>that is not this page</b> which claims to be the{` `}
        <Badge name='Homepage' />, then you are likely on a false or counterfeit
        page which is attempting to scam you, which in that case our advice is
        to immediately leave such page and{` `}
        <b>report such page to the proper authorities</b>. If you do not report
        the page to the proper authorities, you will be declared as
        {` `}
        <b>COMPLICIT</b> with the acts of any such fake "
        <Badge name='Homepage' quoted />
        ." If that is the case, you are advised to be aware of the potentially
        unforseen{` `}
        <b>GLOBALLY CATASTROPHIC CONSEQUENCES</b>.
      </p>
    </section>
  </ProsefulPage>
);

export default LanderPage;
