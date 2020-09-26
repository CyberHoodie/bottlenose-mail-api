import handler from "../libs/handler-lib";
import Inbox from "../libs/inbox-lib";
import Email from "../libs/email-lib";

export const main = handler(async (event, context) => {
  let inboxId;

  if (event.queryStringParameters && event.queryStringParameters.inboxId) {
    inboxId = event.queryStringParameters.inboxId;
  } else {
    throw new Error("Inbox ID is missing.");
  }

  const inbox = await Inbox.get(inboxId);
  return await Email.list(inbox.emailAddress);
});
