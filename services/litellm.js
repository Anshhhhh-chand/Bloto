async function chat(messages, model = 'gemini-3.8-flash') {
  const modelToUse = process.env.GEMINI_MODEL || model || 'gemini-3.8-flash';
  console.log('Using Gemini model:', modelToUse);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error in Gemini API chat:', error);
    console.error('Error details:', {
      message: error.message,
      modelRequested: modelToUse,
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
    throw new Error('Failed to get response from AI service: ' + (error.message || 'Unknown'));
  }
}

module.exports = { chat };
