import type { Course } from "@/types/course";
import type { Coupon } from "@/types/coupon";
import type { CourseFormData } from "../CourseForm";
import type { CouponFormData } from "../CouponForm";
import { slugify } from "@/lib/utils";

export function useAdminActions() {
  const handleSaveCourse = async (data: CourseFormData, editingCourse?: Course | null) => {
    const slug = editingCourse ? editingCourse.slug : slugify(data.title);
    const payload = {
      ...data,
      slug,
      price: Number(data.price),
      sections: data.sections.map((section, sectionIndex) => ({
        title: section.title,
        position: sectionIndex,
        items: section.items.map((item, itemIndex) => ({
          title: item.title,
          kind: item.kind,
          assetPath: item.kind === "svg" ? item.assetPath : undefined,
          youtubeUrl: item.kind === "youtube" ? item.youtubeUrl : undefined,
          position: itemIndex,
          isPreview: false,
        })),
      })),
    };
    // #region agent log
    fetch('http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9b4d30'},body:JSON.stringify({sessionId:'9b4d30',runId:'baseline',hypothesisId:'H2',location:'useAdminActions.ts:28',message:'Payload prepared in admin action',data:{slug:payload.slug,hasMainImageUrl:Boolean(payload.mainImageUrl),mainImageUrlLength:payload.mainImageUrl?.length ?? 0,sectionsLen:payload.sections?.length,fieldKeys:Object.keys(payload).filter((key) => ['title','slug','description','price','status','sections','mainImageUrl'].includes(key)).sort()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    try {
      // #region agent log
      fetch('http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'99f69b'},body:JSON.stringify({sessionId:'99f69b',location:'useAdminActions.ts:handleSaveCourse',message:'Payload before save',data:{slug:payload.slug,price:payload.price,priceType:typeof payload.price,sectionsLen:payload.sections?.length,sectionTitles:payload.sections?.map((s: { title: string }) => s.title),itemsPerSection:payload.sections?.map((s: { items: { kind: string; assetPath?: string }[] }) => s.items.map((i: { kind: string; assetPath?: string }) => ({ kind: i.kind, hasAsset: Boolean(i.assetPath) })))},timestamp:Date.now(),hypothesisId:'client-payload'})}).catch(()=>{});
      // #endregion
      const response = await fetch(
        editingCourse ? `/api/admin/courses/${editingCourse.id}` : "/api/admin/courses",
        {
          method: editingCourse ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.field === "slug") {
          throw new Error(`Błąd w polu adresu URL: ${result.error}`);
        } else if (result.details) {
          throw new Error(`Błąd walidacji: ${result.error}`);
        } else {
          throw new Error(result.error || "Nie udało się zapisać kursu.");
        }
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
      return { success: false, error: message };
    }
  };

  const handleSaveCoupon = async (data: CouponFormData, editingCoupon?: Coupon | null) => {
    const payload = {
      name: data.name,
      code: data.code,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      startDate: data.startDate,
      endDate: data.endDate || null,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
      usageLimitPerUser: data.usageLimitPerUser
        ? Number(data.usageLimitPerUser)
        : null,
      isActive: data.isActive,
    };

    try {
      const response = await fetch(
        editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : "/api/admin/coupons",
        {
          method: editingCoupon ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Nie udało się zapisać kuponu.");
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
      return { success: false, error: message };
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć kuponu.");
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
      return { success: false, error: message };
    }
  };

  return {
    handleSaveCourse,
    handleSaveCoupon,
    handleDeleteCoupon,
  };
}
