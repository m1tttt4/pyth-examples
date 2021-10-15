// makes an option (generator)
// todo: determine who makes the initialize call
// initialization call against rust will create if missing
// always returns: "OK" meaning the option exists 
// should also return account info of the option
// binary_option.serialize(&mut *binary_option_account_info.data.borrow_mut())?;
BinaryOptionInstruction::InitializeBinaryOption(args) => {
    msg!("Instruction: InitializeBinaryOption");
    process_initialize_binary_option(program_id, accounts, args.decimals, args.expiry, args.strike, args.underlying_asset_address)
}


// trade (long or short an initialized option)
// web client will need to call initialize before trade
// argruments:
// accounts = binary_option_account_info returned by initialize
// program_id = program_id of on-chain app
// TODO: consider error handling of account balances
BinaryOptionInstruction::Trade(args) => {
    msg!("Instruction: Trade");
    process_trade(
        program_id,
        accounts,
        args.size, //quantity of options being traded
        args.buy_price,
        args.sell_price,
    )
}

// rust-only
BinaryOptionInstruction::Settle => {
    msg!("Instruction: Settle");
    process_settle(program_id, accounts)
    if buy_price + sell_price != u64::pow(10, binary_option.decimals as u32) {
            return Err(BinaryOptionError::TradePricesIncorrect.into());
        }
    if binary_option.settled {
        return Err(BinaryOptionError::AlreadySettled.into());
    } 
}

// rust-only
// On-login, check existing trades if they are expired
// if expired, reflect in UI.
// initialize call will return if the expiry is in the past
// #[error("ExpiryInThePast")]
//    ExpiryInThePast,
// TODO: process return values (balances?)
BinaryOptionInstruction::Collect => {



