process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
 const nodemailer = require("nodemailer");

const sendEmail = async (options) =>{

    let transporter = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        auth:{
            user:process.env.SMTP_EMAIL,
            pass:process.env.SMTP_PASSWORD
        }
    })

    let message = {
        from: `${process.env.SMTP_EMAIL} <${process.env.SMTP_EMAIL}>`, 
        to:options.email, 
        subject:options.subject,
        text:options.message
      };
    
      const info = await transporter.sendMail(message)
      console.log('Message sent %s', info)
}

module.exports = sendEmail;