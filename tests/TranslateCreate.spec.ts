import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const TEST_COUNT = 10; // kaç kez çalışsın

// Türkmenistan mobil telefon formatı (login için)
const LOGIN_PHONE = "640000000";
const LOGIN_PASSWORD = "qwerty";

// Bildiğimiz sabit seçenekler - senin gerçek dropdown'ındaki TÜM seçenekleri
// söylersen bu listeleri genişletirim, şimdilik gördüğüm tek örnekle başlıyorum
const statuses = ["Gyssagly","Adaty"]; // örn: "Adaty", "Gyssagly" gibi başka seçenekler varsa ekle
const paidOptions = ["Tölendi","Kredit"]; // örn: "Tölenmedi" de varsa ekle
const languagePairs = ["TKM-RU", "RU-TKM", "EN-TKM", "TKM-EN","TKM-RU-EN"];
const correctionStatuses = ["Dogry"]; // başka seçenek varsa ekle

// Açık duran bir dropdown'dan (role="option" listesi) rastgele bir seçenek seçer.
// Client/personel/tercüman gibi DB'den gelen, değişebilen listeler için kullanışlı.
async function selectRandomOption(page: import("@playwright/test").Page) {
  const options = page.getByRole("option");
  const count = await options.count();
  const randomIndex = faker.number.int({ min: 0, max: Math.max(count - 1, 0) });
  await options.nth(randomIndex).click();
}

// Takvimde rastgele bir gün seçer (1-28 arası, her ay için güvenli aralık)
async function selectRandomDay(page: import("@playwright/test").Page) {
  const day = faker.number.int({ min: 1, max: 28 }).toString();
  await page.getByRole("gridcell", { name: day, exact: true }).first().click();
}

function randomTime(): string {
  const hour = faker.number
    .int({ min: 8, max: 18 })
    .toString()
    .padStart(2, "0");
  const minute = faker.number
    .int({ min: 0, max: 59 })
    .toString()
    .padStart(2, "0");
  return `${hour}:${minute}`;
}

for (let i = 0; i < TEST_COUNT; i++) {
  test(`Translation create #${i + 1}`, async ({ page }) => {
    // --- LOGIN ---
    await page.goto("http://localhost:5173/login");
    const loginInputs = page.locator("form input");
    await loginInputs.nth(0).click();
    await loginInputs.nth(0).fill(LOGIN_PHONE);
    await loginInputs.nth(0).press("Tab");
    await loginInputs.nth(1).fill(LOGIN_PASSWORD);
    await page.getByRole("button", { name: "Giriş et" }).click();

    // --- NAVIGATE ---
    await page.getByRole("link", { name: "Terjime" }).click();
    await page.getByRole("button", { name: "Terjime goşmak" }).click();

    // --- CLIENT SELECT (Autocomplete, rastgele bir müşteri seç) ---
    await page.getByRole("button", { name: "Open" }).click();
    await selectRandomOption(page);

    // --- GELEN GÜNI (arrival date) ---
    await page
      .getByRole("button", { name: "Choose date, selected date is" })
      .click();
    await selectRandomDay(page);
    await page.locator('input[type="time"]').first().fill(randomTime());

    // --- STATUS ---
    await page.locator("#status-select").click();
    await page
      .getByRole("option", { name: faker.helpers.arrayElement(statuses) })
      .click();

    // --- PERSONEL (opr_guid) - rastgele seç ---
    await page.locator("#opr_guid-select").click();
    await selectRandomOption(page);

    // --- TERCÜMAN (translator_guid) - rastgele seç ---
    await page.locator("#translator_guid-select").click();
    await selectRandomOption(page);

    // --- DİL ÇİFTİ ---
    const languagePair = faker.helpers.arrayElement(languagePairs);
    await page.locator('input[name="source_to_target"]').click();
    await page.locator('input[name="source_to_target"]').fill(languagePair);

    // --- SAYFA SAYISI ---
    const pageCount = faker.number.int({ min: 1, max: 20 }).toString();
    await page.locator('input[name="page_count"]').click();
    await page.locator('input[name="page_count"]').fill(pageCount);

    // --- FİYAT ---
    const price = faker.number.int({ min: 50, max: 1000 }).toString();
    await page.locator('input[name="price"]').click();
    await page.locator('input[name="price"]').fill(price);

    // --- ÖDENDİ Mİ ---
    await page.locator("#is_paid-select").click();
    await page
      .getByRole("option", { name: faker.helpers.arrayElement(paidOptions) })
      .click();

    // --- TAMAMLANMA TARİHİ ---
    await page
      .getByRole("button", { name: "Choose date", exact: true })
      .click();
    await selectRandomDay(page);
    await page.locator('input[name="completed_time"]').fill(randomTime());

    // --- TAMAMLANAN SAYFA SAYISI ---
    const completedPageCount = faker.number.int({ min: 1, max: 20 }).toString();
    await page.locator('input[name="completed_page_count"]').click();
    await page
      .locator('input[name="completed_page_count"]')
      .fill(completedPageCount);

    // --- DÜZELTME DURUMU ---
    await page.locator('input[name="correction_status"]').click();
    await page
      .locator('input[name="correction_status"]')
      .fill(faker.helpers.arrayElement(correctionStatuses));

    // --- SAVE (isteğin tamamlanmasını bekleyerek) ---
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/translation") &&
          res.request().method() === "POST",
        { timeout: 10000 },
      ),
      page.getByRole("button", { name: "Ýatda sakla" }).click(),
    ]);

    console.log(
      `Translation #${i + 1} save response status:`,
      response.status(),
    );
    expect(response.ok()).toBeTruthy();
  });
}
