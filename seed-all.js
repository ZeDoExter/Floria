// seed-all.js - Script รวมสำหรับ seed ทุกอย่างในคำสั่งเดียว
const fs = require('fs');
const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const API_BASE = 'http://localhost:3000';

function apiRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('🌸 Flora Tailor - Complete Seed Script\n');

  // STEP 0: Restart services
  console.log('🔧 Step 1: Restarting services to sync database...\n');
  try {
    await execPromise('docker-compose restart gateway cart-service');
    console.log('   ✓ Services restarted');
    console.log('   ⏳ Waiting 15 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 15000));
  } catch (error) {
    console.log('   ⚠️  Could not restart services');
    console.log('   Run: docker-compose restart gateway cart-service\n');
  }

  // STEP 1: สร้าง Accounts
  console.log('� Steep 2: Creating accounts...\n');
  const accounts = [
    { email: 'flora.owner1@example.com', password: 'secret123', firstName: 'Main Shop', lastName: 'Owner', role: 'owner' },
    { email: 'flora.owner2@example.com', password: 'secret123', firstName: 'Weekend Market', lastName: 'Owner', role: 'owner' },
    { email: 'flora.customer1@example.com', password: 'secret123', firstName: 'Loyal', lastName: 'Customer', role: 'customer' },
    { email: 'flora.customer2@example.com', password: 'secret123', firstName: 'Guest', lastName: 'Customer', role: 'customer' }
  ];

  for (const account of accounts) {
    try {
      await apiRequest('POST', '/auth/register', account);
      console.log(`   ✓ ${account.email}`);
    } catch (error) {
      if (error.message.includes('already registered')) {
        console.log(`   ⚠️  ${account.email} (exists)`);
      } else {
        console.log(`   ✗ ${account.email}`);
      }
    }
  }
  console.log('');

  // STEP 2: Update roles
  console.log('🔑 Step 3: Setting roles...\n');
  console.log('   ⏳ Waiting 2 seconds for accounts to be ready...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const result = await execPromise(
      `docker exec floratailor-postgres-1 psql -U flora -d floratailor -c "UPDATE account SET role = 'owner' WHERE email IN ('flora.owner1@example.com', 'flora.owner2@example.com'); SELECT email, role FROM account WHERE email LIKE 'flora.%' ORDER BY email;"`
    );
    console.log('   ✓ Roles updated');
    console.log(result.stdout);
  } catch (error) {
    console.log('   ⚠️  Could not update roles');
    console.log('   Error:', error.message);
    console.log('   Please run manually:');
    console.log('   docker exec floratailor-postgres-1 psql -U flora -d floratailor -c "UPDATE account SET role = \'owner\' WHERE email IN (\'flora.owner1@example.com\', \'flora.owner2@example.com\');"');
    console.log('');
  }

  // STEP 3: Login as both owners
  console.log('🔐 Step 4: Login as owners...\n');
  let token1, token2;
  try {
    const login1 = await apiRequest('POST', '/auth/login', {
      email: 'flora.owner1@example.com',
      password: 'secret123'
    });
    token1 = login1.token;
    console.log('   ✓ Owner 1 logged in');

    const login2 = await apiRequest('POST', '/auth/login', {
      email: 'flora.owner2@example.com',
      password: 'secret123'
    });
    token2 = login2.token;
    console.log('   ✓ Owner 2 logged in\n');
  } catch (error) {
    console.error('   ✗ Login failed:', error.message);
    console.log('\n💡 Make sure Docker is running: docker-compose up -d\n');
    process.exit(1);
  }

  // STEP 4: Read mockup
  console.log('📖 Step 5: Reading mockup data...\n');
  let mockupData;
  try {
    mockupData = JSON.parse(fs.readFileSync('mockup-data.json', 'utf-8'));
    console.log(`   ✓ ${mockupData.categories.length} categories`);
    console.log(`   ✓ ${mockupData.products.length} products`);
    console.log(`   ✓ ${mockupData.optionGroups.length} option groups`);
    console.log(`   ✓ ${mockupData.options.length} options\n`);
  } catch (error) {
    console.error('   ✗ Failed to read mockup-data.json\n');
    process.exit(1);
  }

  // STEP 5: Categories (ใช้ owner1 สร้าง)
  console.log('🏷️  Step 6: Creating categories...\n');
  const categoryMap = new Map();
  for (const cat of mockupData.categories) {
    try {
      const response = await apiRequest('POST', '/categories', {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl
      }, token1);
      categoryMap.set(cat.id, response.id);
      console.log(`   ✓ ${cat.name}`);
    } catch (error) {
      console.log(`   ✗ ${cat.name}`);
    }
  }
  console.log('');

  // STEP 6: Products (สลับกันระหว่าง 2 owners)
  console.log('🌸 Step 7: Creating products...\n');
  const productMap = new Map();
  let ownerIndex = 0;
  for (const prod of mockupData.products) {
    try {
      // สลับระหว่าง owner1 และ owner2
      const currentToken = ownerIndex % 2 === 0 ? token1 : token2;
      const ownerName = ownerIndex % 2 === 0 ? 'Owner 1' : 'Owner 2';
      
      const response = await apiRequest('POST', '/products', {
        categoryId: categoryMap.get(prod.categoryId),
        name: prod.name,
        description: prod.description,
        basePrice: prod.basePrice,
        imageUrl: prod.imageUrl
      }, currentToken);
      productMap.set(prod.id, response.id);
      console.log(`   ✓ ${prod.name} (${prod.basePrice} บาท) - ${ownerName}`);
      ownerIndex++;
    } catch (error) {
      console.log(`   ✗ ${prod.name}`);
      ownerIndex++;
    }
  }
  console.log('');

  // STEP 7: Option Groups (ใช้ token ของ owner ที่สร้าง product นั้น)
  console.log('📦 Step 8: Creating option groups...\n');
  const optionGroupMap = new Map();
  const productOwnerMap = new Map(); // เก็บว่า product ไหนเป็นของ owner ไหน
  
  // สร้าง map ของ product -> owner token
  let prodIndex = 0;
  for (const prod of mockupData.products) {
    const ownerToken = prodIndex % 2 === 0 ? token1 : token2;
    productOwnerMap.set(prod.id, ownerToken);
    prodIndex++;
  }
  
  for (const og of mockupData.optionGroups) {
    try {
      const ownerToken = productOwnerMap.get(og.productId) || token1;
      const response = await apiRequest('POST', '/option-groups', {
        productId: productMap.get(og.productId),
        name: og.name,
        description: og.description,
        isRequired: og.isRequired,
        minSelect: og.minSelect,
        maxSelect: og.maxSelect
      }, ownerToken);
      optionGroupMap.set(og.id, response.id);
      console.log(`   ✓ ${og.name}`);
    } catch (error) {
      console.log(`   ✗ ${og.name}`);
    }
  }
  console.log('');

  // STEP 8: Options (ใช้ token ของ owner ที่สร้าง product นั้น)
  console.log('✨ Step 9: Creating options...\n');
  let optionCount = 0;
  
  // สร้าง map ของ optionGroup -> product -> owner token
  const optionGroupProductMap = new Map();
  for (const og of mockupData.optionGroups) {
    optionGroupProductMap.set(og.id, og.productId);
  }
  
  for (const opt of mockupData.options) {
    try {
      const productId = optionGroupProductMap.get(opt.optionGroupId);
      const ownerToken = productOwnerMap.get(productId) || token1;
      
      await apiRequest('POST', '/options', {
        optionGroupId: optionGroupMap.get(opt.optionGroupId),
        name: opt.name,
        description: opt.description,
        priceModifier: opt.priceModifier
      }, ownerToken);
      optionCount++;
      const priceText = opt.priceModifier > 0 ? `+${opt.priceModifier}` : opt.priceModifier < 0 ? `${opt.priceModifier}` : 'ฟรี';
      console.log(`   ✓ ${opt.name} (${priceText})`);
    } catch (error) {
      console.log(`   ✗ ${opt.name}`);
    }
  }
  console.log('');

  // Summary
  console.log('🎉 Seed completed!\n');
  console.log('📊 Summary:');
  console.log(`   ✓ ${accounts.length} accounts`);
  console.log(`   ✓ ${categoryMap.size} categories`);
  console.log(`   ✓ ${productMap.size} products`);
  console.log(`   ✓ ${optionGroupMap.size} option groups`);
  console.log(`   ✓ ${optionCount} options\n`);
  
  console.log('🌐 Next steps:');
  console.log('   1. Open http://localhost:4173');
  console.log('   2. ⚠️  IMPORTANT: Logout first if already logged in (to refresh roles)');
  console.log('   3. Login:');
  console.log('      Owner 1: flora.owner1@example.com / secret123 (can manage catalog & view orders)');
  console.log('      Owner 2: flora.owner2@example.com / secret123 (can manage catalog & view orders)');
  console.log('      Customer 1: flora.customer1@example.com / secret123');
  console.log('      Customer 2: flora.customer2@example.com / secret123');
  console.log('   4. Owners can access:');
  console.log('      - Catalog dashboard: /admin/catalog');
  console.log('      - Customer orders: /orders');
  console.log('   5. Start shopping! 🛒\n');
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
