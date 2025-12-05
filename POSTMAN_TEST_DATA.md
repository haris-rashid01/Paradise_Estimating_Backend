# Postman Test Data for Email Sending

**Endpoint:** `POST` `http://localhost:5000/api/send-email`
**Body Type:** `form-data`

## Request Setup

1. **Method:** Select `POST`.
2. **URL:** Enter `http://localhost:5000/api/send-email`.
3. **Body:** Select the **Body** tab, then choose **form-data**.

## Test Data (Key-Value Pairs)

Copy and paste these values into the form-data fields.

| Key | Value | Type | Description |
| :--- | :--- | :--- | :--- |
| `name` | `Test User` | Text | Name of the sender. |
| `email` | `test-user@example.com` | Text | Email address of the sender. |
| `phone` | `555-0199` | Text | Phone number. |
| `message` | `This is a test message regarding the blueprint.` | Text | The message body. |
| `blueprint` | *(Select a file)* | **File** | **Important:** Hover over the 'text' dropdown on the right of the key input and select 'File'. Then choose a file from your system. |

## Expected Response

**Status:** `200 OK`

```json
{
    "success": true
}
```
