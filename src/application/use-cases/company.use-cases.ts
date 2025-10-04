import { Injectable, Inject } from '@nestjs/common';
import { Company } from '../../domain/entities/company.entity';
import { Adhesion } from '../../domain/entities/adhesion.entity';
import { CompanyPyme } from '../../domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../domain/entities/company-corporativa.entity';
import type { CompanyRepository } from '../../domain/repositories/company.repository.interface';
import type { TransferRepository } from '../../domain/repositories/transfer.repository.interface';
import type { AdhesionRepository } from '../../domain/repositories/adhesion.repository.interface';
import {
  COMPANY_REPOSITORY_TOKEN,
  TRANSFER_REPOSITORY_TOKEN,
  ADHESION_REPOSITORY_TOKEN,
} from '../../domain/repositories/tokens';

@Injectable()
export class GetCompaniesWithTransfersLastMonthUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepository: CompanyRepository,
    @Inject(TRANSFER_REPOSITORY_TOKEN)
    private readonly transferRepository: TransferRepository,
  ) {}

  async execute(): Promise<Company[]> {
    const lastMonth = this.getLastMonthDateRange();

    // Obtener IDs de empresas que realizaron transferencias en el último mes
    const companyIds =
      await this.transferRepository.findCompaniesByTransferDateRange(
        lastMonth.start,
        lastMonth.end,
      );

    // Obtener los detalles completos de las empresas
    const companies: Company[] = [];
    for (const companyId of companyIds) {
      const company = await this.companyRepository.findById(companyId);
      if (company) {
        companies.push(company);
      }
    }

    return companies;
  }

  private getLastMonthDateRange(): { start: Date; end: Date } {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      start: lastMonth,
      end: endOfLastMonth,
    };
  }
}

@Injectable()
export class GetCompaniesAdheredLastMonthUseCase {
  constructor(
    @Inject(ADHESION_REPOSITORY_TOKEN)
    private readonly adhesionRepository: AdhesionRepository,
  ) {}

  async execute(): Promise<Company[]> {
    const lastMonth = this.getLastMonthDateRange();

    return await this.adhesionRepository.findCompaniesByAdhesionDateRange(
      lastMonth.start,
      lastMonth.end,
    );
  }

  private getLastMonthDateRange(): { start: Date; end: Date } {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      start: lastMonth,
      end: endOfLastMonth,
    };
  }
}

export interface RegisterCompanyAdhesionDto {
  name: string;
  cuit: string;
  email: string;
  type: 'PYME' | 'CORPORATIVA';
  // PYME specific
  employeeCount?: number;
  annualRevenue?: number;
  // Corporativa specific
  sector?: string;
  isMultinational?: boolean;
  stockSymbol?: string;
}

@Injectable()
export class RegisterCompanyAdhesionUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepository: CompanyRepository,
    @Inject(ADHESION_REPOSITORY_TOKEN)
    private readonly adhesionRepository: AdhesionRepository,
  ) {}

  async execute(dto: RegisterCompanyAdhesionDto): Promise<Adhesion> {
    // Validar que no exista empresa con mismo CUIT
    const existingCompanyByCuit = await this.companyRepository.findByCuit(
      dto.cuit,
    );
    if (existingCompanyByCuit) {
      throw new Error(`Company with CUIT ${dto.cuit} already exists`);
    }

    // Validar que no exista empresa con mismo email
    const existingCompanyByEmail = await this.companyRepository.findByEmail(
      dto.email,
    );
    if (existingCompanyByEmail) {
      throw new Error(`Company with email ${dto.email} already exists`);
    }

    // Crear la empresa según el tipo
    const companyId = this.generateId();
    let company: Company;

    if (dto.type === 'PYME') {
      if (!dto.employeeCount || !dto.annualRevenue) {
        throw new Error(
          'Employee count and annual revenue are required for PYME companies',
        );
      }
      company = new CompanyPyme(
        companyId,
        dto.name,
        dto.cuit,
        dto.email,
        dto.employeeCount,
        dto.annualRevenue,
      );
    } else {
      if (!dto.sector || dto.isMultinational === undefined) {
        throw new Error(
          'Sector and multinational status are required for Corporate companies',
        );
      }
      company = new CompanyCorporativa(
        companyId,
        dto.name,
        dto.cuit,
        dto.email,
        dto.sector,
        dto.isMultinational,
        dto.stockSymbol,
      );
    }

    // Guardar la empresa
    await this.companyRepository.save(company);

    // Crear la adhesión
    const adhesionId = this.generateId();
    const adhesion = new Adhesion(adhesionId, company);

    // Guardar la adhesión
    return await this.adhesionRepository.save(adhesion);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
