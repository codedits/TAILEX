'use server'

import * as api from '@/lib/api/products'

export async function createProduct(formData: FormData) {
  return api.createProduct(formData)
}

export async function updateProduct(formData: FormData) {
  return api.updateProduct(formData)
}

export async function deleteProduct(id: string) {
  return api.deleteProduct(id)
}
