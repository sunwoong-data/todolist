const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler');
const authRouter = require('./routes/auth.router');
const usersRouter = require('./routes/users.router');
const categoriesRouter = require('./routes/categories.router');
const todosRouter = require('./routes/todos.router');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => { res.status(200).json({ status: 'ok' }); });

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/todos', todosRouter);

app.use(errorHandler);

module.exports = app;
