const express = require("express");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { MONGODB_CON_URL, PORT } = require("./config/server-config");
const bcrypt = require("bcrypt");
const { z } = require("zod");

mongoose.connect(MONGODB_CON_URL);

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
    const requiredBody = z.object({
        name: z.string().min(3).max(100),
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(100),
    });

    const parsedValidatedBody = requiredBody.safeParse(req.body);
    if (!parsedValidatedBody.success) {
        res.status(400).json({
            message: "Incorrect format!",
            error: parsedValidatedBody.error,
        });
        return;
    }

    const { email, name, password } = req.body;

    try {
        // Check if a user with the same email already exists
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists",
            });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = await UserModel.create({
            email,
            password: hashedPassword,
            name,
        });

        res.status(201).json({
            message: "You are signed up",
            userId: user._id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.post("/todo", auth, async function (req, res) {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await TodoModel.create({
        userId,
        title,
        done,
    });

    res.json({
        message: "Todo created",
    });
});

app.get("/todos", auth, async function (req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId,
    });

    res.json({
        todos,
    });
});

app.listen(PORT, () => {
    console.log(`Server started at port : ${PORT}`);
});
