import { A } from '@solidjs/router';
import { toast } from 'solid-sonner';

import { BradyGPT } from '@/components/brady-gpt';
import { buttonStyles } from '@/components/button';
import { Header } from '@/components/header';
import { discordLink } from '@/utils/const';
import factSummary from '@/assets/facts.md?raw';

const LanderPage = () => (
  <main class='mx-auto h-fit max-w-xl space-y-6 py-8 max-sm:p-4'>
    <Header />
    <section>
      <h1 class='text-2xl font-black'>
        The{` `}
        <span class='rounded bg-red-500/50 px-2 py-1 font-black'>OFFICIAL</span>
        {` `}
        TB "Work In Progress" Homepage
      </h1>
      <p>
        This page is pretty work in progress, please excuse the mess! It'll get
        sorted eventually, hopefully.
      </p>
    </section>
    <hr />
    <section>
      <h2 class='text-2xl font-black'>Server Facts</h2>
      <p>
        I've cut this out of the cardboard box the server came in. Of course,
        you should join the{` `}
        <a
          class='text-blue-500 underline decoration-dotted'
          href={discordLink}
          target='_blank'
        >
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
    <hr />
    <section>
      <h2 class='text-xl font-black'>DISCLAIMER:</h2>
      <p>
        If you are on a page{` `}
        <b>that is not this page</b> which claims to be the{` `}
        <span class='rounded bg-red-500/50 px-2 py-1 font-black'>OFFICIAL</span>
        {` `}
        TB "Work In Progress" Homepage, then you are likely on a false or
        counterfeit page which is attempting to scam you, which in that case our
        advice is to immediately leave such page and{` `}
        <b>report such page to the proper authorities</b>. If you do not report
        the page to the proper authorities, you will be declared as
        {` `}
        <b>COMPLICIT</b> with the acts of any such fake "
        <span class='rounded bg-red-500/50 px-2 py-1 font-black'>OFFICIAL</span>
        {` `}
        TB 'Work In Progress' Homepage." If that is the case, you are advised to
        be aware of the potentially unforseen{` `}
        <b>GLOBALLY CATASTROPHIC CONSEQUENCES</b>.
      </p>
    </section>
  </main>
);

export default LanderPage;

const ServerFacts = () => (
  <div class='mx-auto my-8 w-full max-w-sm border-1 border-black bg-white p-4 font-sans text-sm text-black'>
    <div class='mb-1 border-b-8 border-black pb-1 text-3xl font-extrabold'>
      Server Facts
    </div>

    <div class='mb-1 flex items-baseline justify-between'>
      <p class='font-normal'>Serving Size</p>
      <p class='font-bold'>12 players (sometimes more)</p>
    </div>

    <div class='mb-2 flex items-baseline justify-between border-b border-black pb-1'>
      <p class='font-normal'>Servings Per Container</p>
      <p class='font-bold'>2 Servers</p>
    </div>

    <p class='text-right text-xs font-semibold'>Amount Per Serving</p>
    <div class='flex items-baseline justify-between'>
      <h3 class='text-4xl font-extrabold'>Slots</h3>
      <span class='text-4xl font-extrabold'>100</span>
    </div>

    <p class='mt-1 border-t-8 border-black py-1 text-right text-xs leading-none font-bold'>
      % Daily Value*
    </p>

    <div class='border-t border-black pt-1'>
      <div class='flex items-baseline justify-between pb-1'>
        <p>
          <span class='font-bold'>Server IP</span>
        </p>
        <p
          class='rounded bg-gray-200 px-2 font-mono font-bold select-all'
          onClick={() => {
            toast.success(`Copied IP to clipboard`);
            navigator.clipboard.writeText(`tombrady.fireballs.me`);
          }}
        >
          tombrady.fireballs.me
        </p>
      </div>
      <div class='flex items-baseline justify-between border-t border-gray-300 py-1 pl-4'>
        <p>
          <span>Versions</span>
        </p>
        <p class='font-bold'>1.8.9+</p>
      </div>
      <div class='flex items-baseline justify-between border-t border-gray-300 py-1 pl-4'>
        <p>
          <span>Region</span>
        </p>
        <p class='font-bold'>US-Central</p>
      </div>

      <div class='flex items-baseline justify-between border-t border-black py-1'>
        <p>
          <span class='font-bold'>One Pass Rule</span>
        </p>
        <p class='font-bold'>100%</p>
      </div>
      <div class='flex items-baseline justify-between border-t border-gray-300 py-1 pl-4'>
        <p>
          <span>Pass needed to score?</span>
        </p>
        <p class='font-bold'>Yes</p>
      </div>
      <div class='flex items-baseline justify-between border-t border-gray-300 py-1 pl-4'>
        <p>
          <span>Number of passes needed?</span>
        </p>
        <p class='font-bold'>1</p>
      </div>
      <div class='flex items-baseline justify-between border-t border-gray-300 py-1 pl-4'>
        <p>
          <span>Self passing?</span>
        </p>
        <p class='font-bold'>No</p>
      </div>

      <div class='flex items-baseline justify-between border-t border-black py-1'>
        <p>
          <span class='font-bold'>Double Clicking</span>
        </p>
        <p class='font-bold'>STRICTLY BANNED</p>
      </div>
      <div class='flex items-baseline justify-between border-t border-gray-300 py-1 pl-4'>
        <p>
          <span>Additional Rules</span>
        </p>
        <a class='font-bold text-blue-500 underline' href='https://oc.tc/rules'>
          From OCC
        </a>
      </div>
    </div>

    <div class='border-t-8 border-black pt-1'>
      <div class='flex items-baseline justify-between pb-1'>
        <p>Toxicity</p>
        <p class='font-bold'>0%</p>
      </div>
      <div class='flex items-baseline justify-between border-t border-gray-300 pb-1'>
        <p>Having fun</p>
        <p class='font-bold'>1000%</p>
      </div>
    </div>

    <p class='border-t-8 border-black pt-2 text-xs font-normal'>
      *The % Daily Value (DV) tells you how much a nutrient in a serving of food
      contributes to a daily diet. 2,000 calories a day is used for general
      nutrition advice.
    </p>
  </div>
);
