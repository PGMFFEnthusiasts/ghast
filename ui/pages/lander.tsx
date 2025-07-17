import { A } from '@solidjs/router';
import { toast } from 'solid-sonner';

const LanderPage = () => (
  <div class='container min-h-screen p-4'>
    <div class='mx-auto max-w-xl space-y-4 py-4 lg:py-8'>
      <h1 class='text-2xl font-black'>
        The{` `}
        <span class='rounded bg-red-300 px-2 py-1 font-black'>OFFICIAL</span> TB
        "Work In Progress" Homepage
      </h1>
      <p>
        This page is pretty work in progress, please excuse the mess! It'll get
        sorted eventually, hopefully.
      </p>
      <hr class='text-gray-200' />
      <div>
        <h2 class='text-2xl font-black'>Server Facts</h2>
        <p>
          I've cut this out of the cardboard box the server came in. Of course,
          you should join the{` `}
          <a
            class='text-blue-500 underline decoration-dotted'
            href='https://discord.gg/YYYtfhDGUM'
            target='_blank'
          >
            Discord
          </a>
          {` `}
          for even more information.
        </p>
      </div>
      <div class='mx-auto my-8 w-full max-w-sm border-1 border-black bg-white p-4 font-sans text-sm'>
        <h2 class='mb-1 border-b-8 border-black pb-1 text-3xl font-extrabold'>
          Server Facts
        </h2>

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
            <a
              class='font-bold text-blue-500 underline'
              href='https://oc.tc/rules'
            >
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
          *The % Daily Value (DV) tells you how much a nutrient in a serving of
          food contributes to a daily diet. 2,000 calories a day is used for
          general nutrition advice.
        </p>
      </div>
      <hr class='text-gray-200' />
      <div class='text-center'>
        <A class='text-blue-500 underline decoration-dotted' href='/matches'>
          View Recent matches ↗
        </A>
      </div>
      <hr class='text-gray-200' />
      <p>
        <span class='font-black'>DISCLAIMER</span>: If you are on a page{` `}
        <b>that is not this page</b> which claims to be the{` `}
        <span class='rounded bg-red-300 px-2 py-1 font-black'>OFFICIAL</span> TB
        "Work In Progress" Homepage, then you are likely on a false or
        counterfeit page which is attempting to scam you, which in that case our
        advice is to immediately leave such page and{` `}
        <b>report such page to the proper authorities</b>. If you do not report
        the page to the proper authorities, you will be declared as{` `}
        <b>COMPLICIT</b> with the acts of any such fake "
        <span class='rounded bg-red-300 px-2 py-1 font-black'>OFFICIAL</span> TB
        'Work In Progress' Homepage." If that is the case, you are advised to be
        aware of the potentially unforseen{` `}
        <b>GLOBALLY CATASTROPHIC CONSEQUENCES</b>. Furthermore, we reserve the
        right to use CATs or (Complete Annihilation Technologies) to deal with
        flagrant violations of the above.
      </p>
    </div>
  </div>
);

export default LanderPage;
