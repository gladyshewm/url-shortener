import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { Link } from './entities/link.entity';
import { ShortenedLinkDto } from './dto/shortened-link.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { Response } from 'express';

@Controller()
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get('api/all')
  async getAll(): Promise<Link[]> {
    return this.linkService.findAll();
  }

  @Post('api/shorten')
  async createLink(
    @Body() createLinkDto: CreateLinkDto,
  ): Promise<ShortenedLinkDto> {
    return this.linkService.createLink(createLinkDto.originalUrl);
  }

  @Delete('api/short/:code')
  async deleteLink(@Param('code') code: string): Promise<void> {
    return this.linkService.deleteLink(code);
  }

  @Get('s/:code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.linkService.getOriginalUrl(code);
    return res.redirect(url);
  }
}
