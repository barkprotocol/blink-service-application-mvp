export const IDL = {
    "version": "0.1.0",
    "name": "blink_program",
    "instructions": [
      {
        "name": "createBlink",
        "accounts": [
          {
            "name": "blink",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "metadataUri",
            "type": "string"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "Blink",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "publicKey"
            },
            {
              "name": "metadataUri",
              "type": "string"
            }
          ]
        }
      }
    ]
  };
  
  