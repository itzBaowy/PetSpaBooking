import assert from "node:assert/strict";
import test from "node:test";
import {
  getProviderNavigation,
  getProviderRouteAccess,
  PROVIDER_NAVIGATION,
} from "./provider-access.ts";

const LIMITED_ITEM_IDS = [
  "dashboard",
  "business-profile",
  "verification",
];

test("verified and approved providers receive the full navigation", () => {
  assert.deepEqual(getProviderNavigation("VERIFIED"), PROVIDER_NAVIGATION);
  assert.deepEqual(getProviderNavigation("APPROVED"), PROVIDER_NAVIGATION);
});

for (const status of [
  "PENDING_VERIFICATION",
  "PENDING",
  "REJECTED",
  "SUSPENDED",
] as const) {
  test(`${status} receives only limited navigation`, () => {
    assert.deepEqual(
      getProviderNavigation(status).map((item) => item.id),
      LIMITED_ITEM_IDS,
    );
  });
}

test("limited providers can access safe nested routes", () => {
  assert.equal(
    getProviderRouteAccess(
      "/provider/business-profile/gallery",
      "PENDING_VERIFICATION",
    ).allowed,
    true,
  );
});

test("removed provider nav pages are denied", () => {
  assert.equal(
    getProviderRouteAccess("/provider/communication/notifications", "VERIFIED")
      .allowed,
    false,
  );
});

test("provider profile route is available from the topbar", () => {
  assert.equal(getProviderRouteAccess("/provider/profile", "VERIFIED").allowed, true);
  assert.equal(getProviderRouteAccess("/provider/profile", "PENDING_VERIFICATION").allowed, true);
  assert.equal(getProviderRouteAccess("/provider/profile", "SUSPENDED").allowed, true);
});

test("limited and suspended providers cannot access operational routes", () => {
  const pendingAccess = getProviderRouteAccess(
    "/provider/services/create",
    "PENDING_VERIFICATION",
  );
  const suspendedAccess = getProviderRouteAccess(
    "/provider/bookings/booking-id",
    "SUSPENDED",
  );

  assert.equal(pendingAccess.allowed, false);
  assert.match(pendingAccess.reason ?? "", /chưa được phê duyệt/);
  assert.equal(suspendedAccess.allowed, false);
  assert.match(suspendedAccess.reason ?? "", /tạm ngưng/);
});

test("verified providers can access operational nested routes", () => {
  assert.equal(
    getProviderRouteAccess("/provider/services/create", "VERIFIED").allowed,
    true,
  );
  assert.equal(
    getProviderRouteAccess("/provider/bookings/booking-id", "VERIFIED").allowed,
    true,
  );
});

test("unknown status and unknown provider route are denied without redirect loops", () => {
  const unknownStatus = getProviderRouteAccess("/provider", null);
  const unknownRoute = getProviderRouteAccess(
    "/provider/not-a-feature",
    "VERIFIED",
  );

  assert.equal(unknownStatus.allowed, false);
  assert.equal(unknownStatus.fallbackHref, "/provider");
  assert.equal(unknownRoute.allowed, false);
  assert.equal(unknownRoute.fallbackHref, "/provider");
});
