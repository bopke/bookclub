import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/CreateBook.dto';
import { Book } from './entities/book.entity';
import { UpdateBookDto } from './dto/UpdateBook.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.bookService.create(createBookDto);
  }

  @Get()
  findAll(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.bookService.update(id, updateBookDto);
  }

  @Put(':id')
  replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createBookDto: CreateBookDto,
  ): Promise<Book> {
    return this.bookService.update(id, createBookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.bookService.remove(id);
  }
}
