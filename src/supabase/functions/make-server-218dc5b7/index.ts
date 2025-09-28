import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from '../server/kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Initialize storage bucket
const initStorage = async () => {
  const bucketName = 'make-218dc5b7-fueltrakr-photos'
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false
    })
    if (error) {
      console.log('Error creating bucket:', error)
    } else {
      console.log('Storage bucket created successfully')
    }
  }
}

// Initialize demo users
const initDemoUsers = async () => {
  try {
    console.log('Initializing demo users...')
    
    // Try to create admin user
    try {
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@napleton.com',
        password: 'admin123',
        user_metadata: { name: 'Admin User' },
        email_confirm: true
      })

      if (!adminError && adminData.user) {
        await kv.set(`user:${adminData.user.id}`, {
          id: adminData.user.id,
          email: 'admin@napleton.com',
          name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        console.log('✅ Demo admin user created successfully')
      } else {
        console.log('⚠️ Admin user creation error:', adminError?.message || 'Unknown error')
      }
    } catch (adminCreateError) {
      console.log('⚠️ Admin user may already exist:', adminCreateError)
    }

    // Try to create porter user
    try {
      const { data: porterData, error: porterError } = await supabase.auth.admin.createUser({
        email: 'porter@napleton.com',
        password: 'porter123',
        user_metadata: { name: 'John Porter' },
        email_confirm: true
      })

      if (!porterError && porterData.user) {
        await kv.set(`user:${porterData.user.id}`, {
          id: porterData.user.id,
          email: 'porter@napleton.com',
          name: 'John Porter',
          role: 'porter',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        console.log('✅ Demo porter user created successfully')
      } else {
        console.log('⚠️ Porter user creation error:', porterError?.message || 'Unknown error')
      }
    } catch (porterCreateError) {
      console.log('⚠️ Porter user may already exist:', porterCreateError)
    }

    console.log('Demo users initialization complete')
  } catch (error) {
    console.log('❌ Error initializing demo users:', error)
  }
}

// Initialize on startup
initStorage()
initDemoUsers()

// Authentication middleware for protected routes
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401)
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401)
  }

  c.set('user', user)
  await next()
}

