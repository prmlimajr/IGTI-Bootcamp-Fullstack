const express = require('express');
const fs = require('fs').promises;
const winston = require('winston');
const gradesRouter = require('./routes/grades.js');

global.grades = 'grades.json';

const app = express();
const port = 3000;

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

app.use(express.json());
app.use('/grades', gradesRouter);

app.listen(port, async () => {
  try {
    await fs.readFile(global.grades, 'utf8');
    logger.info(`Conectado na porta ${port}.`);
  } catch (err) {
    const initialJson = {
      nextId: 1,
      grades: [],
    };
    fs.writeFile(global.grades, JSON.stringify(initialJson)).catch((err) => {
      logger.error(err);
    });
  }
});
