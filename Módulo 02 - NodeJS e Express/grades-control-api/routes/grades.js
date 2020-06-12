const express = require('express');
const fs = require('fs').promises;

const app = express();
const router = express.Router();

app.use(express.json());

router.post('/', async (req, res) => {
  try {
    let grade = req.body;
    const timeStamp = new Date();
    const data = await fs.readFile(global.grades, 'utf8');
    const json = JSON.parse(data);
    grade = {
      id: json.nextId++,
      ...grade,
      timestamp: timeStamp,
    };
    json.grades.push(grade);
    await fs.writeFile(global.grades, JSON.stringify(json));
    res.send(grade);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    let updatedGrade = req.body;
    const timeStamp = new Date();
    const newGrade = {
      ...updatedGrade,
      timestamp: timeStamp,
    };
    const data = await fs.readFile(global.grades, 'utf8');
    const json = JSON.parse(data);
    let oldIndex = json.grades.findIndex((grade) => grade.id === newGrade.id);
    json.grades[oldIndex] = newGrade;

    await fs.writeFile(global.grades, JSON.stringify(json));

    oldIndex !== -1
      ? res.send(newGrade)
      : res.status(400).send({ error: err.message });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(global.grades, 'utf8');
    const grades = JSON.parse(data);
    res.send(grades.grades);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(global.grades, 'utf8');
    const id = Number(req.params.id);
    const json = JSON.parse(data);
    const grade = json.grades.find((grade) => grade.id === id);
    grade ? res.send(grade) : res.end();
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(global.grades, 'utf8');
    const id = Number(req.params.id);
    const json = JSON.parse(data);
    const removed = json.grades.filter((grade) => grade.id === id);
    const grades = json.grades.filter((grade) => grade.id !== id);
    json.grades = grades;
    await fs.writeFile(global.grades, JSON.stringify(json));
    res.send(removed);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.post('/total', async (req, res) => {
  try {
    const { student, subject } = req.body;
    const data = await fs.readFile(global.grades, 'utf8');
    const json = JSON.parse(data);
    const findGrades = json.grades.filter(
      (grade) => grade.student === student && grade.subject === subject
    );
    let totalGrades = 0;
    for (grade of findGrades) {
      totalGrades += grade.value;
    }

    res.send(String(totalGrades));
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.post('/average', async (req, res) => {
  try {
    const data = await fs.readFile(global.grades, 'utf8');
    const json = JSON.parse(data);
    const { subject, type } = req.body;
    const grades = json.grades.filter(
      (grade) => (grade.subject === subject) & (grade.type === type)
    );
    const sum = grades.reduce((accumulator, current) => {
      return accumulator + current.value;
    }, 0);
    const average = sum / grades.length;
    res.send(`Média: ${average}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.post('/topgrades', async (req, res) => {
  try {
    const data = await fs.readFile(global.grades, 'utf8');
    const json = JSON.parse(data);
    const { subject, type } = req.body;
    const grades = json.grades
      .filter((grade) => (grade.subject === subject) & (grade.type === type))
      .sort((a, b) => b.value - a.value);

    const top3 = [];
    for (let i = 0; i < 2; i++) {
      top3.push(grades[i]);
    }
    res.send(grades);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
