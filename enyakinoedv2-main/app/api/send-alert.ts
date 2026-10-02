export default async function handler(req: Request) {
  // Sadece POST isteklerine izin ver
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const { playerIds, latitude, longitude } = await req.json();

    // Gelen verileri kontrol et
    if (
      !Array.isArray(playerIds) ||
      playerIds.length === 0 ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return new Response(
        JSON.stringify({
          error: "Geçersiz bildirim verisi",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // OneSignal REST API anahtarını server ortamından al
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!restApiKey) {
      console.error("ONESIGNAL_REST_API_KEY bulunamadı.");

      return new Response(
        JSON.stringify({
          error: "OneSignal API yapılandırması eksik",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // OneSignal'a bildirim gönder
    const response = await fetch(
      "https://api.onesignal.com/notifications",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${restApiKey}`,
        },

        body: JSON.stringify({
          app_id: "3628049c-37d2-483e-afe9-f6eafae5761a",

          include_subscription_ids: playerIds,

          headings: {
            tr: "🚨 Acil Durum",
            en: "🚨 Emergency",
          },

          contents: {
            tr: "Yakınınızda CPR/OED ihtiyacı var!",
            en: "CPR/AED assistance is needed near you!",
          },

          // Şimdilik koordinatları bildirime tıklanınca
          // uygulamaya aktaracağız.
          url: `https://enyakinoedv2.vercel.app/?lat=${latitude}&lng=${longitude}`,
        }),
      }
    );

    const data = await response.json();

    // OneSignal hata döndürdüyse
    if (!response.ok) {
      console.error("OneSignal API hatası:", data);

      return new Response(
        JSON.stringify({
          error: "OneSignal bildirimi gönderilemedi",
          details: data,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Başarılı
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Push notification error:", error);

    return new Response(
      JSON.stringify({
        error: "Push bildirimi gönderilirken hata oluştu",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
