import { Transfer } from '../transfer.entity';

describe('Transfer', () => {
  describe('Constructor', () => {
    it('should create a valid transfer', () => {
      // Arrange
      const id = '1';
      const companyId = 'company-1';
      const amount = 1000000;
      const currency = 'ARS';
      const destinationAccount = '1234-5678-9012-34567890';
      const description = 'Payment for services';
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

    it('should create transfer with default current date', () => {
      // Arrange
      const beforeCreation = new Date();

      // Act
      const transfer = new Transfer(
        '1',
        'company-1',
        500000,
        'USD',
        '9876-5432-1098-76543210',
        'Monthly payment',
      );

      const afterCreation = new Date();

      // Assert
      expect(transfer.transferDate.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(transfer.transferDate.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });

    it('should throw error when amount is negative', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          'company-1',
          -1000, // Negative amount
          'ARS',
          '1234-5678-9012-34567890',
          'Invalid transfer',
        );
      }).toThrow('Transfer amount must be positive');
    });

    it('should throw error when amount is zero', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          'company-1',
          0, // Zero amount
          'ARS',
          '1234-5678-9012-34567890',
          'Invalid transfer',
        );
      }).toThrow('Transfer amount must be positive');
    });

    it('should throw error when companyId is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          '', // Empty companyId
          1000,
          'ARS',
          '1234-5678-9012-34567890',
          'Invalid transfer',
        );
      }).toThrow('Company ID is required');
    });

    it('should throw error when currency is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          'company-1',
          1000,
          '', // Empty currency
          '1234-5678-9012-34567890',
          'Invalid transfer',
        );
      }).toThrow('Currency is required');
    });

    it('should throw error when currency is invalid', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          'company-1',
          1000,
          'GBP', // Invalid currency
          '1234-5678-9012-34567890',
          'Invalid transfer',
        );
      }).toThrow('Currency must be ARS, USD, or EUR');
    });

    it('should throw error when destinationAccount is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          'company-1',
          1000,
          'ARS',
          '', // Empty destination account
          'Invalid transfer',
        );
      }).toThrow('Destination account is required');
    });

    it('should throw error when description is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Transfer(
          '1',
          'company-1',
          1000,
          'ARS',
          '1234-5678-9012-34567890',
          '', // Empty description
        );
      }).toThrow('Transfer description is required');
    });

    it('should accept ARS currency', () => {
      // Arrange & Act
      const transfer = new Transfer(
        '1',
        'company-1',
        1000,
        'ARS',
        '1234-5678-9012-34567890',
        'ARS transfer',
      );

      // Assert
      expect(transfer.currency).toBe('ARS');
    });

    it('should accept USD currency', () => {
      // Arrange & Act
      const transfer = new Transfer(
        '1',
        'company-1',
        1000,
        'USD',
        '1234-5678-9012-34567890',
        'USD transfer',
      );

      // Assert
      expect(transfer.currency).toBe('USD');
    });

    it('should accept EUR currency', () => {
      // Arrange & Act
      const transfer = new Transfer(
        '1',
        'company-1',
        1000,
        'EUR',
        '1234-5678-9012-34567890',
        'EUR transfer',
      );

      // Assert
      expect(transfer.currency).toBe('EUR');
    });

    it('should accept very large amounts', () => {
      // Arrange & Act
      const transfer = new Transfer(
        '1',
        'company-1',
        999999999999,
        'ARS',
        '1234-5678-9012-34567890',
        'Large transfer',
      );

      // Assert
      expect(transfer.amount).toBe(999999999999);
    });

    it('should accept minimal positive amount', () => {
      // Arrange & Act
      const transfer = new Transfer(
        '1',
        'company-1',
        0.01,
        'USD',
        '1234-5678-9012-34567890',
        'Minimal transfer',
      );

      // Assert
      expect(transfer.amount).toBe(0.01);
    });
  });

  describe('toJSON', () => {
    it('should return complete transfer information as JSON', () => {
      // Arrange
      const transferDate = new Date('2025-09-15T10:30:00Z');
      const transfer = new Transfer(
        '1',
        'company-1',
        1000000,
        'ARS',
        '1234-5678-9012-34567890',
        'Payment for services',
        transferDate,
      );

      // Act
      const json = transfer.toJSON();

      // Assert
      expect(json).toEqual({
        id: '1',
        companyId: 'company-1',
        amount: 1000000,
        currency: 'ARS',
        destinationAccount: '1234-5678-9012-34567890',
        description: 'Payment for services',
        transferDate,
      });
    });

    it('should return JSON with default date', () => {
      // Arrange
      const transfer = new Transfer(
        '2',
        'company-a',
        500000,
        'USD',
        '9876-5432-1098-76543210',
        'Monthly subscription',
      );

      // Act
      const json = transfer.toJSON();

      // Assert
      expect(json.id).toBe('2');
      expect(json.companyId).toBe('company-a');
      expect(json.amount).toBe(500000);
      expect(json.currency).toBe('USD');
      expect(json.destinationAccount).toBe('9876-5432-1098-76543210');
      expect(json.description).toBe('Monthly subscription');
      expect(json.transferDate).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle decimal amounts correctly', () => {
      // Arrange & Act
      const transfer = new Transfer(
        '1',
        'company-1',
        1234.56,
        'EUR',
        '1234-5678-9012-34567890',
        'Decimal amount transfer',
      );

      // Assert
      expect(transfer.amount).toBe(1234.56);
    });

    it('should handle long company IDs', () => {
      // Arrange
      const longCompanyId =
        'very-long-company-identifier-with-many-characters-123456789';

      // Act
      const transfer = new Transfer(
        '1',
        longCompanyId,
        1000,
        'ARS',
        '1234-5678-9012-34567890',
        'Transfer with long company ID',
      );

      // Assert
      expect(transfer.companyId).toBe(longCompanyId);
    });

    it('should handle long descriptions', () => {
      // Arrange
      const longDescription =
        'This is a very long description that explains in detail the purpose of this transfer, including all the business context, legal requirements, and additional information that might be relevant for accounting and auditing purposes. It contains multiple sentences and provides comprehensive information about the transaction.';

      // Act
      const transfer = new Transfer(
        '1',
        'company-1',
        1000,
        'ARS',
        '1234-5678-9012-34567890',
        longDescription,
      );

      // Assert
      expect(transfer.description).toBe(longDescription);
    });

    it('should handle special characters in description', () => {
      // Arrange
      const specialDescription =
        'Pago por servicios 2025 - Facturación mensual (50% descuento aplicado) #Invoice-001 @company.com';

      // Act
      const transfer = new Transfer(
        '1',
        'company-1',
        1000,
        'ARS',
        '1234-5678-9012-34567890',
        specialDescription,
      );

      // Assert
      expect(transfer.description).toBe(specialDescription);
    });

    it('should handle future dates', () => {
      // Arrange
      const futureDate = new Date('2026-12-31T23:59:59Z');

      // Act
      const transfer = new Transfer(
        '1',
        'company-1',
        1000,
        'USD',
        '1234-5678-9012-34567890',
        'Future scheduled transfer',
        futureDate,
      );

      // Assert
      expect(transfer.transferDate).toBe(futureDate);
    });

    it('should handle past dates', () => {
      // Arrange
      const pastDate = new Date('2020-01-01T00:00:00Z');

      // Act
      const transfer = new Transfer(
        '1',
        'company-1',
        1000,
        'EUR',
        '1234-5678-9012-34567890',
        'Historical transfer',
        pastDate,
      );

      // Assert
      expect(transfer.transferDate).toBe(pastDate);
    });
  });
});
