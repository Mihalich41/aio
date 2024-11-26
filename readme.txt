 curl.exe --insecure --request POST --url "https://api.telegram.org/bot7759937694:AAHRnJbZey6k5SZiFv4wED6RG0Wjip9vSN0/setWebhook?url=https://functions.yandexcloud.net/d4et2kn19s9dv8dencn4"

ДЛЯ ЯНДЕКС ФкНКЦИИ поставь handler point index.point


#Echo telegram-bot for Yandex.Cloud CloudFunction

import requests
import json

# Telegram Bot Token
token = "7759937694:AAHcFBqGqoYpnX7V8JWJ0lAWU7m5L1pxmgg"


# handler
def point(event, context):
    body = json.loads(event['body'])
    chat_id = body['message']['from']['id']
    text = body['message']['text']
    send_message(chat_id, text)


#send message function
def send_message(chat_id, text):
    url = 'https://api.telegram.org/bot' + token + '/' + 'sendMessage'
    data = {'chat_id': chat_id, 'text': text} 
    r = requests.post(url, data=data)
