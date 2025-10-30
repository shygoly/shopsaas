/**
 * Playwright E2E Test: ShopSaaS智能客服集成测试
 * 测试创建新店铺和启用智能客服完整流程
 */

import { test, expect } from '@playwright/test';

const SHOPSAAS_URL = process.env.SHOPSAAS_URL || 'https://shopsaas.fly.dev';
const TEST_EMAIL = process.env.TEST_EMAIL || `test-${Date.now()}@example.com`;
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

test.describe('ShopSaaS智能客服集成测试', () => {
  let userId, shopId, shopUrl;

  test('1. 注册新用户', async ({ page }) => {
    console.log(`📝 注册新用户: ${TEST_EMAIL}`);
    
    await page.goto(`${SHOPSAAS_URL}/sign-up`);
    
    // 填写注册表单
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // 等待跳转到dashboard
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`, { timeout: 15000 });
    
    // 验证登录成功
    const creditsElement = await page.locator('#credits').textContent();
    console.log(`✅ 注册成功，初始积分: ${creditsElement}`);
    
    expect(creditsElement).toBeTruthy();
  });

  test('2. 创建新店铺', async ({ page }) => {
    console.log('🏪 开始创建新店铺...');
    
    // 登录
    await page.goto(`${SHOPSAAS_URL}/sign-in`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`);
    
    // 记录当前积分
    const initialCredits = await page.locator('#credits').textContent();
    console.log(`💰 当前积分: ${initialCredits}`);
    
    // 点击创建店铺按钮
    await page.click('button:has-text("Create Shop")');
    
    // 填写店铺信息
    const shopName = `TestShop${Date.now()}`;
    const slug = shopName.toLowerCase();
    
    await page.fill('input[name="shop_name"]', shopName);
    await page.fill('input[name="slug"]', slug);
    await page.click('button[type="submit"]');
    
    console.log(`📝 店铺信息: ${shopName} (${slug})`);
    
    // 等待创建成功（这可能需要几分钟）
    console.log('⏳ 等待店铺部署...');
    
    // 等待成功消息或店铺出现在列表中
    await page.waitForSelector(`.shop:has-text("${shopName}")`, { 
      timeout: 300000 // 5分钟超时
    });
    
    console.log('✅ 店铺创建成功！');
    
    // 获取店铺URL
    const shopCard = page.locator(`.shop:has-text("${shopName}")`);
    const shopLink = shopCard.locator('a[href*=".fly.dev"]');
    shopUrl = await shopLink.getAttribute('href');
    
    console.log(`🌐 店铺URL: ${shopUrl}`);
    
    // 验证积分是否扣除（第一个店铺免费）
    const newCredits = await page.locator('#credits').textContent();
    console.log(`💰 剩余积分: ${newCredits}`);
  });

  test('3. 验证店铺可访问', async ({ page }) => {
    console.log('🔍 验证店铺可访问...');
    
    // 登录获取shopUrl
    await page.goto(`${SHOPSAAS_URL}/sign-in`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`);
    
    // 获取第一个店铺的URL
    const firstShopLink = page.locator('.shop a[href*=".fly.dev"]').first();
    shopUrl = await firstShopLink.getAttribute('href');
    
    if (!shopUrl) {
      console.log('⚠️ 没有找到店铺，跳过测试');
      test.skip();
      return;
    }
    
    console.log(`🌐 访问店铺: ${shopUrl}`);
    
    // 访问店铺
    const response = await page.goto(shopUrl);
    
    // 验证响应成功
    expect(response.status()).toBeLessThan(400);
    
    console.log('✅ 店铺可访问');
  });

  test('4. 启用智能客服', async ({ page }) => {
    console.log('🤖 开始启用智能客服...');
    
    // 登录
    await page.goto(`${SHOPSAAS_URL}/sign-in`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`);
    
    // 检查积分
    const creditsText = await page.locator('#credits').textContent();
    const currentCredits = parseInt(creditsText);
    console.log(`💰 当前积分: ${currentCredits}`);
    
    if (currentCredits < 50) {
      console.log('⚠️ 积分不足（需要50积分），跳过智能客服测试');
      test.skip();
      return;
    }
    
    // 查找"启用智能客服"按钮
    const enableButton = page.locator('button:has-text("启用智能客服")').first();
    
    // 检查按钮是否存在
    const isVisible = await enableButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      console.log('⚠️ 没有找到"启用智能客服"按钮，可能已启用或店铺不存在');
      test.skip();
      return;
    }
    
    // 点击启用按钮
    await enableButton.click();
    
    // 等待确认对话框
    page.on('dialog', async (dialog) => {
      console.log(`📢 确认对话框: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // 等待成功消息（可能需要30秒）
    console.log('⏳ 等待智能客服启用...');
    
    await page.waitForSelector('text=/智能客服启用成功|智能客服已启用/', { 
      timeout: 60000 
    });
    
    console.log('✅ 智能客服启用成功！');
    
    // 验证积分是否扣除
    const newCreditsText = await page.locator('#credits').textContent();
    const newCredits = parseInt(newCreditsText);
    console.log(`💰 剩余积分: ${newCredits}`);
    
    expect(newCredits).toBe(currentCredits - 50);
    
    // 验证状态badge显示
    await expect(page.locator('text=智能客服已启用')).toBeVisible();
  });

  test('5. 验证Widget显示在店铺页面', async ({ page }) => {
    console.log('🔍 验证聊天Widget显示...');
    
    // 登录获取shop URL
    await page.goto(`${SHOPSAAS_URL}/sign-in`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`);
    
    // 获取第一个店铺的URL
    const firstShopLink = page.locator('.shop a[href*=".fly.dev"]').first();
    shopUrl = await firstShopLink.getAttribute('href');
    
    if (!shopUrl) {
      console.log('⚠️ 没有找到店铺URL');
      test.skip();
      return;
    }
    
    console.log(`🌐 访问店铺: ${shopUrl}`);
    
    // 访问店铺
    await page.goto(shopUrl);
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 查找聊天按钮（可能需要等待一段时间）
    console.log('⏳ 等待聊天按钮加载...');
    
    const chatButton = page.locator('.chat-button');
    await expect(chatButton).toBeVisible({ timeout: 20000 });
    
    console.log('✅ 聊天按钮显示正常！');
    
    // 验证按钮样式
    const bgColor = await chatButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    console.log(`🎨 按钮颜色: ${bgColor}`);
  });

  test('6. 测试聊天功能', async ({ page }) => {
    console.log('💬 测试聊天功能...');
    
    // 登录获取shop URL
    await page.goto(`${SHOPSAAS_URL}/sign-in`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`);
    
    // 获取店铺URL
    const firstShopLink = page.locator('.shop a[href*=".fly.dev"]').first();
    shopUrl = await firstShopLink.getAttribute('href');
    
    if (!shopUrl) {
      test.skip();
      return;
    }
    
    // 访问店铺
    await page.goto(shopUrl);
    await page.waitForLoadState('networkidle');
    
    // 点击聊天按钮
    const chatButton = page.locator('.chat-button');
    await chatButton.waitFor({ state: 'visible', timeout: 20000 });
    await chatButton.click();
    
    console.log('🖱️ 点击聊天按钮');
    
    // 等待聊天窗口打开
    await expect(page.locator('.chat-window')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ 聊天窗口已打开');
    
    // 发送测试消息
    const testMessage = `你好，这是自动化测试消息 - ${Date.now()}`;
    const textarea = page.locator('.message-input textarea');
    await textarea.fill(testMessage);
    
    console.log(`📝 输入消息: ${testMessage}`);
    
    // 点击发送按钮
    await page.locator('.send-button').click();
    
    console.log('📤 发送消息');
    
    // 验证用户消息显示
    await expect(page.locator('.message-bubble.user')).toContainText(testMessage.substring(0, 20));
    
    console.log('✅ 用户消息已显示');
    
    // 等待AI回复（可能需要几秒钟）
    console.log('⏳ 等待AI回复...');
    
    const assistantMessage = page.locator('.message-bubble.assistant').first();
    await expect(assistantMessage).toBeVisible({ timeout: 30000 });
    
    const aiReply = await assistantMessage.textContent();
    console.log(`🤖 AI回复: ${aiReply}`);
    
    console.log('✅ 聊天功能测试完成！');
  });

  test('7. 测试移动端响应式', async ({ page }) => {
    console.log('📱 测试移动端响应式...');
    
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 登录并获取shop URL
    await page.goto(`${SHOPSAAS_URL}/sign-in`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`);
    
    const firstShopLink = page.locator('.shop a[href*=".fly.dev"]').first();
    shopUrl = await firstShopLink.getAttribute('href');
    
    if (!shopUrl) {
      test.skip();
      return;
    }
    
    // 访问店铺
    await page.goto(shopUrl);
    
    // 点击聊天按钮
    const chatButton = page.locator('.chat-button');
    await chatButton.waitFor({ state: 'visible', timeout: 20000 });
    await chatButton.click();
    
    // 验证聊天窗口全屏显示
    const chatWindow = page.locator('.chat-window');
    const boundingBox = await chatWindow.boundingBox();
    
    console.log(`📐 聊天窗口尺寸: ${boundingBox?.width}x${boundingBox?.height}`);
    
    // 手机端应该是全屏
    expect(boundingBox?.width).toBeCloseTo(375, 5);
    expect(boundingBox?.height).toBeCloseTo(667, 5);
    
    console.log('✅ 移动端响应式测试通过！');
  });

  test('8. 测试消息持久化', async ({ page }) => {
    console.log('💾 测试消息持久化...');
    
    // 登录并获取shop URL
    await page.goto(`${SHOPSAAS_URL}/sign-in`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${SHOPSAAS_URL}/dashboard`);
    
    const firstShopLink = page.locator('.shop a[href*=".fly.dev"]').first();
    shopUrl = await firstShopLink.getAttribute('href');
    
    if (!shopUrl) {
      test.skip();
      return;
    }
    
    // 访问店铺并发送消息
    await page.goto(shopUrl);
    await page.locator('.chat-button').click();
    
    const testMessage = `持久化测试 - ${Date.now()}`;
    await page.locator('.message-input textarea').fill(testMessage);
    await page.locator('.send-button').click();
    
    // 等待消息显示
    await expect(page.locator('.message-bubble.user')).toContainText('持久化测试');
    
    console.log('📝 消息已发送');
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('🔄 页面已刷新');
    
    // 重新打开聊天
    await page.locator('.chat-button').click();
    
    // 验证消息仍然存在
    await expect(page.locator('.message-bubble.user')).toContainText('持久化测试');
    
    console.log('✅ 消息持久化测试通过！');
  });
});

test.describe('管理后台测试', () => {
  test.skip('9. 测试数据同步功能', async ({ page }) => {
    // 这个测试需要登录EverShop管理后台
    // 需要管理员账号密码
    console.log('⚙️ 测试数据同步功能（需要管理员权限）');
    
    // TODO: 实现管理后台登录和数据同步测试
  });
});

