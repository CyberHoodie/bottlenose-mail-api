import handler from "../libs/handler-lib";
import Email from "../libs/email-lib";

export const main = handler(async (event, context) => {
  return Email.get(event.pathParameters.id);
});
