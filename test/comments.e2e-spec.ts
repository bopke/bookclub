// Causing trouble with test
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let createdBookId: string;
  const exampleBook = {
    title: 'Best book ever, look it up!',
    author: 'Nick Morgan',
    isbn: '9788301183165',
    numberOfPages: 320,
    rating: 5,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    const bookResponse = await request(app.getHttpServer())
      .post('/books')
      .send(exampleBook)
      .expect(HttpStatus.CREATED);

    createdBookId = bookResponse.body.id;
  });

  afterAll(async () => {
    await request(app.getHttpServer()).delete(`/books/${createdBookId}`);
    await app.close();
  });

  it('/books/:bookId/comments (POST) creates a comment', async () => {
    const response = await request(app.getHttpServer())
      .post(`/books/${createdBookId}/comments`)
      .send({ text: 'Amazing book!' })
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('id');
    expect(response.body.text).toBe('Amazing book!');
    expect(response.body).toHaveProperty('createdAt');
  });

  it('/books/:bookId/comments (POST) returns 404 for nonexistent book', async () => {
    await request(app.getHttpServer())
      .post('/books/deadbeef-dead-beef-dead-deadbeefdead/comments')
      .send({ text: 'This should fail' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/books/:bookId/comments (POST) returns 400 for invalid input', async () => {
    await request(app.getHttpServer())
      .post(`/books/${createdBookId}/comments`)
      .send({ text: '' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/books/:bookId/comments (GET) returns paginated comments', async () => {
    const response = await request(app.getHttpServer())
      .get(`/books/${createdBookId}/comments?page=1&limit=1`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(1);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toHaveProperty('text');
  });

  it('/books/:bookId/comments (GET) returns 404 for nonexistent book', async () => {
    await request(app.getHttpServer())
      .get('/books/deadbeef-dead-beef-dead-deadbeefdead/comments')
      .expect(HttpStatus.NOT_FOUND);
  });
});
