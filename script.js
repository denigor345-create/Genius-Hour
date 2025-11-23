class KidsQuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.lives = 5;
        this.correctAnswers = 0;
        this.totalQuestions = 10;
        this.hintsAvailable = 3;
        
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
            this.questions = this.shuffleArray(data.questions).slice(0, this.totalQuestions);
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            // Резервные вопросы на случай ошибки
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
            }
        ];
    }

    shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    bindEvents() {
        // Кнопки главного меню
        document.getElementById('startSinglePlayer').addEventListener('click', () => this.startSinglePlayer());
        document.getElementById('startMultiplayer').addEventListener('click', () => this.showMultiplayerScreen());
        document.getElementById('showRules').addEventListener('click', () => this.showRules());
        
        // Игровые кнопки
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.checkAnswer(parseInt(e.target.dataset.index)));
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
    }

    startSinglePlayer() {
        this.resetGame();
        this.showScreen('gameScreen');
        this.displayQuestion();
    }

    showMultiplayerScreen() {
        this.showScreen('multiplayerScreen');
    }

    createRoom() {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        document.getElementById('roomCode').textContent = roomCode;
        document.getElementById('roomSection').classList.remove('hidden');
    }

    startMultiplayer() {
        alert('Мультиплеер режим в разработке! Сейчас запустим одиночную игру.');
        this.startSinglePlayer();
    }

    resetGame() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.lives = 5;
        this.correctAnswers = 0;
        this.hintsAvailable = 3;
        this.updateUI();
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
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
        const question = this.questions[this.currentQuestionIndex];
        const options = document.querySelectorAll('.option-btn');
        
        // Блокируем кнопки после ответа
        options.forEach(btn => btn.disabled = true);
        
        if (selectedIndex === question.correctAnswer) {
            // Правильный ответ
            options[selectedIndex].classList.add('correct');
            this.score += 10;
            this.correctAnswers++;
            this.playSound('correct');
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
            this.displayQuestion();
        }, 1500);
    }

    useHint() {
        if (this.hintsAvailable > 0) {
            const question = this.questions[this.currentQuestionIndex];
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
        }
    }

    updateUI() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('currentLives').textContent = this.lives;
        
        // Обновляем доступность подсказок
        const hintBtn = document.getElementById('useHint');
        hintBtn.disabled = this.hintsAvailable === 0;
        hintBtn.textContent = `💡 Подсказка (${this.hintsAvailable})`;
        
        // Проверяем окончание игры по жизням
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    endGame() {
        document.getElementById('correctAnswers').textContent = this.correctAnswers;
        document.getElementById('finalScore').textContent = this.score;
        
        const resultMessage = document.getElementById('resultMessage');
        if (this.correctAnswers >= 8) {
            resultMessage.textContent = '🎉 Ты гений! Отличный результат!';
        } else if (this.correctAnswers >= 5) {
            resultMessage.textContent = '👍 Хорошо поработал!';
        } else {
            resultMessage.textContent = '💪 Не сдавайся! Попробуй еще раз!';
        }
        
        this.showScreen('resultsScreen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    playSound(type) {
        // Здесь можно добавить звуковые эффекты
        console.log(`Playing ${type} sound`);
    }

    pauseGame() {
        alert('Игра на паузе! Нажми ОК чтобы продолжить.');
    }

    showRules() {
        alert(`📖 Правила игры:
        
🎯 Отвечай на вопросы и зарабатывай звёзды
❤️ У тебя 5 жизней
💡 Есть 3 подсказки "50/50"
⭐ За каждый правильный ответ +10 очков

Удачи!`);
    }
}

// Запуск игры когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
    new KidsQuizGame();
});
