import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Infrastructure - Controllers
import { CompanyController } from './infrastructure/controllers/company.controller';

// Infrastructure - Repositories
import { MockCompanyRepository } from './infrastructure/repositories/mock-company.repository';
import { MockTransferRepository } from './infrastructure/repositories/mock-transfer.repository';
import { MockAdhesionRepository } from './infrastructure/repositories/mock-adhesion.repository';

// Application - Use Cases
import {
  GetCompaniesWithTransfersLastMonthUseCase,
  GetCompaniesAdheredLastMonthUseCase,
  RegisterCompanyAdhesionUseCase,
} from './application/use-cases/company.use-cases';

// Domain tokens
import {
  COMPANY_REPOSITORY_TOKEN,
  TRANSFER_REPOSITORY_TOKEN,
  ADHESION_REPOSITORY_TOKEN,
} from './domain/repositories/tokens';

@Module({
  imports: [],
  controllers: [
    AppController,
    CompanyController, // Nuevo controlador para el challenge
  ],
  providers: [
    AppService,

    // Company Use Cases (challenge)
    GetCompaniesWithTransfersLastMonthUseCase,
    GetCompaniesAdheredLastMonthUseCase,
    RegisterCompanyAdhesionUseCase,

    // Repository Implementations
    {
      provide: COMPANY_REPOSITORY_TOKEN,
      useClass: MockCompanyRepository,
    },
    {
      provide: TRANSFER_REPOSITORY_TOKEN,
      useClass: MockTransferRepository,
    },
    {
      provide: ADHESION_REPOSITORY_TOKEN,
      useClass: MockAdhesionRepository,
    },
  ],
})
export class AppModule {}
