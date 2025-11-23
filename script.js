class KidsQuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.lives = 5;
        this.correctAnswers = 0;
        this.totalQuestions = 10;
        this.hintsAvailable = 3;
        this.gameActive = false;
        this.selectedQuestions = [];
        
        this.initializeGame();
        this.bindEvents();
    }

    async initializeGame() {
        await this.loadQuestions();
        this.showScreen('mainMenu');
    }

    async loadQuestions() {
        try {
            const response = await fetch('./data/questions.json');
            const data = await response.json();
            this.questions = data.questions;
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            this.questions = this.getBackupQuestions();
        }
    }

    getBackupQuestions() {
        return [
            {
                id: 1,
                question: "Какое животное говорит 'Мяу'?",
                options: ["Собака", "Кошка", "Корова", "Утка"],
                correctAnswer: 1,
                category: "Животные",
                difficulty: 1
            },
            {
                id: 2,
                question: "Сколько будет 2 + 2?",
                options: ["3", "4", "5", "6"],
                correctAnswer: 1,
                category: "Математика",
                difficulty: 1
            },
            {
                id: 3,
                question: "Какого цвета солнце?",
                options: ["Синего", "Зеленого", "Желтого", "Красного"],
                correctAnswer: 2,
                category: "Природа",
                difficulty: 1
            },
            {
                id: 4,
                question: "Сколько дней в неделе?",
                options: ["5", "6", "7", "8"],
                correctAnswer: 2,
                category: "Общие знания",
                difficulty: 1
            },
            {
                id: 5,
                question: "Какое время года самое холодное?",
                options: ["Лето", "Осень", "Зима", "Весна"],
                correctAnswer: 2,
                category: "Природа",
                difficulty: 1
            }
        ];
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    bindEvents() {
        // Кнопки главного меню
        document.getElementById('startSinglePlayer').addEventListener('click', () => this.startSinglePlayer());
        document.getElementById('startMultiplayer').addEventListener('click', () => this.showMultiplayerScreen());
        document.getElementById('showRules').addEventListener('click', () => this.showRules());
        
        // Игровые кнопки
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.gameActive) return;
                this.checkAnswer(parseInt(e.target.dataset.index));
            });
        });
        
        document.getElementById('useHint').addEventListener('click', () => this.useHint());
        document.getElementById('pauseGame').addEventListener('click', () => this.pauseGame());
        
        // Кнопки результатов
        document.getElementById('playAgain').addEventListener('click', () => this.startSinglePlayer());
        document.getElementById('backToMenu').addEventListener('click', () => this.showScreen('mainMenu'));
        
        // Мультиплеер
        document.getElementById('createRoom').addEventListener('click', () => this.createRoom());
        document.getElementById('backToMainMenu').addEventListener('click', () => this.showScreen('mainMenu'));
        document.getElementById('startMultiplayerGame').addEventListener('click', () => this.startMultiplayer());
        document.getElementById('joinRoom').addEventListener('click', () => this.joinRoom());
    }

    startSinglePlayer() {
        this.resetGame();
        this.selectRandomQuestions();
        this.showScreen('gameScreen');
        this.displayQuestion();
        this.gameActive = true;
    }

    showMultiplayerScreen() {
        this.showScreen('multiplayerScreen');
    }

    createRoom() {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        document.getElementById('roomCode').textContent = roomCode;
        document.getElementById('roomSection').classList.remove('hidden');
        
        // Сохраняем код комнаты для использования
        this.roomCode = roomCode;
        this.isRoomCreator = true;
    }

    joinRoom() {
        const roomCode = prompt('Введите код комнаты:');
        if (roomCode && roomCode.length === 4) {
            this.roomCode = roomCode.toUpperCase();
            this.isRoomCreator = false;
            document.getElementById('roomCode').textContent = this.roomCode;
            document.getElementById('roomSection').classList.remove('hidden');
            alert(`Вы присоединились к комнате ${this.roomCode}! Ожидайте начала игры.`);
        } else {
            alert('Пожалуйста, введите корректный код комнаты (4 символа)');
        }
    }

    startMultiplayer() {
        if (!this.roomCode) {
            alert('Сначала создайте или присоединитесь к комнате!');
            return;
        }
        
        this.resetGame();
        this.selectRandomQuestions();
        this.showScreen('gameScreen');
        this.displayQuestion();
        this.gameActive = true;
        
        // В реальном приложении здесь бы было подключение к серверу
        console.log(`Мультиплеер игра началась в комнате ${this.roomCode}`);
    }

    selectRandomQuestions() {
        // Выбираем случайные вопросы из общей базы
        this.selectedQuestions = this.shuffleArray(this.questions).slice(0, this.totalQuestions);
        this.currentQuestionIndex = 0;
    }

    resetGame() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.lives = 5;
        this.correctAnswers = 0;
        this.hintsAvailable = 3;
        this.gameActive = true;
        this.updateUI();
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.selectedQuestions.length) {
            this.endGame();
            return;
        }

        const question = this.selectedQuestions[this.currentQuestionIndex];
        
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('questionNumber').textContent = this.currentQuestionIndex + 1;
        
        const options = document.querySelectorAll('.option-btn');
        options.forEach((btn, index) => {
            btn.textContent = question.options[index];
            btn.className = 'option-btn';
            btn.disabled = false;
        });
        
        this.updateUI();
    }

    checkAnswer(selectedIndex) {
        if (!this.gameActive) return;

        const question = this.selectedQuestions[this.currentQuestionIndex];
        const options = document.querySelectorAll('.option-btn');
        
        // Блокируем кнопки после ответа
        options.forEach(btn => btn.disabled = true);
        this.gameActive = false;
        
        if (selectedIndex === question.correctAnswer) {
            // Правильный ответ
            options[selectedIndex].classList.add('correct');
            this.score += 10;
            this.correctAnswers++;
            this.playSound('correct');
            
            // Бонус за быстрый ответ (в будущем можно добавить таймер)
            this.score += 2;
        } else {
            // Неправильный ответ
            options[selectedIndex].classList.add('incorrect');
            options[question.correctAnswer].classList.add('correct');
            this.lives--;
            this.playSound('incorrect');
        }
        
        this.updateUI();
        
        // Следующий вопрос через 1.5 секунды
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.gameActive = true;
            this.displayQuestion();
        }, 1500);
    }

    useHint() {
        if (this.hintsAvailable > 0 && this.gameActive) {
            const question = this.selectedQuestions[this.currentQuestionIndex];
            const options = document.querySelectorAll('.option-btn');
            let wrongOptions = [];
            
            // Находим индексы неправильных ответов
            options.forEach((btn, index) => {
                if (index !== question.correctAnswer) {
                    wrongOptions.push(index);
                }
            });
            
            // Убираем два случайных неправильных ответа
            const optionsToRemove = this.shuffleArray(wrongOptions).slice(0, 2);
            optionsToRemove.forEach(index => {
                options[index].classList.add('disabled');
                options[index].disabled = true;
            });
            
            this.hintsAvailable--;
            this.playSound('hint');
            this.updateUI();
        }
    }

    updateUI() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('currentLives').textContent = this.lives;
        
        // Обновляем доступность подсказок
        const hintBtn = document.getElementById('useHint');
        if (this.hintsAvailable > 0) {
            hintBtn.disabled = false;
            hintBtn.textContent = `💡 Подсказка (${this.hintsAvailable})`;
        } else {
            hintBtn.disabled = true;
            hintBtn.textContent = `💡 Подсказки закончились`;
        }
        
        // Меняем цвет жизней в зависимости от количества
        const livesElement = document.getElementById('currentLives');
        if (this.lives <= 2) {
            livesElement.style.color = '#ff6b6b';
        } else if (this.lives <= 3) {
            livesElement.style.color = '#feca57';
        } else {
            livesElement.style.color = '#1dd1a1';
        }
        
        // Проверяем окончание игры по жизням
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.gameActive = false;
        
        document.getElementById('correctAnswers').textContent = this.correctAnswers;
        document.getElementById('finalScore').textContent = this.score;
        
        const resultMessage = document.getElementById('resultMessage');
        if (this.correctAnswers >= 8) {
            resultMessage.textContent = '🎉 Ты гений! Отличный результат!';
            resultMessage.style.color = '#1dd1a1';
        } else if (this.correctAnswers >= 5) {
            resultMessage.textContent = '👍 Хорошо поработал! Продолжай в том же духе!';
            resultMessage.style.color = '#feca57';
        } else {
            resultMessage.textContent = '💪 Не сдавайся! Попробуй еще раз - у тебя все получится!';
            resultMessage.style.color = '#ff6b6b';
        }
        
        this.showScreen('resultsScreen');
        
        // Показываем дополнительное сообщение если все жизни закончились
        if (this.lives <= 0) {
            setTimeout(() => {
                alert('💔 Жизни закончились! Но не расстраивайся - каждая ошибка это новая возможность научиться чему-то!');
            }, 500);
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    playSound(type) {
        // Простая имитация звуков через Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'correct':
                    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // Нота C5
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    break;
                case 'incorrect':
                    oscillator.frequency.setValueAtTime(220.00, audioContext.currentTime); // Нота A3
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    break;
                case 'hint':
                    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // Нота E5
                    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    break;
            }
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Звуки не поддерживаются в этом браузере');
        }
    }

    pauseGame() {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        const pauseTime = new Date();
        
        alert('⏸️ Игра на паузе! Нажми OK чтобы продолжить.');
        
        this.gameActive = true;
        console.log(`Игра была на паузе ${Math.round((new Date() - pauseTime) / 1000)} секунд`);
    }

    showRules() {
        const rules = `🎮 ПРАВИЛА ВИКТОРИНЫ 🎮

🌟 ЦЕЛЬ ИГРЫ:
Отвечай на вопросы и набирай как можно больше очков!

❤️ СИСТЕМА ЖИЗНЕЙ:
• У тебя 5 жизней
• За неправильный ответ теряешь 1 жизнь
• Если жизни закончатся - игра завершается

⭐ СИСТЕМА ОЧКОВ:
• Правильный ответ: +10 очков
• Бонус за скорость: +2 очка
• Комбо (подряд): дополнительные бонусы

💡 ПОДСКАЗКИ:
• У тебя 3 подсказки "50/50"
• Подсказка убирает два неверных ответа
• Используй их мудро!

🎯 РЕЖИМЫ ИГРЫ:
• Одиночная игра - играй сам
• Мультиплеер - играй с друзьями

УДАЧИ! 🍀`;
        
        alert(rules);
    }

    // Дополнительные методы для расширения функциональности

    getCurrentQuestion() {
        return this.selectedQuestions[this.currentQuestionIndex];
    }

    getGameStats() {
        return {
            score: this.score,
            lives: this.lives,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.selectedQuestions.length,
            hintsAvailable: this.hintsAvailable,
            progress: Math.round((this.currentQuestionIndex / this.selectedQuestions.length) * 100)
        };
    }

    addBonusPoints(points) {
        this.score += points;
        this.updateUI();
        
        // Показываем анимацию бонуса
        const bonusElement = document.createElement('div');
        bonusElement.textContent = `+${points} ⭐`;
        bonusElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2em;
            font-weight: bold;
            color: #feca57;
            z-index: 1000;
            animation: floatUp 1s ease-out forwards;
        `;
        
        // Добавляем CSS анимацию
        if (!document.querySelector('#bonus-animation')) {
            const style = document.createElement('style');
            style.id = 'bonus-animation';
            style.textContent = `
                @keyframes floatUp {
                    0% { opacity: 1; transform: translate(-50%, -50%); }
                    100% { opacity: 0; transform: translate(-50%, -100px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(bonusElement);
        setTimeout(() => {
            document.body.removeChild(bonusElement);
        }, 1000);
    }

    // Метод для отладки
    debugGame() {
        console.log('=== ДЕБАГ ИНФОРМАЦИЯ ===');
        console.log('Текущий вопрос:', this.getCurrentQuestion());
        console.log('Статистика:', this.getGameStats());
        console.log('Всего вопросов в базе:', this.questions.length);
        console.log('Выбранные вопросы:', this.selectedQuestions.length);
    }
}

// Вспомогательные функции
function createConfetti() {
    // Простая реализация конфетти для празднования победы
    const colors = ['#ff6b6b', '#4ecdc4', '#feca57', '#1dd1a1', '#54a0ff', '#ff9ff3'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: fall ${Math.random() * 3 + 2}s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    document.body.removeChild(confetti);
                }
            }, 5000);
        }, i * 100);
    }
    
    // Добавляем CSS анимацию для падения
    if (!document.querySelector('#confetti-animation')) {
        const style = document.createElement('style');
        style.id = 'confetti-animation';
        style.textContent = `
            @keyframes fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Запуск игры когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
    window.game = new KidsQuizGame();
    
    // Добавляем глобальную функцию для отладки (только в development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debugGame = () => window.game.debugGame();
        console.log('🎮 Для отладки используйте debugGame()');
    }
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Произошла ошибка:', event.error);
    
    // Показываем дружелюбное сообщение об ошибке
    if (document.body) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
        `;
        errorDiv.textContent = 'Что-то пошло не так. Попробуй обновить страницу!';
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
});

// Добавляем красивый загрузчик
window.addEventListener('load', () => {
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease-out;
    `;
    
    loader.innerHTML = `
        <div style="text-align: center; color: white;">
            <h1 style="font-size: 3em; margin-bottom: 20px;">🎮</h1>
            <p style="font-size: 1.5em;">Загрузка викторины...</p>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            if (loader.parentNode) {
                document.body.removeChild(loader);
            }
        }, 500);
    }, 1000);
});
