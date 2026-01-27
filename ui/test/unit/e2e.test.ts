import Bun from 'bun';
import { describe, expect, test } from 'bun:test';

describe(`e2e`, () => {
  test(
    `playwright tests`,
    async () => {
      const proc = Bun.spawn([`bun`, `playwright`, `test`], {
        cwd: import.meta.dirname + `/../..`,
        env: { ...process.env, FORCE_COLOR: `1` },
        stderr: `inherit`,
        stdout: `inherit`,
      });
      const exitCode = await proc.exited;
      expect(exitCode).toBe(0);
    },
    { timeout: 300_000 },
  );
});
