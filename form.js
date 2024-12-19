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
                formDiv.remove();
                backToMain();
            }, 2000);
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Отправить';
        }
    };
}

// Функция для отправки данных формы
async function sendFormData(formData, courseTitle = '', button = null) {
    if (button && button.disabled) return false;
    
    if (button) {
        button.disabled = true;
        button.textContent = 'Отправка...';
    }

    try {
        let section = button ? button.textContent : 'Форма обратной связи';

        const data = {
            username: formData.get('username') || '@' + (window.Telegram.WebApp.initDataUnsafe?.user?.username || 'Гость'),
            message: formData.get('message'),
            course: courseTitle,
            steps: window.userSteps,
            section: section
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

        const result = await response.json();
        
        if (button) {
            button.textContent = 'Отправлено!';
            setTimeout(() => {
                backToMain();
            }, 2000);
        }
        
        return true;

    } catch (error) {
        console.error('Error:', error);
        if (button) {
            button.textContent = 'Ошибка! Попробуйте позже';
            setTimeout(() => {
                button.disabled = false;
                button.textContent = 'Отправить';
            }, 2000);
        }
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
            // Если кнопка уже отключена, прерываем выполнение
            if (e.target.disabled) return;

            addStep(e.target.textContent);
            
            if (e.target.classList.contains('purchase')) {
                const panel = e.target.closest('.panel');
                const messageText = panel.querySelector('textarea')?.value;
                const courseTitle = panel.querySelector('h1').textContent;
                
                const formData = new FormData();
                formData.append('message', messageText);
                
                await sendFormData(formData, courseTitle, e.target);
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
window.showForm = showForm;
window.sendFormData = sendFormData;
window.addStep = addStep;
window.initAllHandlers = initAllHandlers;
window.backToMain = backToMain; 