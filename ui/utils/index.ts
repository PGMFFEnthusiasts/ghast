import { intlFormat, intlFormatDistance } from 'date-fns';

export const formatRelativeTime = (time: number) =>
  intlFormatDistance(new Date(time), new Date());

export const formatReallyLongTime = (time: number) => {
  const date = new Date(time);
  return `${formatRelativeTime(time)} (${intlFormat(date, {
    day: `numeric`,
    month: `numeric`,
    year: `numeric`,
  })}) at ${intlFormat(date, {
    hour: `numeric`,
    minute: `numeric`,
  })}`;
};

export const capitalize = (s: string) =>
  String(s[0]).toUpperCase() + s.slice(1);

export const formatNumericalDuration = (time: number) =>
  `${Math.floor(time / 60)
    .toString()
    .padStart(2, `0`)}:${(time % 60).toString().padStart(2, `0`)}`;

export const divHtml = (
  strings: TemplateStringsArray,
  ...values: (number | string)[]
): HTMLDivElement => {
  const element = document.createElement(`div`);
  element.innerHTML = values
    .map((v) => v.toString())
    .reduce((acc, val, i) => acc + val + strings[i + 1], strings[0]);
  return element;
};
