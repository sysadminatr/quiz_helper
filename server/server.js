const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

// ✅ Исправленный CORS middleware
app.use(cors({
  origin: "https://study.tusur.ru",
  credentials: true
}));

// ✅ Подключение к MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "sysadmin",
  password: "D270c1E528b750D5",
  database: "quiz_helper"
});

db.connect(err => {
  if (err) {
    console.error("Ошибка подключения к MySQL: ", err);
    return;
  }
  console.log("✅ Подключено к MySQL");
});

// ✅ Подключение Telegram-бота
const TELEGRAM_BOT_TOKEN = "7919016278:AAHr3NJOeARpAYV8IeXvgQyiwFWENrPe23A";
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Зарегистрироваться", url: `https://test.technoadmin.ru/register?telegramId=${chatId}` }]
      ]
    }
  };

  bot.sendMessage(chatId, "Нажмите кнопку ниже, чтобы зарегистрироваться:", options);
});

// ✅ Обработчик регистрации через URL
app.get("/register", (req, res) => {
  const { telegramId } = req.query;
  console.log("Получен запрос на регистрацию с Telegram ID:", telegramId);
  if (!telegramId) {
    console.log("Ошибка: не указан Telegram ID");
    return res.status(400).json({ success: false, error: "Не указан Telegram ID" });
  }

  const username = `User_${telegramId}`;

  const query = "INSERT INTO users (telegram_id, username, verified, answer_views, vip) VALUES (?, ?, 1, 10, 0) ON DUPLICATE KEY UPDATE verified = 1";
  db.query(query, [telegramId, username], (err) => {
    if (err) {
      console.error("Ошибка регистрации:", err);
      return res.status(500).json({ success: false, error: err });
    }

    const registrationCode = Math.floor(Math.random() * 1000000);

    const updateQuery = "UPDATE users SET registration_code = ? WHERE telegram_id = ?";
    db.query(updateQuery, [registrationCode, telegramId], (err) => {
      if (err) {
        console.error("Ошибка сохранения регистрационного кода:", err);
        return res.status(500).json({ success: false, error: err });
      }

      console.log("Регистрация прошла успешно. Код:", registrationCode);
      res.send(`Вы успешно зарегистрированы! Ваш регистрационный код: ${registrationCode}`);
    });
  });
});

// ✅ Обработчик проверки кода
app.post("/api/verifyCode", (req, res) => {
  const { telegramId, enteredCode } = req.body;

  if (!telegramId || !enteredCode) {
    console.log("Ошибка: Не указаны все параметры. Telegram ID:", telegramId, "Введенный код:", enteredCode);
    return res.status(400).json({ success: false, error: "Не указаны все параметры" });
  }

  console.log("Получен запрос для проверки кода с telegram_id:", telegramId);

  const query = "SELECT registration_code FROM users WHERE telegram_id = ?";
  db.query(query, [telegramId], (err, results) => {
    if (err) {
      console.error("Ошибка при запросе регистрационного кода: ", err);
      return res.status(500).json({ success: false, error: "Ошибка сервера" });
    }

    console.log("Результаты запроса:", results);

    if (results.length === 0) {
      console.log("Ошибка: Пользователь с данным telegram_id не найден в базе данных");
      return res.status(404).json({ success: false, error: "Пользователь не найден" });
    }

    const storedCode = results[0].registration_code;

    if (enteredCode === storedCode.toString()) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, error: "Неверный код!" });
    }
  });
});

// ✅ Обработчик сохранения ответов
app.post("/api/saveAnswers", (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, error: "Некорректные данные" });
  }

  answers.forEach(({ question, answers, correct }) => {
    if (!question || !answers || answers.length === 0) {
      console.warn(`Пропущен пустой вопрос или ответ:`, { question, answers });
      return;
    }

    db.query("SELECT COUNT(*) AS count FROM answers WHERE question = ?", [question], (err, results) => {
      if (err) {
        console.error("Ошибка при проверке существования вопроса: ", err);
        if (!res.headersSent) {
          return res.status(500).json({ success: false, error: err });
        }
        return;
      }

      const { count } = results[0];

      if (count > 0) {
        console.log(`Вопрос уже существует: ${question}`);
        return;
      }

      answers.forEach(answer => {
        const query = "INSERT INTO answers (question, answer) VALUES (?, ?) ON DUPLICATE KEY UPDATE answer = ?";
        db.query(query, [question, answer, answer], (err) => {
          if (err) {
            console.error("Ошибка сохранения ответа: ", err);
            if (!res.headersSent) {
              return res.status(500).json({ success: false, error: err });
            }
            return;
          }
        });
      });
    });
  });

  if (!res.headersSent) {
    res.json({ success: true });
  }
});

// ✅ Обработчик получения ответа (с POST)
app.post("/api/getAnswer", (req, res) => {
  const { question, telegram_id } = req.body;

  if (!question || !telegram_id) {
    return res.status(400).json({ error: "Не указаны все параметры" });
  }

  const decodedQuestion = decodeURIComponent(question);
  console.log("Получен вопрос:", decodedQuestion);
  console.log("Получен telegram_id:", telegram_id);

  db.query("SELECT vip, answer_views FROM users WHERE telegram_id = ?", [telegram_id], (err, userResults) => {
    if (err) {
      console.error("Ошибка запроса данных пользователя: ", err);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    if (userResults.length === 0) {
      return res.status(403).json({ error: "Пользователь не найден" });
    }

    const { vip, answer_views } = userResults[0];

    if (!vip && answer_views <= 0) {
      return res.json({ error: "Лимит просмотров исчерпан" });
    }

    db.query("SELECT answer FROM answers WHERE question = ?", [decodedQuestion], (err, results) => {
      if (err) {
        console.error("Ошибка получения ответа: ", err);
        return res.status(500).json({ error: "Ошибка сервера" });
      }

      if (results.length > 0) {
        if (!vip) {
          db.query("UPDATE users SET answer_views = answer_views - 1 WHERE telegram_id = ?", [telegram_id], (updateErr) => {
            if (updateErr) {
              console.error("Ошибка обновления данных пользователя: ", updateErr);
              return res.status(500).json({ error: "Ошибка обновления данных пользователя" });
            }
            return res.json({ answer: results[0].answer });
          });
        } else {
          return res.json({ answer: results[0].answer });
        }
      } else {
        return res.json({ error: "Ответ не найден" });
      }
    });
  });
});

// Запуск сервера
app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});
