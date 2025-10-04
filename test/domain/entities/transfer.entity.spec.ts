import { Transfer } from '../../../src/domain/entities/transfer.entity';

describe('Transfer', () => {
  describe('Constructor', () => {
    it('should create a valid transfer', () => {
      // Arrange
      const id = '1';
      const companyId = '1';
      const amount = 150000;
      const currency = 'ARS';
      const destinationAccount = '0001-0001-0001-12345678';
      const description = 'Pago a proveedor de software';
      const transferDate = new Date('2025-09-15');

      // Act
      const transfer = new Transfer(
        id,
        companyId,
        amount,
        currency,
        destinationAccount,
        description,
        transferDate,
      );

      // Assert
      expect(transfer.id).toBe(id);
      expect(transfer.companyId).toBe(companyId);
      expect(transfer.amount).toBe(amount);
      expect(transfer.currency).toBe(currency);
      expect(transfer.destinationAccount).toBe(destinationAccount);
      expect(transfer.description).toBe(description);
      expect(transfer.transferDate).toBe(transferDate);
    });

    it('should create transfer with default date when not provided', () => {
      // Arrange
      const beforeCreation = new Date();

      // Act
      const transfer = new Transfer(
        '1',
        '1',
        100000,
        'ARS',
        '0001-0001-0001-12345678',
        'Test transfer',
      );

      // Assert
      const afterCreation = new Date();
      expect(transfer.transferDate.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(transfer.transferDate.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });

    it('should throw error when ID is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '', // Empty ID
          '1',
          100000,
          'ARS',
          '0001-0001-0001-12345678',
          'Test transfer',
        );
      }).toThrow('Transfer ID is required');
    });

    it('should throw error when company ID is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '', // Empty company ID
          100000,
          'ARS',
          '0001-0001-0001-12345678',
          'Test transfer',
        );
      }).toThrow('Company ID is required');
    });

    it('should throw error when amount is zero', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          0, // Zero amount
          'ARS',
          '0001-0001-0001-12345678',
          'Test transfer',
        );
      }).toThrow('Transfer amount must be positive');
    });

    it('should throw error when amount is negative', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          -1000, // Negative amount
          'ARS',
          '0001-0001-0001-12345678',
          'Test transfer',
        );
      }).toThrow('Transfer amount must be positive');
    });

    it('should throw error when currency is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          100000,
          '', // Empty currency
          '0001-0001-0001-12345678',
          'Test transfer',
        );
      }).toThrow('Currency is required');
    });

    it('should throw error for invalid currency', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          100000,
          'BTC', // Invalid currency
          '0001-0001-0001-12345678',
          'Test transfer',
        );
      }).toThrow('Currency must be ARS, USD, or EUR');
    });

    it('should accept valid currencies', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          100000,
          'ARS',
          '0001-0001-0001-12345678',
          'Test ARS',
        );
      }).not.toThrow();

      expect(() => {
        new Transfer(
          '2',
          '1',
          100000,
          'USD',
          '0001-0001-0001-12345678',
          'Test USD',
        );
      }).not.toThrow();

      expect(() => {
        new Transfer(
          '3',
          '1',
          100000,
          'EUR',
          '0001-0001-0001-12345678',
          'Test EUR',
        );
      }).not.toThrow();
    });

    it('should throw error when destination account is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          100000,
          'ARS',
          '', // Empty account
          'Test transfer',
        );
      }).toThrow('Destination account is required');
    });

    it('should throw error for invalid account number format', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          100000,
          'ARS',
          '123456789', // Invalid format
          'Test transfer',
        );
      }).toThrow('Invalid destination account format');
    });

    it('should accept valid account number format', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          100000,
          'ARS',
          '0001-0001-0001-12345678', // Valid format
          'Test transfer',
        );
      }).not.toThrow();
    });

    it('should throw error when description is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '1',
          100000,
          'ARS',
          '0001-0001-0001-12345678',
          '', // Empty description
        );
      }).toThrow('Transfer description is required');
    });
  });

  describe('toJSON', () => {
    it('should return complete transfer information as JSON', () => {
      // Arrange
      const transferDate = new Date('2025-09-15');
      const transfer = new Transfer(
        '1',
        '1',
        150000,
        'ARS',
        '0001-0001-0001-12345678',
        'Pago a proveedor de software',
        transferDate,
      );

      // Act
      const json = transfer.toJSON();

      // Assert
      expect(json).toEqual({
        id: '1',
        companyId: '1',
        amount: 150000,
        currency: 'ARS',
        destinationAccount: '0001-0001-0001-12345678',
        description: 'Pago a proveedor de software',
        transferDate,
      });
    });
  });
});
