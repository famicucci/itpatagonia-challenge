import { Test, TestingModule } from '@nestjs/testing';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../company.use-cases';
import { GetCompaniesAdheredLastMonthUseCase } from '../company.use-cases';
import { RegisterCompanyAdhesionUseCase } from '../company.use-cases';
import { RegisterCompanyAdhesionDto } from '../company.use-cases';
import type { CompanyRepository } from '../../../domain/repositories/company.repository.interface';
import type { TransferRepository } from '../../../domain/repositories/transfer.repository.interface';
import type { AdhesionRepository } from '../../../domain/repositories/adhesion.repository.interface';
import {
  COMPANY_REPOSITORY_TOKEN,
  TRANSFER_REPOSITORY_TOKEN,
  ADHESION_REPOSITORY_TOKEN,
} from '../../../domain/repositories/tokens';
import { CompanyPyme } from '../../../domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../../domain/entities/company-corporativa.entity';
import { Transfer } from '../../../domain/entities/transfer.entity';
import { Adhesion } from '../../../domain/entities/adhesion.entity';

describe('Company Use Cases', () => {
  let module: TestingModule;

  // Mock repositories
  let mockCompanyRepository: jest.Mocked<CompanyRepository>;
  let mockTransferRepository: jest.Mocked<TransferRepository>;
  let mockAdhesionRepository: jest.Mocked<AdhesionRepository>;

  // Use cases
  let getCompaniesWithTransfersUseCase: GetCompaniesWithTransfersLastMonthUseCase;
  let getCompaniesAdheredUseCase: GetCompaniesAdheredLastMonthUseCase;
  let registerAdhesionUseCase: RegisterCompanyAdhesionUseCase;

  // Test data
  let testCompanyPyme: CompanyPyme;
  let testCompanyCorporativa: CompanyCorporativa;

  beforeEach(async () => {
    // Create mock repositories
    mockCompanyRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCuit: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTransferRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCompanyId: jest.fn(),
      findByDateRange: jest.fn(),
      findCompaniesByTransferDateRange: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockAdhesionRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCompanyId: jest.fn(),
      findByDateRange: jest.fn(),
      findCompaniesByAdhesionDateRange: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Create testing module
    module = await Test.createTestingModule({
      providers: [
        GetCompaniesWithTransfersLastMonthUseCase,
        GetCompaniesAdheredLastMonthUseCase,
        RegisterCompanyAdhesionUseCase,
        {
          provide: COMPANY_REPOSITORY_TOKEN,
          useValue: mockCompanyRepository,
        },
        {
          provide: TRANSFER_REPOSITORY_TOKEN,
          useValue: mockTransferRepository,
        },
        {
          provide: ADHESION_REPOSITORY_TOKEN,
          useValue: mockAdhesionRepository,
        },
      ],
    }).compile();

    // Get use case instances
    getCompaniesWithTransfersUseCase =
      module.get<GetCompaniesWithTransfersLastMonthUseCase>(
        GetCompaniesWithTransfersLastMonthUseCase,
      );
    getCompaniesAdheredUseCase =
      module.get<GetCompaniesAdheredLastMonthUseCase>(
        GetCompaniesAdheredLastMonthUseCase,
      );
    registerAdhesionUseCase = module.get<RegisterCompanyAdhesionUseCase>(
      RegisterCompanyAdhesionUseCase,
    );

    // Create test data
    testCompanyPyme = new CompanyPyme(
      'pyme-1',
      'TechStart Solutions',
      '20-12345678-3',
      'contact@techstart.com',
      15,
      50000000,
      new Date('2025-08-15'),
    );

    testCompanyCorporativa = new CompanyCorporativa(
      'corp-1',
      'Banco Nacional SA',
      '30-11111111-9',
      'corporate@banconacional.com',
      'Financiero',
      false,
      'BNA',
      new Date('2025-07-10'),
    );
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('GetCompaniesWithTransfersLastMonthUseCase', () => {
    it('should return companies with transfers from last month', async () => {
      // Arrange
      const companyIdsWithTransfers = ['pyme-1', 'corp-1'];
      const expectedCompanies = [testCompanyPyme, testCompanyCorporativa];

      mockTransferRepository.findCompaniesByTransferDateRange.mockResolvedValue(
        companyIdsWithTransfers,
      );
      mockCompanyRepository.findById
        .mockResolvedValueOnce(testCompanyPyme)
        .mockResolvedValueOnce(testCompanyCorporativa);

      // Act
      const result = await getCompaniesWithTransfersUseCase.execute();

      // Assert
      expect(
        mockTransferRepository.findCompaniesByTransferDateRange,
      ).toHaveBeenCalledWith(expect.any(Date), expect.any(Date));
      expect(mockCompanyRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith('pyme-1');
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith('corp-1');
      expect(result).toEqual(expectedCompanies);
    });

    it('should return empty array when no transfers found', async () => {
      // Arrange
      mockTransferRepository.findCompaniesByTransferDateRange.mockResolvedValue(
        [],
      );

      // Act
      const result = await getCompaniesWithTransfersUseCase.execute();

      // Assert
      expect(result).toEqual([]);
      expect(mockCompanyRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle companies not found gracefully', async () => {
      // Arrange
      const companyIdsWithTransfers = ['non-existent-company'];

      mockTransferRepository.findCompaniesByTransferDateRange.mockResolvedValue(
        companyIdsWithTransfers,
      );
      mockCompanyRepository.findById.mockResolvedValue(null);

      // Act
      const result = await getCompaniesWithTransfersUseCase.execute();

      // Assert
      expect(result).toEqual([]);
      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(
        'non-existent-company',
      );
    });

    it('should remove duplicates when same company has multiple transfers', async () => {
      // Arrange
      const companyIdsWithTransfers = ['pyme-1', 'pyme-1', 'corp-1'];

      mockTransferRepository.findCompaniesByTransferDateRange.mockResolvedValue(
        companyIdsWithTransfers,
      );
      mockCompanyRepository.findById
        .mockResolvedValueOnce(testCompanyPyme)
        .mockResolvedValueOnce(testCompanyPyme)
        .mockResolvedValueOnce(testCompanyCorporativa);

      // Act
      const result = await getCompaniesWithTransfersUseCase.execute();

      // Assert
      expect(result).toEqual([
        testCompanyPyme,
        testCompanyPyme,
        testCompanyCorporativa,
      ]);
      expect(mockCompanyRepository.findById).toHaveBeenCalledTimes(3);
    });

    it('should calculate correct date range for last month', async () => {
      // Arrange
      const mockDate = new Date('2025-10-15'); // October 15th
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      mockTransferRepository.findCompaniesByTransferDateRange.mockResolvedValue(
        [],
      );

      // Act
      await getCompaniesWithTransfersUseCase.execute();

      // Assert
      const [[startDate, endDate]] =
        mockTransferRepository.findCompaniesByTransferDateRange.mock.calls;
      expect(startDate.getMonth()).toBe(8); // September (0-indexed)
      expect(startDate.getDate()).toBe(1);
      expect(endDate.getMonth()).toBe(8); // September
      expect(endDate.getDate()).toBe(30);

      jest.useRealTimers();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockTransferRepository.findCompaniesByTransferDateRange.mockRejectedValue(
        error,
      );

      // Act & Assert
      await expect(getCompaniesWithTransfersUseCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('GetCompaniesAdheredLastMonthUseCase', () => {
    it('should return companies that adhered last month', async () => {
      // Arrange
      const expectedCompanies = [testCompanyPyme, testCompanyCorporativa];

      mockAdhesionRepository.findCompaniesByAdhesionDateRange.mockResolvedValue(
        expectedCompanies,
      );

      // Act
      const result = await getCompaniesAdheredUseCase.execute();

      // Assert
      expect(
        mockAdhesionRepository.findCompaniesByAdhesionDateRange,
      ).toHaveBeenCalledWith(expect.any(Date), expect.any(Date));
      expect(result).toEqual(expectedCompanies);
    });

    it('should return empty array when no adhesions found', async () => {
      // Arrange
      mockAdhesionRepository.findCompaniesByAdhesionDateRange.mockResolvedValue(
        [],
      );

      // Act
      const result = await getCompaniesAdheredUseCase.execute();

      // Assert
      expect(result).toEqual([]);
    });

    it('should calculate correct date range for last month', async () => {
      // Arrange
      const mockDate = new Date('2025-10-15'); // October 15th
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      mockAdhesionRepository.findCompaniesByAdhesionDateRange.mockResolvedValue(
        [],
      );

      // Act
      await getCompaniesAdheredUseCase.execute();

      // Assert
      const [[startDate, endDate]] =
        mockAdhesionRepository.findCompaniesByAdhesionDateRange.mock.calls;
      expect(startDate.getMonth()).toBe(8); // September (0-indexed)
      expect(startDate.getDate()).toBe(1);
      expect(endDate.getMonth()).toBe(8); // September
      expect(endDate.getDate()).toBe(30);

      jest.useRealTimers();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockAdhesionRepository.findCompaniesByAdhesionDateRange.mockRejectedValue(
        error,
      );

      // Act & Assert
      await expect(getCompaniesAdheredUseCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('RegisterCompanyAdhesionUseCase', () => {
    describe('PYME Company Registration', () => {
      const pymeDto: RegisterCompanyAdhesionDto = {
        name: 'Nueva Pyme',
        cuit: '20-98765432-1',
        email: 'nueva@pyme.com',
        type: 'PYME',
        employeeCount: 25,
        annualRevenue: 45000000,
      };

      it('should register a new PYME company adhesion successfully', async () => {
        // Arrange
        mockCompanyRepository.findByCuit.mockResolvedValue(null);
        mockCompanyRepository.findByEmail.mockResolvedValue(null);
        mockCompanyRepository.save.mockImplementation(
          async (company) => company,
        );

        const expectedAdhesion = new Adhesion('adhesion-123', testCompanyPyme);
        mockAdhesionRepository.save.mockResolvedValue(expectedAdhesion);

        // Act
        const result = await registerAdhesionUseCase.execute(pymeDto);

        // Assert
        expect(mockCompanyRepository.findByCuit).toHaveBeenCalledWith(
          pymeDto.cuit,
        );
        expect(mockCompanyRepository.findByEmail).toHaveBeenCalledWith(
          pymeDto.email,
        );
        expect(mockCompanyRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            name: pymeDto.name,
            cuit: pymeDto.cuit,
            email: pymeDto.email,
            type: 'PYME',
          }),
        );
        expect(mockAdhesionRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            company: expect.any(CompanyPyme),
            status: 'PENDING',
          }),
        );
        expect(result).toBe(expectedAdhesion);
      });

      it('should throw error when PYME is missing required fields', async () => {
        // Arrange
        const invalidDto = { ...pymeDto, employeeCount: undefined };

        mockCompanyRepository.findByCuit.mockResolvedValue(null);
        mockCompanyRepository.findByEmail.mockResolvedValue(null);

        // Act & Assert
        await expect(
          registerAdhesionUseCase.execute(invalidDto),
        ).rejects.toThrow(
          'Employee count and annual revenue are required for PYME companies',
        );
      });
    });

    describe('Corporativa Company Registration', () => {
      const corporativaDto: RegisterCompanyAdhesionDto = {
        name: 'Nueva Corporativa',
        cuit: '30-98765432-9',
        email: 'nueva@corporativa.com',
        type: 'CORPORATIVA',
        sector: 'Technology',
        isMultinational: true,
        stockSymbol: 'NCORP',
      };

      it('should register a new Corporativa company adhesion successfully', async () => {
        // Arrange
        mockCompanyRepository.findByCuit.mockResolvedValue(null);
        mockCompanyRepository.findByEmail.mockResolvedValue(null);
        mockCompanyRepository.save.mockImplementation(
          async (company) => company,
        );

        const expectedAdhesion = new Adhesion(
          'adhesion-123',
          testCompanyCorporativa,
        );
        mockAdhesionRepository.save.mockResolvedValue(expectedAdhesion);

        // Act
        const result = await registerAdhesionUseCase.execute(corporativaDto);

        // Assert
        expect(mockCompanyRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            name: corporativaDto.name,
            cuit: corporativaDto.cuit,
            email: corporativaDto.email,
            type: 'CORPORATIVA',
            sector: corporativaDto.sector,
            isMultinational: corporativaDto.isMultinational,
            stockSymbol: corporativaDto.stockSymbol,
          }),
        );
        expect(result).toBe(expectedAdhesion);
      });

      it('should throw error when Corporativa is missing required fields', async () => {
        // Arrange
        const invalidDto = { ...corporativaDto, sector: undefined };

        mockCompanyRepository.findByCuit.mockResolvedValue(null);
        mockCompanyRepository.findByEmail.mockResolvedValue(null);

        // Act & Assert
        await expect(
          registerAdhesionUseCase.execute(invalidDto),
        ).rejects.toThrow(
          'Sector and multinational status are required for Corporate companies',
        );
      });
    });

    describe('Validation Rules', () => {
      const validDto: RegisterCompanyAdhesionDto = {
        name: 'Test Company',
        cuit: '20-11111111-1',
        email: 'test@company.com',
        type: 'PYME',
        employeeCount: 10,
        annualRevenue: 1000000,
      };

      it('should throw error when company with same CUIT already exists', async () => {
        // Arrange
        mockCompanyRepository.findByCuit.mockResolvedValue(testCompanyPyme);

        // Act & Assert
        await expect(registerAdhesionUseCase.execute(validDto)).rejects.toThrow(
          `Company with CUIT ${validDto.cuit} already exists`,
        );

        expect(mockCompanyRepository.findByEmail).not.toHaveBeenCalled();
        expect(mockCompanyRepository.save).not.toHaveBeenCalled();
      });

      it('should throw error when company with same email already exists', async () => {
        // Arrange
        mockCompanyRepository.findByCuit.mockResolvedValue(null);
        mockCompanyRepository.findByEmail.mockResolvedValue(testCompanyPyme);

        // Act & Assert
        await expect(registerAdhesionUseCase.execute(validDto)).rejects.toThrow(
          `Company with email ${validDto.email} already exists`,
        );

        expect(mockCompanyRepository.save).not.toHaveBeenCalled();
      });

      it('should generate unique IDs for company and adhesion', async () => {
        // Arrange
        mockCompanyRepository.findByCuit.mockResolvedValue(null);
        mockCompanyRepository.findByEmail.mockResolvedValue(null);
        mockCompanyRepository.save.mockImplementation(
          async (company) => company,
        );
        mockAdhesionRepository.save.mockImplementation(
          async (adhesion) => adhesion,
        );

        // Mock Math.random to return predictable values
        const originalMathRandom = Math.random;
        let callCount = 0;
        Math.random = jest.fn(() => {
          callCount++;
          return callCount === 1 ? 0.123456789 : 0.987654321;
        });

        // Act
        const result = await registerAdhesionUseCase.execute(validDto);

        // Assert
        expect(Math.random).toHaveBeenCalledTimes(2);
        expect(result.id).toBeDefined();
        expect(result.company.id).toBeDefined();
        expect(result.id).not.toBe(result.company.id);

        // Restore Math.random
        Math.random = originalMathRandom;
      });

      it('should handle company save errors', async () => {
        // Arrange
        const error = new Error('Database save failed');

        mockCompanyRepository.findByCuit.mockResolvedValue(null);
        mockCompanyRepository.findByEmail.mockResolvedValue(null);
        mockCompanyRepository.save.mockRejectedValue(error);

        // Act & Assert
        await expect(registerAdhesionUseCase.execute(validDto)).rejects.toThrow(
          'Database save failed',
        );
        expect(mockAdhesionRepository.save).not.toHaveBeenCalled();
      });

      it('should handle adhesion save errors', async () => {
        // Arrange
        const error = new Error('Adhesion save failed');

        mockCompanyRepository.findByCuit.mockResolvedValue(null);
        mockCompanyRepository.findByEmail.mockResolvedValue(null);
        mockCompanyRepository.save.mockImplementation(
          async (company) => company,
        );
        mockAdhesionRepository.save.mockRejectedValue(error);

        // Act & Assert
        await expect(registerAdhesionUseCase.execute(validDto)).rejects.toThrow(
          'Adhesion save failed',
        );
      });
    });
  });

  describe('Integration Between Use Cases', () => {
    it('should work correctly when registering company and then querying it', async () => {
      // Arrange
      const dto: RegisterCompanyAdhesionDto = {
        name: 'Integration Test Company',
        cuit: '20-55555555-5',
        email: 'integration@test.com',
        type: 'PYME',
        employeeCount: 50,
        annualRevenue: 40000000,
      };

      // Setup for registration
      mockCompanyRepository.findByCuit.mockResolvedValue(null);
      mockCompanyRepository.findByEmail.mockResolvedValue(null);
      mockCompanyRepository.save.mockImplementation(async (company) => company);
      mockAdhesionRepository.save.mockImplementation(
        async (adhesion) => adhesion,
      );

      // Register company
      const adhesion = await registerAdhesionUseCase.execute(dto);
      const savedCompany = adhesion.company;

      // Setup for querying adhesions
      mockAdhesionRepository.findCompaniesByAdhesionDateRange.mockResolvedValue(
        [savedCompany],
      );

      // Act
      const companiesWithAdhesions = await getCompaniesAdheredUseCase.execute();

      // Assert
      expect(companiesWithAdhesions).toContain(savedCompany);
      expect(companiesWithAdhesions[0].name).toBe(dto.name);
      expect(companiesWithAdhesions[0].cuit).toBe(dto.cuit);
    });
  });
});
