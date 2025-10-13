import { apiFetch, ApiPaths } from '../utils/api'
import type { Voucher, CreateVoucherRequest, UseVoucherRequest } from '../types'

export const voucherService = {
  async getAllVouchers(): Promise<Voucher[]> {
    return apiFetch<Voucher[]>(ApiPaths.vouchers)
  },

  async getVoucherById(id: string): Promise<Voucher> {
    return apiFetch<Voucher>(ApiPaths.voucherByCode(id))
  },

  async createVoucher(voucherData: CreateVoucherRequest): Promise<Voucher> {
    return apiFetch<Voucher>(ApiPaths.vouchers, {
      method: 'POST',
      body: voucherData
    })
  },

  async updateVoucher(id: string, voucherData: Partial<Voucher>): Promise<Voucher> {
    return apiFetch<Voucher>(ApiPaths.voucherByCode(id), {
      method: 'PUT',
      body: voucherData
    })
  },

  async deleteVoucher(id: string): Promise<void> {
    return apiFetch<void>(ApiPaths.voucherByCode(id), {
      method: 'DELETE'
    })
  },

  async useVoucher(voucherData: UseVoucherRequest): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(ApiPaths.voucherUse(voucherData.code), {
      method: 'POST',
      body: voucherData
    })
  },

  async bulkCreateVouchers(vouchers: CreateVoucherRequest[]): Promise<Voucher[]> {
    return apiFetch<Voucher[]>(ApiPaths.voucherBulk, {
      method: 'POST',
      body: { vouchers }
    })
  }
}
