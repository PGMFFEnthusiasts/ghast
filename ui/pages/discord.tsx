import { BradyGPT } from '@/components/brady-gpt';
import { discordLink } from '@/utils/const';
import summary from '@/assets/discord.md?raw';

const DiscordPage = () => {
  return (
    <div class='container min-h-screen p-4'>
      <div class='mx-auto max-w-xl space-y-4 py-4 lg:py-8'>
        <h1 class='text-2xl font-black'>
          The{` `}
          <span class='rounded bg-red-500/50 px-2 py-1 font-black'>
            OFFICIAL
          </span>
          {` `}
          TB "Work In Progress" Discord
        </h1>
        <p>
          Hi there! You can find our Discord server link here:{' '}
          <a
            href={discordLink}
            target='_blank'
            class='text-blue-500 underline decoration-dotted'
          >
            {discordLink}
          </a>
        </p>
        <hr />
        <BradyGPT content={summary} />
      </div>
    </div>
  );
};

export default DiscordPage;
