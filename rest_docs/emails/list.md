# List Emails

`GET /emails`

## Description

List the emails for an inbox. Emails objects only contain common header values.

## Body Parameters

| Field Name | Required | Description                    |
|------------|----------|--------------------------------|
| inboxId    | true     | Unique identifier of the inbox |

## Success Responses

**Code**: `200`

**Content Example**
```json
[
  {
    "emailId": "d843bdd6-7c86-43e0-a3e4-0405d08c0f24",
    "emailAddress": "wn0x8rp1py@bottlenosemail.com",
    "date": "1599696547782",
    "from": "Will <will@example.com>",
    "subject": "Some subject"
  },
  // ...
]
```

## Error Response

**Code**: `500`

**Content Example**
```json
{
  "error": "Some error message"
}
```