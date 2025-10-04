import { Test, TestingModule } from '@nestjs/testing';
import {
  GetCompaniesWithTransfersLastMonthUseCase,
  GetCompaniesAdheredLastMonthUseCase,
  RegisterCompanyAdhesionUseCase,
} from '../../../src/application/use-cases/company.use-cases';
import {
  COMPANY_REPOSITORY_TOKEN,
  TRANSFER_REPOSITORY_TOKEN,
  ADHESION_REPOSITORY_TOKEN,
} from '../../../src/domain/repositories/tokens';
import type { CompanyRepository } from '../../../src/domain/repositories/company.repository.interface';
import type { TransferRepository } from '../../../src/domain/repositories/transfer.repository.interface';
import type { AdhesionRepository } from '../../../src/domain/repositories/adhesion.repository.interface';
import { CompanyPyme } from '../../../src/domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../../src/domain/entities/company-corporativa.entity';
import { Adhesion } from '../../../src/domain/entities/adhesion.entity';

describe('Company Use Cases', () => {
  let getCompaniesWithTransfersUseCase: GetCompaniesWithTransfersLastMonthUseCase;
  let getCompaniesAdheredUseCase: GetCompaniesAdheredLastMonthUseCase;
  let registerCompanyAdhesionUseCase: RegisterCompanyAdhesionUseCase;

  let mockCompanyRepository: jest.Mocked<CompanyRepository>;
  let mockTransferRepository: jest.Mocked<TransferRepository>;
  let mockAdhesionRepository: jest.Mocked<AdhesionRepository>;

  const mockCompany1 = new CompanyPyme(
    '1',
    'TechStart Solutions',
    '20-12345678-5',
    'contact@techstart.com',
    15,
    2500000,
  );

  const mockCompany2 = new CompanyCorporativa(
    '2',
    'Banco Nacional SA',
    '30-11111111-9',
    'corporate@banconacional.com',
    'Financiero',
    false,
    'BNA',
  );

  beforeEach(async () => {
    // Create mocks
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

    const module: TestingModule = await Test.createTestingModule({
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

    getCompaniesWithTransfersUseCase =
      module.get<GetCompaniesWithTransfersLastMonthUseCase>(
        GetCompaniesWithTransfersLastMonthUseCase,
      );
    getCompaniesAdheredUseCase =
      module.get<GetCompaniesAdheredLastMonthUseCase>(
        GetCompaniesAdheredLastMonthUseCase,
      );
    registerCompanyAdhesionUseCase = module.get<RegisterCompanyAdhesionUseCase>(
      RegisterCompanyAdhesionUseCase,
    );
  });

  describe('GetCompaniesWithTransfersLastMonthUseCase', () => {
    it('should return companies that made transfers in the last month', async () => {
      // Arrange
      const companyIds = ['1', '2'];
      mockTransferRepository.findCompaniesByTransferDateRange.mockResolvedValue(
        companyIds,
      );
      mockCompanyRepository.findById
        .mockResolvedValueOnce(mockCompany1)
        .mockResolvedValueOnce(mockCompany2);

      // Act
      const result = await getCompaniesWithTransfersUseCase.execute();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockCompany1);
      expect(result[1]).toBe(mockCompany2);
      expect(
        mockTransferRepository.findCompaniesByTransferDateRange,
      ).toHaveBeenCalledWith(expect.any(Date), expect.any(Date));
      expect(mockCompanyRepository.findById).toHaveBeenCalledTimes(2);
    });

    it('should handle companies not found', async () => {
      // Arrange
      const companyIds = ['1', '999'];
      mockTransferRepository.findCompaniesByTransferDateRange.mockResolvedValue(
        companyIds,
      );
      mockCompanyRepository.findById
        .mockResolvedValueOnce(mockCompany1)
        .mockResolvedValueOnce(null);

      // Act
      const result = await getCompaniesWithTransfersUseCase.execute();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockCompany1);
    });

    it('should return empty array when no companies made transfers', async () => {
      // Arrange
      mockTransferRepository.findCompaniesByTransferDateRange.mockResolvedValue(
        [],
      );

      // Act
      const result = await getCompaniesWithTransfersUseCase.execute();

      // Assert
      expect(result).toHaveLength(0);
      expect(mockCompanyRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('GetCompaniesAdheredLastMonthUseCase', () => {
    it('should return companies that adhered in the last month', async () => {
      // Arrange
      const expectedCompanies = [mockCompany1, mockCompany2];
      mockAdhesionRepository.findCompaniesByAdhesionDateRange.mockResolvedValue(
        expectedCompanies,
      );

      // Act
      const result = await getCompaniesAdheredUseCase.execute();

      // Assert
      expect(result).toBe(expectedCompanies);
      expect(
        mockAdhesionRepository.findCompaniesByAdhesionDateRange,
      ).toHaveBeenCalledWith(expect.any(Date), expect.any(Date));
    });

    it('should return empty array when no companies adhered', async () => {
      // Arrange
      mockAdhesionRepository.findCompaniesByAdhesionDateRange.mockResolvedValue(
        [],
      );

      // Act
      const result = await getCompaniesAdheredUseCase.execute();

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('RegisterCompanyAdhesionUseCase', () => {
    it('should register PYME company adhesion successfully', async () => {
      // Arrange
      const dto = {
        name: 'Nueva PYME SRL',
        cuit: '20-99999999-9',
        email: 'info@nuevapyme.com',
        type: 'PYME' as const,
        employeeCount: 25,
        annualRevenue: 3000000,
      };

      mockCompanyRepository.findByCuit.mockResolvedValue(null);
      mockCompanyRepository.findByEmail.mockResolvedValue(null);
      mockCompanyRepository.save.mockResolvedValue(expect.any(CompanyPyme));

      const expectedAdhesion = new Adhesion('test-id', mockCompany1);
      mockAdhesionRepository.save.mockResolvedValue(expectedAdhesion);

      // Act
      const result = await registerCompanyAdhesionUseCase.execute(dto);

      // Assert
      expect(result).toBe(expectedAdhesion);
      expect(mockCompanyRepository.findByCuit).toHaveBeenCalledWith(dto.cuit);
      expect(mockCompanyRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockCompanyRepository.save).toHaveBeenCalled();
      expect(mockAdhesionRepository.save).toHaveBeenCalled();
    });

    it('should register Corporate company adhesion successfully', async () => {
      // Arrange
      const dto = {
        name: 'Nueva Corporación SA',
        cuit: '30-88888888-8',
        email: 'contact@nuevacorp.com',
        type: 'CORPORATIVA' as const,
        sector: 'Tecnología',
        isMultinational: false,
        stockSymbol: 'NCS',
      };

      mockCompanyRepository.findByCuit.mockResolvedValue(null);
      mockCompanyRepository.findByEmail.mockResolvedValue(null);
      mockCompanyRepository.save.mockResolvedValue(
        expect.any(CompanyCorporativa),
      );

      const expectedAdhesion = new Adhesion('test-id', mockCompany2);
      mockAdhesionRepository.save.mockResolvedValue(expectedAdhesion);

      // Act
      const result = await registerCompanyAdhesionUseCase.execute(dto);

      // Assert
      expect(result).toBe(expectedAdhesion);
      expect(mockCompanyRepository.save).toHaveBeenCalled();
      expect(mockAdhesionRepository.save).toHaveBeenCalled();
    });

    it('should throw error when company with CUIT already exists', async () => {
      // Arrange
      const dto = {
        name: 'Nueva PYME SRL',
        cuit: '20-99999999-9',
        email: 'info@nuevapyme.com',
        type: 'PYME' as const,
        employeeCount: 25,
        annualRevenue: 3000000,
      };

      mockCompanyRepository.findByCuit.mockResolvedValue(mockCompany1);

      // Act & Assert
      await expect(registerCompanyAdhesionUseCase.execute(dto)).rejects.toThrow(
        'Company with CUIT 20-99999999-9 already exists',
      );
      expect(mockCompanyRepository.save).not.toHaveBeenCalled();
      expect(mockAdhesionRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when company with email already exists', async () => {
      // Arrange
      const dto = {
        name: 'Nueva PYME SRL',
        cuit: '20-99999999-9',
        email: 'info@nuevapyme.com',
        type: 'PYME' as const,
        employeeCount: 25,
        annualRevenue: 3000000,
      };

      mockCompanyRepository.findByCuit.mockResolvedValue(null);
      mockCompanyRepository.findByEmail.mockResolvedValue(mockCompany1);

      // Act & Assert
      await expect(registerCompanyAdhesionUseCase.execute(dto)).rejects.toThrow(
        'Company with email info@nuevapyme.com already exists',
      );
      expect(mockCompanyRepository.save).not.toHaveBeenCalled();
      expect(mockAdhesionRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when PYME data is incomplete', async () => {
      // Arrange
      const dto = {
        name: 'Nueva PYME SRL',
        cuit: '20-99999999-9',
        email: 'info@nuevapyme.com',
        type: 'PYME' as const,
        // Missing employeeCount and annualRevenue
      };

      mockCompanyRepository.findByCuit.mockResolvedValue(null);
      mockCompanyRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(registerCompanyAdhesionUseCase.execute(dto)).rejects.toThrow(
        'Employee count and annual revenue are required for PYME companies',
      );
    });

    it('should throw error when Corporate data is incomplete', async () => {
      // Arrange
      const dto = {
        name: 'Nueva Corporación SA',
        cuit: '30-88888888-8',
        email: 'contact@nuevacorp.com',
        type: 'CORPORATIVA' as const,
        // Missing sector and isMultinational
      };

      mockCompanyRepository.findByCuit.mockResolvedValue(null);
      mockCompanyRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(registerCompanyAdhesionUseCase.execute(dto)).rejects.toThrow(
        'Sector and multinational status are required for Corporate companies',
      );
    });
  });
});