// Routes
app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Setup demo users (can be called manually)
app.post('/setup-demo-users', async (c) => {
  try {
    console.log('Manual demo user setup requested...')
    
    const results = {
      admin: { success: false, message: '', id: null },
      porter: { success: false, message: '', id: null }
    }

    // Create admin user
    try {
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@napleton.com',
        password: 'admin123',
        user_metadata: { name: 'Admin User' },
        email_confirm: true
      })

      if (!adminError && adminData.user) {
        await kv.set(`user:${adminData.user.id}`, {
          id: adminData.user.id,
          email: 'admin@napleton.com',
          name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        results.admin = { success: true, message: 'Created successfully', id: adminData.user.id }
      } else {
        results.admin = { success: false, message: adminError?.message || 'Unknown error', id: null }
      }
    } catch (error: any) {
      results.admin = { success: false, message: error?.message || 'User may already exist', id: null }
    }

    // Create porter user
    try {
      const { data: porterData, error: porterError } = await supabase.auth.admin.createUser({
        email: 'porter@napleton.com',
        password: 'porter123',
        user_metadata: { name: 'John Porter' },
        email_confirm: true
      })

      if (!porterError && porterData.user) {
        await kv.set(`user:${porterData.user.id}`, {
          id: porterData.user.id,
          email: 'porter@napleton.com',
          name: 'John Porter',
          role: 'porter',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        results.porter = { success: true, message: 'Created successfully', id: porterData.user.id }
      } else {
        results.porter = { success: false, message: porterError?.message || 'Unknown error', id: null }
      }
    } catch (error: any) {
      results.porter = { success: false, message: error?.message || 'User may already exist', id: null }
    }

    return c.json({
      message: 'Demo user setup completed',
      results
    })
  } catch (error) {
    console.log('Setup demo users error:', error)
    return c.json({ error: 'Failed to setup demo users' }, 500)
  }
})

// User signup
app.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    // Validate Napleton email domain
    if (!email.endsWith('@napleton.com')) {
      return c.json({ 
        error: 'Only Napleton email addresses are allowed' 
      }, 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since email server not configured
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'porter', // Default role
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    return c.json({ 
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email,
        name,
        role: 'porter'
      }
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

// Get user profile
app.get('/profile', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const profile = await kv.get(`user:${user.id}`)
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    return c.json(profile)
  } catch (error) {
    console.log('Profile fetch error:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// Create fuel entry
app.post('/fuel-entries', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const entryData = await c.req.json()
    
    const fuelEntry = {
      id: crypto.randomUUID(),
      user_id: user.id,
      ...entryData,
      created_at: new Date().toISOString()
    }

    await kv.set(`fuel_entry:${fuelEntry.id}`, fuelEntry)
    
    // Also store in user's fuel entries list
    const userEntriesKey = `user_fuel_entries:${user.id}`
    const existingEntries = await kv.get(userEntriesKey) || []
    await kv.set(userEntriesKey, [...existingEntries, fuelEntry.id])

    return c.json(fuelEntry)
  } catch (error) {
    console.log('Create fuel entry error:', error)
    return c.json({ error: 'Failed to create fuel entry' }, 500)
  }
})

// Get fuel entries for user
app.get('/fuel-entries', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const userProfile = await kv.get(`user:${user.id}`)
    
    if (userProfile?.role === 'admin') {
      // Admin can see all entries
      const allEntries = await kv.getByPrefix('fuel_entry:')
      return c.json(allEntries)
    } else {
      // Regular users see only their entries
      const userEntriesKey = `user_fuel_entries:${user.id}`
      const entryIds = await kv.get(userEntriesKey) || []
      
      const entries = []
      for (const entryId of entryIds) {
        const entry = await kv.get(`fuel_entry:${entryId}`)
        if (entry) entries.push(entry)
      }
      
      return c.json(entries)
    }
  } catch (error) {
    console.log('Get fuel entries error:', error)
    return c.json({ error: 'Failed to fetch fuel entries' }, 500)
  }
})

// Upload photo
app.post('/upload-photo', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const formData = await c.req.formData()
    const file = formData.get('photo') as File
    
    if (!file) {
      return c.json({ error: 'No photo provided' }, 400)
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`
    const bucketName = 'make-218dc5b7-fueltrakr-photos'

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file)

    if (error) {
      console.log('Upload error:', error)
      return c.json({ error: 'Failed to upload photo' }, 500)
    }

    // Create signed URL for frontend access
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7 days

    return c.json({ 
      path: data.path,
      url: signedUrlData?.signedUrl 
    })
  } catch (error) {
    console.log('Upload photo error:', error)
    return c.json({ error: 'Failed to upload photo' }, 500)
  }
})

// Admin: Get all users
app.get('/admin/users', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const userProfile = await kv.get(`user:${user.id}`)
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const users = await kv.getByPrefix('user:')
    return c.json(users)
  } catch (error) {
    console.log('Get users error:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Admin: Update user role
app.put('/admin/users/:userId/role', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const userProfile = await kv.get(`user:${user.id}`)
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const userId = c.req.param('userId')
    const { role } = await c.req.json()
    
    const targetUser = await kv.get(`user:${userId}`)
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404)
    }

    const updatedUser = {
      ...targetUser,
      role,
      updated_at: new Date().toISOString()
    }

    await kv.set(`user:${userId}`, updatedUser)
    return c.json(updatedUser)
  } catch (error) {
    console.log('Update user role error:', error)
    return c.json({ error: 'Failed to update user role' }, 500)
  }
})

// Admin: Delete user
app.delete('/admin/users/:userId', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const userProfile = await kv.get(`user:${user.id}`)
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const userId = c.req.param('userId')
    
    // Delete user profile
    await kv.del(`user:${userId}`)
    
    // Delete user's fuel entries
    const userEntriesKey = `user_fuel_entries:${userId}`
    const entryIds = await kv.get(userEntriesKey) || []
    
    for (const entryId of entryIds) {
      await kv.del(`fuel_entry:${entryId}`)
    }
    
    await kv.del(userEntriesKey)

    return c.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.log('Delete user error:', error)
    return c.json({ error: 'Failed to delete user' }, 500)
  }
})

// Admin: Export data
app.get('/admin/export', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const userProfile = await kv.get(`user:${user.id}`)
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const entries = await kv.getByPrefix('fuel_entry:')
    const users = await kv.getByPrefix('user:')

    // Create CSV data
    const csvHeaders = [
      'Entry ID', 'User Name', 'User Email', 'Stock Number', 'VIN',
      'Gallons', 'Price Per Gallon', 'Total Amount', 'Odometer',
      'Fuel Type', 'Location', 'Timestamp', 'Notes'
    ]

    const csvRows = entries.map(entry => {
      const entryUser = users.find(u => u.id === entry.user_id)
      return [
        entry.id,
        entryUser?.name || '',
        entryUser?.email || '',
        entry.stock_number,
        entry.vin || '',
        entry.gallons,
        entry.price_per_gallon,
        entry.total_amount,
        entry.odometer,
        entry.fuel_type,
        entry.location,
        entry.timestamp,
        entry.notes || ''
      ].map(field => `"${field}"`).join(',')
    })

    const csv = [csvHeaders.join(','), ...csvRows].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="fueltrakr-export.csv"'
      }
    })
  } catch (error) {
    console.log('Export data error:', error)
    return c.json({ error: 'Failed to export data' }, 500)
  }
})

Deno.serve(app.fetch)