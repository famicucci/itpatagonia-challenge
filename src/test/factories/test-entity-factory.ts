import { Company } from '../../domain/entities/company.entity';
import { CompanyPyme } from '../../domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../domain/entities/company-corporativa.entity';
import { Transfer } from '../../domain/entities/transfer.entity';
import { Adhesion } from '../../domain/entities/adhesion.entity';

/**
 * Factory class for creating test entities with valid data
 */
export class TestEntityFactory {
  /**
   * Creates a valid PYME company for testing
   */
  static createPymeCompany(
    overrides: Partial<{
      id: string;
      cuit: string;
      name: string;
      email: string;
      employeeCount: number;
      annualRevenue: number;
      createdAt: Date;
    }> = {},
  ): CompanyPyme {
    const defaults = {
      id: 'test-pyme-' + Math.random().toString(36).substr(2, 9),
      cuit: '20-12345678-9',
      name: 'Test PYME Company',
      email: 'test.pyme@company.com',
      employeeCount: 25,
      annualRevenue: 5000000,
      createdAt: new Date(),
    };

    const data = { ...defaults, ...overrides };
    return new CompanyPyme(
      data.id,
      data.name,
      data.cuit,
      data.email,
      data.employeeCount,
      data.annualRevenue,
      data.createdAt,
    );
  }

  /**
   * Creates a valid CORPORATIVA company for testing
   */
  static createCorporativaCompany(
    overrides: Partial<{
      id: string;
      cuit: string;
      name: string;
      email: string;
      sector: string;
      isMultinational: boolean;
      stockSymbol?: string;
      createdAt: Date;
    }> = {},
  ): CompanyCorporativa {
    const defaults = {
      id: 'test-corp-' + Math.random().toString(36).substr(2, 9),
      cuit: '30-87654321-2',
      name: 'Test CORPORATIVA Company',
      email: 'test.corporativa@company.com',
      sector: 'Technology',
      isMultinational: true,
      stockSymbol: 'TST',
      createdAt: new Date(),
    };

    const data = { ...defaults, ...overrides };
    return new CompanyCorporativa(
      data.id,
      data.name,
      data.cuit,
      data.email,
      data.sector,
      data.isMultinational,
      data.stockSymbol,
      data.createdAt,
    );
  }

  /**
   * Creates a valid Transfer for testing
   */
  static createTransfer(
    overrides: Partial<{
      id: string;
      companyId: string;
      amount: number;
      currency: string;
      destinationAccount: string;
      description: string;
      transferDate: Date;
    }> = {},
  ): Transfer {
    const defaults = {
      id: 'test-transfer-' + Math.random().toString(36).substr(2, 9),
      companyId: 'test-company-id',
      amount: 10000,
      currency: 'ARS',
      destinationAccount: '1234-5678-9012-34567890',
      description: 'Test transfer',
      transferDate: new Date('2024-10-01'),
    };

    const data = { ...defaults, ...overrides };
    return new Transfer(
      data.id,
      data.companyId,
      data.amount,
      data.currency,
      data.destinationAccount,
      data.description,
      data.transferDate,
    );
  }

  /**
   * Creates a valid Adhesion for testing
   */
  static createAdhesion(
    overrides: Partial<{
      id: string;
      company: Company;
      adhesionDate: Date;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
    }> = {},
  ): Adhesion {
    const defaultCompany = this.createPymeCompany();
    const defaults = {
      id: 'test-adhesion-' + Math.random().toString(36).substr(2, 9),
      company: defaultCompany,
      adhesionDate: new Date('2024-10-01'),
      status: 'PENDING' as const,
    };

    const data = { ...defaults, ...overrides };
    return new Adhesion(data.id, data.company, data.adhesionDate, data.status);
  }

  /**
   * Creates multiple PYME companies for testing
   */
  static createMultiplePymeCompanies(count: number): CompanyPyme[] {
    return Array.from({ length: count }, (_, index) =>
      this.createPymeCompany({
        cuit: `20-${String(12345678 + index).padStart(8, '0')}-9`,
        name: `Test PYME Company ${index + 1}`,
        email: `test.pyme${index + 1}@company.com`,
        employeeCount: 20 + index * 5,
        annualRevenue: 4000000 + index * 1000000,
      }),
    );
  }

  /**
   * Creates multiple CORPORATIVA companies for testing
   */
  static createMultipleCorporativaCompanies(
    count: number,
  ): CompanyCorporativa[] {
    const sectors = [
      'Technology',
      'Finance',
      'Healthcare',
      'Manufacturing',
      'Retail',
    ];

    return Array.from({ length: count }, (_, index) =>
      this.createCorporativaCompany({
        cuit: `30-${String(87654321 + index).padStart(8, '0')}-2`,
        name: `Test CORPORATIVA Company ${index + 1}`,
        email: `test.corporativa${index + 1}@company.com`,
        sector: sectors[index % sectors.length],
        isMultinational: index % 2 === 0,
        stockSymbol: `TST${index + 1}`,
      }),
    );
  }

  /**
   * Creates transfers for a specific company
   */
  static createTransfersForCompany(
    companyId: string,
    count: number,
  ): Transfer[] {
    return Array.from({ length: count }, (_, index) => {
      const date = new Date('2024-10-01');
      date.setDate(date.getDate() + index);

      return this.createTransfer({
        destinationAccount: `${String(1234 + index).padStart(4, '0')}-${String(5678 + index).padStart(4, '0')}-${String(9012 + index).padStart(4, '0')}-${String(34567890 + index).padStart(8, '0')}`,
        amount: 10000 + index * 5000,
        description: `Test transfer ${index + 1}`,
        transferDate: date,
        companyId,
      });
    });
  }

  /**
   * Creates adhesions for a specific company
   */
  static createAdhesionsForCompany(
    company: Company,
    count: number,
  ): Adhesion[] {
    const statuses: Array<'PENDING' | 'APPROVED' | 'REJECTED'> = [
      'PENDING',
      'APPROVED',
      'REJECTED',
    ];

    return Array.from({ length: count }, (_, index) => {
      const date = new Date('2024-09-01');
      date.setDate(date.getDate() + index * 7); // Weekly intervals

      return this.createAdhesion({
        adhesionDate: date,
        status: statuses[index % statuses.length],
        company,
      });
    });
  }

  /**
   * Creates a complete test scenario with companies, transfers, and adhesions
   */
  static createCompleteTestScenario(): {
    pymeCompanies: CompanyPyme[];
    corporativaCompanies: CompanyCorporativa[];
    transfers: Transfer[];
    adhesions: Adhesion[];
  } {
    const pymeCompanies = this.createMultiplePymeCompanies(3);
    const corporativaCompanies = this.createMultipleCorporativaCompanies(2);

    const allCompanies = [...pymeCompanies, ...corporativaCompanies];

    const transfers = allCompanies.flatMap((company) =>
      this.createTransfersForCompany(company.id, 2),
    );

    const adhesions = allCompanies.flatMap((company) =>
      this.createAdhesionsForCompany(company, 1),
    );

    return {
      pymeCompanies,
      corporativaCompanies,
      transfers,
      adhesions,
    };
  }
}
