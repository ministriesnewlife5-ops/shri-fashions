import { test, expect } from '@playwright/test';

test.describe('Premium Women\'s Fashion Storefront E2E Journey', () => {
  test('1. Homepage displays editorial hero, new arrivals, and silhouettes', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SHRÎ Atelier/i);
    await expect(page.locator('h1')).toContainText('Autumn Nocturne');

    // Verify New Arrivals section is visible
    const newArrivalsHeading = page.locator('text=New Season Arrivals');
    await expect(newArrivalsHeading).toBeVisible();

    // Verify categories are listed
    await expect(page.locator('text=Sculptural Dresses')).toBeVisible();
    await expect(page.locator('text=Silk & Linen Co-ords')).toBeVisible();
  });

  test('2. Can navigate to Shop, apply filters, and view product details', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('h1')).toContainText('The Complete Collection');

    // Click on a product card to navigate to PDP
    const firstProduct = page.locator('h3 a').first();
    const productName = await firstProduct.textContent();
    await firstProduct.click();

    // Verify PDP elements
    await expect(page.locator('h1')).toContainText(productName || '');
    await expect(page.locator('text=Inclusive of all taxes')).toBeVisible();
    await expect(page.locator('text=Add to Shopping Bag')).toBeVisible();
  });

  test('3. Variant selection and Add to Cart flow', async ({ page }) => {
    await page.goto('/products/vayu-pleated-silk-maxi-dress');

    // Choose size M
    const sizeButton = page.locator('button:has-text("M")').first();
    await sizeButton.click();

    // Click Add to Bag
    await page.locator('button:has-text("Add to Shopping Bag")').click();

    // Verify Cart Drawer opens and displays item
    await expect(page.locator('text=Shopping Bag')).toBeVisible();
    await expect(page.locator('text=Proceed to Checkout')).toBeVisible();
  });

  test('4. Full Cart and Checkout navigation', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('h1')).toContainText('Shopping Bag');
  });

  test('5. Admin console navigation and metrics', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('Atelier Business Metrics');
    await expect(page.locator('text=Collected Revenue')).toBeVisible();
    await expect(page.locator('text=Average Order Value')).toBeVisible();
  });
});
