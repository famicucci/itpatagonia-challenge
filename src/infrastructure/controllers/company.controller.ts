import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  GetCompaniesWithTransfersLastMonthUseCase,
  GetCompaniesAdheredLastMonthUseCase,
  RegisterCompanyAdhesionUseCase,
} from '../../application/use-cases/company.use-cases';
import type { RegisterCompanyAdhesionDto } from '../../application/use-cases/company.use-cases';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly getCompaniesWithTransfersLastMonthUseCase: GetCompaniesWithTransfersLastMonthUseCase,
    private readonly getCompaniesAdheredLastMonthUseCase: GetCompaniesAdheredLastMonthUseCase,
    private readonly registerCompanyAdhesionUseCase: RegisterCompanyAdhesionUseCase,
  ) {}

  @Get('transfers/last-month')
  async getCompaniesWithTransfersLastMonth() {
    try {
      const companies =
        await this.getCompaniesWithTransfersLastMonthUseCase.execute();

      return {
        success: true,
        data: companies.map((company) => company.toJSON()),
        message: `Found ${companies.length} companies that made transfers in the last month`,
        totalCount: companies.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error retrieving companies with transfers from last month',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('adhesions/last-month')
  async getCompaniesAdheredLastMonth() {
    try {
      const companies =
        await this.getCompaniesAdheredLastMonthUseCase.execute();

      return {
        success: true,
        data: companies.map((company) => company.toJSON()),
        message: `Found ${companies.length} companies that adhered in the last month`,
        totalCount: companies.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error retrieving companies that adhered in the last month',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('adhesions')
  async registerCompanyAdhesion(@Body() dto: RegisterCompanyAdhesionDto) {
    try {
      // Validaciones básicas del DTO
      this.validateRegisterAdhesionDto(dto);

      const adhesion = await this.registerCompanyAdhesionUseCase.execute(dto);

      return {
        success: true,
        data: adhesion.toJSON(),
        message: 'Company adhesion registered successfully',
      };
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw new HttpException(
          {
            success: false,
            message: 'Company registration failed',
            error: error.message,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (
        error.message.includes('required') ||
        error.message.includes('Invalid')
      ) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid company data',
            error: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: 'Error registering company adhesion',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateRegisterAdhesionDto(dto: RegisterCompanyAdhesionDto): void {
    if (!dto.name?.trim()) {
      throw new Error('Company name is required');
    }

    if (!dto.cuit?.trim()) {
      throw new Error('CUIT is required');
    }

    if (!dto.email?.trim()) {
      throw new Error('Email is required');
    }

    if (!dto.type || !['PYME', 'CORPORATIVA'].includes(dto.type)) {
      throw new Error('Company type must be PYME or CORPORATIVA');
    }

    if (dto.type === 'PYME') {
      if (!dto.employeeCount || dto.employeeCount <= 0) {
        throw new Error(
          'Employee count is required and must be positive for PYME companies',
        );
      }
      if (!dto.annualRevenue || dto.annualRevenue <= 0) {
        throw new Error(
          'Annual revenue is required and must be positive for PYME companies',
        );
      }
    }

    if (dto.type === 'CORPORATIVA') {
      if (!dto.sector?.trim()) {
        throw new Error('Sector is required for Corporate companies');
      }
      if (dto.isMultinational === undefined || dto.isMultinational === null) {
        throw new Error(
          'Multinational status is required for Corporate companies',
        );
      }
    }
  }
}
