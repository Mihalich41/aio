// Глобальный массив для хранения шагов пользователя
window.userSteps = [];

// Функция для добавления шага
function addStep(text) {
    window.userSteps.push(text);
}

// Функция для отображения формы обратной связи
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

    addStep('Открыта форма обратной связи');

    document.getElementById('telegramForm').onsubmit = async function(event) {
        event.preventDefault();
        const submitButton = this.querySelector('button[type="submit"]');
        if (submitButton.disabled) return;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';
        
        if (await sendFormData(new FormData(this))) {
            submitButton.textContent = 'Отправлено!';
            setTimeout(() => {
                const panels = document.querySelectorAll('.panel');
                panels.forEach(panel => panel.style.display = 'none');
                document.getElementById('div0').style.display = 'block';
                formDiv.remove();
            }, 2000);
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Отправить';
        }
    };
}

// Функция для отправки данных формы
async function sendFormData(formData, courseTitle = '', button = null) {
    // Если передана кнопка и она уже отключена, прерываем отправку
    if (button && button.disabled) return false;
    
    // Отключаем кнопку если она передана
    if (button) {
        button.disabled = true;
        button.textContent = 'Отправка...';
    }

    // Получаем название раздела из последнего шага (не считая открытие формы)
    const section = window.userSteps[window.userSteps.length - 2] || 'Главная';

    const data = {
        username: formData.get('username') || '@' + (window.Telegram.WebApp.initDataUnsafe?.user?.username || 'Гость'),
        message: formData.get('message'),
        course: courseTitle,
        steps: window.userSteps,
        section: section
    };

    try {
        console.log('Отправляемые данные:', data);

        const response = await fetch('https://functions.yandexcloud.net/d4eno726s7f0too863f7', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            if (button) {
                button.textContent = 'Отправлено!';
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = 'Отправить';
                }, 2000);
            }
            // Очищаем шаги после успешной отправки
            window.userSteps = [];
            return true;
        } else {
            const result = await response.json();
            alert('Ошибка: ' + result.error);
            return false;
        }
    } catch (error) {
        alert('Ошибка отправки: ' + error.message);
        console.error('Ошибка при отправке:', error);
        return false;
    } finally {
        // Возвращаем кнопку в исходное состояние в случае ошибки
        if (button && button.textContent !== 'Отправлено!') {
            button.disabled = false;
            button.textContent = 'Отправить';
        }
    }
}

// Делаем функции доступными глобально
window.showForm = showForm;
window.sendFormData = sendFormData;
window.addStep = addStep; 