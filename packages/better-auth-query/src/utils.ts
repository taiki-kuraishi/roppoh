interface RawMessage {
  readonly code: string;
  message: string;
}

interface BetterAuthErrorObject {
  code?: string | undefined;
  message?: string | RawMessage | undefined;
}

export const extractErrorMessage = (
  message: string | RawMessage | undefined,
): string | undefined => {
  if (!message) {
    return undefined;
  }

  if (typeof message === "string") {
    return message;
  }

  return message.message;
};

export const toError = (error: BetterAuthErrorObject, fallback: string): Error =>
  new Error(extractErrorMessage(error.message) ?? error.code ?? fallback);
