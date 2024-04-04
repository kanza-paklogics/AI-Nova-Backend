import nodemailer from "nodemailer";
import config from "config";

const sendMail = async (to: string, subject: string, text: string) => {
  const emailBody: any = {
    to: to,
    subject: subject,
    text: text,
  };

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.get<string>("email"),
      pass: config.get<string>("password"),
    },
  });

  console.log("Email body ==>", emailBody);
  console.log("Transporter ==>", transporter);

  let info = await transporter.sendMail(emailBody);
  return {
    status: info.messageId,
  };
};

export default sendMail;
