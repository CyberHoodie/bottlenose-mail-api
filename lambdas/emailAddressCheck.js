import dynamoDb from "../libs/dynamodb-lib";

export async function main(event, context) {
  const record = event.Records[0];
  const toEmailAddress = record.ses.mail.destination[0];

  try {
    const emailExists = await checkEmail(toEmailAddress);

    if (emailExists) {
      return { 'disposition': 'CONTINUE' };
    } else {
      return { 'disposition': 'STOP_RULE_SET' };
    }
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
}

async function checkEmail(toEmailAddress) {
  const params = {
    TableName: process.env.inboxesTableName,
    IndexName: 'EmailAddressIndex',
    KeyConditionExpression: 'emailAddress = :email_address',
    ExpressionAttributeValues: { ':email_address': toEmailAddress}
  };
  const results = await dynamoDb.query(params);

  return results.Items.length > 0;
}