import { Idl } from '@coral-xyz/anchor';

export const BLINK_IDL: Idl = {
  version: "0.1.0",
  name: "blink",
  instructions: [
    {
      name: "createBlink",
      accounts: [
        {
          name: "blink",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "blinkType",
          type: "string",
        },
        {
          name: "isNft",
          type: "bool",
        },
        {
          name: "isDonation",
          type: "bool",
        },
        {
          name: "isGift",
          type: "bool",
        },
        {
          name: "isPayment",
          type: "bool",
        },
        {
          name: "isPoll",
          type: "bool",
        },
      ],
    },
    {
      name: "updateBlink",
      accounts: [
        {
          name: "blink",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "blinkType",
          type: "string",
        },
      ],
    },
    {
      name: "deleteBlink",
      accounts: [
        {
          name: "blink",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Blink",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "blinkType",
            type: "string",
          },
          {
            name: "isNft",
            type: "bool",
          },
          {
            name: "isDonation",
            type: "bool",
          },
          {
            name: "isGift",
            type: "bool",
          },
          {
            name: "isPayment",
            type: "bool",
          },
          {
            name: "isPoll",
            type: "bool",
          },
          {
            name: "createdAt",
            type: "i64",
          },
          {
            name: "updatedAt",
            type: "i64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "NameTooLong",
      msg: "The provided name is too long",
    },
    {
      code: 6001,
      name: "DescriptionTooLong",
      msg: "The provided description is too long",
    },
    {
      code: 6002,
      name: "InvalidBlinkType",
      msg: "The provided blink type is invalid",
    },
    {
      code: 6003,
      name: "Unauthorized",
      msg: "You are not authorized to perform this action",
    },
  ],
};

