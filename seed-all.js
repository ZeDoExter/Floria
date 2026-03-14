const fs = require('fs');
const path = require('path');
const http = require('http');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

function getErrorMessage(parsedBody) {
  if (!parsedBody) return 'Unknown error';
  if (typeof parsedBody === 'string') return parsedBody;
  if (Array.isArray(parsedBody.message)) return parsedBody.message.join(', ');
  if (typeof parsedBody.message === 'string') return parsedBody.message;
  return JSON.stringify(parsedBody);
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

function apiRequest(method, endpoint, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: `${url.pathname}${url.search}`,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let rawBody = '';
      res.on('data', (chunk) => {
        rawBody += chunk;
      });
      res.on('end', () => {
        let parsedBody = null;
        if (rawBody) {
          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            parsedBody = rawBody;
          }
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsedBody);
          return;
        }

        const error = new Error(`HTTP ${res.statusCode}: ${getErrorMessage(parsedBody)}`);
        error.statusCode = res.statusCode;
        error.response = parsedBody;
        reject(error);
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNetworkError(error) {
  const msg = String(error?.message || '');
  return msg.includes('ECONNRESET')
    || msg.includes('ECONNREFUSED')
    || msg.includes('ETIMEDOUT')
    || msg.includes('socket hang up')
    || msg.includes('ENOTFOUND');
}

async function apiRequestWithRetry(method, endpoint, data, token, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await apiRequest(method, endpoint, data, token);
    } catch (error) {
      lastError = error;
      if (!isTransientNetworkError(error) || attempt === maxRetries) {
        throw error;
      }
      const delay = 500 * (attempt + 1);
      console.log(`   ↻ retry ${attempt + 1}/${maxRetries} ${method} ${endpoint} in ${delay}ms (${error.message})`);
      await wait(delay);
    }
  }
  throw lastError;
}

function normalizeName(value) {
  return (value || '').trim().toLowerCase();
}

function findByName(list, name) {
  const target = normalizeName(name);
  return list.find((item) => normalizeName(item?.name) === target);
}

async function registerOrLoginAccount(account, summary) {
  let alreadyExists = false;

  try {
    await apiRequestWithRetry('POST', '/auth/register', {
      email: account.email,
      password: account.password,
      firstName: account.firstName,
      lastName: account.lastName
    });
    summary.accounts.created += 1;
    console.log(`   ✓ ${account.email} (created)`);
  } catch (error) {
    if (String(error.message).includes('already registered')) {
      alreadyExists = true;
      summary.accounts.existing += 1;
      console.log(`   • ${account.email} (exists)`);
    } else {
      summary.accounts.failed += 1;
      console.log(`   ✗ ${account.email} (${error.message})`);
      throw error;
    }
  }

  const login = await apiRequestWithRetry('POST', '/auth/login', {
    email: account.email,
    password: account.password
  });

  if (!alreadyExists) {
    return login?.token;
  }

  return login?.token;
}

