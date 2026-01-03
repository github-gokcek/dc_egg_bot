const admin = require('firebase-admin');

// Firebase Admin SDK için service account key gerekli
// Firebase Console > Project Settings > Service Accounts > Generate New Private Key
// İndirilen JSON dosyasını buraya kopyala

const serviceAccount = {
  
  "type": "service_account",
  "project_id": "egg-bot-dashboard",
  "private_key_id": "c8848fe1c36b01392f43d65db301a78b7438616d",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9cky7gDdNgNto\nuuoIBaVQ8Xev3vBrjr9PpCJDJTM3QGObQrs1jE3M7rxybHg4Zx173zsSOIrTYzDs\niujhnW12b4w3utkRsN7Kixzbw5gOdv+OyTSpqOl5VHaC5e+kX0kPNHxXQtugK37S\n1rIC7Stwiyoke7fJRQzN2/6HiWyGNvxcIr/VvQMMCdyyZM4qKHFi5xJPcgGQdpzM\nuQAsaa8O8lNWmZ4R68BXNeXQ1NbMyE7LyqPcWcOKv4iZ5O4ShBoBKvCIQAIHI/kY\n7WD338bBriAM8RnKmEHRVbVqJOBn+HK4XstY6nEgMngXHbJr8/3lziWQfNlCzfyY\nr8aWgdaVAgMBAAECggEAGbof+Yab/AZ3xW08wwIhRTDFlDiuZazpBiPAE2ZF4kb4\nP+l8CvWWyzHQnallWiOGuX/DQeIz2CksR7NFlP4QE3lqjVbui5x9ZPwnWyDg0XYP\nlpB0emXZ7wQtY/Fd7fCSt2HlUORfdwzxGCjX29XhhFMh0fqLJuYdqwcpNbbP6hnp\nKx9gngItMsUkX3pp+M2vOhu/N3uoyi4WVhTr2sY5esy3dqVFKsNk9WZvP844zUAM\naD1J7iLWZKHyKYEAmOeitrmUSpe77zQsbY7R61Ub83UDK6iWkb1gsHkuqb1zocMo\nJ3a4bYmCUk43JG87Lk/g+cBW/xq1zMzU8hPIvYH+MQKBgQD7mPNz2rCYeIPR3/+k\nwS7QPOaQAxjWdOwvD4V76e6P+dTpiW5RhFiojyfT0Vf5GBI9xCwjdxn+ywrGImzI\neYo+dZm+dQhakfBBnQzpeUgo4g9kbbOhO44BMpMToUsJ2hnMWxMcjfrgU0tOJTOq\nFchX3XwuLPiIvAwxw+3ifrnQ1wKBgQDAwvBeWYtYmatYWhTPkt2ODhmNmIw+2CZu\nFFHzaafBgykVe82mENZopKKW0s27qhoArvojj8w8pxMGew9iozWVLY7OxtHBuJ8w\nlpdrz9mQgr3z3X4RhDnuTT8lyPZyl8ylXl0PM8+y+jg8n3c3sgMrVfH87WuNLNKK\nUOHLqfBqcwKBgFVdQ9zfKmPRIAipk7d2xEdrIl9ibZ719NzSy1uLt6GqBo9mTcPi\nv6IRUFYSBWNCw42pbcBqvKsygOlQ7M/oTPt8Mznnw3nXYkkg3CyrNcyJRuewQO5H\noprNahGS/D7PfUlU7VsW4TQTjs1o2eqvkVYek++m2nyqMQkBjUj37lvpAoGABdvn\nAncmTSMemijiyQxlv5OeIzeny6E2SdJES2nCt5cNAKIqtgl8+uFGL99ocXPSJoMr\nBzmvs4hAg8npxc3AKzCfTpmsdn7uF8P8BkLjEglnTKpG0rF6MUwXx0Y8d281wTEF\nExk4DvCcFPuj3AWFIyQRnuZ4hmn+XEXpFw+rRxECgYEAzsApFI3nNaFkAqUfhoh9\n5h9iSOICK6vWQcSAD0PMnXmNuMAY1E7Hz+l/8YcNzZGZi7VX82AXwLIIMBb7qdpZ\njJrSelUaC4uo9unza5hNIOMzNoODF3PSsDMYI6Wtm32Y/Vn9/ktaCT2sdfUV7A8M\nl2rs++akoXL10sVlokGyyRk=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@egg-bot-dashboard.iam.gserviceaccount.com",
  "client_id": "118140316008908260567",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40egg-bot-dashboard.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"

};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };
