import Wallet from "../models/wallet.model.js";
import { errorHandler } from "../utils/error.js";

export const getWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("useer", userId);

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0 });
      await wallet.save();
    }

    res.json({
      balance: wallet.balance,
      transactions: wallet.transactions.slice(0, 10), // Return only the last 10 transactions
    });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Error fetching wallet data"));
  }
};
