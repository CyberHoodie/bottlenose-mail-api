import Inbox from "../libs/inbox-lib";

export async function main(event, context) {
  const record = event.Records[0];
  const toEmailAddress = record.ses.mail.destination[0];

  try {
    const inbox = await Inbox.getByEmailAddress(toEmailAddress);

    if ( ! inbox) {
      return { 'disposition': 'STOP_RULE_SET' };
    } else {
      return { 'disposition': 'CONTINUE' };
    }
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
}