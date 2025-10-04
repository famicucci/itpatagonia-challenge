import { Company } from './company.entity';

export class Adhesion {
  constructor(
    public readonly id: string,
    public readonly company: Company,
    public readonly adhesionDate: Date = new Date(),
    public readonly status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING',
  ) {
    this.validateAdhesion();
  }

  private validateAdhesion(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Adhesion ID is required');
    }

    if (!this.company) {
      throw new Error('Company is required for adhesion');
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(this.status)) {
      throw new Error('Invalid adhesion status');
    }
  }

  approve(): Adhesion {
    return new Adhesion(this.id, this.company, this.adhesionDate, 'APPROVED');
  }

  reject(): Adhesion {
    return new Adhesion(this.id, this.company, this.adhesionDate, 'REJECTED');
  }

  toJSON() {
    return {
      id: this.id,
      company: this.company.toJSON(),
      adhesionDate: this.adhesionDate,
      status: this.status,
    };
  }
}
