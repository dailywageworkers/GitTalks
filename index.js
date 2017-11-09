'use strict'
var NodeSession = require('node-session');
var http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var needle = require('needle');
const app = express()
const superagent = require('superagent');
const CLIENT_ACCESS_TOKEN = "f5db0bbe9c0d4c02928bf261e2fe431c"
const apiaiApp = require('apiai')(CLIENT_ACCESS_TOKEN);
var user = ""
var http = require('http')
const token = "EAAByjr8pz8MBAKvkSsCh4VsewZAT5q37xdXzHveh3ApdCuYui3xpqIfznKmY9RqJeK2cqU8uXqmP4JGbTXTGqSkMHEvb9hdykFGi2jCWjXnq4fxftp2fW8y0QD5FeYUYDZATDqeEaXZAbZAuB6y7XxMwg8f7QojIbdYi5UB48wZDZD"
const builder = require('botbuilder');
const quick = require('botbuilder-facebook-quick-replies');
// var session = require('express-session');
var session = new NodeSession({secret : "288ed46ac547e46a1e92024e52ab6db1"})
var queryAboutContext = ""
var listOrCount = ""

module.exports.TOKEN_GITHUB_DOT_COM = "d8908df607caae5d5c10ac96151235c828eebd8b"
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})
// for Facebook verification
app.get('/webhook/', function (req, res) {
	sendTextMessage(1162839713765285, res.toString())
	if (req.query['hub.verify_token'] === '3649') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
	var jsonBody = req.body
	if(req.body.entry[0])
	{
		let messaging_events = req.body.entry[0].messaging
		for (let i = 0; i < messaging_events.length; i++) {
			let event = req.body.entry[0].messaging[i]
			let sender = event.sender.id
			if (event.message && event.message.text) {
				let text = event.message.text
				sendApiAiMessage(sender, text.substring(0,200))
			}
		}
	}
	else 
	{
		var msg
		if(jsonBody.issue != undefined)
		{
			msg = ""+jsonBody.issue.title + " is created on "+jsonBody.issue.created_at +"\n and updated on "+ jsonBody.issue.updated_at+"\nfor user "+jsonBody.issue.user.login
					+".\n\nOpen the issue using with "+jsonBody.issue.html_url
		}
		else if (jsonBody.pusher)
		{
			msg = "A push is performedd by "+jsonBody.pusher.name+"\non repository "+jsonBody.repository.name
					+"\nat "+(new Date(jsonBody.repository.pushed_at).toString("dd MMM yyyy"))+"\n with commit id "+jsonBody.commits[0].id	
					+"\nwith a commit message "+jsonBody.commits[0].message
					+"\n\nFurther information can be viewed on "+jsonBody.repository.html_url
		}
		else if(jsonBody.forkee)
		{
			msg = "A fork is made to "+jsonBody.forkee.name +" repository in "
					+jsonBody.organization.login+"\n On "+jsonBody.forkee.created_at+"\n By "+jsonBody.forkee.owner.login
					+"\n\nFurther information can be found at \n"+jsonBody.repository.html_url
		}
		else if(jsonBody.ref_type == "branch" && jsonBody.ref)
		{
			msg = "A new branch is created for repository "+jsonBody.repository.name+"\nIn organization "+jsonBody.organization.login
					+"\nBy user "+jsonBody.sender.login+ "\nOn "+(new Date().toString())+"\n\n Further information can be found at \n"
					+jsonBody.repository.html_url
		}
		else if(jsonBody.repository)
		{
			msg = "A repository named "+jsonBody.repository.full_name 
					+" is "+ jsonBody.action+" in "+jsonBody.organization.login+" profile"
					+" on "+jsonBody.repository.created_at
					+".\n\n Further information can be found in "+jsonBody.repository.owner.html_url
		}
		sendTextMessage(1162839713765285, msg)
	}
	
	res.sendStatus(200)
})
function sendApiAiMessage(sender, text)
{
	let messageData = { text:text }
	let apiai = apiaiApp.textRequest(text, {
		sessionId: 'checking_username_replies' 
	});
	apiai.on('response', (response) => {
		// Got a response from api.ai. Let's POST to Facebook Messenger

		let aiText = response.result.fulfillment.speech;
		let str = "nothing";
		aiText = aiText?aiText:str
		if(aiText == "hey!! What is your query about?")
		{
			var messageJson = {
				text: aiText,
				"quick_replies" :[
					{
					"content_type":"text",
					"title":"Forks",
					"payload": "later"
					},
					{
					"content_type":"text",
					"title":"Pushes",
					"payload": "later"
					},
					{
						"content_type":"text",
						"title":"Branches",
						"payload": "later"
					},
					{
						"content_type":"text",
						"title":"Commits",
						"payload": "later"
					},
					
					{
						"content_type":"text",
						"title":"PRs",
						"payload": "later"
					},
					{
						"content_type":"text",
						"title":"Issues",
						"payload": "later"
					},
					{
						"content_type":"text",
						"title":"Repos",
						"payload": "later"
					},
					{
						"content_type":"text",
						"title":"Followers",
						"payload": "later"
					},
					{
						"content_type":"text",
						"title":"Following",
						"payload": "later"
					},
				]
			}
			request({
				url: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {access_token:token},
				method: 'POST',
				json: {
					recipient: {id: sender},
					message: messageJson
				}
				
			}, function(error, response, body) {
				if (error) {
					throw error;
					console.log('Error sending messages: ', error)
				} else if (response.body.error) {
					console.log('Error: ', response.body.error)
				}
			})
		}
		else if (aiText == "Forks" 
				|| aiText == "Pushes" 
				|| aiText == "Issues" 
				|| aiText == "Repos" 
				|| aiText == "Following" 
				|| aiText == "Followers" 
				|| aiText == "Branches"
				|| aiText == "PRs" )
		{
			queryAboutContext = aiText
			var messageJson = {
				text: aiText,
				"quick_replies" :[
					{
					"content_type":"text",
					"title":"Count",
					"payload": "later"
					},
					{
					"content_type":"text",
					"title":"List",
					"payload": "later"
					}
				]
			}
			request({
				url: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {access_token:token},
				method: 'POST',
				json: {
					recipient: {id: sender},
					message: messageJson
				}
				
			}, function(error, response, body) {
				if (error) {
					throw error;
					console.log('Error sending messages: ', error)
				} else if (response.body.error) {
					console.log('Error: ', response.body.error)
				}
			})
		}
		else if(aiText == "Count" || aiText == "List")
		{
			listOrCount = aiText
			var queryObject = {
				"queryAboutContext" : queryAboutContext,
				"listOrCount" : listOrCount
			}
			if(queryAboutContext == "Followers")
			{
                messageJson = getFollowersList(messageJson, sender);
			}
		}
		else {
			messageJson = {text: aiText}
			request({
				url: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {access_token:token},
				method: 'POST',
				json: {
					recipient: {id: sender},
					message: messageJson
				}
				
			}, function(error, response, body) {
				if (error) {
					throw error;
					console.log('Error sending messages: ', error)
				} else if (response.body.error) {
					console.log('Error: ', response.body.error)
				}
			})
		}
	});
	
	apiai.on('error', (error) => {
	console.log(error);
	});

	apiai.end();
}
function sendTextMessage(sender, text) {
	let messageData = { text:text }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id: sender},
			message: {text: text},
		}
	}, function(error, response, body) {
		if (error) {
			throw error;
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}
function getFollowersList(messageJson, sender) {
	needle.get ('https://api.github.com/users/mahikanthnag/followers', function(error, response) 
	{
		if(!error) 
		{
			messageJson = 
			{
				attachment: {
					type: "template",
					payload: 
					{
						template_type: "button",
						text: "Link to profile",
						buttons: []
					}
				}
			};
			console.log(response.body);
			var i = 0;
			for(var index of response.body) {
				var button = {};
				button.type = "web_url",
				button.url = index.html_url,
				button.title = index.login;
				messageJson.attachment.payload.buttons[0] = button;
				request({
				url: 'https://graph.facebook.com/v2.6/me/messages',
				qs: { access_token: token },
				method: 'POST',
				json: 
				{
					recipient: { id: sender },
					message: messageJson
				}
				}, function(error, response, body) 
				{
					if(error) 
					{
						throw error;
						console.log('Error sending messages: ', error);
					}
					else if(response.body.error) 
					{
						console.log('Error: ', response.body.error);
					}
				});
			}
		}
	});
    return messageJson;
}
