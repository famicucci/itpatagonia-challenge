import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Infrastructure - Database
import { typeOrmConfig } from './infrastructure/database/typeorm.config';
import { CompanyEntity } from './infrastructure/database/entities/company.entity';
import { TransferEntity } from './infrastructure/database/entities/transfer.entity';
import { AdhesionEntity } from './infrastructure/database/entities/adhesion.entity';

// Infrastructure - Controllers
import { CompanyController } from './infrastructure/controllers/company.controller';

// Infrastructure - Repositories (Real TypeORM)
import { TypeOrmCompanyRepository } from './infrastructure/repositories/typeorm-company.repository';
import { TypeOrmTransferRepository } from './infrastructure/repositories/typeorm-transfer.repository';
import { TypeOrmAdhesionRepository } from './infrastructure/repositories/typeorm-adhesion.repository';

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
  imports: [
    // Configure TypeORM with SQLite
    TypeOrmModule.forRoot(typeOrmConfig),
    // Register entities for injection
    TypeOrmModule.forFeature([CompanyEntity, TransferEntity, AdhesionEntity]),
  ],
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

    // TypeORM Repository Implementations (REAL DATABASE)
    {
      provide: COMPANY_REPOSITORY_TOKEN,
      useClass: TypeOrmCompanyRepository,
    },
    {
      provide: TRANSFER_REPOSITORY_TOKEN,
      useClass: TypeOrmTransferRepository,
    },
    {
      provide: ADHESION_REPOSITORY_TOKEN,
      useClass: TypeOrmAdhesionRepository,
    },

    // Additional providers for TypeORM repositories
    TypeOrmCompanyRepository,
    TypeOrmTransferRepository,
    TypeOrmAdhesionRepository,
  ],
})
export class AppModule {}
