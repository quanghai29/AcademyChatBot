const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const request = require('request');
const chatbotService =  require('./services/chatbot.service');
require('express-async-errors');
require('dotenv').config();
const { type } = require('./helper/type.chatbot.helper'); 

const bot = express();

bot.use(cors());
bot.use(express.json());

bot.use(morgan('dev'));

// Adds support for GET requests to our webhook
bot.get('/', (req, res) => {

  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
bot.post('/', (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      console.log('Sender PSID: ' + senderPsid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {

    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Handles messages events
async function handleMessage(senderPsid, receivedMessage) {
  let response;

  // Checks if the message contains text
  if (receivedMessage.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of your request to the Send API
    const msg = receivedMessage.text.trim();
    switch (msg) {
      case 'start':
        response = chatbotService.startBot();
        break;
      default:
        response = await chatbotService.searchCourse(msg);
        break;
    }
  } else if (receivedMessage.attachments) {

    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': [{
            'title': 'Is this the right picture?',
            'subtitle': 'Tap a button to answer.',
            'image_url': attachmentUrl,
            'buttons': [
              {
                'type': 'postback',
                'title': 'Yes!',
                'payload': 'yes',
              },
              {
                'type': 'postback',
                'title': 'No!',
                'payload': 'no',
              }
            ],
          }]
        }
      }
    };
  }

  // Send the response message
  callSendAPI(senderPsid, response);
}

// Handles messaging_postbacks events
async function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;
  data = JSON.parse(payload);

  // Set the response based on the postback payload
  switch (data.type) {
    case type.categories:
      response = await chatbotService.getAllCategory();
      break;
    case type.search:
      response = chatbotService.guideSearch();
      break;
    case type.course_by_category:
        response = await chatbotService.getCourseByCategory(data.msg);
        break;
    case type.course_detail:
        response = await chatbotService.getCourseDetail(data.msg);
        break;
    default:
      break;
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response);
}

// Sends response messages via the Send API
function callSendAPI(senderPsid, response) {

  // The page access token we have generated in your app settings
  //const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  const PAGE_ACCESS_TOKEN = "EAAHJzrPX4rcBAF8Hj8ZAb3ScWcBCfkblbEhF5ECdUIz5cJDUFf8qWUqWO41jvG5tP2ZByyK0R4vYkjUHNJ2kXpXYtpMnNu62gZBwseLX6Jox4vbb752KZABouXbPl16bOH7VCVLLCgZBjFHogUt6BPI4ywlh2JFmzVI488RLcUDw32PMGoxdQ"
  // Construct the message body
  let requestBody = {
    'recipient': {
      'id': senderPsid
    },
    'message': response
  };

  // Send the HTTP request to the Messenger Platform
  request({
    'uri': 'https://graph.facebook.com/v2.6/me/messages',
    'qs': { 'access_token': PAGE_ACCESS_TOKEN },
    'method': 'POST',
    'json': requestBody
  }, (err, _res, _body) => {
    if (!err) {
      console.log('Message sent!');
    } else {
      console.error('Unable to send message:' + err);
    }
  });
}

// middleware error
require('./middlewares/error.mdw')(bot);

const  PORT  = process.env.PORT;
bot.listen(PORT, () => {
  console.log(`Bot is runing at ${process.env.HOST_NAME}:${PORT}`);
});


