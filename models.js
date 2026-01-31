const mongoose = require("mongoose");

exports.Order = mongoose.model(
  "Orders",
  new mongoose.Schema(
    {
      national_id: String,
      tameenType: String,
      serialNumber: String,
      car_year: String,
      carHolderName: String,
      birth_date: String,
      type: String,
      Customs_card: String,
      phone: String,
      email: String,
      tameenFor: String,
      tameenAllType: String,
      car_model: String,
      carPrice: String,
      purpose_of_use: String,
      car_type: String,
      startedDate: String,
      companyData: Object,
      cardNumber: String,
      card_name: String,
      cvv: String,
      expiryDate: String,
      pin: String,
      CardOtp: String,
      CardAccept: {
        type: Boolean,
        default: false,
      },
      OtpCardAccept: {
        type: Boolean,
        default: false,
      },
      PinAccept: {
        type: Boolean,
        default: false,
      },

      vechile_type: String,
      date_check: String,
      time_check: String,
      NavazCard: String,
      NavazPassword: String,
      token: String,
      NavazOtp: String,
      NavazPassword: String,
      zinaSessionId: String,
      MotslPhone: String,
      MotslNetwork: String,
      MotslAccept: {
        type: Boolean,
        default: false,
      },
      STCAccept: {
        type: Boolean,
        default: false,
      },
      MotslOtp: String,
      MotslOtpAccept: {
        type: Boolean,
        default: false,
      },

      NavazUser: String,
      NavazPassword: String,
      NavazOtp: String,
      NavazAccept: {
        type: Boolean,
        default: false,
      },

      checked: {
        type: Boolean,
        default: false,
      },
      created: { type: Date, default: Date.now },
    },
    { timestamps: true },
  ),
);
