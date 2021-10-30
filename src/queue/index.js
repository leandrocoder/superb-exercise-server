const settings = require('../settings')
const events = require('events')

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region we will be using
AWS.config.update({
  region: settings.env.AWS_REGION ,
  secretAccessKey: settings.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: settings.env.AWS_ACCESS_KEY_ID 
});


class Queue extends events {

	sqs = null

	constructor() {
		super()
		this.sqs = new AWS.SQS({apiVersion: '2012-11-05'});
		this.processMessages()
	}

	add(payload) {
		const params = {
			MessageBody: JSON.stringify(payload),
			QueueUrl: settings.env.AWS_QUEUE_URL
		}
		this.sqs.sendMessage(params, (err, data) => {
			if (err) {
				console.log("Error", err);
			} else {
				//console.log("Successfully added message", data.MessageId);
			}
		})
	}


	processMessages() {
	
		const receiveConfig = {
			QueueUrl: settings.env.AWS_QUEUE_URL,
			MaxNumberOfMessages: settings.env.AWS_QUEUE_MAX_MESSAGES,
			VisibilityTimeout: settings.env.AWS_QUEUE_VISIBILITY_TIMEOUT,
			WaitTimeSeconds: settings.env.AWS_QUEUE_WAITING_SECONDS
		}
	
		this.sqs.receiveMessage(receiveConfig, (err, data) => {
			this.processMessages()
			if (err) {
				console.log(err, err.stack);
			} else {
				if (!data.Messages) return

				for (let i = 0; i < data.Messages.length; i++) {

					let json = null
					let raw = data.Messages[i].Body
					try { json = JSON.parse(raw) } catch {}
					
					const deleteConfig = {
						QueueUrl: settings.env.AWS_QUEUE_URL,
						ReceiptHandle: data.Messages[i].ReceiptHandle
					}
					
					this.sqs.deleteMessage(deleteConfig, (err, data) => {
						if (err) {
							console.log(err, err.stack);
						} else {
							//console.log('Successfully deleted message from queue');
						}
					})

					this.emit('message', raw)
					if (json != null) this.emit('json', json)
				}
			}
		})
	}
}

module.exports = Queue