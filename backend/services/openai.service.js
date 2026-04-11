const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../config/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/*
 * SYSTEM PROMPT
 * Constrains the model to restaurant-menu-only answers and asks it to
 * return data in a Markdown table the frontend can parse.
 *
 * NOTE: This system does NOT have live web access. The model relies on
 * its training data to approximate menu information. For production use,
 * plug a web-scraping / data-retrieval layer into `getMenuResponse()`
 * BEFORE calling the LLM — e.g., a Bing/Google search API, or a
 * restaurant data provider (Zomato, Yelp, etc.).
 */
const SYSTEM_PROMPT = `You are MenuChat — a helpful assistant that ONLY answers questions about restaurant menus.

STRICT RULES:
1. You MUST refuse any question that is not related to restaurant food menus, politely saying: "I'm sorry, I can only help with restaurant menu queries. Please ask about a specific restaurant's menu.""
2. When you have plausible menu information, respond with a Markdown table using EXACTLY these columns:
   | Item Name | Category | Price | Description | Veg/Non-Veg |
3. You MUST provide the complete menu of the restaurant (all available items and categories). Do not provide partial menus unless explicitly requested by the user.
4. If you cannot verify the latest full menu, say clearly: "The information below is approximate and based on previously available data."
5. NEVER invent menu items, prices, or descriptions. If you truly have no data, say: "I don't have reliable menu information for this restaurant."
6. You MUST include the restaurant’s contact details (phone number and address, if available) after the menu table, followed by the disclaimer:
"⚠️ Menu availability and pricing may vary by branch and date."
7. Extract the restaurant name and location from the user's query when possible.
8. If the query mentions a restaurant but also asks non-menu things, answer ONLY the menu part.
9. Respond only in English.
`;

/**
 * Send user query to Gemini and get a menu-focused response.
 *
 * @param {string} userMessage - The sanitized user query
 * @param {Array}  history     - Previous messages in [{role, content}] format (max last 6)
 * @returns {{ content: string, restaurantName: string|null, location: string|null }}
 */
async function getMenuResponse(userMessage, history = []) {
  /*
   * ── Data-retrieval hook (future) ──────────────────────
   * Insert a call here to fetch live menu data from an external
   * source (web search API, Zomato/Yelp API, web scraper, etc.)
   * and prepend the results into the user message or as an
   * additional system message before sending to the LLM.
   * ──────────────────────────────────────────────────────
   */

  try {
    console.log('=== Starting Gemini API Call ===');
    console.log('User message:', userMessage.substring(0, 50));
    console.log('History length:', history.length);

    // Build messages array for Gemini
    const messages = [];
    
    // Add history
    history.slice(-6).forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    });

    // Add current user message with system prompt
    const userMessageWithSystem = SYSTEM_PROMPT + '\n\n' + userMessage;
    messages.push({
      role: 'user',
      parts: [{ text: userMessageWithSystem }],
    });

    console.log('Total messages:', messages.length);
    console.log('Getting model instance...');
    
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest'
    });
    
    console.log('Model retrieved. Sending message...');
    
    // Use startChat for conversation history support
    const chatHistory = messages.slice(0, -1);
    const lastMessage = messages[messages.length - 1]?.parts[0]?.text || userMessageWithSystem;
    
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(lastMessage);
    
    console.log('Response received from Gemini');
    const response = await result.response;
    const content = response.text();
    
    console.log('Content extracted, length:', content.length);

    // Attempt to extract restaurant name & location from the user query
    const { restaurantName, location } = extractRestaurantInfo(userMessage);

    return { content, restaurantName, location };
  } catch (err) {
    console.error('=== GEMINI API ERROR ===');
    console.error('Error Type:', err.constructor.name);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    console.error('Error Status:', err.status);
    console.error('Full Error Object:', err);
    console.error('Stack Trace:', err.stack);
    console.error('========================');
    
    logger.error('Gemini API error:', err.message);
    logger.error('Error details:', err);
    throw new Error('Failed to get response from AI service.');
  }
}

/**
 * Simple heuristic to pull restaurant name and location from a query.
 * Production systems should use NER or an LLM function-call for this.
 */
function extractRestaurantInfo(query) {
  let restaurantName = null;
  let location = null;

  // Pattern: "... <restaurant> ... in/at/near <location> ..."
  const locPattern = /(?:menu\s+(?:of|for|from)\s+)?(.+?)\s+(?:in|at|near|from)\s+(.+)/i;
  const match = query.match(locPattern);

  if (match) {
    restaurantName = match[1].replace(/\b(menu|restaurant|the)\b/gi, '').trim() || null;
    location = match[2].replace(/\b(menu|please|thanks)\b/gi, '').trim() || null;
  } else {
    // Fallback: treat entire query minus filler words as restaurant name
    const cleaned = query
      .replace(/\b(give|me|show|get|about|what|is|the|menu|of|for|from|restaurant|please|thanks|latest|full|complete)\b/gi, '')
      .trim();
    if (cleaned.length > 1) restaurantName = cleaned;
  }

  return { restaurantName, location };
}

module.exports = { getMenuResponse };
