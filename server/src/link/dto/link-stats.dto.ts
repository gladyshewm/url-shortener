import { IsDate, IsIP, IsNumber, IsString } from 'class-validator';

export class LinkStatsDto {
  @IsNumber()
  id: number;

  @IsDate()
  accessedAt: Date;

  @IsString()
  userAgent: string;

  @IsIP()
  ipAddress: string;
}
