import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Comment } from '../comments/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Comment])],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
