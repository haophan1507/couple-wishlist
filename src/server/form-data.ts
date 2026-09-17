import { createServerFn } from "@tanstack/react-start";

export function createFormDataServerFn() {
  return createServerFn({ method: "POST" }).validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    return data;
  });
}
