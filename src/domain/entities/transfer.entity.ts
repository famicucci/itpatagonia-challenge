export class Transfer {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly destinationAccount: string,
    public readonly description: string,
    public readonly transferDate: Date = new Date(),
  ) {
    this.validateTransfer();
  }

  private validateTransfer(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Transfer ID is required');
    }

    if (!this.companyId || this.companyId.trim().length === 0) {
      throw new Error('Company ID is required');
    }

    if (this.amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error('Currency is required');
    }

    if (!['ARS', 'USD', 'EUR'].includes(this.currency)) {
      throw new Error('Currency must be ARS, USD, or EUR');
    }

    if (
      !this.destinationAccount ||
      this.destinationAccount.trim().length === 0
    ) {
      throw new Error('Destination account is required');
    }

    if (!this.isValidAccountNumber(this.destinationAccount)) {
      throw new Error('Invalid destination account format');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Transfer description is required');
    }
  }

  private isValidAccountNumber(account: string): boolean {
    // Formato cuenta bancaria argentina: XXXX-XXXX-XXXX-XXXXXXXX
    const accountRegex = /^\d{4}-\d{4}-\d{4}-\d{8}$/;
    return accountRegex.test(account);
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      amount: this.amount,
      currency: this.currency,
      destinationAccount: this.destinationAccount,
      description: this.description,
      transferDate: this.transferDate,
    };
  }
}
