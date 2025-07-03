// Causing trouble with test
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('BookController (e2e)', () => {
  let app: INestApplication;

  const mockBookDto = {
    title: 'Best book ever, look it up!',
    author: 'Nick Morgan',
    isbn: '9788301183165',
    numberOfPages: 320,
    rating: 5,
  };

  let createdBookId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/books (POST) creates a book', async () => {
    const response = await request(app.getHttpServer())
      .post('/books')
      .send(mockBookDto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(mockBookDto.title);
    createdBookId = response.body.id;
  });

  it('/books (GET) returns array of books', async () => {
    const response = await request(app.getHttpServer())
      .get('/books')
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/books/:id (GET) returns single book', async () => {
    const response = await request(app.getHttpServer())
      .get(`/books/${createdBookId}`)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(createdBookId);
    expect(response.body.title).toBe(mockBookDto.title);
  });

  it('/books/:id (PATCH) updates book partially', async () => {
    const updateDto = { rating: 4 };

    const response = await request(app.getHttpServer())
      .patch(`/books/${createdBookId}`)
      .send(updateDto)
      .expect(HttpStatus.OK);

    expect(response.body.rating).toBe(4);
  });

  it('/books/:id update fails for incorrect rating value', async () => {
    const updateDto = { rating: 7 }; // It actually is this good!

    await request(app.getHttpServer())
      .patch(`/books/${createdBookId}`)
      .send(updateDto)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/books/:id update fails for incorrect ISBN value', async () => {
    const updateDto = { isbn: '1337' };

    await request(app.getHttpServer())
      .patch(`/books/${createdBookId}`)
      .send(updateDto)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/books/:id (PUT) replaces the book', async () => {
    const replaceDto = {
      title: 'Replaced Book Title',
      author: 'Nick Morgan',
      isbn: '9788301183165',
      numberOfPages: 320,
      rating: 3,
    };

    const response = await request(app.getHttpServer())
      .put(`/books/${createdBookId}`)
      .send(replaceDto)
      .expect(HttpStatus.OK);

    expect(response.body.title).toBe('Replaced Book Title');
    expect(response.body.rating).toBe(3);
  });

  it('/books/:id (DELETE) removes book', async () => {
    await request(app.getHttpServer())
      .delete(`/books/${createdBookId}`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('/books/:id (GET) returns 404 after delete', async () => {
    await request(app.getHttpServer())
      .get(`/books/${createdBookId}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
