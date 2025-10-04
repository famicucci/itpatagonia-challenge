export enum CompanyType {
  PYME = 'PYME',
  CORPORATIVA = 'CORPORATIVA',
}

export abstract class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly cuit: string,
    public readonly email: string,
    public readonly type: CompanyType,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validateCompany();
  }

  private validateCompany(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Company ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Company name is required');
    }

    if (!this.cuit || this.cuit.trim().length === 0) {
      throw new Error('CUIT is required');
    }

    if (!this.isValidCuit(this.cuit)) {
      throw new Error('Invalid CUIT format');
    }

    if (!this.email || this.email.trim().length === 0) {
      throw new Error('Company email is required');
    }

    if (!this.isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }
  }

  private isValidCuit(cuit: string): boolean {
    // CUIT format: XX-XXXXXXXX-X (11 digits)
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    return cuitRegex.test(cuit);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  abstract getCompanyTypeSpecificInfo(): Record<string, any>;

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      cuit: this.cuit,
      email: this.email,
      type: this.type,
      createdAt: this.createdAt,
      ...this.getCompanyTypeSpecificInfo(),
    };
  }
}
