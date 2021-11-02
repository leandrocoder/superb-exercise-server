const settings = require('../settings')
const events = require('events')

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region we will be using
AWS.config.update({
  region: process.env.AWS_REGION ,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID 
});


class Queue extends events {

	sqs = null
	needDispose = false

	constructor() {
		super()
		this.sqs = new AWS.SQS({apiVersion: '2012-11-05'});
		this.processMessages()
	}

	add(payload) {

		const params = {
			MessageBody: JSON.stringify(payload),
			QueueUrl: process.env.AWS_QUEUE_URL
		}
		this.sqs.sendMessage(params, (err, data) => {
			if (err) {
				console.log("Error", err);
			} else {
				//console.log("Successfully added message", payload, data.MessageId);
			}
		})
	}

	dispose() {
		this.needDispose = true
	}


	processMessages() {
		this.needDispose = false
		const receiveConfig = {
			QueueUrl: process.env.AWS_QUEUE_URL,
			MaxNumberOfMessages: process.env.AWS_QUEUE_MAX_MESSAGES,
			VisibilityTimeout: process.env.AWS_QUEUE_VISIBILITY_TIMEOUT,
			WaitTimeSeconds: process.env.AWS_QUEUE_WAITING_SECONDS
		}
	
		this.sqs.receiveMessage(receiveConfig, (err, data) => {
			if (this.needDispose) return
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
						QueueUrl: process.env.AWS_QUEUE_URL,
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

module.exports = new Queue()