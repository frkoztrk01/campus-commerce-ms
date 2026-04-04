/**
 * k6 load script — run against a running stack:
 *   docker compose up --build
 *   k6 run load-tests/smoke.js
 *
 * Tweak VU stages in `options` to match report tables (50 / 100 / 200 / 500 concurrent users).
 */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 50 },
    { duration: "40s", target: 100 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const res = http.post(
    "http://localhost:3000/api/v1/auth/register",
    JSON.stringify({ email: `load-${__VU}-${__ITER}@example.com`, password: "k6-test" }),
    { headers: { "Content-Type": "application/json" } },
  );
  check(res, {
    "register status 201": (r) => r.status === 201,
  });
  sleep(0.05);
}
