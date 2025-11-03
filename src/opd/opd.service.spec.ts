import { Test, TestingModule } from '@nestjs/testing';
import { OpdService } from './opd.service';

describe('OpdService', () => {
  let service: OpdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpdService],
    }).compile();

    service = module.get<OpdService>(OpdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
