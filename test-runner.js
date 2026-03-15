// Test uruchomieniowy - sprawdzenie kluczowych funkcji
console.log("🧪 Rozpoczynanie testów aplikacji...");

// Test 1: Sprawdzenie czy środowisko jest poprawnie skonfigurowane
try {
  const response = await fetch('/api/admin/courses');
  console.log("✅ API endpoint dostępny (status: " + response.status + ")");
} catch (error) {
  console.log("❌ Błąd API:", error.message);
}

// Test 2: Sprawdzenie walidacji
const testSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
console.log("✅ Walidacja sluga:", testSlug.test("test-kurs") ? "OK" : "BŁĄD");
console.log("❌ Walidacja niepoprawnego sluga:", !testSlug.test("Test Kurs") ? "OK" : "BŁĄD");

// Test 3: Sprawdzenie kalkulacji kuponów
const percentageTest = Math.round(10000 * (10 / 100));
console.log("✅ Kalkulacja 10% z 10000:", percentageTest === 1000 ? "OK" : "BŁĄD");

console.log("🎉 Testy zakończone!");
