import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

// Check database collections
router.get('/tables', async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.json({
        success: true,
        count: 0,
        tables: [],
        message: 'Database connection is still establishing. Please refresh in a moment.'
      });
    }
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({
      success: true,
      count: collections.length,
      tables: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check collections structures
router.get('/table-columns', async (req, res) => {
  try {
    const models = Object.keys(mongoose.models);
    res.json({
      success: true,
      models: models
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check existing users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('id email role created_at').sort({ created_at: -1 }).limit(20).lean();
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(u => {
        u.id = u._id.toString();
        return u;
      })
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generic endpoint to query any model's data
router.get('/data/:modelName', async (req, res) => {
  try {
    const { modelName } = req.params;
    const model = mongoose.model(modelName);
    
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }

    const data = await model.find({}).sort({ created_at: -1, createdAt: -1 }).limit(100).lean();
    
    res.json({
      success: true,
      count: data.length,
      data: data.map(item => {
        item.id = item._id.toString();
        return item;
      })
    });
  } catch (error) {
    console.error('Error fetching collection data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve database visual web inspector
router.get('/viewer', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Influish MongoDB Live Web Inspector</title>
  <!-- Google Fonts & Tailwind/Bootstrap -->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #0f0c20 0%, #15102a 100%);
      color: #e2e8f0;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    .glass-card {
      background: rgba(25, 18, 48, 0.45);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .glass-card:hover {
      border-color: rgba(139, 92, 246, 0.4);
      box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.15);
    }

    .navbar-brand {
      font-weight: 800;
      letter-spacing: 1px;
      background: linear-gradient(to right, #a78bfa, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .sidebar-item {
      padding: 12px 20px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }

    .sidebar-item:hover, .sidebar-item.active {
      background: rgba(139, 92, 246, 0.15);
      color: #c084fc;
      border-left: 4px solid #a78bfa;
    }

    .custom-table {
      color: #cbd5e1;
    }

    .custom-table th {
      background: rgba(15, 12, 32, 0.6) !important;
      color: #a78bfa !important;
      border-bottom: 2px solid rgba(255, 255, 255, 0.08);
      padding: 15px;
    }

    .custom-table td {
      background: transparent !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding: 15px;
      vertical-align: middle;
    }

    .badge-paid {
      background: rgba(52, 211, 153, 0.15);
      color: #34d399;
    }
    .badge-barter {
      background: rgba(251, 146, 60, 0.15);
      color: #fb923c;
    }
    .badge-influencer {
      background: rgba(96, 165, 250, 0.15);
      color: #60a5fa;
    }
    .badge-brand {
      background: rgba(244, 114, 182, 0.15);
      color: #f474b6;
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #0f0c20;
    }
    ::-webkit-scrollbar-thumb {
      background: #312e81;
      border-radius: 10px;
    }
  </style>
</head>
<body>

  <!-- Navbar -->
  <nav class="navbar navbar-dark border-bottom border-secondary border-opacity-25" style="background: rgba(15, 12, 32, 0.85); backdrop-filter: blur(10px);">
    <div class="container-fluid px-4">
      <span class="navbar-brand fs-4"><i class="fa-solid fa-layer-group me-2"></i>INFLUISH LIVE DB INSPECTOR</span>
      <span class="badge bg-dark border border-secondary border-opacity-50 text-secondary"><i class="fa-solid fa-circle text-success me-1"></i> MongoDB Mode Connected</span>
    </div>
  </nav>

  <div class="container-fluid py-4 px-4">
    <div class="row g-4">
      <!-- Left Sidebar (Collections) -->
      <div class="col-lg-3 col-md-4">
        <div class="glass-card p-4 h-100">
          <h5 class="text-white mb-4 fw-semibold text-uppercase tracking-wider fs-6 opacity-75">Collections</h5>
          <div id="sidebar-list">
            <div class="sidebar-item active" onclick="loadCollection('User', this)"><i class="fa-solid fa-users"></i> Users</div>
            <div class="sidebar-item" onclick="loadCollection('InfluencerProfile', this)"><i class="fa-solid fa-user-tie"></i> Influencer Profiles</div>
            <div class="sidebar-item" onclick="loadCollection('BrandProfile', this)"><i class="fa-solid fa-briefcase"></i> Brand Profiles</div>
            <div class="sidebar-item" onclick="loadCollection('Campaign', this)"><i class="fa-solid fa-bullhorn"></i> Campaigns</div>
            <div class="sidebar-item" onclick="loadCollection('Application', this)"><i class="fa-solid fa-file-signature"></i> Applications</div>
            <div class="sidebar-item" onclick="loadCollection('Chat', this)"><i class="fa-solid fa-comments"></i> Chats</div>
            <div class="sidebar-item" onclick="loadCollection('ChatMessage', this)"><i class="fa-solid fa-message"></i> Chat Messages</div>
            <div class="sidebar-item" onclick="loadCollection('Message', this)"><i class="fa-solid fa-paper-plane"></i> Direct Messages</div>
            <div class="sidebar-item" onclick="loadCollection('Payment', this)"><i class="fa-solid fa-credit-card"></i> Payment Orders</div>
            <div class="sidebar-item" onclick="loadCollection('Withdrawal', this)"><i class="fa-solid fa-wallet"></i> Withdrawals</div>
            <div class="sidebar-item" onclick="loadCollection('Notification', this)"><i class="fa-solid fa-bell"></i> System Notifications</div>
          </div>
        </div>
      </div>

      <!-- Right Content (Tables/Details) -->
      <div class="col-lg-9 col-md-8">
        <div class="glass-card p-4 h-100">
          <div class="d-flex justify-between justify-content-between align-items-center mb-4">
            <h4 class="text-white fw-bold mb-0" id="collection-title">User Data</h4>
            <span class="badge bg-secondary py-2 px-3" id="records-count">0 Records</span>
          </div>

          <div class="table-responsive" style="max-height: 70vh;">
            <table class="table custom-table mb-0 align-middle">
              <thead id="table-head">
                <!-- Dynamic Header -->
              </thead>
              <tbody id="table-body">
                <!-- Dynamic Content -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function loadCollection(modelName, element) {
      // Toggle sidebar active states
      document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
      if (element) element.classList.add('active');

      // Update Title
      document.getElementById('collection-title').innerText = modelName + ' Records';
      
      const head = document.getElementById('table-head');
      const body = document.getElementById('table-body');
      
      head.innerHTML = '<tr><td class="text-center text-secondary py-5">Loading database entries...</td></tr>';
      body.innerHTML = '';

      try {
        const response = await fetch('/api/debug/data/' + modelName);
        const resData = await response.json();
        
        if (!resData.success || resData.data.length === 0) {
          head.innerHTML = '';
          body.innerHTML = '<tr><td class="text-center text-secondary py-5"><i class="fa-solid fa-box-open fs-2 mb-2 d-block"></i>No records found in this collection.</td></tr>';
          document.getElementById('records-count').innerText = '0 Records';
          return;
        }

        const data = resData.data;
        document.getElementById('records-count').innerText = data.length + ' Records';

        // Extract columns from first object dynamically
        const columns = Object.keys(data[0]).filter(k => k !== '__v');

        // Build Header
        let headHtml = '<tr>';
        columns.forEach(col => {
          headHtml += '<th>' + col.toUpperCase() + '</th>';
        });
        headHtml += '</tr>';
        head.innerHTML = headHtml;

        // Build Rows
        let bodyHtml = '';
        data.forEach(row => {
          bodyHtml += '<tr>';
          columns.forEach(col => {
            let val = row[col];
            if (val === null || val === undefined) {
              val = '<span class="text-secondary opacity-50">null</span>';
            } else if (typeof val === 'object') {
              val = '<pre class="m-0 text-info" style="font-size:11px;">' + JSON.stringify(val) + '</pre>';
            } else if (col === 'role' || col === 'target_type' || col === 'status') {
              let badgeClass = 'bg-secondary';
              if (val === 'brand' || val === 'all_brands') badgeClass = 'badge-brand';
              if (val === 'influencer' || val === 'all_influencers') badgeClass = 'badge-influencer';
              if (val === 'paid') badgeClass = 'badge-paid';
              if (val === 'barter') badgeClass = 'badge-barter';
              val = '<span class="badge ' + badgeClass + '">' + val + '</span>';
            } else if (col === 'profile_image' || col === 'profile_picture' || col === 'logo') {
              if (val.startsWith('/')) {
                val = '<img src="' + val + '" class="rounded-circle" style="width:36px; height:36px; object-fit:cover; border: 1px solid rgba(255,255,255,0.1);">';
              } else {
                val = '<span class="text-truncate d-inline-block" style="max-width:150px;">' + val + '</span>';
              }
            } else if (typeof val === 'string' && val.length > 80) {
              val = '<span class="text-truncate d-inline-block" style="max-width:200px;" title="' + val + '">' + val + '</span>';
            }
            bodyHtml += '<td>' + val + '</td>';
          });
          bodyHtml += '</tr>';
        });
        body.innerHTML = bodyHtml;

      } catch (err) {
        console.error(err);
        head.innerHTML = '';
        body.innerHTML = '<tr><td class="text-danger text-center py-5">Failed to fetch database information. Make sure database is running.</td></tr>';
      }
    }

    // Load default collection
    window.onload = () => {
      loadCollection('User', document.querySelector('.sidebar-item'));
    };
  </script>
</body>
</html>
  `);
});

export default router;
