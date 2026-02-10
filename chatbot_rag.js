// RAG (Retrieval-Augmented Generation) System for IslamAI Chatbot
// Provides accurate, source-based responses by retrieving relevant fatwas from islamqa.info

class IslamQARetriever {
    constructor() {
        this.knowledge = null;
        this.isLoaded = false;
        this.loadKnowledge();
    }

    async loadKnowledge() {
        try {
            const response = await fetch('knowledge/islamqa_db.json');
            const data = await response.json();
            this.knowledge = data.fatwas;
            this.isLoaded = true;
            console.log(`✅ Knowledge base loaded: ${this.knowledge.length} fatwas`);
        } catch (error) {
            console.error('❌ Failed to load knowledge base:', error);
            this.knowledge = [];
            this.isLoaded = false;
        }
    }

    // Normalize text for better matching
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .trim();
    }

    // Extract keywords from query
    extractKeywords(query) {
        const normalized = this.normalizeText(query);
        const words = normalized.split(/\s+/);

        // Remove common stop words (Indonesian)
        const stopWords = ['apa', 'yang', 'di', 'ke', 'dari', 'untuk', 'dengan', 'adalah', 'ini', 'itu', 'dan', 'atau', 'saya', 'kamu', 'bagaimana', 'kapan', 'dimana'];

        return words.filter(word =>
            word.length > 2 && !stopWords.includes(word)
        );
    }

    // Calculate relevance score for a fatwa
    calculateScore(fatwa, keywords) {
        let score = 0;
        const searchText = this.normalizeText(
            `${fatwa.title_id} ${fatwa.question_id} ${fatwa.answer_id} ${fatwa.keywords.join(' ')}`
        );

        keywords.forEach(keyword => {
            // Exact match in keywords array
            if (fatwa.keywords.some(k => k.includes(keyword))) {
                score += 10;
            }

            // Match in title (high priority)
            if (this.normalizeText(fatwa.title_id).includes(keyword)) {
                score += 5;
            }

            // Match in question
            if (this.normalizeText(fatwa.question_id).includes(keyword)) {
                score += 3;
            }

            // Match in answer
            if (this.normalizeText(fatwa.answer_id).includes(keyword)) {
                score += 1;
            }
        });

        return score;
    }

    // Search for relevant fatwas
    searchRelevant(query, topK = 3) {
        if (!this.isLoaded || !this.knowledge || this.knowledge.length === 0) {
            console.warn('⚠️ Knowledge base not loaded yet');
            return [];
        }

        const keywords = this.extractKeywords(query);
        console.log(`🔍 Searching for keywords: ${keywords.join(', ')}`);

        // Calculate scores for all fatwas
        const scored = this.knowledge.map(fatwa => ({
            fatwa,
            score: this.calculateScore(fatwa, keywords)
        }));

        // Sort by score and get top K
        const topResults = scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .map(item => item.fatwa);

        console.log(`📚 Found ${topResults.length} relevant fatwas`);
        return topResults;
    }

    // Format fatwas as context for AI
    formatContext(fatwas) {
        if (!fatwas || fatwas.length === 0) {
            return null;
        }

        const formatted = fatwas.map((f, index) => `
[FATWA #${f.id} - ${f.category}]
Judul: ${f.title_id}
Pertanyaan: ${f.question_id}
Jawaban: ${f.answer_id}
Sumber: ${f.url}
${index < fatwas.length - 1 ? '\n---' : ''}
        `).join('\n');

        return formatted.trim();
    }

    // Get context for a query
    async getContext(query, topK = 3) {
        // Wait for knowledge base to load if not ready
        if (!this.isLoaded) {
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (this.isLoaded) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);

                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 5000);
            });
        }

        const relevantFatwas = this.searchRelevant(query, topK);
        return this.formatContext(relevantFatwas);
    }
}

// Initialize retriever globally
const islamQARetriever = new IslamQARetriever();
