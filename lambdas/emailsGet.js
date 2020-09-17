import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const params = {
    TableName: process.env.emailsTableName,
    Key: {
      emailId: event.pathParameters.id
    }
  };

  const result = await dynamoDb.get(params);
  if ( ! result.Item) {
    throw new Error("Item not found.");
  } else {
    delete result.Item.bucketName;
    delete result.Item.bucketObjectKey;
  }

  // Return the retrieved item
  return result.Item;
});
