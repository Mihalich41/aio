// form.js
document.addEventListener('DOMContentLoaded', function () {
    const tg = window.Telegram.WebApp;
    const userData = tg.initDataUnsafe;

    // Подставляем данные пользователя в форму
    if (userData && userData.user) {
        const username = userData.user.username;
        if (username) document.getElementById('username').value = username;
    }

    // Обработчик отправки формы
    document.getElementById('telegramForm').onsubmit = async function (event) {
        event.preventDefault(); // Предотвращаем обычное отправление формы

        const formData = new FormData(this);
        const data = {
            username: formData.get('username'),
            message: formData.get('message')
        };

        try {
            const response = await fetch('https://functions.yandexcloud.net/d4eno726s7f0too863f7', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Сообщение отправлено успешно');
            } else {
                alert('Ошибка: ' + result.error);
            }
        } catch (error) {
            alert('Ошибка отправки: ' + error.message);
            console.error('Ошибка при отправке:', error);
        }
    };
});
