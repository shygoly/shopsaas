import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  
  // Example: check if the page has loaded
  await expect(page).toHaveTitle(/ShopSaaS/i);
});

test('user can navigate to dashboard', async ({ page }) => {
  await page.goto('/');
  
  // Example: look for dashboard link
  // const dashboardLink = page.getByRole('link', { name: /dashboard/i });
  // await expect(dashboardLink).toBeVisible();
  
  // Uncomment and customize based on your actual UI
});

// Add more tests below as needed

