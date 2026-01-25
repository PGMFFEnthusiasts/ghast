import { clsx } from 'clsx';

export const skinUrl = (uuid: string, yaw?: number) => {
  const base = `https://nmsr.nickac.dev/fullbody/${uuid}`;
  return yaw === undefined ? base : `${base}?yaw=${yaw}`;
};

export const fetchSkinAsDataUrl = async (
  uuid: string,
  yaw?: number,
): Promise<string> => {
  const response = await fetch(skinUrl(uuid, yaw));
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const MinecraftSkin = (props: {
  class?: string;
  height?: number;
  src?: string;
  uuid?: string;
  yaw?: number;
}) => (
  <img
    class={clsx(`select-none`, props.class)}
    height={props.height ?? 400}
    src={props.src ?? skinUrl(props.uuid!, props.yaw)}
    width={props.height ? props.height / 2 : 200}
  />
);
