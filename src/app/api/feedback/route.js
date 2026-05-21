export async function POST(req) {
  try {
    const body = await req.json();

    const message = `
📩 New Feedback

👤 Name: ${body.name}
📧 Email: ${body.email}
⭐ Rating: ${body.rating}
💬 Feedback: ${body.feedback}
`;

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );

    const telegramData = await telegramResponse.json();

    console.log(telegramData);

    if (!telegramData.ok) {
      return Response.json(
        {
          success: false,
          error: telegramData.description,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
