import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../../infrastructure/database/entities/company.entity';
import { TransferEntity } from '../../infrastructure/database/entities/transfer.entity';
import { AdhesionEntity } from '../../infrastructure/database/entities/adhesion.entity';

/**
 * Helper class for setting up test databases
 */
export class DatabaseTestHelper {
  private dataSource: DataSource;

  /**
   * Creates an in-memory SQLite database for testing
   */
  static async createTestDataSource(): Promise<DataSource> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [CompanyEntity, TransferEntity, AdhesionEntity],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();
    return dataSource;
  }

  /**
   * Creates a testing module with TypeORM configuration
   */
  static async createTestingModule(
    additionalProviders: any[] = [],
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [CompanyEntity, TransferEntity, AdhesionEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          CompanyEntity,
          TransferEntity,
          AdhesionEntity,
        ]),
      ],
      providers: [...additionalProviders],
    }).compile();
  }

  /**
   * Cleans all data from the test database
   */
  static async cleanDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  /**
   * Seeds the database with test data
   */
  static async seedTestData(dataSource: DataSource): Promise<{
    companies: CompanyEntity[];
    transfers: TransferEntity[];
    adhesions: AdhesionEntity[];
  }> {
    const companyRepo = dataSource.getRepository(CompanyEntity);
    const transferRepo = dataSource.getRepository(TransferEntity);
    const adhesionRepo = dataSource.getRepository(AdhesionEntity);

    // Create test companies
    const company1 = companyRepo.create({
      id: 'test-company-1',
      cuit: '20-12345678-9',
      name: 'Test Company PYME',
      email: 'test1@company.com',
      type: 'PYME',
      employeeCount: 50,
      annualRevenue: 5000000,
    });

    const company2 = companyRepo.create({
      id: 'test-company-2',
      cuit: '30-87654321-2',
      name: 'Test Company CORPORATIVA',
      email: 'test2@company.com',
      type: 'CORPORATIVA',
      sector: 'Technology',
      isPublic: true,
      stockSymbol: 'TST',
    });

    const savedCompanies = await companyRepo.save([company1, company2]);

    // Create test transfers
    const transfer1 = transferRepo.create({
      id: 'test-transfer-1',
      destinationAccount: '2222-2222-2222-22222222',
      amount: 10000,
      currency: 'ARS',
      description: 'Test transfer 1',
      transferDate: new Date('2024-10-01'),
      companyId: savedCompanies[0].id,
    });

    const transfer2 = transferRepo.create({
      id: 'test-transfer-2',
      destinationAccount: '4444-4444-4444-44444444',
      amount: 50000,
      currency: 'ARS',
      description: 'Test transfer 2',
      transferDate: new Date('2024-10-15'),
      companyId: savedCompanies[1].id,
    });

    const savedTransfers = await transferRepo.save([transfer1, transfer2]);

    // Create test adhesions
    const adhesion1 = adhesionRepo.create({
      id: 'test-adhesion-1',
      adhesionDate: new Date('2024-10-05'),
      status: 'APPROVED',
      companyId: savedCompanies[0].id,
    });

    const adhesion2 = adhesionRepo.create({
      id: 'test-adhesion-2',
      adhesionDate: new Date('2024-10-10'),
      status: 'PENDING',
      companyId: savedCompanies[1].id,
    });

    const savedAdhesions = await adhesionRepo.save([adhesion1, adhesion2]);

    return {
      companies: savedCompanies,
      transfers: savedTransfers,
      adhesions: savedAdhesions,
    };
  }
}
