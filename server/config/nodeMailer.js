"use strict";
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Log pour débogage
console.log("NodeMailer: Loading environment variables");
console.log(`NodeMailer: GMAIL_USER from env: ${process.env.GMAIL_USER}`);

// Fonction principale pour envoyer un email
async function main(to, subject, content) {
  console.log(`NodeMailer: Preparing to send email to ${to}`);
  
  try {
    // Utiliser SendGrid pour envoyer l'email
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'SG.votre_cle_api_sendgrid');
    
    const msg = {
      to: to,
      from: process.env.GMAIL_USER, // Utilisez une adresse vérifiée dans SendGrid
      subject: subject,
      html: content,
    };
    
    console.log(`NodeMailer: Sending email from ${process.env.GMAIL_USER} to ${to} using SendGrid`);
    
    // Envoyer l'email avec SendGrid
    return sgMail.send(msg);
  } catch (error) {
    console.error("NodeMailer Critical Error:", error);
    
    // Fallback to Nodemailer if SendGrid fails
    console.log("Falling back to Nodemailer...");
    
    try {
      // Utiliser les informations d'identification depuis les variables d'environnement
      const gmailUser = process.env.GMAIL_USER;
      const gmailKey = process.env.GMAIL_KEY;
      
      console.log(`NodeMailer Fallback: Using GMAIL_USER: ${gmailUser}`);
      
      // Créer un objet transporteur réutilisable en utilisant le transport SMTP par défaut
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true pour le port 465, false pour les autres ports
        auth: {
          user: gmailUser,
          pass: gmailKey,
        },
        tls: {
          rejectUnauthorized: false // Accepter les certificats auto-signés
        }
      });

      const message = {
        from: `"Taskify App" <${gmailUser}>`, // adresse de l'expéditeur
        to: to, // liste des destinataires
        subject: subject, // Ligne d'objet
        html: content, // Utiliser le paramètre de contenu directement
      };
      
      console.log(`NodeMailer Fallback: Sending email from ${gmailUser} to ${to}`);
      
      // Envoyer un email avec l'objet transporteur défini
      return new Promise((resolve, reject) => {
        transporter.sendMail(message, (err, info) => {
          if (err) {
            console.error("NodeMailer Fallback Error:", err);
            reject(err);
          } else {
            console.log("NodeMailer Fallback Success:", info.response);
            resolve(info);
          }
        });
      });
    } catch (fallbackError) {
      console.error("NodeMailer Fallback Critical Error:", fallbackError);
      throw fallbackError;
    }
  }
}

const nodeMailer = async (to, subject, content) => {
  try {
    await main(to, subject, content);
    console.log(`Email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error("NodeMailer Function Error:", error);
    return false;
  }
};

module.exports = {
  nodeMailer,
};
          console.error("NodeMailer Error:", err);
          reject(err);
        } else {
          console.log("NodeMailer Success:", info.response);
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.error("NodeMailer Critical Error:", error);
    throw error;
  }
}

const nodeMailer = async (to, subject, content) => {
  try {
    await main(to, subject, content);
    console.log(`Email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error("NodeMailer Function Error:", error);
    return false;
  }
};

module.exports = {
  nodeMailer,
};
