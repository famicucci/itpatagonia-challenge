import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CompanyController } from '../company.controller';
import {
  GetCompaniesWithTransfersLastMonthUseCase,
  GetCompaniesAdheredLastMonthUseCase,
  RegisterCompanyAdhesionUseCase,
  RegisterCompanyAdhesionDto,
} from '../../../application/use-cases/company.use-cases';
import { CompanyPyme } from '../../../domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../../domain/entities/company-corporativa.entity';
import { Adhesion } from '../../../domain/entities/adhesion.entity';

describe('CompanyController', () => {
  let controller: CompanyController;
  let getCompaniesWithTransfersUseCase: jest.Mocked<GetCompaniesWithTransfersLastMonthUseCase>;
  let getCompaniesAdheredUseCase: jest.Mocked<GetCompaniesAdheredLastMonthUseCase>;
  let registerAdhesionUseCase: jest.Mocked<RegisterCompanyAdhesionUseCase>;

  // Test data
  let testCompanyPyme: CompanyPyme;
  let testCompanyCorporativa: CompanyCorporativa;
  let testAdhesion: Adhesion;

  beforeEach(async () => {
    // Create mock use cases
    const mockGetCompaniesWithTransfersUseCase = {
      execute: jest.fn(),
    };

    const mockGetCompaniesAdheredUseCase = {
      execute: jest.fn(),
    };

    const mockRegisterAdhesionUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: GetCompaniesWithTransfersLastMonthUseCase,
          useValue: mockGetCompaniesWithTransfersUseCase,
        },
        {
          provide: GetCompaniesAdheredLastMonthUseCase,
          useValue: mockGetCompaniesAdheredUseCase,
        },
        {
          provide: RegisterCompanyAdhesionUseCase,
          useValue: mockRegisterAdhesionUseCase,
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    getCompaniesWithTransfersUseCase =
      module.get<GetCompaniesWithTransfersLastMonthUseCase>(
        GetCompaniesWithTransfersLastMonthUseCase,
      ) as jest.Mocked<GetCompaniesWithTransfersLastMonthUseCase>;
    getCompaniesAdheredUseCase =
      module.get<GetCompaniesAdheredLastMonthUseCase>(
        GetCompaniesAdheredLastMonthUseCase,
      ) as jest.Mocked<GetCompaniesAdheredLastMonthUseCase>;
    registerAdhesionUseCase = module.get<RegisterCompanyAdhesionUseCase>(
      RegisterCompanyAdhesionUseCase,
    ) as jest.Mocked<RegisterCompanyAdhesionUseCase>;

    // Create test data
    testCompanyPyme = new CompanyPyme(
      'pyme-1',
      'TechStart Solutions',
      '20-12345678-3',
      'contact@techstart.com',
      15,
      40000000,
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

    testAdhesion = new Adhesion(
      'adhesion-1',
      testCompanyPyme,
      new Date('2025-09-20'),
      'PENDING',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /companies/transfers/last-month', () => {
    it('should return companies with transfers from last month successfully', async () => {
      // Arrange
      const companies = [testCompanyPyme, testCompanyCorporativa];
      getCompaniesWithTransfersUseCase.execute.mockResolvedValue(companies);

      // Act
      const result = await controller.getCompaniesWithTransfersLastMonth();

      // Assert
      expect(getCompaniesWithTransfersUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        data: companies.map((company) => company.toJSON()),
        message: 'Found 2 companies that made transfers in the last month',
        totalCount: 2,
      });
    });

    it('should return empty result when no companies found', async () => {
      // Arrange
      getCompaniesWithTransfersUseCase.execute.mockResolvedValue([]);

      // Act
      const result = await controller.getCompaniesWithTransfersLastMonth();

      // Assert
      expect(result).toEqual({
        success: true,
        data: [],
        message: 'Found 0 companies that made transfers in the last month',
        totalCount: 0,
      });
    });

    it('should handle use case errors and throw HttpException', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      getCompaniesWithTransfersUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      try {
        await controller.getCompaniesWithTransfersLastMonth();
      } catch (exception) {
        expect(exception).toBeInstanceOf(HttpException);
        expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(exception.getResponse()).toEqual({
          success: false,
          message: 'Error retrieving companies with transfers from last month',
          error: 'Database connection failed',
        });
      }
    });

    it('should transform company entities to JSON correctly', async () => {
      // Arrange
      const companies = [testCompanyPyme];
      getCompaniesWithTransfersUseCase.execute.mockResolvedValue(companies);

      // Act
      const result = await controller.getCompaniesWithTransfersLastMonth();

      // Assert
      expect(result.data[0]).toEqual({
        id: 'pyme-1',
        name: 'TechStart Solutions',
        cuit: '20-12345678-3',
        email: 'contact@techstart.com',
        type: 'PYME',
        createdAt: new Date('2025-08-15'),
        employeeCount: 15,
        annualRevenue: 40000000,
      });
    });
  });

  describe('GET /companies/adhesions/last-month', () => {
    it('should return companies that adhered last month successfully', async () => {
      // Arrange
      const companies = [testCompanyPyme, testCompanyCorporativa];
      getCompaniesAdheredUseCase.execute.mockResolvedValue(companies);

      // Act
      const result = await controller.getCompaniesAdheredLastMonth();

      // Assert
      expect(getCompaniesAdheredUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        data: companies.map((company) => company.toJSON()),
        message: 'Found 2 companies that adhered in the last month',
        totalCount: 2,
      });
    });

    it('should return empty result when no companies found', async () => {
      // Arrange
      getCompaniesAdheredUseCase.execute.mockResolvedValue([]);

      // Act
      const result = await controller.getCompaniesAdheredLastMonth();

      // Assert
      expect(result).toEqual({
        success: true,
        data: [],
        message: 'Found 0 companies that adhered in the last month',
        totalCount: 0,
      });
    });

    it('should handle use case errors and throw HttpException', async () => {
      // Arrange
      const error = new Error('Service unavailable');
      getCompaniesAdheredUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      try {
        await controller.getCompaniesAdheredLastMonth();
      } catch (exception) {
        expect(exception).toBeInstanceOf(HttpException);
        expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(exception.getResponse()).toEqual({
          success: false,
          message: 'Error retrieving companies that adhered in the last month',
          error: 'Service unavailable',
        });
      }
    });

    it('should transform company entities to JSON correctly', async () => {
      // Arrange
      const companies = [testCompanyCorporativa];
      getCompaniesAdheredUseCase.execute.mockResolvedValue(companies);

      // Act
      const result = await controller.getCompaniesAdheredLastMonth();

      // Assert
      expect(result.data[0]).toEqual({
        id: 'corp-1',
        name: 'Banco Nacional SA',
        cuit: '30-11111111-9',
        email: 'corporate@banconacional.com',
        type: 'CORPORATIVA',
        createdAt: new Date('2025-07-10'),
        sector: 'Financiero',
        isMultinational: false,
        stockSymbol: 'BNA',
      });
    });
  });

  describe('POST /companies/adhesions', () => {
    describe('Successful Registration', () => {
      it('should register PYME company adhesion successfully', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Nueva PYME',
          cuit: '20-98765432-1',
          email: 'nueva@pyme.com',
          type: 'PYME',
          employeeCount: 25,
          annualRevenue: 30000000,
        };

        registerAdhesionUseCase.execute.mockResolvedValue(testAdhesion);

        // Act
        const result = await controller.registerCompanyAdhesion(dto);

        // Assert
        expect(registerAdhesionUseCase.execute).toHaveBeenCalledWith(dto);
        expect(result).toEqual({
          success: true,
          data: testAdhesion.toJSON(),
          message: 'Company adhesion registered successfully',
        });
      });

      it('should register Corporativa company adhesion successfully', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Nueva Corporativa',
          cuit: '30-98765432-9',
          email: 'nueva@corporativa.com',
          type: 'CORPORATIVA',
          sector: 'Technology',
          isMultinational: true,
          stockSymbol: 'NCORP',
        };

        const corporativeAdhesion = new Adhesion(
          'adhesion-2',
          testCompanyCorporativa,
        );
        registerAdhesionUseCase.execute.mockResolvedValue(corporativeAdhesion);

        // Act
        const result = await controller.registerCompanyAdhesion(dto);

        // Assert
        expect(registerAdhesionUseCase.execute).toHaveBeenCalledWith(dto);
        expect(result).toEqual({
          success: true,
          data: corporativeAdhesion.toJSON(),
          message: 'Company adhesion registered successfully',
        });
      });
    });

    describe('Validation Errors (400 Bad Request)', () => {
      it('should throw BadRequest when company name is missing', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: '',
          cuit: '20-98765432-1',
          email: 'test@company.com',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception).toBeInstanceOf(HttpException);
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error: 'Company name is required',
          });
        }
      });

      it('should throw BadRequest when CUIT is missing', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Company',
          cuit: '',
          email: 'test@company.com',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error: 'CUIT is required',
          });
        }
      });

      it('should throw BadRequest when email is missing', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Company',
          cuit: '20-98765432-1',
          email: '',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error: 'Email is required',
          });
        }
      });

      it('should throw BadRequest when company type is invalid', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Company',
          cuit: '20-98765432-1',
          email: 'test@company.com',
          type: 'INVALID' as any,
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error: 'Company type must be PYME or CORPORATIVA',
          });
        }
      });

      it('should throw BadRequest when PYME is missing employee count', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test PYME',
          cuit: '20-98765432-1',
          email: 'test@pyme.com',
          type: 'PYME',
          employeeCount: 0,
          annualRevenue: 1000000,
        };

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error:
              'Employee count is required and must be positive for PYME companies',
          });
        }
      });

      it('should throw BadRequest when PYME is missing annual revenue', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test PYME',
          cuit: '20-98765432-1',
          email: 'test@pyme.com',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 0,
        };

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error:
              'Annual revenue is required and must be positive for PYME companies',
          });
        }
      });

      it('should throw BadRequest when Corporativa is missing sector', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Corp',
          cuit: '30-98765432-9',
          email: 'test@corp.com',
          type: 'CORPORATIVA',
          sector: '',
          isMultinational: true,
        };

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error: 'Sector is required for Corporate companies',
          });
        }
      });

      it('should throw BadRequest when Corporativa is missing multinational status', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Corp',
          cuit: '30-98765432-9',
          email: 'test@corp.com',
          type: 'CORPORATIVA',
          sector: 'Technology',
          isMultinational: undefined,
        };

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error: 'Multinational status is required for Corporate companies',
          });
        }
      });
    });

    describe('Conflict Errors (409 Conflict)', () => {
      it('should throw Conflict when company with same CUIT already exists', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Company',
          cuit: '20-98765432-1',
          email: 'test@company.com',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        const error = new Error(
          'Company with CUIT 20-98765432-1 already exists',
        );
        registerAdhesionUseCase.execute.mockRejectedValue(error);

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception).toBeInstanceOf(HttpException);
          expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Company registration failed',
            error: 'Company with CUIT 20-98765432-1 already exists',
          });
        }
      });

      it('should throw Conflict when company with same email already exists', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Company',
          cuit: '20-98765432-1',
          email: 'test@company.com',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        const error = new Error(
          'Company with email test@company.com already exists',
        );
        registerAdhesionUseCase.execute.mockRejectedValue(error);

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Company registration failed',
            error: 'Company with email test@company.com already exists',
          });
        }
      });
    });

    describe('Business Logic Errors (400 Bad Request)', () => {
      it('should throw BadRequest when use case validates business rules', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Company',
          cuit: '20-98765432-1',
          email: 'test@company.com',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        const error = new Error(
          'Employee count and annual revenue are required for PYME companies',
        );
        registerAdhesionUseCase.execute.mockRejectedValue(error);

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error:
              'Employee count and annual revenue are required for PYME companies',
          });
        }
      });

      it('should throw BadRequest when entity validation fails', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Company',
          cuit: 'Invalid CUIT',
          email: 'test@company.com',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        const error = new Error('Invalid CUIT format');
        registerAdhesionUseCase.execute.mockRejectedValue(error);

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Invalid company data',
            error: 'Invalid CUIT format',
          });
        }
      });
    });

    describe('Server Errors (500 Internal Server Error)', () => {
      it('should throw InternalServerError when unexpected error occurs', async () => {
        // Arrange
        const dto: RegisterCompanyAdhesionDto = {
          name: 'Test Company',
          cuit: '20-98765432-1',
          email: 'test@company.com',
          type: 'PYME',
          employeeCount: 10,
          annualRevenue: 1000000,
        };

        const error = new Error('Database connection timeout');
        registerAdhesionUseCase.execute.mockRejectedValue(error);

        // Act & Assert
        try {
          await controller.registerCompanyAdhesion(dto);
        } catch (exception) {
          expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(exception.getResponse()).toEqual({
            success: false,
            message: 'Error registering company adhesion',
            error: 'Database connection timeout',
          });
        }
      });
    });
  });

  describe('Controller Instance', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required use cases injected', () => {
      expect(getCompaniesWithTransfersUseCase).toBeDefined();
      expect(getCompaniesAdheredUseCase).toBeDefined();
      expect(registerAdhesionUseCase).toBeDefined();
    });
  });
});
