import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../../../database/entities/company.entity';
import { TransferEntity } from '../../../database/entities/transfer.entity';
import { AdhesionEntity } from '../../../database/entities/adhesion.entity';
import { TypeOrmCompanyRepository } from '../../typeorm-company.repository';
import { TypeOrmTransferRepository } from '../../typeorm-transfer.repository';
import { TypeOrmAdhesionRepository } from '../../typeorm-adhesion.repository';
import { CompanyPyme } from '../../../../domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../../../domain/entities/company-corporativa.entity';
import { Transfer } from '../../../../domain/entities/transfer.entity';
import { Adhesion } from '../../../../domain/entities/adhesion.entity';

describe('TypeORM Repositories Integration Tests', () => {
  let module: TestingModule;
  let companyRepo: TypeOrmCompanyRepository;
  let transferRepo: TypeOrmTransferRepository;
  let adhesionRepo: TypeOrmAdhesionRepository;
  let companyEntityRepo: Repository<CompanyEntity>;
  let transferEntityRepo: Repository<TransferEntity>;
  let adhesionEntityRepo: Repository<AdhesionEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [CompanyEntity, TransferEntity, AdhesionEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([CompanyEntity, TransferEntity, AdhesionEntity]),
      ],
      providers: [
        TypeOrmCompanyRepository,
        TypeOrmTransferRepository,
        TypeOrmAdhesionRepository,
      ],
    }).compile();

    companyRepo = module.get<TypeOrmCompanyRepository>(TypeOrmCompanyRepository);
    transferRepo = module.get<TypeOrmTransferRepository>(TypeOrmTransferRepository);
    adhesionRepo = module.get<TypeOrmAdhesionRepository>(TypeOrmAdhesionRepository);
    
    companyEntityRepo = module.get<Repository<CompanyEntity>>(getRepositoryToken(CompanyEntity));
    transferEntityRepo = module.get<Repository<TransferEntity>>(getRepositoryToken(TransferEntity));
    adhesionEntityRepo = module.get<Repository<AdhesionEntity>>(getRepositoryToken(AdhesionEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clear all tables before each test
    await adhesionEntityRepo.clear();
    await transferEntityRepo.clear();
    await companyEntityRepo.clear();
  });

  describe('Company Repository Integration', () => {
    it('should save and retrieve a PYME company', async () => {
      const company = new CompanyPyme(
        'test-pyme-1',
        'Test PYME Company',
        '20-12345678-9',
        'test@pyme.com',
        10,
        2000000,
        new Date('2024-01-01')
      );

      const savedCompany = await companyRepo.save(company);
      expect(savedCompany).toEqual(company);

      const retrievedCompany = await companyRepo.findById('test-pyme-1');
      expect(retrievedCompany).not.toBeNull();
      expect(retrievedCompany).toBeInstanceOf(CompanyPyme);
      expect(retrievedCompany!.name).toBe('Test PYME Company');
      expect((retrievedCompany as CompanyPyme).employeeCount).toBe(10);
    });

    it('should save and retrieve a CORPORATIVA company', async () => {
      const company = new CompanyCorporativa(
        'test-corp-1',
        'Test Corp Company',
        '30-98765432-1',
        'test@corp.com',
        'Technology',
        true,
        'TESTC',
        new Date('2024-01-01')
      );

      const savedCompany = await companyRepo.save(company);
      expect(savedCompany).toEqual(company);

      const retrievedCompany = await companyRepo.findById('test-corp-1');
      expect(retrievedCompany).not.toBeNull();
      expect(retrievedCompany).toBeInstanceOf(CompanyCorporativa);
      expect((retrievedCompany as CompanyCorporativa).sector).toBe('Technology');
    });

    it('should find company by CUIT and email', async () => {
      const company = new CompanyPyme(
        'test-find-1',
        'Find Test Company',
        '20-11111111-1',
        'find@test.com',
        5,
        1000000,
        new Date()
      );
      await companyRepo.save(company);

      const foundByCuit = await companyRepo.findByCuit('20-11111111-1');
      expect(foundByCuit).not.toBeNull();
      expect(foundByCuit!.name).toBe('Find Test Company');

      const foundByEmail = await companyRepo.findByEmail('find@test.com');
      expect(foundByEmail).not.toBeNull();
      expect(foundByEmail!.name).toBe('Find Test Company');
    });

    it('should update company', async () => {
      const company = new CompanyPyme(
        'test-update-1',
        'Original Name',
        '20-22222222-2',
        'original@test.com',
        8,
        1500000,
        new Date()
      );
      await companyRepo.save(company);

      const updated = await companyRepo.update('test-update-1', { 
        name: 'Updated Name',
        email: 'updated@test.com' 
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('Updated Name');
      expect(updated!.email).toBe('updated@test.com');
    });

    it('should delete company', async () => {
      const company = new CompanyPyme(
        'test-delete-1',
        'Delete Me',
        '20-33333333-3',
        'delete@test.com',
        3,
        500000,
        new Date()
      );
      await companyRepo.save(company);

      const result = await companyRepo.delete('test-delete-1');
      expect(result).toBe(true);

      const deleted = await companyRepo.findById('test-delete-1');
      expect(deleted).toBeNull();
    });
  });

  describe('Transfer Repository Integration', () => {
    let testCompany: CompanyPyme;

    beforeEach(async () => {
      testCompany = new CompanyPyme(
        'transfer-company-1',
        'Transfer Test Company',
        '20-44444444-4',
        'transfer@test.com',
        12,
        2500000,
        new Date()
      );
      await companyRepo.save(testCompany);
    });

    it('should save and retrieve transfers', async () => {
      const transfer = new Transfer(
        'transfer-1',
        'transfer-company-1',
        150000,
        'ARS',
        '0001-0001-0001-12345678',
        'Test transfer',
        new Date('2025-09-15')
      );

      const savedTransfer = await transferRepo.save(transfer);
      expect(savedTransfer).toEqual(transfer);

      const retrievedTransfer = await transferRepo.findById('transfer-1');
      expect(retrievedTransfer).not.toBeNull();
      expect(retrievedTransfer!.amount).toBe(150000);
      expect(retrievedTransfer!.companyId).toBe('transfer-company-1');
    });

    it('should find transfers by company ID', async () => {
      const transfers = [
        new Transfer('t1', 'transfer-company-1', 100000, 'ARS', '1111-1111-1111-11111111', 'Transfer 1', new Date()),
        new Transfer('t2', 'transfer-company-1', 200000, 'USD', '2222-2222-2222-22222222', 'Transfer 2', new Date()),
      ];

      for (const transfer of transfers) {
        await transferRepo.save(transfer);
      }

      const companyTransfers = await transferRepo.findByCompanyId('transfer-company-1');
      expect(companyTransfers).toHaveLength(2);
    });

    it('should find transfers by date range', async () => {
      const transfers = [
        new Transfer('td1', 'transfer-company-1', 100000, 'ARS', '1111-1111-1111-11111111', 'Sept transfer', new Date('2025-09-15')),
        new Transfer('td2', 'transfer-company-1', 200000, 'ARS', '2222-2222-2222-22222222', 'Oct transfer', new Date('2025-10-15')),
      ];

      for (const transfer of transfers) {
        await transferRepo.save(transfer);
      }

      const septTransfers = await transferRepo.findByDateRange(
        new Date('2025-09-01'),
        new Date('2025-09-30')
      );

      expect(septTransfers).toHaveLength(1);
      expect(septTransfers[0].description).toBe('Sept transfer');
    });

    it('should find companies by transfer date range', async () => {
      const transfer = new Transfer(
        'tdr1',
        'transfer-company-1',
        300000,
        'ARS',
        '3333-3333-3333-33333333',
        'Range test transfer',
        new Date('2025-09-20')
      );
      await transferRepo.save(transfer);

      const companyIds = await transferRepo.findCompaniesByTransferDateRange(
        new Date('2025-09-01'),
        new Date('2025-09-30')
      );

      expect(companyIds).toContain('transfer-company-1');
    });
  });

  describe('Adhesion Repository Integration', () => {
    let testCompany: CompanyPyme;

    beforeEach(async () => {
      testCompany = new CompanyPyme(
        'adhesion-company-1',
        'Adhesion Test Company',
        '20-55555555-5',
        'adhesion@test.com',
        15,
        3000000,
        new Date()
      );
      await companyRepo.save(testCompany);
    });

    it('should save and retrieve adhesions', async () => {
      const adhesion = new Adhesion(
        'adhesion-1',
        testCompany,
        new Date('2025-09-10'),
        'APPROVED'
      );

      const savedAdhesion = await adhesionRepo.save(adhesion);
      expect(savedAdhesion.id).toBe('adhesion-1');
      expect(savedAdhesion.status).toBe('APPROVED');

      const retrievedAdhesion = await adhesionRepo.findById('adhesion-1');
      expect(retrievedAdhesion).not.toBeNull();
      expect(retrievedAdhesion!.company.name).toBe('Adhesion Test Company');
    });

    it('should find adhesions by company ID', async () => {
      const adhesion = new Adhesion(
        'adhesion-company-test',
        testCompany,
        new Date(),
        'PENDING'
      );
      await adhesionRepo.save(adhesion);

      const companyAdhesions = await adhesionRepo.findByCompanyId('adhesion-company-1');
      expect(companyAdhesions).toHaveLength(1);
      expect(companyAdhesions[0].status).toBe('PENDING');
    });

    it('should find adhesions by date range', async () => {
      const adhesions = [
        new Adhesion('ad1', testCompany, new Date('2025-09-15'), 'APPROVED'),
        new Adhesion('ad2', testCompany, new Date('2025-10-15'), 'PENDING'),
      ];

      for (const adhesion of adhesions) {
        await adhesionRepo.save(adhesion);
      }

      const septAdhesions = await adhesionRepo.findByDateRange(
        new Date('2025-09-01'),
        new Date('2025-09-30')
      );

      expect(septAdhesions).toHaveLength(1);
      expect(septAdhesions[0].status).toBe('APPROVED');
    });

    it('should update adhesion status', async () => {
      const adhesion = new Adhesion(
        'adhesion-update-test',
        testCompany,
        new Date(),
        'PENDING'
      );
      await adhesionRepo.save(adhesion);

      const updated = await adhesionRepo.update('adhesion-update-test', 'APPROVED');
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('APPROVED');
    });

    it('should find companies by adhesion date range (only approved)', async () => {
      const adhesions = [
        new Adhesion('adr1', testCompany, new Date('2025-09-10'), 'APPROVED'),
        new Adhesion('adr2', testCompany, new Date('2025-09-15'), 'PENDING'),
      ];

      for (const adhesion of adhesions) {
        await adhesionRepo.save(adhesion);
      }

      const companies = await adhesionRepo.findCompaniesByAdhesionDateRange(
        new Date('2025-09-01'),
        new Date('2025-09-30')
      );

      // Solo debería devolver empresas con adhesiones APPROVED
      expect(companies).toHaveLength(1);
      expect(companies[0].name).toBe('Adhesion Test Company');
    });
  });

  describe('Cross-Repository Integration', () => {
    it('should handle full workflow: company -> transfers -> adhesions', async () => {
      // 1. Create companies
      const companies = [
        new CompanyPyme('workflow-1', 'Workflow Company 1', '20-66666666-6', 'wf1@test.com', 10, 2000000, new Date()),
        new CompanyCorporativa('workflow-2', 'Workflow Company 2', '30-77777777-7', 'wf2@test.com', 'Tech', true, 'WFC2', new Date()),
      ];

      for (const company of companies) {
        await companyRepo.save(company);
      }

      // 2. Create transfers
      const transfers = [
        new Transfer('wf-t1', 'workflow-1', 150000, 'ARS', '1111-1111-1111-11111111', 'WF Transfer 1', new Date('2025-09-15')),
        new Transfer('wf-t2', 'workflow-2', 250000, 'USD', '2222-2222-2222-22222222', 'WF Transfer 2', new Date('2025-09-20')),
      ];

      for (const transfer of transfers) {
        await transferRepo.save(transfer);
      }

      // 3. Create adhesions
      const adhesions = [
        new Adhesion('wf-a1', companies[0], new Date('2025-09-10'), 'APPROVED'),
        new Adhesion('wf-a2', companies[1], new Date('2025-09-12'), 'APPROVED'),
      ];

      for (const adhesion of adhesions) {
        await adhesionRepo.save(adhesion);
      }

      // 4. Verify integration
      const allCompanies = await companyRepo.findAll();
      expect(allCompanies).toHaveLength(2);

      const septTransfers = await transferRepo.findByDateRange(
        new Date('2025-09-01'),
        new Date('2025-09-30')
      );
      expect(septTransfers).toHaveLength(2);

      const approvedCompanies = await adhesionRepo.findCompaniesByAdhesionDateRange(
        new Date('2025-09-01'),
        new Date('2025-09-30')
      );
      expect(approvedCompanies).toHaveLength(2);

      const transferCompanyIds = await transferRepo.findCompaniesByTransferDateRange(
        new Date('2025-09-01'),
        new Date('2025-09-30')
      );
      expect(transferCompanyIds).toContain('workflow-1');
      expect(transferCompanyIds).toContain('workflow-2');
    });
  });
});