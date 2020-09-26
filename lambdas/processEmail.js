import Email from "../libs/email-lib";

export async function main(event, context) {
  const record = event.Records[0];

  try {
    Email.create(record.s3.bucket.name, record.s3.object.key);
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
}