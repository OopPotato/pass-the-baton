import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jzcbdougoorsklimeibt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Y2Jkb3Vnb29yc2tsaW1laWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODg3NzEsImV4cCI6MjA4OTE2NDc3MX0.6jf9lNx8Ri38neALsyqMYAi5oeebj7bEaNwczL4xOHM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
