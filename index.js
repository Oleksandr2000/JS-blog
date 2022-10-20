import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { AuthController, PostController, CommentsController } from './contollers/index.js';
import checkAuth from './middleware/checkAuth.js';
import fileUpload from 'express-fileupload';
import path from 'path';
import commonjsVariables from 'commonjs-variables-for-esmodules';

const { __dirname } = commonjsVariables(import.meta);

mongoose
  .connect(
    'mongodb+srv://admin:admin@cluster0.hfofisu.mongodb.net/blog?retryWrites=true&w=majority',
  )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));

app.post('/registr', AuthController.registr);
app.post('/login', AuthController.login);
app.get('/auth', checkAuth, AuthController.auth);

app.get('/posts', PostController.getAll);
app.get('/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts', checkAuth, PostController.update);

app.post('/comments', checkAuth, CommentsController.create);
app.get('/comments', CommentsController.getAll);

app.listen(process.env.PORT || 4444, (error) => {
  if (error) {
    console.log(error);
  }

  console.log('Server OK');
});
