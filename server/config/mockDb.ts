// In-memory MySQL-compatible database mock
// Provides full CRUD, aggregations, filtering, sorting, and user isolation
// Used when an external MySQL instance is not available

export function createMockPool() {
  const users: any[] = [
    {
      id: 'demo-user-1',
      name: 'Alex Sterling',
      email: 'alex.sterling@expensetrack.io',
      password: '$2b$10$7l7L2fVHIJr6U9zHifUuxewR327mntMyUvejFSAri3xtLGtgrSfuG', // 'demo'
      role: 'Chief Financial Officer',
      company_name: 'Apex Enterprise Technologies',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      currency: 'INR',
      created_at: new Date('2026-01-01T00:00:00Z'),
      updated_at: new Date('2026-01-01T00:00:00Z')
    },
    {
      id: 'demo-user-2',
      name: 'Demo Administrator',
      email: 'demo@expensetrack.io',
      password: '$2b$10$7l7L2fVHIJr6U9zHifUuxewR327mntMyUvejFSAri3xtLGtgrSfuG', // 'demo'
      role: 'Chief Financial Officer',
      company_name: 'Apex Enterprise Technologies',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      currency: 'INR',
      created_at: new Date('2026-01-01T00:00:00Z'),
      updated_at: new Date('2026-01-01T00:00:00Z')
    }
  ];

  const locations: any[] = [
    { id: 'loc-chn', user_id: 'demo-user-1', name: 'Chennai', code: 'CHN-HQ', state: 'Tamil Nadu', budget_limit: 350000.00, color: '#3B82F6', description: 'Corporate Headquarters & Primary Technology Hub (Tidel Park)', created_at: new Date(), updated_at: new Date() },
    { id: 'loc-blr', user_id: 'demo-user-1', name: 'Bangalore', code: 'BLR-01', state: 'Karnataka', budget_limit: 280000.00, color: '#10B981', description: 'R&D Engineering Center & Product Design Lab (Electronic City)', created_at: new Date(), updated_at: new Date() },
    { id: 'loc-cbe', user_id: 'demo-user-1', name: 'Coimbatore', code: 'CBE-01', state: 'Tamil Nadu', budget_limit: 180000.00, color: '#8B5CF6', description: 'Regional Operations & Support Branch (Avinashi Road)', created_at: new Date(), updated_at: new Date() },
    { id: 'loc-mdu', user_id: 'demo-user-1', name: 'Madurai', code: 'MDU-01', state: 'Tamil Nadu', budget_limit: 140000.00, color: '#F59E0B', description: 'Tier-2 Development & Client Logistics Hub (Mattuthavani)', created_at: new Date(), updated_at: new Date() },
    { id: 'loc-hyd', user_id: 'demo-user-1', name: 'Hyderabad', code: 'HYD-01', state: 'Telangana', budget_limit: 220000.00, color: '#06B6D4', description: 'HITEC City Cyber Tower Operations', created_at: new Date(), updated_at: new Date() },
    { id: 'loc-koc', user_id: 'demo-user-1', name: 'Kochi', code: 'KOC-01', state: 'Kerala', budget_limit: 160000.00, color: '#EC4899', description: 'Infopark Tech Center & Maritime Logistics', created_at: new Date(), updated_at: new Date() },
    { id: 'loc-pun', user_id: 'demo-user-1', name: 'Pune', code: 'PUN-01', state: 'Maharashtra', budget_limit: 200000.00, color: '#6366F1', description: 'Hinjewadi Tech Park Engineering Hub', created_at: new Date(), updated_at: new Date() }
  ];

  const categories: any[] = [
    { id: 'cat-1', user_id: 'demo-user-1', name: 'Cloud & Infrastructure', budget_limit: 180000.00, color: '#3B82F6', created_at: new Date(), updated_at: new Date() },
    { id: 'cat-2', user_id: 'demo-user-1', name: 'Travel & Lodging', budget_limit: 120000.00, color: '#10B981', created_at: new Date(), updated_at: new Date() },
    { id: 'cat-3', user_id: 'demo-user-1', name: 'Office Supplies', budget_limit: 60000.00, color: '#8B5CF6', created_at: new Date(), updated_at: new Date() },
    { id: 'cat-4', user_id: 'demo-user-1', name: 'Meals & Entertainment', budget_limit: 50000.00, color: '#F59E0B', created_at: new Date(), updated_at: new Date() },
    { id: 'cat-5', user_id: 'demo-user-1', name: 'Software Subscriptions', budget_limit: 100000.00, color: '#EC4899', created_at: new Date(), updated_at: new Date() },
    { id: 'cat-6', user_id: 'demo-user-1', name: 'Marketing & Events', budget_limit: 90000.00, color: '#06B6D4', created_at: new Date(), updated_at: new Date() },
    { id: 'cat-7', user_id: 'demo-user-1', name: 'Utilities & Internet', budget_limit: 40000.00, color: '#EF4444', created_at: new Date(), updated_at: new Date() },
    { id: 'cat-8', user_id: 'demo-user-1', name: 'Hardware & Equipment', budget_limit: 150000.00, color: '#6366F1', created_at: new Date(), updated_at: new Date() }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const expenses: any[] = [
    { id: 'exp-1', user_id: 'demo-user-1', name: 'AWS Global Cloud Hosting', amount: 42500.00, category: 'Cloud & Infrastructure', location_id: 'loc-chn', location_name: 'Chennai', date: `${currentMonthStr}-02`, payment_method: 'Corporate Card', description: 'Monthly production VPC clusters and RDS database hosting', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-2', user_id: 'demo-user-1', name: 'Executive Team Strategy Flight', amount: 24500.00, category: 'Travel & Lodging', location_id: 'loc-blr', location_name: 'Bangalore', date: `${currentMonthStr}-03`, payment_method: 'Corporate Card', description: 'Direct flights for annual executive quarterly review', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-3', user_id: 'demo-user-1', name: 'Ergonomic Office Chairs & Desks', amount: 68000.00, category: 'Hardware & Equipment', location_id: 'loc-cbe', location_name: 'Coimbatore', date: `${currentMonthStr}-04`, payment_method: 'Bank Transfer', description: 'Furniture fit-out for 15 newly onboarded support engineers', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-4', user_id: 'demo-user-1', name: 'High-Speed Fiber Lease Line', amount: 14200.00, category: 'Utilities & Internet', location_id: 'loc-mdu', location_name: 'Madurai', date: `${currentMonthStr}-05`, payment_method: 'Net Banking', description: 'Dedicated 1Gbps enterprise internet connection line', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-5', user_id: 'demo-user-1', name: 'Enterprise Figma & GitHub Org', amount: 31000.00, category: 'Software Subscriptions', location_id: 'loc-chn', location_name: 'Chennai', date: todayStr, payment_method: 'Corporate Card', description: 'Annual developer and design system team licenses', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-6', user_id: 'demo-user-1', name: 'Client Dinner & Partner Hospitality', amount: 12800.00, category: 'Meals & Entertainment', location_id: 'loc-blr', location_name: 'Bangalore', date: `${currentMonthStr}-06`, payment_method: 'Corporate Card', description: 'Contract renewal banquet with enterprise retail client', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-7', user_id: 'demo-user-1', name: 'Regional Print Media & Promo Ads', amount: 28500.00, category: 'Marketing & Events', location_id: 'loc-cbe', location_name: 'Coimbatore', date: `${currentMonthStr}-07`, payment_method: 'UPI', description: 'Regional tech conference sponsorship banner and print kit', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-8', user_id: 'demo-user-1', name: 'MacBook Pro M3 Hardware Provision', amount: 198000.00, category: 'Hardware & Equipment', location_id: 'loc-chn', location_name: 'Chennai', date: `${currentMonthStr}-08`, payment_method: 'Bank Transfer', description: 'Laptops for senior full-stack and systems architects', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-9', user_id: 'demo-user-1', name: 'Branch Electricity & Generator Diesel', amount: 21500.00, category: 'Utilities & Internet', location_id: 'loc-mdu', location_name: 'Madurai', date: `${currentMonthStr}-09`, payment_method: 'Net Banking', description: 'Facility utility bill and backup power fuel recharge', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
    { id: 'exp-10', user_id: 'demo-user-1', name: 'Hotel Stay & Tech Summit Conference', amount: 18400.00, category: 'Travel & Lodging', location_id: 'loc-blr', location_name: 'Bangalore', date: `${currentMonthStr}-10`, payment_method: 'Corporate Card', description: 'Accommodations for Bangalore AI & Cloud symposium delegates', tax_deductible: 1, status: 'approved', created_at: new Date(), updated_at: new Date() }
  ];

  async function query(sql: string, params: any[] = []): Promise<[any, any]> {
    const rawSql = sql.trim();
    const cleanSql = rawSql.replace(/\s+/g, ' ');

    // 1. Health / Connection checks
    if (/^SELECT\s+1\s*\+\s*1/i.test(cleanSql) || /SELECT 1 as alive/i.test(cleanSql) || /SELECT DATABASE\(\)/i.test(cleanSql)) {
      return [
        [{ solution: 2, alive: 1, math: 2, db: 'expensetrack_db', version: '8.0.35-inmemory', ver: '8.0.35-inmemory' }],
        []
      ];
    }

    if (/^SHOW\s+TABLES/i.test(cleanSql)) {
      return [
        [
          { Tables_in_expensetrack_db: 'users' },
          { Tables_in_expensetrack_db: 'locations' },
          { Tables_in_expensetrack_db: 'categories' },
          { Tables_in_expensetrack_db: 'expenses' }
        ],
        []
      ];
    }

    // DDL Statements (CREATE TABLE, INSERT INTO ON DUPLICATE KEY UPDATE, etc. from schema.sql)
    if (/^CREATE\s+/i.test(cleanSql) || /^ALTER\s+/i.test(cleanSql) || /^DROP\s+/i.test(cleanSql)) {
      return [{ affectedRows: 0, insertId: 0 }, []];
    }

    // -------------------------------------------------------------
    // USERS QUERIES
    // -------------------------------------------------------------
    if (/SELECT id FROM users WHERE LOWER\(email\) = LOWER\(\?\)/i.test(cleanSql)) {
      const email = String(params[0] || '').toLowerCase();
      const u = users.find(x => String(x.email).toLowerCase() === email);
      return [u ? [{ id: u.id }] : [], []];
    }

    if (/SELECT id, name, email, password, role, company_name, currency, avatar_url FROM users WHERE LOWER\(email\) = LOWER\(\?\)/i.test(cleanSql)) {
      const email = String(params[0] || '').toLowerCase();
      const u = users.find(x => String(x.email).toLowerCase() === email);
      return [u ? [{ ...u }] : [], []];
    }

    if (/SELECT password FROM users WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const u = users.find(x => x.id === id);
      return [u ? [{ password: u.password }] : [], []];
    }

    if (/SELECT COUNT\(\*\) as count FROM users WHERE email = \?/i.test(cleanSql)) {
      const email = String(params[0] || '').toLowerCase();
      const count = users.filter(x => String(x.email).toLowerCase() === email).length;
      return [[{ count }], []];
    }

    if (/SELECT id, name, email, role, company_name, currency, avatar_url FROM users WHERE id = \?/i.test(cleanSql) ||
        /SELECT \* FROM users WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const u = users.find(x => x.id === id);
      return [u ? [{ ...u }] : [], []];
    }

    if (/INSERT INTO users/i.test(cleanSql)) {
      // (id, name, email, password, role, company_name, currency, avatar_url, created_at, updated_at)
      const [id, name, email, password, role, company_name, currency, avatar_url] = params;
      users.push({
        id,
        name,
        email,
        password,
        role: role || 'Finance Manager',
        company_name: company_name || 'Enterprise Technologies',
        currency: currency || 'INR',
        avatar_url: avatar_url || null,
        created_at: new Date(),
        updated_at: new Date()
      });
      return [{ affectedRows: 1, insertId: 0 }, []];
    }

    if (/UPDATE users SET name = \?, company_name = \?, currency = \?, role = \?, avatar_url = \?/i.test(cleanSql)) {
      const [name, company_name, currency, role, avatar_url, id] = params;
      const u = users.find(x => x.id === id);
      if (u) {
        if (name !== undefined) u.name = name;
        if (company_name !== undefined) u.company_name = company_name;
        if (currency !== undefined) u.currency = currency;
        if (role !== undefined) u.role = role;
        if (avatar_url !== undefined) u.avatar_url = avatar_url;
        u.updated_at = new Date();
      }
      return [{ affectedRows: u ? 1 : 0 }, []];
    }

    if (/DELETE FROM users WHERE id IN/i.test(cleanSql)) {
      const ids = params.map(String);
      let count = 0;
      for (let i = users.length - 1; i >= 0; i--) {
        if (ids.includes(users[i].id)) {
          users.splice(i, 1);
          count++;
        }
      }
      return [{ affectedRows: count }, []];
    }

    // -------------------------------------------------------------
    // CATEGORIES QUERIES
    // -------------------------------------------------------------
    if (/SELECT \* FROM categories WHERE user_id = \? OR user_id IS NULL/i.test(cleanSql)) {
      const userId = String(params[0]);
      const res = categories
        .filter(c => c.user_id === userId || !c.user_id)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
      return [res.map(c => ({ ...c })), []];
    }

    if (/INSERT INTO categories/i.test(cleanSql)) {
      const [id, user_id, name, budget_limit, color] = params;
      categories.push({
        id,
        user_id,
        name,
        budget_limit: parseFloat(budget_limit) || 50000,
        color: color || '#10B981',
        created_at: new Date(),
        updated_at: new Date()
      });
      return [{ affectedRows: 1, insertId: 0 }, []];
    }

    // -------------------------------------------------------------
    // LOCATIONS QUERIES
    // -------------------------------------------------------------
    if (/SELECT \* FROM locations WHERE id = \? AND user_id = \?/i.test(cleanSql)) {
      const [id, userId] = params.map(String);
      const loc = locations.find(l => l.id === id && l.user_id === userId);
      return [loc ? [{ ...loc }] : [], []];
    }

    if (/SELECT \* FROM locations WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const loc = locations.find(l => l.id === id);
      return [loc ? [{ ...loc }] : [], []];
    }

    if (/SELECT id FROM locations WHERE LOWER\(name\) = LOWER\(\?\) AND user_id = \?/i.test(cleanSql)) {
      const name = String(params[0]).toLowerCase();
      const userId = String(params[1]);
      const loc = locations.find(l => String(l.name).toLowerCase() === name && l.user_id === userId);
      return [loc ? [{ id: loc.id }] : [], []];
    }

    if (/SELECT id, name, code, budget_limit, color FROM locations WHERE user_id = \?/i.test(cleanSql) ||
        /SELECT \* FROM locations WHERE user_id = \?/i.test(cleanSql)) {
      const userId = String(params[0]);
      let res = locations.filter(l => l.user_id === userId);

      // check if search param was passed
      if (/LIKE \?/i.test(cleanSql) && params.length >= 2) {
        const term = String(params[1]).replace(/%/g, '').toLowerCase();
        res = res.filter(l =>
          l.name.toLowerCase().includes(term) ||
          l.code.toLowerCase().includes(term) ||
          l.state.toLowerCase().includes(term)
        );
      }

      res.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      return [res.map(l => ({ ...l })), []];
    }

    if (/INSERT INTO locations/i.test(cleanSql)) {
      const [id, user_id, name, code, state, budget_limit, color, description] = params;
      locations.push({
        id,
        user_id,
        name,
        code,
        state,
        budget_limit: parseFloat(budget_limit) || 100000,
        color: color || '#3B82F6',
        description: description || '',
        created_at: new Date(),
        updated_at: new Date()
      });
      return [{ affectedRows: 1, insertId: 0 }, []];
    }

    if (/UPDATE locations SET/i.test(cleanSql)) {
      const [name, code, state, budget_limit, color, description, id, userId] = params;
      const loc = locations.find(l => l.id === id && l.user_id === userId);
      if (loc) {
        loc.name = name;
        loc.code = code;
        loc.state = state;
        loc.budget_limit = parseFloat(budget_limit);
        loc.color = color;
        loc.description = description;
        loc.updated_at = new Date();
      }
      return [{ affectedRows: loc ? 1 : 0 }, []];
    }

    if (/DELETE FROM locations WHERE id = \? AND user_id = \?/i.test(cleanSql)) {
      const [id, userId] = params.map(String);
      const idx = locations.findIndex(l => l.id === id && l.user_id === userId);
      let count = 0;
      if (idx !== -1) {
        locations.splice(idx, 1);
        count = 1;
        // Foreign key ON DELETE SET NULL
        for (const exp of expenses) {
          if (exp.location_id === id && exp.user_id === userId) {
            exp.location_id = null;
          }
        }
      }
      return [{ affectedRows: count }, []];
    }

    // -------------------------------------------------------------
    // DASHBOARD & REPORTS AGGREGATION QUERIES
    // -------------------------------------------------------------
    if (/SELECT COALESCE\(SUM\(amount\), 0\) AS total_amount, COUNT\(\*\) AS total_count FROM expenses WHERE user_id = \?/i.test(cleanSql)) {
      const userId = String(params[0]);
      const userExps = expenses.filter(e => e.user_id === userId);
      const sum = userExps.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
      return [[{ total_amount: sum, total_count: userExps.length }], []];
    }

    if (/SELECT COALESCE\(SUM\(amount\), 0\) AS month_amount FROM expenses WHERE user_id = \? AND date LIKE \?/i.test(cleanSql)) {
      const userId = String(params[0]);
      const monthPrefix = String(params[1]).replace(/%/g, '');
      const userExps = expenses.filter(e => e.user_id === userId && String(e.date).startsWith(monthPrefix));
      const sum = userExps.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
      return [[{ month_amount: sum }], []];
    }

    if (/SELECT COALESCE\(SUM\(amount\), 0\) AS today_amount FROM expenses WHERE user_id = \? AND date = \?/i.test(cleanSql)) {
      const userId = String(params[0]);
      const day = String(params[1]);
      const userExps = expenses.filter(e => e.user_id === userId && String(e.date).startsWith(day));
      const sum = userExps.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
      return [[{ today_amount: sum }], []];
    }

    if (/SELECT location_name, SUM\(amount\) AS loc_total, COUNT\(\*\) AS loc_count FROM expenses WHERE user_id = \? GROUP BY location_name ORDER BY loc_total DESC LIMIT 1/i.test(cleanSql)) {
      const userId = String(params[0]);
      const map: Record<string, { total: number; count: number }> = {};
      expenses.filter(e => e.user_id === userId).forEach(e => {
        const loc = e.location_name || 'Unassigned';
        if (!map[loc]) map[loc] = { total: 0, count: 0 };
        map[loc].total += parseFloat(e.amount) || 0;
        map[loc].count += 1;
      });
      const sorted = Object.entries(map).sort((a, b) => b[1].total - a[1].total);
      if (sorted.length > 0) {
        return [[{ location_name: sorted[0][0], loc_total: sorted[0][1].total, loc_count: sorted[0][1].count }], []];
      }
      return [[], []];
    }

    if (/SELECT category, SUM\(amount\) AS cat_total, COUNT\(\*\) AS cat_count FROM expenses WHERE user_id = \? GROUP BY category ORDER BY cat_total DESC LIMIT 1/i.test(cleanSql)) {
      const userId = String(params[0]);
      const map: Record<string, { total: number; count: number }> = {};
      expenses.filter(e => e.user_id === userId).forEach(e => {
        const cat = e.category || 'Other';
        if (!map[cat]) map[cat] = { total: 0, count: 0 };
        map[cat].total += parseFloat(e.amount) || 0;
        map[cat].count += 1;
      });
      const sorted = Object.entries(map).sort((a, b) => b[1].total - a[1].total);
      if (sorted.length > 0) {
        return [[{ category: sorted[0][0], cat_total: sorted[0][1].total, cat_count: sorted[0][1].count }], []];
      }
      return [[], []];
    }

    if (/SELECT DATE_FORMAT\(date, '%Y-%m'\) AS month_key, SUM\(amount\) AS total FROM expenses WHERE user_id = \? GROUP BY month_key/i.test(cleanSql)) {
      const userId = String(params[0]);
      const map: Record<string, number> = {};
      expenses.filter(e => e.user_id === userId).forEach(e => {
        const key = String(e.date).substring(0, 7);
        map[key] = (map[key] || 0) + (parseFloat(e.amount) || 0);
      });
      const res = Object.entries(map).map(([month_key, total]) => ({ month_key, total }));
      return [res, []];
    }

    if (/SELECT category AS name, SUM\(amount\) AS total, COUNT\(\*\) AS count FROM expenses WHERE user_id = \? GROUP BY category ORDER BY total DESC/i.test(cleanSql)) {
      const userId = String(params[0]);
      const map: Record<string, { total: number; count: number }> = {};
      expenses.filter(e => e.user_id === userId).forEach(e => {
        const cat = e.category || 'Other';
        if (!map[cat]) map[cat] = { total: 0, count: 0 };
        map[cat].total += parseFloat(e.amount) || 0;
        map[cat].count += 1;
      });
      const res = Object.entries(map)
        .map(([name, val]) => ({ name, total: val.total, count: val.count }))
        .sort((a, b) => b.total - a.total);
      return [res, []];
    }

    if (/SELECT location_name, SUM\(amount\) AS total, COUNT\(\*\) AS count FROM expenses WHERE user_id = \? GROUP BY location_name/i.test(cleanSql)) {
      const userId = String(params[0]);
      const map: Record<string, { total: number; count: number }> = {};
      expenses.filter(e => e.user_id === userId).forEach(e => {
        const loc = e.location_name || 'Unassigned';
        if (!map[loc]) map[loc] = { total: 0, count: 0 };
        map[loc].total += parseFloat(e.amount) || 0;
        map[loc].count += 1;
      });
      const res = Object.entries(map).map(([location_name, val]) => ({ location_name, total: val.total, count: val.count }));
      return [res, []];
    }

    if (/SELECT location_name, amount, category FROM expenses WHERE user_id = \?/i.test(cleanSql)) {
      const userId = String(params[0]);
      const res = expenses.filter(e => e.user_id === userId).map(e => ({
        location_name: e.location_name,
        amount: parseFloat(e.amount) || 0,
        category: e.category
      }));
      return [res, []];
    }

    if (/SELECT COALESCE\(SUM\(amount\), 0\) AS total FROM expenses WHERE user_id = \?/i.test(cleanSql)) {
      const userId = String(params[0]);
      const sum = expenses.filter(e => e.user_id === userId).reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
      return [[{ total: sum }], []];
    }

    if (/SELECT category, SUM\(amount\) AS total, COUNT\(\*\) AS count FROM expenses WHERE user_id = \? GROUP BY category ORDER BY total DESC/i.test(cleanSql)) {
      const userId = String(params[0]);
      const map: Record<string, { total: number; count: number }> = {};
      expenses.filter(e => e.user_id === userId).forEach(e => {
        const cat = e.category || 'Other';
        if (!map[cat]) map[cat] = { total: 0, count: 0 };
        map[cat].total += parseFloat(e.amount) || 0;
        map[cat].count += 1;
      });
      const res = Object.entries(map)
        .map(([category, val]) => ({ category, total: val.total, count: val.count }))
        .sort((a, b) => b.total - a.total);
      return [res, []];
    }

    // -------------------------------------------------------------
    // EXPENSES CRUD QUERIES
    // -------------------------------------------------------------
    if (/SELECT COUNT\(\*\) as total FROM expenses WHERE/i.test(cleanSql)) {
      const userId = String(params[0]);
      let filtered = expenses.filter(e => e.user_id === userId);

      let paramIdx = 1;
      if (/AND \(LOWER\(name\) LIKE \? OR LOWER\(description\) LIKE \? OR LOWER\(location_name\) LIKE \?\)/i.test(cleanSql)) {
        const term = String(params[paramIdx]).replace(/%/g, '').toLowerCase();
        paramIdx += 3;
        filtered = filtered.filter(e =>
          (e.name || '').toLowerCase().includes(term) ||
          (e.description || '').toLowerCase().includes(term) ||
          (e.location_name || '').toLowerCase().includes(term)
        );
      }
      if (/AND category = \?/i.test(cleanSql)) {
        const cat = params[paramIdx++];
        filtered = filtered.filter(e => e.category === cat);
      }
      if (/AND LOWER\(location_name\) = LOWER\(\?\)/i.test(cleanSql)) {
        const loc = String(params[paramIdx++]).toLowerCase();
        filtered = filtered.filter(e => (e.location_name || '').toLowerCase() === loc);
      }
      if (/AND date >= \?/i.test(cleanSql)) {
        const d = String(params[paramIdx++]);
        filtered = filtered.filter(e => String(e.date) >= d);
      }
      if (/AND date <= \?/i.test(cleanSql)) {
        const d = String(params[paramIdx++]);
        filtered = filtered.filter(e => String(e.date) <= d);
      }

      return [[{ total: filtered.length }], []];
    }

    if (/SELECT location_id, location_name FROM expenses WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const exp = expenses.find(e => e.id === id);
      return [exp ? [{ location_id: exp.location_id, location_name: exp.location_name }] : [], []];
    }

    if (/SELECT location_id FROM expenses WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const exp = expenses.find(e => e.id === id);
      return [exp ? [{ location_id: exp.location_id }] : [], []];
    }

    if (/SELECT amount, description FROM expenses WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const exp = expenses.find(e => e.id === id);
      return [exp ? [{ amount: exp.amount, description: exp.description }] : [], []];
    }

    if (/SELECT amount FROM expenses WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const exp = expenses.find(e => e.id === id);
      return [exp ? [{ amount: exp.amount }] : [], []];
    }

    if (/SELECT COUNT\(\*\) as cnt FROM expenses WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const count = expenses.filter(e => e.id === id).length;
      return [[{ cnt: count }], []];
    }

    if (/SELECT id FROM expenses WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const exp = expenses.find(e => e.id === id);
      return [exp ? [{ id: exp.id }] : [], []];
    }

    if (/SELECT \* FROM expenses WHERE id = \? AND user_id = \?/i.test(cleanSql)) {
      const [id, userId] = params.map(String);
      const exp = expenses.find(e => e.id === id && e.user_id === userId);
      return [exp ? [{ ...exp }] : [], []];
    }

    if (/SELECT \* FROM expenses WHERE id = \?/i.test(cleanSql)) {
      const id = String(params[0]);
      const exp = expenses.find(e => e.id === id);
      return [exp ? [{ ...exp }] : [], []];
    }

    if (/SELECT \* FROM expenses WHERE user_id = \?/i.test(cleanSql)) {
      const userId = String(params[0]);
      let filtered = expenses.filter(e => e.user_id === userId);

      let paramIdx = 1;
      if (/AND \(LOWER\(name\) LIKE \? OR LOWER\(description\) LIKE \? OR LOWER\(location_name\) LIKE \?\)/i.test(cleanSql)) {
        const term = String(params[paramIdx]).replace(/%/g, '').toLowerCase();
        paramIdx += 3;
        filtered = filtered.filter(e =>
          (e.name || '').toLowerCase().includes(term) ||
          (e.description || '').toLowerCase().includes(term) ||
          (e.location_name || '').toLowerCase().includes(term)
        );
      }
      if (/AND category = \?/i.test(cleanSql)) {
        const cat = params[paramIdx++];
        filtered = filtered.filter(e => e.category === cat);
      }
      if (/AND LOWER\(location_name\) = LOWER\(\?\)/i.test(cleanSql)) {
        const loc = String(params[paramIdx++]).toLowerCase();
        filtered = filtered.filter(e => (e.location_name || '').toLowerCase() === loc);
      }
      if (/AND date >= \?/i.test(cleanSql)) {
        const d = String(params[paramIdx++]);
        filtered = filtered.filter(e => String(e.date) >= d);
      }
      if (/AND date <= \?/i.test(cleanSql)) {
        const d = String(params[paramIdx++]);
        filtered = filtered.filter(e => String(e.date) <= d);
      }

      // Sorting
      if (/ORDER BY amount DESC/i.test(cleanSql)) {
        filtered.sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0));
      } else if (/ORDER BY amount ASC/i.test(cleanSql)) {
        filtered.sort((a, b) => (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0));
      } else if (/ORDER BY name ASC/i.test(cleanSql)) {
        filtered.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      } else if (/ORDER BY name DESC/i.test(cleanSql)) {
        filtered.sort((a, b) => String(b.name).localeCompare(String(a.name)));
      } else if (/ORDER BY category ASC/i.test(cleanSql)) {
        filtered.sort((a, b) => String(a.category).localeCompare(String(b.category)));
      } else if (/ORDER BY location_name ASC/i.test(cleanSql)) {
        filtered.sort((a, b) => String(a.location_name).localeCompare(String(b.location_name)));
      } else {
        // default date DESC
        filtered.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      }

      // Pagination
      if (/LIMIT \? OFFSET \?/i.test(cleanSql)) {
        const limit = Number(params[params.length - 2]);
        const offset = Number(params[params.length - 1]);
        filtered = filtered.slice(offset, offset + limit);
      }

      return [filtered.map(e => ({ ...e })), []];
    }

    if (/INSERT INTO expenses/i.test(cleanSql)) {
      const [
        id, user_id, name, amount, category, location_id,
        location_name, date, payment_method, description,
        tax_deductible, status, receipt_url
      ] = params;

      expenses.push({
        id,
        user_id,
        name,
        amount: parseFloat(amount) || 0,
        category,
        location_id: location_id || null,
        location_name,
        date: date || todayStr,
        payment_method: payment_method || 'Corporate Card',
        description: description || '',
        tax_deductible: Boolean(tax_deductible),
        status: status || 'approved',
        receipt_url: receipt_url || null,
        created_at: new Date(),
        updated_at: new Date()
      });

      return [{ affectedRows: 1, insertId: 0 }, []];
    }

    if (/UPDATE expenses SET location_name = \? WHERE location_id = \? AND user_id = \?/i.test(cleanSql)) {
      const [location_name, location_id, user_id] = params;
      let count = 0;
      for (const e of expenses) {
        if (e.location_id === location_id && e.user_id === user_id) {
          e.location_name = location_name;
          e.updated_at = new Date();
          count++;
        }
      }
      return [{ affectedRows: count }, []];
    }

    if (/UPDATE expenses SET name = \?, amount = \?, category = \?, location_id = \?, location_name = \?, date = \?, payment_method = \?, description = \?, tax_deductible = \?, status = \?, receipt_url = \?/i.test(cleanSql)) {
      const [
        name, amount, category, location_id, location_name,
        date, payment_method, description, tax_deductible, status,
        receipt_url, id, user_id
      ] = params;

      const exp = expenses.find(e => e.id === id && e.user_id === user_id);
      if (exp) {
        exp.name = name;
        exp.amount = parseFloat(amount) || 0;
        exp.category = category;
        exp.location_id = location_id || null;
        exp.location_name = location_name;
        exp.date = date;
        exp.payment_method = payment_method;
        exp.description = description;
        exp.tax_deductible = Boolean(tax_deductible);
        exp.status = status;
        exp.receipt_url = receipt_url;
        exp.updated_at = new Date();
      }
      return [{ affectedRows: exp ? 1 : 0 }, []];
    }

    if (/DELETE FROM expenses WHERE id = \? AND user_id = \?/i.test(cleanSql)) {
      const [id, user_id] = params.map(String);
      const idx = expenses.findIndex(e => e.id === id && e.user_id === user_id);
      let count = 0;
      if (idx !== -1) {
        expenses.splice(idx, 1);
        count = 1;
      }
      return [{ affectedRows: count }, []];
    }

    if (/DELETE FROM expenses WHERE user_id = \? AND id IN/i.test(cleanSql)) {
      const userId = String(params[0]);
      const ids = params.slice(1).map(String);
      let count = 0;
      for (let i = expenses.length - 1; i >= 0; i--) {
        if (expenses[i].user_id === userId && ids.includes(expenses[i].id)) {
          expenses.splice(i, 1);
          count++;
        }
      }
      return [{ affectedRows: count }, []];
    }

    console.warn('[Mock DB] Unhandled query pattern:', cleanSql, 'Params:', params);
    return [[], []];
  }

  return {
    query,
    execute: query,
    getConnection: async () => ({
      query,
      execute: query,
      release: () => {}
    }),
    end: async () => {}
  } as any;
}
