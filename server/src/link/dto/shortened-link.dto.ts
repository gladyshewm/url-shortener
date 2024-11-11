import { IsString, IsUrl } from 'class-validator';

export class ShortenedLinkDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsString()
  @IsUrl()
  originalUrl: string;
}
