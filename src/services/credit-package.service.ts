import { apiFetch, ApiPaths } from '../utils/api'
import type { CreditPackage, CreateCreditPackageRequest } from '../types'

export const creditPackageService = {
  async getAllCreditPackages(): Promise<CreditPackage[]> {
    return apiFetch<CreditPackage[]>(ApiPaths.creditPackages)
  },

  async getCreditPackageById(id: string): Promise<CreditPackage> {
    return apiFetch<CreditPackage>(ApiPaths.creditPackageById(id))
  },

  async createCreditPackage(packageData: CreateCreditPackageRequest): Promise<CreditPackage> {
    return apiFetch<CreditPackage>(ApiPaths.creditPackages, {
      method: 'POST',
      body: packageData
    })
  },

  async updateCreditPackage(id: string, packageData: Partial<CreditPackage>): Promise<CreditPackage> {
    return apiFetch<CreditPackage>(ApiPaths.creditPackageById(id), {
      method: 'PUT',
      body: packageData
    })
  },

  async deleteCreditPackage(id: string): Promise<void> {
    return apiFetch<void>(ApiPaths.creditPackageById(id), {
      method: 'DELETE'
    })
  },

  async getActiveCreditPackages(): Promise<CreditPackage[]> {
    return apiFetch<CreditPackage[]>(ApiPaths.activeCreditPackages)
  }
}
