import { CompanyPyme } from '../company-pyme.entity';

describe('CompanyPyme', () => {
  describe('Constructor', () => {
    it('should create a valid PYME company', () => {
      // Arrange
      const id = '1';
      const name = 'TechStart Solutions';
      const cuit = '20-12345678-5';
      const email = 'contact@techstart.com';
      const employeeCount = 15;
      const annualRevenue = 2500000;
      const createdAt = new Date('2025-09-10');

      // Act
      const company = new CompanyPyme(
        id,
        name,
        cuit,
        email,
        employeeCount,
        annualRevenue,
        createdAt,
      );

      // Assert
      expect(company.id).toBe(id);
      expect(company.name).toBe(name);
      expect(company.cuit).toBe(cuit);
      expect(company.email).toBe(email);
      expect(company.type).toBe('PYME');
      expect(company.employeeCount).toBe(employeeCount);
      expect(company.annualRevenue).toBe(annualRevenue);
      expect(company.createdAt).toBe(createdAt);
    });

    it('should throw error when employee count is 0', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyPyme(
          '1',
          'Test Company',
          '20-12345678-5',
          'test@company.com',
          0, // Invalid employee count
          1000000,
        );
      }).toThrow('PYME must have between 1 and 250 employees');
    });

    it('should throw error when employee count exceeds 250', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyPyme(
          '1',
          'Test Company',
          '20-12345678-5',
          'test@company.com',
          251, // Invalid employee count
          1000000,
        );
      }).toThrow('PYME must have between 1 and 250 employees');
    });

    it('should throw error when annual revenue is negative', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyPyme(
          '1',
          'Test Company',
          '20-12345678-5',
          'test@company.com',
          50,
          -1000, // Invalid revenue
        );
      }).toThrow('Annual revenue must be positive');
    });

    it('should throw error when annual revenue exceeds PYME limit', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyPyme(
          '1',
          'Test Company',
          '20-12345678-5',
          'test@company.com',
          50,
          50000001, // Exceeds PYME limit
        );
      }).toThrow('PYME annual revenue cannot exceed $50M ARS');
    });

    it('should throw error when company name is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyPyme(
          '1',
          '', // Empty name
          '20-12345678-5',
          'test@company.com',
          50,
          1000000,
        );
      }).toThrow('Company name is required');
    });

    it('should throw error when CUIT format is invalid', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyPyme(
          '1',
          'Test Company',
          '12345678', // Invalid CUIT format
          'test@company.com',
          50,
          1000000,
        );
      }).toThrow('Invalid CUIT format');
    });

    it('should throw error when email format is invalid', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyPyme(
          '1',
          'Test Company',
          '20-12345678-5',
          'invalid-email', // Invalid email
          50,
          1000000,
        );
      }).toThrow('Invalid email format');
    });
  });

  describe('getCompanyTypeSpecificInfo', () => {
    it('should return PYME specific information', () => {
      // Arrange
      const company = new CompanyPyme(
        '1',
        'Test Company',
        '20-12345678-5',
        'test@company.com',
        50,
        1000000,
      );

      // Act
      const specificInfo = company.getCompanyTypeSpecificInfo();

      // Assert
      expect(specificInfo).toEqual({
        employeeCount: 50,
        annualRevenue: 1000000,
      });
    });
  });

  describe('toJSON', () => {
    it('should return complete company information as JSON', () => {
      // Arrange
      const createdAt = new Date('2025-09-10');
      const company = new CompanyPyme(
        '1',
        'TechStart Solutions',
        '20-12345678-5',
        'contact@techstart.com',
        15,
        2500000,
        createdAt,
      );

      // Act
      const json = company.toJSON();

      // Assert
      expect(json).toEqual({
        id: '1',
        name: 'TechStart Solutions',
        cuit: '20-12345678-5',
        email: 'contact@techstart.com',
        type: 'PYME',
        createdAt,
        employeeCount: 15,
        annualRevenue: 2500000,
      });
    });
  });
});
