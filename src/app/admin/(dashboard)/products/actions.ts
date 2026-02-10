'use server'

import * as api from '@/lib/api/products'

export async function createProduct(formData: FormData) {
  console.log('Action: createProduct started');
  return api.createProduct(formData)
}

export async function updateProduct(formData: FormData) {
  console.log('Action: updateProduct started');
  return api.updateProduct(formData)
}

export async function deleteProduct(id: string) {
  return api.deleteProduct(id)
}

