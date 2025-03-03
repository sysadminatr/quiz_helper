function addLoginForm() {
  // Проверяем, что домен соответствует нужному
  const currentHost = window.location.hostname;
  if (currentHost !== "study.tusur.ru") {
    console.log("Это не сайт study.tusur.ru. Расширение не будет работать.");
    return;
  }

  // Проверяем, есть ли уже введенный код в localStorage
  if (localStorage.getItem('isLoggedIn') === 'true') {
    // Если уже залогинен, запускаем основной функционал
    addAnalyzeButton();
  } else {
    // Иначе показываем форму ввода кода
    const loginContainer = document.createElement("div");
    loginContainer.style.position = "fixed";
    loginContainer.style.top = "0";
    loginContainer.style.left = "0";
    loginContainer.style.width = "100%";
    loginContainer.style.height = "100%";
    loginContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    loginContainer.style.display = "flex";
    loginContainer.style.justifyContent = "center";
    loginContainer.style.alignItems = "center";
    loginContainer.style.zIndex = "10000";

    const loginForm = document.createElement("div");
    loginForm.style.backgroundColor = "#fff";
    loginForm.style.padding = "20px";
    loginForm.style.borderRadius = "5px";
    loginForm.style.textAlign = "center";

    const codeInput = document.createElement("input");
    codeInput.type = "text";
    codeInput.placeholder = "Введите код для входа";
    codeInput.style.padding = "10px";
    codeInput.style.fontSize = "16px";
    codeInput.style.marginBottom = "10px";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Войти";
    submitButton.style.padding = "10px 20px";
    submitButton.style.fontSize = "16px";
    submitButton.style.cursor = "pointer";
    submitButton.style.backgroundColor = "#4CAF50";
    submitButton.style.color = "white";
    submitButton.style.border = "none";
    submitButton.style.borderRadius = "5px";

    loginForm.appendChild(codeInput);
    loginForm.appendChild(submitButton);
    loginContainer.appendChild(loginForm);
    document.body.appendChild(loginContainer);

    submitButton.addEventListener("click", () => {
      const enteredCode = codeInput.value.trim();
      
      if (!enteredCode) {
        alert("Введите код для входа.");
        return;
      }

      // Получаем telegram_id с серверной стороны
      fetch("https://test.technoadmin.ru/api/getTelegramId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // Здесь можно передать данные для получения telegramId, если это необходимо.
        })
      })
      .then(response => response.json())
      .then(data => {
        const telegramId = data.telegramId;

        // Запрос к серверу для проверки существования пользователя с этим telegram_id
        fetch("https://test.technoadmin.ru/api/checkTelegramId", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            telegramId: telegramId
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.exists) {
            // Если пользователь найден, продолжаем проверку кода
            fetch("https://test.technoadmin.ru/api/verifyCode", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                telegramId: telegramId,
                enteredCode: enteredCode
              })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                // Сохраняем информацию о том, что пользователь вошел
                sessionStorage.setItem('isLoggedIn', 'true');  // Для хранения на время сессии

                loginContainer.remove();  // Убираем форму
                addAnalyzeButton();  // Открываем основной функционал
              } else {
                alert("Неверный код! Попробуйте еще раз.");
              }
            })
            .catch(error => {
              console.error("Ошибка при отправке данных:", error);
              alert("Ошибка сети.");
            });
          } else {
            alert("Пользователь с таким telegram_id не найден.");
          }
        })
        .catch(error => {
          console.error("Ошибка при запросе к серверу:", error);
          alert("Ошибка сети при проверке telegram_id.");
        });
      });
    });
  }
}

