/**
 * An interface to set the contract for all window message handlers
 */
export interface MessageHandler {
  getType(): string;
  handleMessage(message);
}
