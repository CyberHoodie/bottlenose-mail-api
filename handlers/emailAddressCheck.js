import AWS from "aws-sdk";
import Inbox from "../libs/inbox-lib";

export async function main(event, context) {
  const record = event.Records[0];
  const toEmailAddress = record.ses.mail.destination[0];

  try {
    const client = new AWS.DynamoDB.DocumentClient;
    const inbox = new Inbox(client, process.env.inboxesTableName, process.env.stage);
    const result = await inbox.getByEmailAddress(toEmailAddress);

    if ( ! result) {
      return { 'disposition': 'STOP_RULE_SET' };
    } else {
      return { 'disposition': 'CONTINUE' };
    }
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
}