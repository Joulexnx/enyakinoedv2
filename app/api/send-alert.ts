declare const process: {
  env: Record<string, string | undefined>;
};

export default async function handler(req: any, res: any) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { playerIds, latitude, longitude } = req.body;

    if (
      !Array.isArray(playerIds) ||
      playerIds.length === 0 ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        error: "Geçersiz bildirim verisi",
      });
    }

    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!restApiKey) {
      console.error("ONESIGNAL_REST_API_KEY bulunamadı.");

      return res.status(500).json({
        error: "OneSignal API yapılandırması eksik",
      });
    }

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

          data: {
            latitude,
            longitude,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OneSignal API hatası:", data);

      return res.status(response.status).json({
        error: "OneSignal bildirimi gönderilemedi",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Push notification error:", error);

    return res.status(500).json({
      error: "Push bildirimi gönderilirken hata oluştu",
    });
  }
}