const { 
  DRAFT_PROMPT, 
  generateText 
} = require('./llm');

function safeJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    try {
      const jsonMatch = jsonString.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
    } catch (innerError) {
      console.error('Failed to parse JSON:', innerError);
      return null;
    }
  }
  return null;
}

async function runDraftWorkflow(topic) {
  try {
    console.log(`Starting draft workflow for topic: ${topic}`);

    const markdown = await generateText(DRAFT_PROMPT, { topic });
    console.log('Generated markdown successfully');

    const titleMatch = markdown.match(/^#\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1] : topic;

        return {
      topic,
      title,
      markdown,
      error: null
    };
  } catch (error) {
    console.error('Draft workflow error:', error);
    return {
      topic,
      title: '',
      markdown: '',
      error: error.message || 'Failed to generate draft'
    };
  }
}

module.exports = {
  runDraftWorkflow,
};