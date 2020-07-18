export async function wait(ms: number): Promise<unknown> {
  return new Promise(res => setTimeout(res, ms));
}
