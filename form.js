// Глобальный массив для хранения шагов пользователя
window.userSteps = [];

// Функция для добавления шага
function addStep(text) {
    window.userSteps.push(text);
}

// Функция для возврата на главную
function backToMain() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.style.display = 'none');
    document.getElementById('div0').style.display = 'block';
    const backLink = document.querySelector('.back-link');
    if (backLink) backLink.style.display = 'none';
}

// Функция для создания и показа формы
function showCustomForm(title) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.style.display = 'none');
    
    const formDiv = document.createElement('div');
    formDiv.classList.add('form-panel');
    formDiv.innerHTML = `
        <h1>${title}</h1>
        <form id="telegramForm">
            <label for="username">Ваш Telegram логин:</label>
            <input type="text" id="username" name="username" required><br><br>
            <label for="message">Сообщение:</label>
            <textarea id="message" name="message" required></textarea><br><br>
            <button type="submit" class="form">Отправить</button>
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
        await sendFormData(formData, title);
    };
}

// Функция для отправки данных формы
async function sendFormData(formData, title = '') {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton.disabled) return false;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    try {
        const data = {
            username: formData.get('username') || '@' + (window.Telegram.WebApp.initDataUnsafe?.user?.username || 'Гость'),
            message: formData.get('message'),
            course: title,
            steps: window.userSteps,
            section: title || 'Форма обратной связи'
        };

        const response = await fetch('https://kvazigame.ru/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();
        submitButton.textContent = 'Отправлено!';
        
        setTimeout(() => {
            const formPanel = document.querySelector('.form-panel');
            if (formPanel) formPanel.remove();
            backToMain();
        }, 2000);
        
        return true;

    } catch (error) {
        console.error('Error:', error);
        submitButton.textContent = 'Ошибка! Попробуйте позже';
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Отправить';
        }, 2000);
        return false;
    }
}

// Функция для инициализации обработчиков
function initAllHandlers() {
    const panels = document.querySelectorAll('.panel');
    const backLink = document.querySelector('.back-link');

    // Обработчик для кнопок навигации
    document.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
            if (e.target.disabled) return;

            addStep(e.target.textContent);
            
            if (e.target.classList.contains('purchase')) {
                showCustomForm(e.target.textContent);
                return;
            }

            if (e.target.classList.contains('formdiv')) {
                showCustomForm('Написать сообщение');
                return;
            }

            if (e.target.classList.contains('all')) {
                window.location.href = 'all.html';
                return;
            }

            // Получаем первый класс кнопки как идентификатор целевой панели
            const targetPanelId = e.target.classList[0];
            
            panels.forEach(panel => panel.style.display = 'none');
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) {
                targetPanel.style.display = 'block';
                backLink.style.display = targetPanelId === 'div0' ? 'none' : 'block';
            }
        }
    });

    // Обработчик для кнопки "назад"
    backLink?.addEventListener('click', (e) => {
        e.preventDefault();
        addStep('Назад на главную');
        backToMain();
    });
}

// Делаем функции доступными глобально
window.showForm = showCustomForm;
window.sendFormData = sendFormData;
window.addStep = addStep;
window.initAllHandlers = initAllHandlers;
window.backToMain = backToMain; 