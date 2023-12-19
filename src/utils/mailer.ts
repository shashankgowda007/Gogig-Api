var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rahul.shah@gogig.in',
        pass: 'twji ddfa hjrc nthy'
    }
});

export async function sendMail(to: string, subject: string, content: string, html: string) {
    var mailOptions = {
        from: 'noreply-Support',
        to: to,
        subject: subject,
        text: content,
        html: html
    };
    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info);
            }
        });
    });
};