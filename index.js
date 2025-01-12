require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const Person = require("./models/person");

app.use(express.json());
app.use(express.static("dist"));

morgan.token("post-data", (req) => {
  if (req.method === "POST" && req.body) {
    return JSON.stringify(req.body);
  }
  return "";
});

app.use(morgan(":method :url :status - :response-time ms - :post-data"));

const cors = require("cors");
app.use(cors());

const errorHandler = (error, request, response, next) => {
  console.error("Error message:", error.message);
  console.error("Error name:", error.name);

  if (error.name === "CastError") {
    return response.status(400).json({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "NotFoundError") {
    return response.status(404).json({ error: error.message });
  }

  next(error);
};

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
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  const total = persons.length;
  const currentTime = new Date();
  response.send(
    `<p>Phonebook has info for ${total} people</p>
    <p>${currentTime}</p>`
  );
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (!person) {
        const error = new Error("Person not found");
        error.name = "NotFoundError";
        return next(error);
      }
      response.json(person);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons/", (request, response, next) => {
  const person = request.body;

  if (!person.name) {
    const error = new Error("Name is required");
    error.name = "ValidationError";
    return next(error);
  }

  if (!person.number) {
    const error = new Error("Number is required");
    error.name = "ValidationError";
    return next(error);
  }

  Person.findOne({ name: person.name }).then((existingPerson) => {
    if (existingPerson) {
      const error = new Error("Name must be unique");
      error.name = "ValidationError";
      return next(error);
    }

    const newPerson = new Person({
      name: person.name,
      number: person.number,
    });

    newPerson
      .save()
      .then((savedPerson) => {
        response.status(201).json(savedPerson);
      })
      .catch((error) => next(error));
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  const updatedPerson = { name, number };

  Person.findByIdAndUpdate(request.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (!updatedPerson) {
        const error = new Error("Person not found");
        error.name = "NotFoundError";
        return next(error);
      }
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(errorHandler);
