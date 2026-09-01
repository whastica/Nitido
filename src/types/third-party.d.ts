declare module "mammoth" {
  interface Result {
    value: string;
    messages: unknown[];
  }
  interface Options {
    buffer?: Buffer;
  }
  export function extractRawText(options: Options): Promise<Result>;
  export default { extractRawText };
}
