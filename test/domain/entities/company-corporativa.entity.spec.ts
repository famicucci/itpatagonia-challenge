import { CompanyCorporativa } from '../../../src/domain/entities/company-corporativa.entity';

describe('CompanyCorporativa', () => {
  describe('Constructor', () => {
    it('should create a valid Corporate company', () => {
      // Arrange
      const id = '1';
      const name = 'Banco Nacional SA';
      const cuit = '30-11111111-9';
      const email = 'corporate@banconacional.com';
      const sector = 'Financiero';
      const isMultinational = false;
      const stockSymbol = 'BNA';
      const createdAt = new Date('2025-08-20');

      // Act
      const company = new CompanyCorporativa(
        id,
        name,
        cuit,
        email,
        sector,
        isMultinational,
        stockSymbol,
        createdAt,
      );

      // Assert
      expect(company.id).toBe(id);
      expect(company.name).toBe(name);
      expect(company.cuit).toBe(cuit);
      expect(company.email).toBe(email);
      expect(company.type).toBe('CORPORATIVA');
      expect(company.sector).toBe(sector);
      expect(company.isMultinational).toBe(isMultinational);
      expect(company.stockSymbol).toBe(stockSymbol);
      expect(company.createdAt).toBe(createdAt);
    });

    it('should create corporate company without stock symbol', () => {
      // Arrange & Act
      const company = new CompanyCorporativa(
        '1',
        'Private Corp',
        '30-11111111-9',
        'info@privatecorp.com',
        'Technology',
        true,
      );

      // Assert
      expect(company.stockSymbol).toBeUndefined();
      expect(company.sector).toBe('Technology');
      expect(company.isMultinational).toBe(true);
    });

    it('should throw error when sector is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyCorporativa(
          '1',
          'Test Corp',
          '30-11111111-9',
          'test@corp.com',
          '', // Empty sector
          false,
        );
      }).toThrow('Corporate sector is required');
    });

    it('should throw error when stock symbol is empty string', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyCorporativa(
          '1',
          'Test Corp',
          '30-11111111-9',
          'test@corp.com',
          'Finance',
          false,
          '', // Empty stock symbol
        );
      }).toThrow('Stock symbol cannot be empty if provided');
    });

    it('should throw error when stock symbol is too short', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyCorporativa(
          '1',
          'Test Corp',
          '30-11111111-9',
          'test@corp.com',
          'Finance',
          false,
          'AB', // Too short
        );
      }).toThrow('Stock symbol must be between 3 and 5 characters');
    });

    it('should throw error when stock symbol is too long', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyCorporativa(
          '1',
          'Test Corp',
          '30-11111111-9',
          'test@corp.com',
          'Finance',
          false,
          'TOOLONG', // Too long
        );
      }).toThrow('Stock symbol must be between 3 and 5 characters');
    });

    it('should accept valid stock symbol lengths', () => {
      // Arrange & Act & Assert
      expect(() => {
        new CompanyCorporativa(
          '1',
          'Test Corp',
          '30-11111111-9',
          'test@corp.com',
          'Finance',
          false,
          'ABC', // 3 characters
        );
      }).not.toThrow();

      expect(() => {
        new CompanyCorporativa(
          '2',
          'Test Corp 2',
          '30-22222222-7',
          'test2@corp.com',
          'Finance',
          false,
          'ABCDE', // 5 characters
        );
      }).not.toThrow();
    });
  });

  describe('getCompanyTypeSpecificInfo', () => {
    it('should return Corporate specific information with stock symbol', () => {
      // Arrange
      const company = new CompanyCorporativa(
        '1',
        'Banco Nacional SA',
        '30-11111111-9',
        'corporate@banconacional.com',
        'Financiero',
        false,
        'BNA',
      );

      // Act
      const specificInfo = company.getCompanyTypeSpecificInfo();

      // Assert
      expect(specificInfo).toEqual({
        sector: 'Financiero',
        isMultinational: false,
        stockSymbol: 'BNA',
      });
    });

    it('should return Corporate specific information without stock symbol', () => {
      // Arrange
      const company = new CompanyCorporativa(
        '1',
        'Private Corp',
        '30-11111111-9',
        'info@privatecorp.com',
        'Technology',
        true,
      );

      // Act
      const specificInfo = company.getCompanyTypeSpecificInfo();

      // Assert
      expect(specificInfo).toEqual({
        sector: 'Technology',
        isMultinational: true,
        stockSymbol: undefined,
      });
    });
  });

  describe('toJSON', () => {
    it('should return complete corporate company information as JSON', () => {
      // Arrange
      const createdAt = new Date('2025-08-20');
      const company = new CompanyCorporativa(
        '1',
        'Banco Nacional SA',
        '30-11111111-9',
        'corporate@banconacional.com',
        'Financiero',
        false,
        'BNA',
        createdAt,
      );

      // Act
      const json = company.toJSON();

      // Assert
      expect(json).toEqual({
        id: '1',
        name: 'Banco Nacional SA',
        cuit: '30-11111111-9',
        email: 'corporate@banconacional.com',
        type: 'CORPORATIVA',
        createdAt,
        sector: 'Financiero',
        isMultinational: false,
        stockSymbol: 'BNA',
      });
    });
  });
});
