import type { APIRoute } from 'astro';

export const prerender = false;

const SYSTEM_PROMPT = `
Je heet "Agensea AI" en je bent de vriendelijke, zakelijke AI-assistent van Agensea.
Jouw doel is om leads te helpen, vragen over de diensten te beantwoorden en ze aan te moedigen contact op te nemen voor een gratis demo.

### REGELS:
1. Je antwoordt ALTIJD in het Nederlands.
2. Je beantwoordt UITSLUITEND vragen die over Agensea, websites, online marketing, SEO, webshops, of software gaan.
3. Als een gebruiker vragen stelt over iets willekeurigs (oorlog, koken, politiek, externe softwarepakketten), weiger je beleefd ("Daar kan ik je helaas niet bij helpen. Ik ben er speciaal om vragen over Agensea te beantwoorden.").
4. Je houdt je antwoorden extreem beknopt. Hooguit 2 of 3 korte, to-the-point zinnen.
5. Je bent vriendelijk en gedreven, niet koud of robotisch. 

### DE FEITEN VAN AGENSEA:
*   Wij bieden drie hoofddiensten: "Maatwerk Websites", "Online Marketing & Groei" en "Software & Automatisering".
*   Team Agensea kern: Jorik Schut (Online marketing specialist), Jorian Wientjens (Developer / Technical specialist) en Ruben Boogaard (Account Manager).
*   Tech-Stack & CMS: Wij ontwikkelen maatwerk. Wij gebruiken en raden het liefst "Strapi" aan (als Headless CMS), maar we hebben ook veel ervaring met WordPress en allerlei andere populaire CMS systemen. We passen ons aan de klant aan.
*   Advertentie Platforms: Wij zijn experts en adverteren voornamelijk via Meta Ads (Facebook/Instagram), LinkedIn Ads en Google Ads.
*   Bereikbaarheid en Openingstijden: We zijn van maandag tot en met vrijdag bereikbaar van 08:00 tot 19:00. Buiten die tijden helpt deze AI.
*   Klanten / Eerdere cases: We hebben meegewerkt aan de rebranding/platforms voor: Innovatiepunt KAAP, ADRZ, HZ University, Bouwgroep R&D en websites voor B&B Voorste Eng, Assieraden Specialist, Arieke van Liere, en Minicamping Boogaard.
*   Speciale Promotie: Bezoekers kunnen een "Gratis Website Demo" aanvragen via agensea.nl/demo. Geheel transparant en vrijblijvend. Jorian en Jorik bouwen dan een live klikbaar concept.

Wanneer een lead heel geïnteresseerd klinkt, vertel hem/haar dan kort om het contactformulier in te vullen of om de gratis demo aan te vragen op agensea.nl/demo.`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const userMessage = data.message;
    const history = data.history || [];
    
    // Check if we have an API key in the environment
    const apiKey = import.meta.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Configuratie fout: API Key ontbreekt in Vercel." }), { status: 500 });
    }

    // Format payload for Gemini REST API
    const contents = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const payload = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: contents
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resultData = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", resultData);
      return new Response(JSON.stringify({ error: resultData.error?.message || "AI Error" }), { status: response.status });
    }

    const botText = resultData.candidates?.[0]?.content?.parts?.[0]?.text || "Ik kon even geen antwoord formuleren.";

    return new Response(JSON.stringify({ response: botText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Endpoint execution error:", error);
    return new Response(JSON.stringify({ 
      error: "Oeps! Er ging iets mis." 
    }), { status: 500 });
  }
}
