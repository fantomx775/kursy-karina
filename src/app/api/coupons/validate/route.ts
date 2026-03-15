import { authenticateUser } from "@/services/auth/server";
import { validateCoupon } from "@/services/coupons";

export async function POST(request: Request) {
  const auth = await authenticateUser();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const { code, subtotalAmount } = await request.json();

  if (!code || typeof code !== "string") {
    return Response.json({ error: "Kod kuponu jest wymagany." }, { status: 400 });
  }

  if (typeof subtotalAmount !== "number" || subtotalAmount <= 0) {
    return Response.json(
      { error: "Nieprawidłowa wartość koszyka." },
      { status: 400 },
    );
  }

  const result = await validateCoupon({
    code,
    userId: auth.user.id,
    subtotalAmount,
  });

  if (!result.valid) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({
    couponId: result.couponId,
    discountAmount: result.discountAmount,
  });
}
