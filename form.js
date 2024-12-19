function showForm() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.style.display = 'none');
    
    const formDiv = document.createElement('div');
    formDiv.classList.add('form-panel');

    formDiv.innerHTML = `
        <h2>Отправить сообщение в Telegram</h2>
        <form id="telegramForm">
            <label for="username">Ваш Telegram логин:</label>
            <input type="text" id="username" name="username" required><br><br>

            <label for="message">Сообщение:</label>
            <textarea id="message" name="message" required></textarea><br><br>

            <button type="submit">Отправить</button>
        </form>
    `;

    document.body.appendChild(formDiv);

    const tg = window.Telegram.WebApp;
    const userData = tg.initDataUnsafe;

    if (userData && userData.user) {
        const username = userData.user.username;
        if (username) document.getElementById('username').value = username;
    }

    document.getElementById('telegramForm').onsubmit = async function(event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {
            username: formData.get('username'),
            message: formData.get('message')
        };

        try {
            console.log('Отправляемые данные:', data);

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
} 