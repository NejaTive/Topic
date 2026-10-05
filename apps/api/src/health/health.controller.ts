import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { HealthErrorResponseDto, HealthOkResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOkResponse({ type: HealthOkResponseDto })
  @ApiServiceUnavailableResponse({ type: HealthErrorResponseDto })
  async check(): Promise<HealthOkResponseDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'up' };
    } catch {
      throw new HttpException({ status: 'error', db: 'down' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
