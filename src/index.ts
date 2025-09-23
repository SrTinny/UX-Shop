import express, { type Request, type Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Servidor rodando com TypeScript!');
});

app.listen(port, () => {
  console.log(`Servidor ouvindo em http://localhost:${port}`);
});
