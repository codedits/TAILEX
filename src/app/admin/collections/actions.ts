'use server'

import * as api from '@/lib/api/collections'

export async function createCollection(formData: FormData) {
  return api.createCollection(formData)
}

export async function updateCollection(formData: FormData) {
  return api.updateCollection(formData)
}

export async function deleteCollection(id: string) {
  return api.deleteCollection(id)
}
