import { Test, TestingModule } from '@nestjs/testing';
import { DischargeService } from './discharge.service';

describe('DischargeService', () => {
  let service: DischargeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DischargeService],
    }).compile();

    service = module.get<DischargeService>(DischargeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
