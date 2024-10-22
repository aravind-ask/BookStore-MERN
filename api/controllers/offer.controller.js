import Offer from "../models/offer.model.js";

export const createOffer = async (req, res, next) => {
  try {
    const {
      title,
      type,
      discountPercentage,
      applicableProducts,
      applicableCategory,
      referralCode,
      expiryDate,
    } = req.body;

    const offer = new Offer({
      title,
      type,
      discountPercentage,
      applicableProducts: type === "product" ? applicableProducts : [],
      applicableCategory: type === "category" ? applicableCategory : null,
      referralCode: type === "referral" ? referralCode : null,
      expiryDate,
    });

    await offer.save();
    res.status(201).json({ message: "Offer created successfully", offer });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getOffers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    let filter = {};

    // Apply filters if provided
    if (req.query.type) filter.type = req.query.type;
    if (req.query.isActive) filter.isActive = req.query.isActive === "true";
    if (req.query.expiryDate) {
      filter.expiryDate = { $gte: new Date(req.query.expiryDate) };
    }

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { referralCode: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const offers = await Offer.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "books",
          localField: "applicableProducts",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "applicableCategory",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $addFields: {
          applicableProducts: {
            $map: {
              input: "$books",
              as: "book",
              in: "$$book.name",
            },
          },
          applicableCategory: {
            $cond: {
              if: { $eq: ["$categories", []] },
              then: null,
              else: { $arrayElemAt: ["$categories.name", 0] },
            },
          },
        },
      },
      {
        $sort: { [sortField]: sortOrder },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const totalOffers = await Offer.countDocuments(filter);

    // Get stats
    const stats = await Offer.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgDiscount: { $avg: "$discountPercentage" },
          maxDiscount: { $max: "$discountPercentage" },
          activeOffers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      offers,
      currentPage: page,
      totalPages: Math.ceil(totalOffers / limit),
      totalOffers,
      stats: stats[0] || {},
    });
  } catch (error) {
    console.error("Error in getOffers:", error);
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const offerId = req.params.offerId;

    // Check if offerId is valid
    if (!offerId) {
      return res.status(400).json({ message: "Offer ID is required" });
    }

    const {
      title,
      type,
      discountPercentage,
      applicableProducts,
      applicableCategory,
      referralCode,
      expiryDate,
      isActive,
    } = req.body;

    const offer = await Offer.findById(offerId);

    // Check if the offer was found
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Update the offer fields
    if (title) offer.title = title;
    if (type) offer.type = type;
    if (discountPercentage) offer.discountPercentage = discountPercentage;
    if (applicableProducts)
      offer.applicableProducts = type === "product" ? applicableProducts : [];
    if (applicableCategory)
      offer.applicableCategory =
        type === "category" ? applicableCategory : null;
    if (referralCode)
      offer.referralCode = type === "referral" ? referralCode : null;
    if (expiryDate) offer.expiryDate = expiryDate;
    if (isActive !== undefined) offer.isActive = isActive;

    await offer.save();

    res.status(200).json({ message: "Offer updated successfully", offer });
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const offerId = req.params.offerId;

    // Check if offerId is valid
    if (!offerId) {
      return res.status(400).json({ message: "Offer ID is required" });
    }

    const deletedOffer = await Offer.findByIdAndDelete(offerId);

    // Check if the offer was found and deleted
    if (!deletedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json("Offer Deleted Successfully");
  } catch (error) {
    next(error);
  }
};
