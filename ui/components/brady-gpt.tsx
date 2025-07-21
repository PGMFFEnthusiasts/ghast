import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { createEffect, createSignal, Show } from 'solid-js';
import { unified } from 'unified';

import markdown from '@/assets/slop.md?raw';
import { Button } from '@/components/button';
import { ArrowUp } from '@/icons';

export const BradyGPT = () => {
  const [currentMarkdown, setCurrentMarkdown] = createSignal(``);
  const [immutableInput, setImmutableInput] = createSignal(
    `im not reading allat summarize it`,
  );
  let responseBox: HTMLDivElement;

  const remaining = markdown.split(/([\n\s])/);
  const generateMore = () => {
    setCurrentMarkdown(
      (old) =>
        old + remaining.splice(0, Math.floor(2 + Math.random() * 6)).join(``),
    );

    return remaining.length > 0;
  };

  const pipeline = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify);

  createEffect(() => {
    responseBox!.innerHTML = pipeline.processSync(currentMarkdown()).toString();
  });

  const start = () => {
    const loop = () => {
      if (generateMore()) setTimeout(loop, 60 + Math.floor(Math.random() * 80));
    };

    loop();
  };

  return (
    <div class='py-4'>
      <div class='flex flex-row items-center gap-2 pb-4'>
        <img class='size-8' src='/brady_logo.png' />
        <span class='font-medium text-current/80'>
          BradyGPT v1-12T{` `}
          {`${new Date().getMonth().toString().padStart(2, `0`)}-${new Date().getDate().toString().padStart(2, `0`)}`}
        </span>
      </div>
      <div
        class='prose dark:prose-invert prose-headings:my-2 prose-a:text-blue-500 prose-a:decoration-dotted prose-code:before:content-[""] prose-code:after:content-[""] prose-ul:my-0.5 prose-li:my-0.5'
        ref={responseBox!}
      />
      <Show when={currentMarkdown().length === 0}>
        <div class='flex flex-row gap-2'>
          <input
            class='h-8 flex-1 rounded bg-background-hover/30 p-2 outline-1 outline-border/80 transition-colors duration-150 focus:outline-border'
            onInput={() => setImmutableInput((v) => v + `\u200B`)}
            type='text'
            value={immutableInput()}
          />
          <Button
            class='hover:bg-background-hover active:bg-background-active'
            onClick={start}
          >
            <ArrowUp class='text-white' />
          </Button>
        </div>
      </Show>
    </div>
  );
};
