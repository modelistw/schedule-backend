const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'secret';

const users = {
    'user1@some.com': 'user1@some.com',
    'user2@some.com': 'user2@some.com'
};

let schedule = {
    'Понедельник': { start: '00:00', end: '23:59' },
    'Вторник': { start: '00:00', end: '23:59' },
    'Среда': { start: '00:00', end: '23:59' },
    'Четверг': { start: '00:00', end: '23:59' },
    'Пятница': { start: '00:00', end: '23:59' },
    'Суббота': { start: '00:00', end: '23:59' },
    'Воскресенье': { start: '00:00', end: '23:59' }
};

app.use(cors());
app.use(bodyParser.json());

function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Недействительный токен' });
        req.user = user;
        next();
    });
}

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (users[email] === password) {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ message: 'Неверный email или пароль' });
    }
});

app.get('/schedule', (req, res) => {
    console.log('get')
    res.status(200).json(schedule);
});

app.post('/schedule', authenticateToken, (req, res) => {
    const { day, start, end } = req.body;
    console.log('update');
    if (schedule[day]) {
        schedule[day] = { start, end };
        res.status(200).json({ message: 'Расписание обновлено' });
    } else {
        res.status(400).json({ message: 'Некорректный день недели' });
    }
});

app.get('/check-access', (req, res) => {
    const { day, time } = req.query;

    if (!schedule[day]) {
        return res.status(400).json({ message: 'Некорректный день недели' });
    }

    const { start, end } = schedule[day];

    if (time >= start && time <= end) {
        return res.status(200).json({ access: true, message: 'Доступ разрешен' });
    } else {
        return res.status(403).json({ access: false, message: 'Доступ запрещен' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});