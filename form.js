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
    
    // Удаляем форму, если она есть
    const formPanel = document.querySelector('.form-panel');
    if (formPanel) formPanel.remove();
    
    document.getElementById('div0').style.display = 'block';
    const backLink = document.querySelector('.back-link');
    if (backLink) backLink.style.display = 'none';
}
async function createPanels(data, container) {
    data.forEach(item => {
        const newDiv = document.createElement('div');
        newDiv.classList.add('panel');
        newDiv.id = item.id;  

        let panelHTML = `
            <h1>${item.h1}</h1>
            <h2 ${item.h2class ? `class="${item.h2class}"` : ''}>${item.h2}</h2>`

        // Обработка текста в p, в том числе с классами hint и emoji
        if (item.span && item.span.emoji && item.span.texts) {
            panelHTML += `
                <p class="emoji"><span class="emoji">${item.span.emoji}</span> ${item.span.texts.join('<br>')}</p>`;
        }
        
        if (item.p) {
            panelHTML += `
                <div class="p-text">
                    ${item.p.map(text => {
                        if (typeof text === "string") {
                            return `<p>${text}</p>`;
                        } else if (text.class === "hint") {
                            return `<p class="hint">${text.text}</p>`;
                        } 
                    }).join('')}
                </div>
            `;
        }
        <h3>${item.h3}</h3>
        // Добавление кнопок
        if (item.buttons) {
            panelHTML += item.buttons.map(btn => `
                <p><button class="${btn.class}">${btn.text}</button></p>
            `).join('');
        }

        // Вставляем панель в контейнер
        newDiv.innerHTML = panelHTML;
        container.appendChild(newDiv);
    });
}

// Общая функция для загрузки данных
async function loadData(jsonFile) {
    try {
        const tg = window.Telegram.WebApp;
        const userData = tg.initDataUnsafe;
        let username = userData?.user?.username || 'Гость';

        const response = await fetch(jsonFile);
        let data;
        
        if (jsonFile.includes('all.json')) {
            const jsonText = await response.text();
            data = JSON.parse(jsonText.replace(/@username/g, '@' + username));
        } else {
            data = await response.json();
        }

        await createPanels(data, document.body);

        // Инициализация отображения
        document.getElementById('div0').style.display = 'block';
        // Инициализируем обработчики
        initAllHandlers();

    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        alert('Произошла ошибка при загрузке данных. Попробуйте позже.');
    }
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
            <textarea id="message" name="message" placeholder="Введите дополнительные уточнения или вопросы" required></textarea><br><br>
            <button type="submit" class="form">Отправить</button>
        </form>
    `;
    document.body.appendChild(formDiv);

    const userData = window.Telegram.WebApp.initDataUnsafe;
    if (userData && userData.user) {
        const username = userData.user.username;
        if (username) document.getElementById('username').value = '@' + username;
    }

    document.getElementById('telegramForm').onsubmit = function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        sendFormData(formData, title);
    };
}

// Функция для отправки данных формы
async function sendFormData(formData, title = '') {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton.disabled) return false;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    const data = {
        username: formData.get('username') || '@' + (window.Telegram.WebApp.initDataUnsafe?.user?.username || 'Гость'),
        message: formData.get('message'),
        course: title,
        steps: window.userSteps,
        section: title || 'Форма обратной связи'
    };

    console.log('Отправляемые данные:', data); // Для отладки

    try {
        const response = await fetch('https://functions.yandexcloud.net/d4eno726s7f0too863f7', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Успешный ответ:', result);
            submitButton.textContent = 'Отправлено!';

            setTimeout(() => {
                const formPanel = document.querySelector('.form-panel');
                if (formPanel) formPanel.remove();
                backToMain();
            }, 2000);
        } else {
            throw new Error(`Ошибка: ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        submitButton.disabled = false;
        submitButton.textContent = 'Ошибка! Попробуйте позже';

        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error');
        errorMessage.textContent = 'Произошла ошибка при отправке. Пожалуйста, попробуйте позже.';
        submitButton.parentNode.insertBefore(errorMessage, submitButton.nextSibling);
        
        setTimeout(() => {
            errorMessage.remove();
            submitButton.textContent = 'Отправить';
            submitButton.disabled = false;
        }, 3000);
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
window.loadData = loadData;
