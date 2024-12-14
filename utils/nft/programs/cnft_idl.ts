import { Idl } from '@coral-xyz/anchor';

export const CNFT_IDL: Idl = {
  version: "0.1.0",
  name: "cnft",
  instructions: [
    {
      name: "createCnft",
      accounts: [
        {
          name: "cnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merkleTree",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treeAuthority",
          isMut: false,
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
          name: "logWrapper",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bubblegumProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "compressionProgram",
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
          name: "symbol",
          type: "string",
        },
        {
          name: "uri",
          type: "string",
        },
        {
          name: "sellerFeeBasisPoints",
          type: "u16",
        },
      ],
    },
    {
      name: "transferCnft",
      accounts: [
        {
          name: "cnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merkleTree",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
        {
          name: "recipient",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bubblegumProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "compressionProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "logWrapper",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "burnCnft",
      accounts: [
        {
          name: "cnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merkleTree",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treeAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
        {
          name: "bubblegumProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "compressionProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "logWrapper",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "CompressedNft",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "delegate",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "uri",
            type: "string",
          },
          {
            name: "sellerFeeBasisPoints",
            type: "u16",
          },
          {
            name: "primarySaleHappened",
            type: "bool",
          },
          {
            name: "isMutable",
            type: "bool",
          },
          {
            name: "editionNonce",
            type: { option: "u8" },
          },
          {
            name: "tokenStandard",
            type: "u8",
          },
          {
            name: "collection",
            type: { option: "publicKey" },
          },
          {
            name: "uses",
            type: { option: "u64" },
          },
          {
            name: "treeId",
            type: "publicKey",
          },
          {
            name: "leafId",
            type: "u32",
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
      name: "SymbolTooLong",
      msg: "The provided symbol is too long",
    },
    {
      code: 6002,
      name: "UriTooLong",
      msg: "The provided URI is too long",
    },
    {
      code: 6003,
      name: "Unauthorized",
      msg: "You are not authorized to perform this action",
    },
    {
      code: 6004,
      name: "InvalidSellerFeeBasisPoints",
      msg: "Seller fee basis points must be between 0 and 10000",
    },
    {
      code: 6005,
      name: "MerkleTreeFull",
      msg: "The Merkle tree is full and cannot accept more CNFTs",
    },
  ],
};

