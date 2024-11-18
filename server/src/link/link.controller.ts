import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { ShortenedLinkDto } from './dto/shortened-link.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { Request, Response } from 'express';
import { LinkStatsDto } from './dto/link-stats.dto';
import { LinkDto } from './dto/link.dto';

@Controller()
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get('api/all')
  async getAll(): Promise<LinkDto[]> {
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
  async redirect(
    @Param('code') code: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const url = await this.linkService.getOriginalUrl(code);
    await this.linkService.saveStats(
      code,
      req.ip as string,
      req.headers['user-agent'] as string,
    );
    return res.redirect(url);
  }

  @Get('api/stats/:code')
  async getStats(@Param('code') code: string): Promise<LinkStatsDto[]> {
    return this.linkService.getStats(code);
  }
}
