const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const { errorHandler } = require('./middlewares/errorHandler');
const authRouter = require('./routes/auth.router');
const usersRouter = require('./routes/users.router');
const categoriesRouter = require('./routes/categories.router');
const todosRouter = require('./routes/todos.router');
const assigneesRouter = require('./routes/assignees.router');
const holidaysRouter = require('./routes/holidays.router');
const anniversariesRouter = require('./routes/anniversaries.router');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res) => { res.status(200).json({ status: 'ok' }); });

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/todos', todosRouter);
app.use('/api/assignees', assigneesRouter);
app.use('/api/holidays', holidaysRouter);
app.use('/api/anniversaries', anniversariesRouter);

app.use(errorHandler);

module.exports = app;
