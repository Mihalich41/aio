import json
import requests

TELEGRAM_TOKEN = "7759937694:AAHcFBqGqoYpnX7V8JWJ0lAWU7m5L1pxmgg"
CHAT_ID = "626560044"  # Ваш chat_id

def send_telegram_message(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        'chat_id': CHAT_ID,
        'text': message,
        'parse_mode': 'HTML'
    }
    response = requests.post(url, data=payload)
    return response.json()

def handler(event, context):
    print("Received event: ", event)  # Логирование для отладки

    # Разбираем метод запроса
    method = event.get('httpMethod', '')
    print(f"Request method: {method}")  # Логирование метода запроса

    # Если запрос с методом OPTIONS, возвращаем статус 200 (для CORS)
    if method == 'OPTIONS':
        response = {
            "statusCode": 200,
            "headers": {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            "body": json.dumps({})
        }
        return response

    # Обрабатываем POST запросы (основная логика)
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            username = body.get('username', 'Не указано')
            message = body.get('message', 'Нет сообщения')
            steps = body.get('steps', [])
            section = body.get('section', 'Не указано')
            course = body.get('course', '')

            # Формируем текст сообщения с HTML форматированием
            telegram_message = f"<b>Новое сообщение</b>\n\n"
            telegram_message += f"От: {username}\n"
            telegram_message += f"Раздел: <b>{section}</b>\n"
            if course:
                telegram_message += f"Курс: <b>{course}</b>\n"
            telegram_message += f"\nСообщение:\n<i>{message}</i>\n"
            
            if steps:
                telegram_message += "\n<b>Путь пользователя:</b>\n"
                for i, step in enumerate(steps, 1):
                    telegram_message += f"{i}. {step}\n"

            # Отправляем сообщение в Telegram
            print("Sending message to Telegram: ", telegram_message)
            send_telegram_message(telegram_message)

            response = {
                "statusCode": 200,
                "headers": {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                "body": json.dumps({"message": "Сообщение отправлено успешно"})
            }
            return response

        except Exception as e:
            print(f"Error occurred: {str(e)}")
            response = {
                "statusCode": 500,
                "headers": {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                "body": json.dumps({"message": f"Ошибка: {str(e)}"})
            }
            return response
