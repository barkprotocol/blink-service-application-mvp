import { PublicKey } from '@solana/web3.js'

export const PROGRAM_ID = new PublicKey('Your_Donation_Program_ID_Here')

export const IDL = {
  version: "0.1.0",
  name: "donation_program",
  instructions: [
    {
      name: "createDonation",
      accounts: [
        {
          name: "donation",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64"
        }
      ]
    }
  ],
  accounts: [
    {
      name: "Donation",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "timestamp",
            type: "i64"
          },
          {
            name: "donor",
            type: "publicKey"
          }
        ]
      }
    }
  ]
}

