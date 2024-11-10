import { Body, Controller, Get, Post } from '@nestjs/common';
import { LinkService } from './link.service';
import { Link } from './link.entity';
import { CreateLinkDto } from './dto/create-link.dto';

@Controller('link')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get('all')
  getAll(): Promise<Link[]> {
    return this.linkService.findAll();
  }

  @Post()
  createLink(@Body() createLinkDto: CreateLinkDto): Promise<Link> {
    const link = new Link();
    link.url = createLinkDto.url;
    link.description = createLinkDto.description;
    return this.linkService.create(link);
  }
}
