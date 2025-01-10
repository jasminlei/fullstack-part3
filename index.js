const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());

morgan.token("post-data", (req) => {
  if (req.method === "POST" && req.body) {
    return JSON.stringify(req.body);
  }
  return "";
});

app.use(morgan(":method :url :status - :response-time ms - :post-data"));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  const total = persons.length;
  const currentTime = new Date();
  response.send(
    `<p>Phonebook has info for ${total} people</p>
    <p>${currentTime}</p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons/", (request, response) => {
  const person = request.body;

  if (!person.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (!person.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  const existingPerson = persons.find((p) => p.name === person.name);
  if (existingPerson) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const generateId = () => {
    const maxId =
      persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0;
    return String(maxId + 1);
  };

  const newPerson = {
    id: generateId(),
    name: person.name,
    number: person.number,
  };

  persons.push(newPerson);
  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