async function main() {
  console.log('🌸 Flora Tailor - Initial Seed (Idempotent)\n');
  console.log(`🔗 API Base: ${API_BASE}\n`);

  const summary = {
    accounts: { created: 0, existing: 0, failed: 0 },
    categories: { created: 0, existing: 0, failed: 0 },
    products: { created: 0, existing: 0, failed: 0 },
    optionGroups: { created: 0, existing: 0, failed: 0 },
    options: { created: 0, existing: 0, failed: 0 }
  };

  const accounts = [
    { email: 'flora.owner1@example.com', password: 'secret123', firstName: 'Main Shop', lastName: 'Owner' },
    { email: 'flora.owner2@example.com', password: 'secret123', firstName: 'Weekend Market', lastName: 'Owner' },
    { email: 'flora.customer1@example.com', password: 'secret123', firstName: 'Loyal', lastName: 'Customer' },
    { email: 'flora.customer2@example.com', password: 'secret123', firstName: 'Guest', lastName: 'Customer' }
  ];

  console.log('👤 Step 1: Ensure demo accounts exist...\n');
  const accountTokens = new Map();
  for (const account of accounts) {
    const token = await registerOrLoginAccount(account, summary);
    if (token) {
      accountTokens.set(account.email, token);
    }
  }

  const token1 = accountTokens.get('flora.owner1@example.com');
  const token2 = accountTokens.get('flora.owner2@example.com');

  if (!token1 || !token2) {
    throw new Error('Owner login failed. Cannot continue seeding catalog data.');
  }

  console.log('\n📖 Step 2: Read mockup data...\n');
  const mockupPath = path.join(__dirname, 'mockup-data.json');
  const mockupData = JSON.parse(fs.readFileSync(mockupPath, 'utf-8'));
  console.log(`   ✓ ${mockupData.categories.length} categories in mockup`);
  console.log(`   ✓ ${mockupData.products.length} products in mockup`);
  console.log(`   ✓ ${mockupData.optionGroups.length} option groups in mockup`);
  console.log(`   ✓ ${mockupData.options.length} options in mockup\n`);

  console.log('🏷️  Step 3: Ensure categories exist...\n');
  const categoryMap = new Map();
  const existingCategories = normalizeListResponse(await apiRequestWithRetry('GET', '/categories', null, token1));

  for (const category of mockupData.categories) {
    const existing = findByName(existingCategories, category.name);
    if (existing?.id) {
      categoryMap.set(category.id, existing.id);
      summary.categories.existing += 1;
      console.log(`   • ${category.name} (exists)`);
      continue;
    }

    try {
      const created = await apiRequestWithRetry('POST', '/categories', {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl
      }, token1);
      categoryMap.set(category.id, created.id);
      existingCategories.push(created);
      summary.categories.created += 1;
      console.log(`   ✓ ${category.name} (created)`);
    } catch (error) {
      summary.categories.failed += 1;
      console.log(`   ✗ ${category.name} (${error.message})`);
    }
  }

  console.log('\n🌸 Step 4: Ensure products exist...\n');
  const productMap = new Map();
  const productByName = new Map();
  const existingProducts = normalizeListResponse(await apiRequestWithRetry('GET', '/products', null, token1));

  for (const product of existingProducts) {
    productByName.set(normalizeName(product.name), product);
  }

  for (let index = 0; index < mockupData.products.length; index += 1) {
    const product = mockupData.products[index];
    const existing = productByName.get(normalizeName(product.name));

    if (existing?.id) {
      productMap.set(product.id, existing.id);
      summary.products.existing += 1;
      console.log(`   • ${product.name} (exists)`);
      continue;
    }

    const ownerToken = index % 2 === 0 ? token1 : token2;
    const ownerName = index % 2 === 0 ? 'Owner 1' : 'Owner 2';

    try {
      const created = await apiRequestWithRetry('POST', '/products', {
        categoryId: categoryMap.get(product.categoryId),
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        imageUrl: product.imageUrl
      }, ownerToken);

      const enrichedProduct = {
        ...created,
        optionGroups: created.optionGroups || []
      };

      productMap.set(product.id, created.id);
      productByName.set(normalizeName(product.name), enrichedProduct);
      summary.products.created += 1;
      console.log(`   ✓ ${product.name} (created by ${ownerName})`);
    } catch (error) {
      summary.products.failed += 1;
      console.log(`   ✗ ${product.name} (${error.message})`);
    }
  }

  console.log('\n📦 Step 5: Ensure option groups exist...\n');
  const optionGroupMap = new Map();
  const mockupProductsById = new Map(mockupData.products.map((item) => [item.id, item]));

  for (const optionGroup of mockupData.optionGroups) {
    const productMock = mockupProductsById.get(optionGroup.productId);
    const productReal = productMock ? productByName.get(normalizeName(productMock.name)) : null;

    if (!productReal?.id) {
      summary.optionGroups.failed += 1;
      console.log(`   ✗ ${optionGroup.name} (product not found)`);
      continue;
    }

    productMap.set(optionGroup.productId, productReal.id);

    const existingGroups = Array.isArray(productReal.optionGroups) ? productReal.optionGroups : [];
    const existingGroup = findByName(existingGroups, optionGroup.name);

    if (existingGroup?.id) {
      optionGroupMap.set(optionGroup.id, existingGroup.id);
      summary.optionGroups.existing += 1;
      console.log(`   • ${optionGroup.name} (exists)`);
      continue;
    }

    try {
      const created = await apiRequestWithRetry('POST', '/option-groups', {
        productId: productReal.id,
        name: optionGroup.name,
        description: optionGroup.description,
        isRequired: optionGroup.isRequired,
        minSelect: optionGroup.minSelect,
        maxSelect: optionGroup.maxSelect
      }, token1);

      optionGroupMap.set(optionGroup.id, created.id);
      productReal.optionGroups = [...existingGroups, { ...created, options: [] }];
      summary.optionGroups.created += 1;
      console.log(`   ✓ ${optionGroup.name} (created)`);
    } catch (error) {
      summary.optionGroups.failed += 1;
      console.log(`   ✗ ${optionGroup.name} (${error.message})`);
    }
  }

  console.log('\n✨ Step 6: Ensure options exist...\n');
  const mockupOptionGroupsById = new Map(mockupData.optionGroups.map((item) => [item.id, item]));

  for (const option of mockupData.options) {
    const mockupGroup = mockupOptionGroupsById.get(option.optionGroupId);
    if (!mockupGroup) {
      summary.options.failed += 1;
      console.log(`   ✗ ${option.name} (mockup option group not found)`);
      continue;
    }

    const productMock = mockupProductsById.get(mockupGroup.productId);
    const productReal = productMock ? productByName.get(normalizeName(productMock.name)) : null;

    if (!productReal?.id || !Array.isArray(productReal.optionGroups)) {
      summary.options.failed += 1;
      console.log(`   ✗ ${option.name} (product/option groups not ready)`);
      continue;
    }

    const realOptionGroupId = optionGroupMap.get(option.optionGroupId);
    const realOptionGroup = productReal.optionGroups.find((group) => group.id === realOptionGroupId);

    if (!realOptionGroup?.id) {
      summary.options.failed += 1;
      console.log(`   ✗ ${option.name} (option group not found)`);
      continue;
    }

    const existingOptions = Array.isArray(realOptionGroup.options) ? realOptionGroup.options : [];
    const existingOption = findByName(existingOptions, option.name);

    if (existingOption?.id) {
      summary.options.existing += 1;
      console.log(`   • ${option.name} (exists)`);
      continue;
    }

    try {
      const created = await apiRequestWithRetry('POST', '/options', {
        optionGroupId: realOptionGroup.id,
        name: option.name,
        description: option.description,
        priceModifier: option.priceModifier
      }, token1);

      realOptionGroup.options = [...existingOptions, created];
      summary.options.created += 1;
      console.log(`   ✓ ${option.name} (created)`);
    } catch (error) {
      summary.options.failed += 1;
      console.log(`   ✗ ${option.name} (${error.message})`);
    }
  }

  console.log('\n🎉 Seed completed\n');
  console.log('📊 Summary');
  console.log(`   Accounts     -> created: ${summary.accounts.created}, existing: ${summary.accounts.existing}, failed: ${summary.accounts.failed}`);
  console.log(`   Categories   -> created: ${summary.categories.created}, existing: ${summary.categories.existing}, failed: ${summary.categories.failed}`);
  console.log(`   Products     -> created: ${summary.products.created}, existing: ${summary.products.existing}, failed: ${summary.products.failed}`);
  console.log(`   OptionGroups -> created: ${summary.optionGroups.created}, existing: ${summary.optionGroups.existing}, failed: ${summary.optionGroups.failed}`);
  console.log(`   Options      -> created: ${summary.options.created}, existing: ${summary.options.existing}, failed: ${summary.options.failed}\n`);

  console.log('🔐 Demo Login');
  console.log('   Owner 1: flora.owner1@example.com / secret123');
  console.log('   Owner 2: flora.owner2@example.com / secret123');
  console.log('   Customer 1: flora.customer1@example.com / secret123');
  console.log('   Customer 2: flora.customer2@example.com / secret123\n');
}

main().catch((error) => {
  console.error('\n❌ Seed failed:', error.message);
  process.exit(1);
});
