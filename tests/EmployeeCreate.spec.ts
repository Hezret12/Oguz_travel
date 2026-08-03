import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const TEST_COUNT = 10;

const departments = ["Bilet"];
const positions = ["Operator"];
const offices = ["Ahal", "Lebap", "Mary", "Asgabat", "Balkan"];


function generateTurkmenPhoneNumber(): string {
  const prefixes = ["61", "62", "63", "64", "65"];
  const prefix = faker.helpers.arrayElement(prefixes);
  const rest = faker.string.numeric(6);
  return `${prefix}${rest}`;
}

for (let i = 0; i < TEST_COUNT; i++) {
  test(`Employee create #${i + 1}`, async ({ page }) => {
    // --- LOGIN ---
    await page.goto("http://localhost:5173/login");

    const loginInputs = page.locator("form input");
    await loginInputs.nth(0).click();
    await loginInputs.nth(0).fill("640000000");
    await loginInputs.nth(0).press("Tab");
    await loginInputs.nth(1).fill("qwerty");
    await page.getByRole("button", { name: "Giriş et" }).click();

    // --- NAVIGATE TO EMPLOYEES ---
    await page.getByRole("button", { name: "Işgärler" }).click();
    await page.getByRole("link", { name: "Işgärler" }).click();
    await page.getByRole("button", { name: "Işgär goşmak" }).click();

    // --- RANDOM DATA ---
    const fullName = faker.person.fullName();
    const phoneNumber = generateTurkmenPhoneNumber();
    const gmail = faker.internet.email().toLowerCase();
    const address = `${faker.location.city()} ${faker.location.street()}`;
    const department = faker.helpers.arrayElement(departments);
    const position = faker.helpers.arrayElement(positions);
    const office = faker.helpers.arrayElement(offices);

    // --- FILL FORM ---
    await page.locator('input[name="fullName"]').click();
    await page.locator('input[name="fullName"]').fill(fullName);
    await page.locator('input[name="fullName"]').press("Tab");

    await page.locator('input[name="phone_number"]').fill(phoneNumber);

    await page.locator('input[name="gmail"]').click();
    await page.locator('input[name="gmail"]').fill(gmail);

    await page.locator("#department_guid-select").click();
    await page.getByRole("option", { name: department }).click();

    await page.locator("#position_guid-select").click();
    await page.getByRole("option", { name: position }).click();

    await page.locator("#office_guid-select").click();
    await page.getByRole("option", { name: office }).click();

    await page.locator('input[name="address"]').click();
    await page.locator('input[name="address"]').fill(address);

    // --- SAVE (tek seferde, isteğin tamamlanmasını bekleyerek) ---
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/employees") && res.request().method() === "POST",
        { timeout: 10000 },
      ),
      page.getByRole("button", { name: "Ýatda sakla" }).click(),
    ]);

    console.log(`Employee #${i + 1} save response status:`, response.status());
    expect(response.ok()).toBeTruthy();

    console.log(
      `Created employee #${i + 1}: ${fullName} / ${phoneNumber} / ${gmail}`,
    );
  });
}
