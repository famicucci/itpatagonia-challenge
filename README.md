# IT Patagonia Challenge - API de Gestión de Empresas

## 📋 Descripción

API desarrollada para el challenge técnico de IT Patagonia. Implementa un sistema de gestión de empresas con sus transferencias y adhesiones, construido con **NestJS** y **arquitectura hexagonal**.

## 🏗️ Arquitectura

### Arquitectura Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────┐
│                Infrastructure                   │
│  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   Controllers   │  │    Repositories     │  │
│  │                 │  │      (Mock)         │  │
│  └─────────────────┘  └─────────────────────┘  │
└─────────────────┬───────────────┬───────────────┘
                  │               │
┌─────────────────▼───────────────▼───────────────┐
│                Application                      │
│  ┌─────────────────────────────────────────────┐ │
│  │             Use Cases                       │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────┘
                          │
┌─────────────────────────▼───────────────────────┐
│                  Domain                         │
│  ┌──────────────┐  ┌─────────────────────────┐  │
│  │   Entities   │  │      Interfaces         │  │
│  │              │  │    (Repositories)       │  │
│  └──────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Capas de la Aplicación

- **🎯 Domain**: Entidades y reglas de negocio
- **⚙️ Application**: Casos de uso y lógica de aplicación
- **🏗️ Infrastructure**: Controladores, repositorios y adaptadores

## 🚀 Funcionalidades

### Endpoints Implementados

1. **GET** `/companies/transfers/last-month`
   - Obtiene empresas que realizaron transferencias en el último mes

2. **GET** `/companies/adhesions/last-month`
   - Obtiene empresas que se adhirieron en el último mes

3. **POST** `/companies/adhesions`
   - Registra la adhesión de una nueva empresa (PYME o Corporativa)

## 🛠️ Tecnologías

- **NestJS** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Arquitectura Hexagonal** - Patrón arquitectónico

## 📦 Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd itpatagonia-challenge

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con auto-reload)
npm run start:dev

# Ejecutar en modo producción
npm run start:prod
```

## 🏃‍♂️ Ejecución

### Modo Desarrollo

```bash
npm run start:dev
```

El servidor se ejecuta en `http://localhost:3000` con auto-reload activado.

### Modo Producción

```bash
npm run build
npm run start:prod
```

## 📚 Uso de la API

### 1. Obtener empresas con transferencias del último mes

```bash
GET http://localhost:3000/companies/transfers/last-month
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "TechStart Solutions",
      "cuit": "20-12345678-5",
      "email": "contact@techstart.com",
      "type": "PYME",
      "employeeCount": 15,
      "annualRevenue": 2500000,
      "createdAt": "2025-09-10T00:00:00.000Z"
    }
  ],
  "message": "Found 4 companies that made transfers in the last month",
  "totalCount": 4
}
```

### 2. Obtener empresas adheridas en el último mes

```bash
GET http://localhost:3000/companies/adhesions/last-month
```

### 3. Registrar nueva adhesión de empresa

```bash
POST http://localhost:3000/companies/adhesions
Content-Type: application/json

# Para empresa PYME
{
  "name": "Nueva PYME SRL",
  "cuit": "20-99999999-9",
  "email": "info@nuevapyme.com",
  "type": "PYME",
  "employeeCount": 25,
  "annualRevenue": 3000000
}

# Para empresa Corporativa
{
  "name": "Nueva Corporación SA",
  "cuit": "30-88888888-8",
  "email": "contact@nuevacorp.com",
  "type": "CORPORATIVA",
  "sector": "Tecnología",
  "isMultinational": false,
  "stockSymbol": "NCS"
}
```

## 🏢 Entidades del Dominio

### Company (Abstracta)

- **CompanyPyme**: Empresas pequeñas y medianas
  - `employeeCount`: Número de empleados (1-250)
  - `annualRevenue`: Facturación anual (límite: $50M ARS)

- **CompanyCorporativa**: Empresas corporativas
  - `sector`: Sector industrial
  - `isMultinational`: Indicador multinacional
  - `stockSymbol`: Símbolo bursátil (opcional)

### Transfer

- Transferencias realizadas por las empresas
- Validación de formatos de cuenta bancaria argentina
- Soporte para múltiples monedas (ARS, USD, EUR)

### Adhesion

- Proceso de adhesión de empresas al sistema
- Estados: PENDING, APPROVED, REJECTED
- Historial completo de adhesiones

### Ventajas de la Arquitectura

✅ **Testeable**: Fácil mockear dependencias  
✅ **Mantenible**: Separación clara de responsabilidades  
✅ **Escalable**: Fácil agregar nuevas funcionalidades  
✅ **Flexible**: Intercambiar implementaciones sin cambiar lógica

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests end-to-end
npm run test:e2e

# Generar reporte de cobertura
npm run test:cov
```

## 👨‍💻 Autor

**Francisco Micucci**  
Challenge técnico para IT Patagonia
