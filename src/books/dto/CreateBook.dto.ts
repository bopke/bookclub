import { IsString, IsInt, Min, Max, IsISBN } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsISBN()
  isbn: string;

  @IsInt()
  @Min(1)
  numberOfPages: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
