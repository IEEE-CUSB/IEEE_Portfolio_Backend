import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'RESPONSE_MESSAGE';

/**
 * Sets a response message for the decorated handler.
 * @param message The message to set.
 * @returns A decorator function.
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
