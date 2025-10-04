import { Company, CompanyType } from './company.entity';

export class CompanyCorporativa extends Company {
  constructor(
    id: string,
    name: string,
    cuit: string,
    email: string,
    public readonly sector: string,
    public readonly isMultinational: boolean,
    public readonly stockSymbol?: string,
    createdAt: Date = new Date(),
  ) {
    super(id, name, cuit, email, CompanyType.CORPORATIVA, createdAt);
    this.validateCorporativa();
  }

  private validateCorporativa(): void {
    if (!this.sector || this.sector.trim().length === 0) {
      throw new Error('Corporate sector is required');
    }

    if (this.stockSymbol && this.stockSymbol.trim().length === 0) {
      throw new Error('Stock symbol cannot be empty if provided');
    }

    if (
      this.stockSymbol &&
      (this.stockSymbol.length < 3 || this.stockSymbol.length > 5)
    ) {
      throw new Error('Stock symbol must be between 3 and 5 characters');
    }
  }

  getCompanyTypeSpecificInfo(): Record<string, any> {
    return {
      sector: this.sector,
      isMultinational: this.isMultinational,
      stockSymbol: this.stockSymbol,
    };
  }
}
