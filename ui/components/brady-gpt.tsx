import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { createSignal, Show } from 'solid-js';
import { unified } from 'unified';

import help from '@/assets/help.md?raw';
import { Button } from '@/components/button';
import { ArrowUp } from '@/icons';
import { discordLink } from '@/utils/const';

const pipeline = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStringify);

const lazyPhrases = [
  `im not reading allat summarize it`,
  `summarize plz`,
  `tl;dr this`,
  `summary`,
  `eli5`,
  `read this for me please`,
  `i love wasting power`,
];

export const BradyGPT = (props: { content: string }) => {
  const [currentMarkdown, setCurrentMarkdown] = createSignal(``);
  const [immutableInput, setImmutableInput] = createSignal(
    lazyPhrases[Math.floor(Math.random() * lazyPhrases.length)],
  );
  const [thinkingTime, setThinkingTime] = createSignal(0);
  let responseBox: HTMLDivElement;

  // eslint-disable-next-line solid/reactivity
  const content = Math.random() < 0.2 ? props.content + help : props.content;
  const remaining = content.replace(`$DISCORD`, discordLink).split(/([\n\s])/);

  const generate = () => {
    setCurrentMarkdown(
      (old) =>
        old + remaining.splice(0, Math.floor(2 + Math.random() * 6)).join(``),
    );
    responseBox!.innerHTML = pipeline.processSync(currentMarkdown()).toString();

    return remaining.length > 0;
  };

  const loop = () => {
    if (generate()) setTimeout(loop, 60 + Math.floor(Math.random() * 80));
  };

  const start = () => {
    setThinkingTime(Math.floor(1000 + Math.random() * 2000));
    setTimeout(loop, thinkingTime());
  };

  return (
    <div class='flex flex-col'>
      <div class='flex flex-row items-center gap-2 pb-4'>
        <img class='size-8' src='/brady_logo.png' />
        <span class='font-medium text-current/80'>
          BradyGPT v1-12T{` `}
          {new Date().getMonth().toString().padStart(2, `0`)}-
          {new Date().getDate().toString().padStart(2, `0`)} Thinking
        </span>
      </div>
      <Show when={currentMarkdown().length > 0 && thinkingTime() !== 0}>
        <div class='text-sm font-semibold text-current/40'>
          Thought for {(thinkingTime() / 1000).toFixed(1)}s
        </div>
      </Show>
      <Show when={currentMarkdown().length === 0 && thinkingTime() !== 0}>
        <div class='animate-pulse'>
          <div class='mb-4 h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700' />
          <div class='mb-2.5 h-2 max-w-[360px] rounded-full bg-gray-200 dark:bg-gray-700' />
          <div class='mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700' />
          <div class='mb-2.5 h-2 max-w-[330px] rounded-full bg-gray-200 dark:bg-gray-700' />
        </div>
      </Show>
      <div class='brady-prose' ref={responseBox!} />
      <Show when={currentMarkdown().length === 0 && thinkingTime() === 0}>
        <div class='flex gap-2'>
          <input
            class='h-8 flex-1 rounded bg-input p-2 outline-1 outline-border transition-colors duration-150 focus:outline-border-hover'
            name='brady-gpt-query'
            onInput={() =>
              setImmutableInput(
                (v) =>
                  lazyPhrases.filter((k) => k !== v)[
                    Math.floor(Math.random() * (lazyPhrases.length - 1))
                  ],
              )
            }
            type='text'
            value={immutableInput()}
          />
          <Button class='size-8' onClick={start}>
            <ArrowUp />
          </Button>
        </div>
      </Show>
    </div>
  );
};
