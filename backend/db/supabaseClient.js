
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wsjsxwjblmfeugmvfknj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzanN4d2pibG1mZXVnbXZma25qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk1NTg5OCwiZXhwIjoyMDc4NTMxODk4fQ.uXKdZpThQ6KfqVDAL9qDLVtSxdW4IiV--voFMrfRATo'
export const supabase = createClient(supabaseUrl, supabaseKey)
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient('https://wsjsxwjblmfeugmvfknj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzanN4d2pibG1mZXVnbXZma25qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk1NTg5OCwiZXhwIjoyMDc4NTMxODk4fQ.uXKdZpThQ6KfqVDAL9qDLVtSxdW4IiV--voFMrfRATo')
// const { data, error } = await supabase.from('items').select('*');
// console.log(data);
