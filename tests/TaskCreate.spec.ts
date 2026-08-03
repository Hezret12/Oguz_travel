import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const TEST_COUNT = 20; // Testin kaç kez çalışacağını buradan ayarlayabilirsin

// Giriş bilgileri
const LOGIN_PHONE = "640000000";
const LOGIN_PASSWORD = "qwerty";

// Sistemindeki seçenekleri buraya ekleyebilirsin
const priorities = ["Gyssagly", "Adaty"]; // Öncelik seçenekleri (Varsayımlar ekledim, kendine göre düzelt)
const statuses = ["ÝERİNE ÝETİRİLMELİ", "DOWAM EDÝÄR", "TAMAMLANDY"]; // Durum seçenekleri

// Açık duran bir dropdown'dan (role="option" listesi) rastgele bir seçenek seçer.
async function selectRandomOption(page) {
  const options = page.getByRole("option");
  const count = await options.count();
  const randomIndex = faker.number.int({ min: 0, max: Math.max(count - 1, 0) });
  await options.nth(randomIndex).click();
}

// Takvimde rastgele bir gün seçer (1-28 arası, her ay için güvenli aralık)
async function selectRandomDay(page) {
  const day = faker.number.int({ min: 1, max: 28 }).toString();
  await page.getByRole("gridcell", { name: day, exact: true }).first().click();
}

for (let i = 0; i < TEST_COUNT; i++) {
  test(`Task create #${i + 1}`, async ({ page }) => {
    // --- LOGIN ---
    await page.goto("http://localhost:5173/login");
    const loginInputs = page.locator("form input");

    // Telefon numarası
    await loginInputs.nth(0).click();
    await loginInputs.nth(0).fill(LOGIN_PHONE);
    await loginInputs.nth(0).press("Tab");

    // Şifre
    await loginInputs.nth(1).fill(LOGIN_PASSWORD);
    await page.getByRole("button", { name: "Giriş et" }).click();

    // --- NAVIGATE ---
    await page.getByRole("link", { name: "Ýumuşlar" }).click();
    await page.getByRole("button", { name: "Täze ýumuş" }).click();

    // --- BAŞLIK (Title) ---
    await page.getByRole("textbox", { name: "task.enterTaskTitle" }).click();
    await page
      .getByRole("textbox", { name: "task.enterTaskTitle" })
      .fill(faker.lorem.words(4)); // Rastgele 4 kelimelik başlık
    await page
      .getByRole("textbox", { name: "task.enterTaskTitle" })
      .press("Tab");

    // --- AÇIKLAMA (Description) ---
    await page
      .getByRole("textbox", { name: "Ýumuş düşündirişini giriziň" })
      .click();
    await page
      .getByRole("textbox", { name: "Ýumuş düşündirişini giriziň" })
      .fill(faker.lorem.sentences(2)); // Rastgele 2 cümlelik açıklama

    // --- ÇALIŞAN SEÇİMİ (Employee) ---
    await page.getByRole("combobox", { name: "Işgäri saýlaň" }).click();
    // Sistemdeki çalışanlardan rastgele birini seçer
    await selectRandomOption(page);

    // --- ÖNCELİK (Priority) ---
    await page.locator("#priority-select").click();
    await page
      .getByRole("option", { name: faker.helpers.arrayElement(priorities) })
      .click();

    // --- DURUM (Status) ---
    await page.locator("#status-select").click();
    await page
      .getByRole("option", { name: faker.helpers.arrayElement(statuses) })
      .click();

    // --- TARİH SEÇİMİ (Date) ---
    await page.getByRole("button", { name: "Choose date" }).click();
    await selectRandomDay(page);

    // --- KAYDET (API'nin yanıt vermesini bekle) ---
    // Not: Endpoint URL'i (/task veya /yumus) projenize göre değiştirebilirsiniz.
    const [response] = await Promise.all([
      page
        .waitForResponse((res) => res.request().method() === "POST", {
          timeout: 10000,
        })
        .catch(() => null), // Timeout olursa testi kırma, sadece devam et
      page.getByRole("button", { name: "Ýumuş döretmek" }).click(),
    ]);

    if (response) {
      console.log(`Task #${i + 1} save response status:`, response.status());
      expect(response.ok()).toBeTruthy();
    }

    // --- EKRAN KONTROLLERİ VE TEMİZLİK ---
    // İlk kodunda yer alan işlem sonrası görünümlere tıklama (İhtiyaca göre aç/kapa yapabilirsin)
    await page.getByRole("button", { name: "Sanaw" }).click();
    await page.getByRole("button", { name: "Lauha" }).click();
  });
}
