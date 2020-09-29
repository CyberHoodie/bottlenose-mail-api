import AWS from "aws-sdk";
import handler from "../libs/handler-lib";
import Inbox from "../libs/inbox-lib";

export const main = handler(async (event, context) => {
  const client = new AWS.DynamoDB.DocumentClient;
  const inbox = new Inbox(client, process.env.inboxesTableName, process.env.stage);
  const result = await inbox.get(event.pathParameters.id);

  return result;
});