function addAnalyzeButton() {
  // Проверяем, что домен соответствует нужному
  const currentHost = window.location.hostname;
  if (currentHost !== "study.tusur.ru") {
    console.log("Это не сайт study.tusur.ru. Расширение не будет работать.");
    return;
  }

  const analyzeButton = document.createElement("button");
  analyzeButton.textContent = "Проанализировать тест";
  analyzeButton.style.position = "fixed";
  analyzeButton.style.bottom = "20px";
  analyzeButton.style.right = "20px";
  analyzeButton.style.zIndex = "10000";
  analyzeButton.style.backgroundColor = "#4CAF50";
  analyzeButton.style.color = "white";
  analyzeButton.style.border = "none";
  analyzeButton.style.padding = "10px 20px";
  analyzeButton.style.cursor = "pointer";
  document.body.appendChild(analyzeButton);

  const showAnswersButton = document.createElement("button");
  showAnswersButton.textContent = "Показать ответы";
  showAnswersButton.style.position = "fixed";
  showAnswersButton.style.bottom = "60px";
  showAnswersButton.style.right = "20px";
  showAnswersButton.style.zIndex = "10000";
  showAnswersButton.style.backgroundColor = "#FF5722";
  showAnswersButton.style.color = "white";
  showAnswersButton.style.border = "none";
  showAnswersButton.style.padding = "10px 20px";
  showAnswersButton.style.cursor = "pointer";
  document.body.appendChild(showAnswersButton);

  const logoutButton = document.createElement("button");
  logoutButton.textContent = "Выход";
  logoutButton.style.position = "fixed";
  logoutButton.style.bottom = "100px";
  logoutButton.style.right = "20px";
  logoutButton.style.zIndex = "10000";
  logoutButton.style.backgroundColor = "#f44336";
  logoutButton.style.color = "white";
  logoutButton.style.border = "none";
  logoutButton.style.padding = "10px 20px";
  logoutButton.style.cursor = "pointer";
  document.body.appendChild(logoutButton);

  // Обработчик для кнопки выхода
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem('isLoggedIn');  // Убираем информацию о том, что пользователь вошел
    location.reload();  // Перезагружаем страницу, чтобы скрыть кнопки
  });

  analyzeButton.addEventListener("click", () => {
    let answers = [];

    document.querySelectorAll(".que").forEach(questionEl => {
      let questionText = questionEl.querySelector(".qtext")?.innerText.trim();
      let answerOptions = [];
      let correctAnswers = [];

      // Обрабатываем текстовые ответы
      questionEl.querySelectorAll('input[type="text"]').forEach(inputEl => {
        let answerText = inputEl.value.trim();
        if (answerText) {
          answerOptions.push(answerText);
          if (inputEl.classList.contains("correct")) {
            correctAnswers.push(answerText);
          }
        }
      });

      // Обрабатываем ответы с флажками
      questionEl.querySelectorAll('input[type="checkbox"]').forEach(checkboxEl => {
        let label = checkboxEl.closest("label") || checkboxEl.parentElement;
        let answerText = label ? label.innerText.trim() : "Выбранный ответ";

        if (checkboxEl.checked) {
          answerOptions.push(answerText);

          // Проверяем правильность с помощью класса "grading .correctness.correct"
          const grading = checkboxEl.closest(".grading");
          if (grading && grading.querySelector(".correctness.correct")) {
            correctAnswers.push(answerText);
          }
        }
      });

      // Обрабатываем текстовые ответы
      questionEl.querySelectorAll(".answer").forEach(answerEl => {
        let answerText = answerEl.innerText.trim();
        if (answerText) {
          answerOptions.push(answerText);
          if (answerEl.classList.contains("correct")) {
            correctAnswers.push(answerText);
          }
        }
      });

      // Добавляем только те вопросы, у которых есть правильные ответы
      if (questionText && correctAnswers.length > 0) {
        answers.push({
          question: questionText,
          answers: answerOptions,
          correct: correctAnswers
        });
      }
    });

    console.log("Найденные вопросы и ответы:", answers);

    if (answers.length > 0) {
      // Запрос на сохранение ответов
      fetch("https://test.technoadmin.ru/api/saveAnswers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Анализ завершен. Ответы сохранены.");
        } else {
          alert("Ошибка при сохранении ответов.");
        }
      })
      .catch(error => {
        console.error("Ошибка при отправке данных:", error);
        alert("Ошибка сети.");
      });
    } else {
      alert("Не найдено правильных ответов.");
    }
  });

  showAnswersButton.addEventListener("click", () => {
    document.querySelectorAll(".que").forEach(questionEl => {
      let questionText = questionEl.querySelector(".qtext")?.innerText.trim();
      if (questionText) {
        // Получаем telegram_id из sessionStorage
        const telegramId = sessionStorage.getItem('telegram_id');  // Или другой способ получения telegram_id, если оно хранится в другом месте

        if (!telegramId) {
          console.error("Не найден telegram_id.");
          return;
        }

        // Используем POST вместо GET
        fetch("https://test.technoadmin.ru/api/getAnswer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: questionText,
            telegram_id: telegramId  // Передаем telegram_id
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.answer) {
            // Создаем элемент, который будет отображать правильный ответ
            const correctAnswerElement = document.createElement("div");
            correctAnswerElement.textContent = `Правильный ответ: ${data.answer}`;
            correctAnswerElement.style.color = "green";
            correctAnswerElement.style.fontWeight = "bold";

            // Вставляем правильный ответ рядом с вопросом
            questionEl.querySelector(".content").appendChild(correctAnswerElement);
          }
        })
        .catch(error => {
          console.error("Ошибка при получении правильного ответа:", error);
        });
      }
    });
  });
}

// Если пользователь уже вошел, сразу запускаем основной функционал
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addLoginForm);
} else {
  addLoginForm();
}
