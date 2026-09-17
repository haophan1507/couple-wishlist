/** Shared FormData validator — always call createServerFn() at each export site. */
export function formDataValidator(data: unknown): FormData {
  if (!(data instanceof FormData)) {
    throw new Error("Expected FormData");
  }
  return data;
}
