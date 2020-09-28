import { v4 as uuid } from "uuid";
import mailparser, { simpleParser } from "mailparser";

export default class Email {
  constructor(database, fileStorage, tableName) {
    this.tableName = tableName;
    this.fileStorage = fileStorage;
    this.database = database;
  }

  list(emailAddress) {
    return this.database.query({
      TableName: this.tableName,
      IndexName: 'EmailAddressIndex',
      KeyConditionExpression: 'emailAddress = :email_address',
      ExpressionAttributeValues: { ':email_address': emailAddress }
    }).promise()
      .then((response) => (
        response.Items.map((email) => this.cleanEmail(email))
      ));
  }

  get(id) {
    let email;
    return this.database.get({
      TableName: this.tableName,
      Key: { emailId: id }
    }).promise()
      .then((response) => {
        email = response.Item;
        if ( ! email) {
          throw new Error("Item not found.");
        }

        return this.getEmailFile(email.bucketName, email.bucketObjectKey);
      })
      .then((s3Email) => {
        const fullEmail = {
          ...email,
          bodyHtml: s3Email.html,
          bodyText: s3Email.text
        };

        return this.cleanEmail(fullEmail);
      });
  }

  create(bucketName, bucketObjectKey) {
    let item;
    return this.fileStorage.getObject({
      Bucket: bucketName,
      Key: bucketObjectKey
    }).promise()
      .then((data) => simpleParser(data.Body))
      .then((email) => {
        item = {
          emailId: uuid(),
          emailAddress: email.to.text,
          date: email.date.getTime(),
          subject: email.subject,
          from: email.from.text,
          bucketName: bucketName,
          bucketObjectKey: bucketObjectKey,
        };

        return this.database.put({
          TableName: this.tableName,
          Item: item,
        }).promise()
      })
      .then(() => item);
  }

  getEmailFile(bucketName, bucketObjectKey) {
    return this.fileStorage.getObject({
      Bucket: bucketName,
      Key: bucketObjectKey
    }).promise()
      .then((response) => mailparser.simpleParser(response.Body));
  }

  cleanEmail(email) {
    // eslint-disable-next-line no-unused-vars
    const { bucketName, bucketObjectKey, ...cleanedEmail} = email;
    return cleanedEmail;
  }
}
