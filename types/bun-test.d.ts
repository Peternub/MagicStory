declare module "bun:test" {
  export function describe(name: string, callback: () => void): void;
  export function test(name: string, callback: () => void | Promise<void>): void;
  export function expect<T>(value: T): {
    toBe(expected: T): void;
    toContain(expected: unknown): void;
    not: {
      toContain(expected: unknown): void;
    };
    toEqual(expected: unknown): void;
    toMatch(expected: RegExp): void;
  };
}
