import { Company, CompanyType } from './company.entity';

export class CompanyPyme extends Company {
  constructor(
    id: string,
    name: string,
    cuit: string,
    email: string,
    public readonly employeeCount: number,
    public readonly annualRevenue: number,
    createdAt: Date = new Date(),
  ) {
    super(id, name, cuit, email, CompanyType.PYME, createdAt);
    this.validatePyme();
  }

  private validatePyme(): void {
    if (this.employeeCount < 1 || this.employeeCount > 250) {
      throw new Error('PYME must have between 1 and 250 employees');
    }

    if (this.annualRevenue <= 0) {
      throw new Error('Annual revenue must be positive');
    }

    // Validación específica para PYME según regulaciones argentinas
    if (this.annualRevenue > 50000000) {
      throw new Error('PYME annual revenue cannot exceed $50M ARS');
    }
  }

  getCompanyTypeSpecificInfo(): Record<string, any> {
    return {
      employeeCount: this.employeeCount,
      annualRevenue: this.annualRevenue,
    };
  }
}
