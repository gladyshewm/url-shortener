import { IsNumber, IsString, IsUrl } from 'class-validator';

export class LinkDto {
  @IsNumber()
  id: number;

  @IsString()
  code: string;

  @IsUrl()
  originalUrl: string;
}
