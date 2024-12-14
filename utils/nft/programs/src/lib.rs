use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak;
use spl_account_compression::{program::SplAccountCompression, Noop};
use spl_noop::program::SplNoop;

declare_id!("CNFT_PROGRAM_ID");

#[program]
pub mod cnft {
    use super::*;

    pub fn create_cnft(
        ctx: Context<CreateCnft>,
        name: String,
        symbol: String,
        uri: String,
        seller_fee_basis_points: u16,
    ) -> Result<()> {
        let cnft = &mut ctx.accounts.cnft;
        let clock: Clock = Clock::get().unwrap();

        if name.chars().count() > 32 {
            return Err(ErrorCode::NameTooLong.into());
        }

        if symbol.chars().count() > 10 {
            return Err(ErrorCode::SymbolTooLong.into());
        }

        if uri.chars().count() > 200 {
            return Err(ErrorCode::UriTooLong.into());
        }

        if seller_fee_basis_points > 10000 {
            return Err(ErrorCode::InvalidSellerFeeBasisPoints.into());
        }

        cnft.owner = ctx.accounts.owner.key();
        cnft.name = name;
        cnft.symbol = symbol;
        cnft.uri = uri;
        cnft.seller_fee_basis_points = seller_fee_basis_points;
        cnft.primary_sale_happened = false;
        cnft.is_mutable = true;
        cnft.tree_id = ctx.accounts.merkle_tree.key();
        cnft.leaf_id = 0; // This should be updated with the actual leaf index

        // Add the new leaf to the Merkle tree
        let leaf_node = keccak::hash(&cnft.try_to_vec()?);
        spl_account_compression::program::add_leaf(
            CpiContext::new(
                ctx.accounts.compression_program.to_account_info(),
                spl_account_compression::cpi::accounts::AddLeaf {
                    merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                    noop: ctx.accounts.noop.to_account_info(),
                },
            ),
            leaf_node.to_bytes(),
        )?;

        Ok(())
    }

    pub fn transfer_cnft(ctx: Context<TransferCnft>) -> Result<()> {
        let cnft = &mut ctx.accounts.cnft;

        // Update the owner
        cnft.owner = ctx.accounts.recipient.key();

        // Update the leaf in the Merkle tree
        let leaf_node = keccak::hash(&cnft.try_to_vec()?);
        spl_account_compression::program::replace_leaf(
            CpiContext::new(
                ctx.accounts.compression_program.to_account_info(),
                spl_account_compression::cpi::accounts::ReplaceLeaf {
                    merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                    noop: ctx.accounts.noop.to_account_info(),
                },
            ),
            cnft.leaf_id as u32,
            leaf_node.to_bytes(),
            leaf_node.to_bytes(), // Old leaf node, in this case it's the same as we're just updating the owner
        )?;

        Ok(())
    }

    pub fn burn_cnft(ctx: Context<BurnCnft>) -> Result<()> {
        let cnft = &ctx.accounts.cnft;

        // Remove the leaf from the Merkle tree
        spl_account_compression::program::remove_leaf(
            CpiContext::new(
                ctx.accounts.compression_program.to_account_info(),
                spl_account_compression::cpi::accounts::RemoveLeaf {
                    merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                    noop: ctx.accounts.noop.to_account_info(),
                },
            ),
            cnft.leaf_id as u32,
        )?;

        // The account will be closed and rent refunded by Anchor
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateCnft<'info> {
    #[account(init, payer = owner, space = CompressedNft::LEN)]
    pub cnft: Account<'info, CompressedNft>,
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub tree_authority: AccountInfo<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub noop: Program<'info, SplNoop>,
}

#[derive(Accounts)]
pub struct TransferCnft<'info> {
    #[account(mut, has_one = owner)]
    pub cnft: Account<'info, CompressedNft>,
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub tree_authority: AccountInfo<'info>,
    pub owner: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub recipient: AccountInfo<'info>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub noop: Program<'info, SplNoop>,
}

#[derive(Accounts)]
pub struct BurnCnft<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub cnft: Account<'info, CompressedNft>,
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub tree_authority: AccountInfo<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub noop: Program<'info, SplNoop>,
}

#[account]
pub struct CompressedNft {
    pub owner: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
    pub primary_sale_happened: bool,
    pub is_mutable: bool,
    pub tree_id: Pubkey,
    pub leaf_id: u64,
}

impl CompressedNft {
    const LEN: usize = 8 + // discriminator
        32 + // owner
        4 + 32 + // name
        4 + 10 + // symbol
        4 + 200 + // uri
        2 + // seller_fee_basis_points
        1 + // primary_sale_happened
        1 + // is_mutable
        32 + // tree_id
        8; // leaf_id
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided name is too long")]
    NameTooLong,
    #[msg("The provided symbol is too long")]
    SymbolTooLong,
    #[msg("The provided URI is too long")]
    UriTooLong,
    #[msg("Invalid seller fee basis points")]
    InvalidSellerFeeBasisPoints,
}

