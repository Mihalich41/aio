import logging
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.filters import Command
from aiogram.utils.keyboard import InlineKeyboardBuilder

# Вставьте свой токен сюда
API_TOKEN = "7759937694:AAHRnJbZey6k5SZiFv4wED6RG0Wjip9vSN0"

# Устанавливаем логирование
logging.basicConfig(level=logging.INFO)

# Инициализация бота и диспетчера
bot = Bot(token=API_TOKEN)
dp = Dispatcher()

# Данные для панелей
data = [
    {
        'id': 'div0',
        'h1': 'Первая инвестиционная недвижимость',
        'h2': 'Игра которая меняет жизнь.',
        'p': ['Цель игры купить первую квартиру для сдачи в аренду.'],
        'h3': ['Готов ли ты к путешествию в финансовую независимость?'],
        'buttons': [
            {'text': 'ВСЕГДА ГОТОВ', 'callback_data': 'div3'},
            {'text': 'НЕ ХОЧУ', 'callback_data': 'div1'}
        ]
    },
    {
        'id': 'div1',
        'h1': 'Тебе не до этого сейчас?',
        'h2': 'Понимаю.',
        'p': ['Если что возвращяйся.'],
        'buttons': [
            {'text': 'Классный БОТ', 'callback_data': 'div2'}
        ]
    },
    {
        'id': 'div2',
        'h1': 'Бот написан Квазимиллиардером',
        'h2': 'Единолично. Mindmap. CSS. HTML> etc',
        'p': ['Могу сделать на заказ или обучить основам по конкретной задаче'],
        'buttons': [
            {'text': 'НАПИСАТЬ', 'callback_data': 'div3'}
        ]
    },
    # Здесь можно добавить другие панели, как в вашем коде...
]

# Функция для создания inline клавиатуры
def create_keyboard(buttons):
    keyboard = InlineKeyboardBuilder()
    for button in buttons:
        keyboard.add(InlineKeyboardButton(text=button['text'], callback_data=button['callback_data']))
    return keyboard.as_markup()

# Обработчик команды /start
@dp.message(Command('start'))
async def cmd_start(message: types.Message):
    # Отправляем сообщение, чтобы напомнить о старте игры
    await message.answer("Нажмите /start чтобы начать игру заново")

    # Далее начинаем игру
    panel = data[0]  # Начинаем с первого экрана (div0)

    # Строка, которая будет содержать все сообщения (h1, h2, p и h3)
    full_message = ""
    sent_message_ids = []

    # Отправляем h1 и h2
    full_message += panel['h1'] + "\n"
    sent_message = await message.answer(full_message)
    sent_message_ids.append(sent_message.message_id)
    
    full_message = panel['h2'] + "\n"
    sent_message = await message.answer(full_message)
    sent_message_ids.append(sent_message.message_id)

    # Добавляем все p
    for text in panel['p']:
        full_message = text + "\n"
        sent_message = await message.answer(full_message)
        sent_message_ids.append(sent_message.message_id)

    # Добавляем все h3, если они есть
    if 'h3' in panel:
        for text in panel['h3']:
            full_message = text + "\n"
            sent_message = await message.answer(full_message)
            sent_message_ids.append(sent_message.message_id)

    # После последнего сообщения (p или h3) добавляем кнопки
    last_message = sent_message_ids[-1]
    await bot.edit_message_reply_markup(chat_id=message.chat.id, message_id=last_message, reply_markup=create_keyboard(panel['buttons']))

# Обработчик callback для кнопок
@dp.callback_query()
async def process_callback(callback_query: types.CallbackQuery):
    target_panel_id = callback_query.data
    panel = next(item for item in data if item['id'] == target_panel_id)

    await bot.answer_callback_query(callback_query.id)

    # Строка, которая будет содержать все сообщения (h1, h2, p и h3)
    full_message = ""
    sent_message_ids = []

    # Отправляем h1 и h2
    full_message += panel['h1'] + "\n"
    sent_message = await bot.send_message(callback_query.from_user.id, full_message)
    sent_message_ids.append(sent_message.message_id)
    
    full_message = panel['h2'] + "\n"
    sent_message = await bot.send_message(callback_query.from_user.id, full_message)
    sent_message_ids.append(sent_message.message_id)

    # Добавляем все p
    for text in panel['p']:
        full_message = text + "\n"
        sent_message = await bot.send_message(callback_query.from_user.id, full_message)
        sent_message_ids.append(sent_message.message_id)

    # Добавляем все h3, если они есть
    if 'h3' in panel:
        for text in panel['h3']:
            full_message = text + "\n"
            sent_message = await bot.send_message(callback_query.from_user.id, full_message)
            sent_message_ids.append(sent_message.message_id)

    # После последнего сообщения (p или h3) добавляем кнопки
    last_message = sent_message_ids[-1]
    await bot.edit_message_reply_markup(chat_id=callback_query.message.chat.id, message_id=last_message, reply_markup=create_keyboard(panel['buttons']))

# Запуск бота
async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
