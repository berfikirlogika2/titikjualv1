// src/midtransService.js
import { supabase } from './supabaseClient';

export async function createMidtransTransaction(payload) {
  try {
    // Memanggil Supabase Edge Function untuk menghindari CORS & menyembunyikan Server Key
    const { data, error } = await supabase.functions.invoke('create-midtrans-transaction', {
      body: payload
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return data; // Mengembalikan token snap
  } catch (error) {
    console.error('Midtrans API Error:', error);
    throw error;
  }
}