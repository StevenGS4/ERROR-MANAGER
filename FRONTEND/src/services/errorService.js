import { callCrud } from './api';

// Normalizamos las respuestas de tu bitácora
function unwrap(res) {
  const rows = Array.isArray(res?.data) ? res.data.flat() : [];
  return { ok: !!res?.success, rows, status: res?.status, message: res?.messageUSR };
}

export async function fetchErrors({ skip = 0, top = 100 } = {}) {
  const res = await callCrud('getAll', {}, { skip, top });
  return unwrap(res);
}

export async function fetchErrorById(id) {
  const res = await callCrud('getOne', {}, { id });
  return unwrap(res);
}

export async function createError(error) {
  const res = await callCrud('add', {}, { data: error });
  return unwrap(res);
}

export async function updateError(error) {
  const res = await callCrud('update', {}, { data: error });
  return unwrap(res);
}

