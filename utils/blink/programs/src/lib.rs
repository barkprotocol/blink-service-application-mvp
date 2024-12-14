use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};

declare_id!("BLINK_PROGRAM_ID");

#[program]
pub mod blink {
    use super::*;

    pub fn create_blink(
        ctx: Context<CreateBlink>,
        name: String,
        description: String,
        blink_type: String,
        is_nft: bool,
        is_donation: bool,
        is_gift: bool,
        is_payment: bool,
        is_poll: bool,
    ) -> Result<()> {
        let blink = &mut ctx.accounts.blink;
        let clock: Clock = Clock::get().unwrap();

        if name.chars().count() > 50 {
            return Err(ErrorCode::NameTooLong.into());
        }

        if description.chars().count() > 200 {
            return Err(ErrorCode::DescriptionTooLong.into());
        }

        blink.owner = ctx.accounts.owner.key();
        blink.mint = ctx.accounts.mint.key();
        blink.name = name;
        blink.description = description;
        blink.blink_type = blink_type;
        blink.is_nft = is_nft;
        blink.is_donation = is_donation;
        blink.is_gift = is_gift;
        blink.is_payment = is_payment;
        blink.is_poll = is_poll;
        blink.created_at = clock.unix_timestamp;
        blink.updated_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn update_blink(
        ctx: Context<UpdateBlink>,
        name: String,
        description: String,
        blink_type: String,
    ) -> Result<()> {
        let blink = &mut ctx.accounts.blink;
        let clock: Clock = Clock::get().unwrap();

        if name.chars().count() > 50 {
            return Err(ErrorCode::NameTooLong.into());
        }

        if description.chars().count() > 200 {
            return Err(ErrorCode::DescriptionTooLong.into());
        }

        blink.name = name;
        blink.description = description;
        blink.blink_type = blink_type;
        blink.updated_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn delete_blink(_ctx: Context<DeleteBlink>) -> Result<()> {
        // The account will be closed and rent refunded by Anchor
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBlink<'info> {
    #[account(init, payer = owner, space = Blink::LEN)]
    pub blink: Account<'info, Blink>,
    pub mint: Account<'info, token::Mint>,
    use anchor_lang::prelude::*;
    use anchor_spl::token::{self, Token};
    
    declare_id!("BLINK_PROGRAM_ID");
    
    #[program]
    pub mod blink {
        use super::*;
    
        pub fn create_blink(
            ctx: Context<CreateBlink>,
            name: String,
            description: String,
            blink_type: String,
            is_nft: bool,
            is_donation: bool,
            is_gift: bool,
            is_payment: bool,
            is_poll: bool,
        ) -> Result<()> {
            let blink = &mut ctx.accounts.blink;
            let clock: Clock = Clock::get().unwrap();
    
            if name.chars().count() > 50 {
                return Err(ErrorCode::NameTooLong.into());
            }
    
            if description.chars().count() > 200 {
                return Err(ErrorCode::DescriptionTooLong.into());
            }
    
            if !["standard", "premium", "limited"].contains(&blink_type.as_str()) {
                return Err(ErrorCode::InvalidBlinkType.into());
            }
    
            blink.owner = ctx.accounts.owner.key();
            blink.mint = ctx.accounts.mint.key();
            blink.name = name;
            blink.description = description;
            blink.blink_type = blink_type;
            blink.is_nft = is_nft;
            blink.is_donation = is_donation;
            blink.is_gift = is_gift;
            blink.is_payment = is_payment;
            blink.is_poll = is_poll;
            blink.created_at = clock.unix_timestamp;
            blink.updated_at = clock.unix_timestamp;
    
            Ok(())
        }
    
        pub fn update_blink(
            ctx: Context<UpdateBlink>,
            name: Option<String>,
            description: Option<String>,
            blink_type: Option<String>,
        ) -> Result<()> {
            let blink = &mut ctx.accounts.blink;
            let clock: Clock = Clock::get().unwrap();
    
            if let Some(new_name) = name {
                if new_name.chars().count() > 50 {
                    return Err(ErrorCode::NameTooLong.into());
                }
                blink.name = new_name;
            }
    
            if let Some(new_description) = description {
                if new_description.chars().count() > 200 {
                    return Err(ErrorCode::DescriptionTooLong.into());
                }
                blink.description = new_description;
            }
    
            if let Some(new_blink_type) = blink_type {
                if !["standard", "premium", "limited"].contains(&new_blink_type.as_str()) {
                    return Err(ErrorCode::InvalidBlinkType.into());
                }
                blink.blink_type = new_blink_type;
            }
    
            blink.updated_at = clock.unix_timestamp;
    
            Ok(())
        }
    
        pub fn delete_blink(_ctx: Context<DeleteBlink>) -> Result<()> {
            // The account will be closed and rent refunded by Anchor
            Ok(())
        }
    }
    
    #[derive(Accounts)]
    pub struct CreateBlink<'info> {
        #[account(init, payer = owner, space = Blink::LEN)]
        pub blink: Account<'info, Blink>,
        pub mint: Account<'info, token::Mint>,
        #[account(mut)]
        pub owner: Signer<'info>,
        pub system_program: Program<'info, System>,
        pub token_program: Program<'info, Token>,
        pub rent: Sysvar<'info, Rent>,
    }
    
    #[derive(Accounts)]
    pub struct UpdateBlink<'info> {
        #[account(mut, has_one = owner)]
        pub blink: Account<'info, Blink>,
        pub owner: Signer<'info>,
    }
    
    #[derive(Accounts)]
    pub struct DeleteBlink<'info> {
        #[account(mut, has_one = owner, close = owner)]
        pub blink: Account<'info, Blink>,
        #[account(mut)]
        pub owner: Signer<'info>,
    }
    
    #[account]
    pub struct Blink {
        pub owner: Pubkey,
        pub mint: Pubkey,
        pub name: String,
        pub description: String,
        pub blink_type: String,
        pub is_nft: bool,
        pub is_donation: bool,
        pub is_gift: bool,
        pub is_payment: bool,
        pub is_poll: bool,
        pub created_at: i64,
        pub updated_at: i64,
    }
    
    impl Blink {
        const LEN: usize = 8 + // discriminator
            32 + // owner
            32 + // mint
            4 + 50 + // name
            4 + 200 + // description
            4 + 20 + // blink_type
            1 + // is_nft
            1 + // is_donation
            1 + // is_gift
            1 + // is_payment
            1 + // is_poll
            8 + // created_at
            8; // updated_at
    }
    
    #[error_code]
    pub enum ErrorCode {
        #[msg("The provided name is too long")]
        NameTooLong,
        #[msg("The provided description is too long")]
        DescriptionTooLong,
        #[msg("Invalid blink type")]
        InvalidBlinkType,
    }
    
    