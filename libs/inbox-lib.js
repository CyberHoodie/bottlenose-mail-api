import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";
import { NotFoundError } from "./error-lib";

export default class Inbox {
  constructor(database, tableName, stage) {
    this.tableName = tableName;
    this.database = database;
    this.stage = stage;
  }

  create() {
    const item = {
      inboxId: uuid(),
      emailAddress: `${nanoid(10).toLowerCase()}@${this.emailDomain()}`,
      createdAt: Date.now()
    };

    return this.database.put({
      TableName: this.tableName,
      Item: item
    }).promise()
      .then(() => item);
  }

  get(id) {
    return this.database.get({
      TableName: this.tableName,
      Key: { inboxId: id }
    }).promise()
      .then((response) => {
        if ( ! response.Item) {
          throw new NotFoundError("Inbox not found.");
        }
        return response.Item
      });
  }

  getByEmailAddress(emailAddress) {
    return this.database.query({
      TableName: this.tableName,
      IndexName: 'EmailAddressIndex',
      KeyConditionExpression: 'emailAddress = :email_address',
      ExpressionAttributeValues: { ':email_address': emailAddress}
    }).promise()
      .then((response) => (
        response.Items.length > 0 ? response.Items[0] : null
      ));
  }

  emailDomain() {
    if (this.stage == "prod") {
      return "bottlenosemail.com";
    } else {
      return "bottlenosemail-dev.com";
    }
  }
}