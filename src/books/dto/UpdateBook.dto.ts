import { CreateBookDto } from './CreateBook.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateBookDto extends PartialType(CreateBookDto) {}
