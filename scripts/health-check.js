/**
 * Health Check Script
 *
 * Verifies that the application is running and healthy
 * Used in CI/CD pipeline post-deployment
 */

const https = require('https');
const http = require('http');

// Configuration
const URLS = [
  process.env.HEALTH_CHECK_URL || 'http://localhost:3000',
  process.env.API_HEALTH_CHECK_URL || 'http://localhost:3000/api/health',
];

const TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ url, statusCode: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Check URL with retries
 */
async function checkUrl(url, retries = MAX_RETRIES) {
  console.log(`Checking: ${url}`);

  for (let i = 0; i < retries; i++) {
    try {
      const result = await makeRequest(url);
      console.log(`✅ ${url} - OK (${result.statusCode})`);
      return true;
    } catch (error) {
      console.log(
        `❌ ${url} - Failed (attempt ${i + 1}/${retries}): ${error.message}`
      );

      if (i < retries - 1) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  return false;
}

/**
 * Main health check
 */
async function healthCheck() {
  console.log('🏥 Starting health check...\n');

  const results = await Promise.all(URLS.map((url) => checkUrl(url)));

  const allHealthy = results.every((result) => result === true);

  console.log('\n' + '='.repeat(50));
  if (allHealthy) {
    console.log('✅ All health checks passed!');
    process.exit(0);
  } else {
    console.log('❌ Some health checks failed!');
    process.exit(1);
  }
}

// Run health check
healthCheck().catch((error) => {
  console.error('💥 Health check error:', error);
  process.exit(1);
});
