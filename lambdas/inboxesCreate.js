import handler from "../libs/handler-lib";
import Inbox from "../libs/inbox-lib";

export const main = handler(async (event, context) => {
  const result = await Inbox.create();

  return result;
});