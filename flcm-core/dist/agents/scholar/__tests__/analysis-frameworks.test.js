"use strict";
/**
 * Scholar Agent Analysis Frameworks Tests
 * Test all 5 analysis frameworks (SWOT-USED, SCAMPER, Socratic, 5W2H, Pyramid)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const swot_used_1 = require("../frameworks/swot-used");
const scamper_1 = require("../frameworks/scamper");
const socratic_1 = require("../frameworks/socratic");
const five_w_two_h_1 = require("../frameworks/five-w-two-h");
const pyramid_1 = require("../frameworks/pyramid");
// Mock logger
jest.mock('../../../shared/utils/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));
describe('Analysis Frameworks', () => {
    const sampleContent = `
    The emergence of artificial intelligence in business operations has created both opportunities and challenges. 
    Companies are finding that AI can automate routine tasks, improve decision-making, and provide valuable insights 
    from data analysis. However, the implementation requires significant investment in technology and training. 
    Employees worry about job displacement, while managers struggle with the complexity of integration. 
    The competitive landscape is shifting as early adopters gain advantages over slower-moving competitors.
    
    Key considerations include data privacy, ethical implications, and the need for new skill sets. 
    Organizations must balance innovation with risk management while ensuring regulatory compliance. 
    Success depends on clear strategy, stakeholder buy-in, and careful change management.
  `;
    describe('SWOT-USED Framework', () => {
        let framework;
        beforeEach(() => {
            framework = new swot_used_1.SWOTUSEDFramework();
        });
        it('should analyze content using SWOT-USED structure', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result).toHaveProperty('strengths');
            expect(result).toHaveProperty('weaknesses');
            expect(result).toHaveProperty('opportunities');
            expect(result).toHaveProperty('threats');
            expect(result).toHaveProperty('urgency');
            expect(result).toHaveProperty('satisfaction');
            expect(result).toHaveProperty('ease');
            expect(result).toHaveProperty('delight');
            expect(Array.isArray(result.strengths)).toBe(true);
            expect(Array.isArray(result.weaknesses)).toBe(true);
            expect(Array.isArray(result.opportunities)).toBe(true);
            expect(Array.isArray(result.threats)).toBe(true);
        });
        it('should identify relevant strengths', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.strengths.length).toBeGreaterThan(0);
            expect(result.strengths.some(s => s.toLowerCase().includes('automat') ||
                s.toLowerCase().includes('insight') ||
                s.toLowerCase().includes('decision'))).toBe(true);
        });
        it('should identify relevant weaknesses', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.weaknesses.length).toBeGreaterThan(0);
            expect(result.weaknesses.some(w => w.toLowerCase().includes('investment') ||
                w.toLowerCase().includes('training') ||
                w.toLowerCase().includes('complexity'))).toBe(true);
        });
        it('should identify opportunities', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.opportunities.length).toBeGreaterThan(0);
            expect(result.opportunities.some(o => o.toLowerCase().includes('competitive') ||
                o.toLowerCase().includes('advantage') ||
                o.toLowerCase().includes('innovation'))).toBe(true);
        });
        it('should identify threats', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.threats.length).toBeGreaterThan(0);
            expect(result.threats.some(t => t.toLowerCase().includes('displacement') ||
                t.toLowerCase().includes('competitor') ||
                t.toLowerCase().includes('risk'))).toBe(true);
        });
        it('should assess USED dimensions', async () => {
            const result = await framework.analyze(sampleContent);
            expect(['Low', 'Medium', 'High']).toContain(result.urgency);
            expect(['Low', 'Medium', 'High']).toContain(result.satisfaction);
            expect(['Low', 'Medium', 'High']).toContain(result.ease);
            expect(['Low', 'Medium', 'High']).toContain(result.delight);
        });
        it('should extract meaningful insights', async () => {
            const result = await framework.analyze(sampleContent);
            const insights = framework.extractInsights(result);
            expect(insights.length).toBeGreaterThan(0);
            expect(insights.every(insight => typeof insight === 'string')).toBe(true);
            expect(insights.some(insight => insight.length > 10)).toBe(true);
        });
        it('should handle empty content gracefully', async () => {
            const result = await framework.analyze('');
            expect(result.strengths).toBeDefined();
            expect(result.weaknesses).toBeDefined();
            expect(result.opportunities).toBeDefined();
            expect(result.threats).toBeDefined();
        });
    });
    describe('SCAMPER Framework', () => {
        let framework;
        beforeEach(() => {
            framework = new scamper_1.SCAMPERFramework();
        });
        it('should analyze content using SCAMPER structure', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result).toHaveProperty('substitute');
            expect(result).toHaveProperty('combine');
            expect(result).toHaveProperty('adapt');
            expect(result).toHaveProperty('modify');
            expect(result).toHaveProperty('purpose');
            expect(result).toHaveProperty('eliminate');
            expect(result).toHaveProperty('reverse');
            expect(Array.isArray(result.substitute)).toBe(true);
            expect(Array.isArray(result.combine)).toBe(true);
            expect(Array.isArray(result.adapt)).toBe(true);
        });
        it('should identify substitution opportunities', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.substitute.length).toBeGreaterThan(0);
            expect(result.substitute.some(s => s.toLowerCase().includes('alternative') ||
                s.toLowerCase().includes('replace') ||
                s.toLowerCase().includes('different'))).toBe(true);
        });
        it('should identify combination possibilities', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.combine.length).toBeGreaterThan(0);
            expect(result.combine.some(c => c.toLowerCase().includes('integrate') ||
                c.toLowerCase().includes('merge') ||
                c.toLowerCase().includes('combine'))).toBe(true);
        });
        it('should suggest adaptations', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.adapt.length).toBeGreaterThan(0);
            expect(result.adapt.some(a => a.toLowerCase().includes('adapt') ||
                a.toLowerCase().includes('adjust') ||
                a.toLowerCase().includes('modify'))).toBe(true);
        });
        it('should identify modification opportunities', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.modify.length).toBeGreaterThan(0);
            expect(result.modify.some(m => m.toLowerCase().includes('enhance') ||
                m.toLowerCase().includes('improve') ||
                m.toLowerCase().includes('change'))).toBe(true);
        });
        it('should explore purpose alternatives', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.purpose.length).toBeGreaterThan(0);
            expect(result.purpose.some(p => p.toLowerCase().includes('purpose') ||
                p.toLowerCase().includes('use') ||
                p.toLowerCase().includes('function'))).toBe(true);
        });
        it('should identify elimination candidates', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.eliminate.length).toBeGreaterThan(0);
            expect(result.eliminate.some(e => e.toLowerCase().includes('remove') ||
                e.toLowerCase().includes('eliminate') ||
                e.toLowerCase().includes('reduce'))).toBe(true);
        });
        it('should suggest reverse approaches', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.reverse.length).toBeGreaterThan(0);
            expect(result.reverse.some(r => r.toLowerCase().includes('reverse') ||
                r.toLowerCase().includes('opposite') ||
                r.toLowerCase().includes('invert'))).toBe(true);
        });
        it('should extract creative insights', async () => {
            const result = await framework.analyze(sampleContent);
            const insights = framework.extractInsights(result);
            expect(insights.length).toBeGreaterThan(0);
            expect(insights.every(insight => typeof insight === 'string')).toBe(true);
            expect(insights.some(insight => insight.toLowerCase().includes('creative') ||
                insight.toLowerCase().includes('innovative') ||
                insight.toLowerCase().includes('new'))).toBe(true);
        });
    });
    describe('Socratic Framework', () => {
        let framework;
        beforeEach(() => {
            framework = new socratic_1.SocraticFramework();
        });
        it('should analyze content using Socratic structure', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result).toHaveProperty('questions');
            expect(result).toHaveProperty('assumptions');
            expect(result).toHaveProperty('evidence');
            expect(result).toHaveProperty('implications');
            expect(result).toHaveProperty('perspectives');
            expect(result).toHaveProperty('concepts');
            expect(Array.isArray(result.questions)).toBe(true);
            expect(Array.isArray(result.assumptions)).toBe(true);
            expect(Array.isArray(result.evidence)).toBe(true);
        });
        it('should generate probing questions', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.questions.length).toBeGreaterThan(0);
            expect(result.questions.some(q => q.includes('?'))).toBe(true);
            expect(result.questions.some(q => q.toLowerCase().includes('what') ||
                q.toLowerCase().includes('why') ||
                q.toLowerCase().includes('how'))).toBe(true);
        });
        it('should identify underlying assumptions', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.assumptions.length).toBeGreaterThan(0);
            expect(result.assumptions.some(a => a.toLowerCase().includes('assume') ||
                a.toLowerCase().includes('presume') ||
                a.toLowerCase().includes('belief'))).toBe(true);
        });
        it('should identify supporting evidence', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.evidence.length).toBeGreaterThan(0);
            expect(result.evidence.some(e => e.toLowerCase().includes('evidence') ||
                e.toLowerCase().includes('data') ||
                e.toLowerCase().includes('fact'))).toBe(true);
        });
        it('should explore implications', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.implications.length).toBeGreaterThan(0);
            expect(result.implications.some(i => i.toLowerCase().includes('implication') ||
                i.toLowerCase().includes('consequence') ||
                i.toLowerCase().includes('result'))).toBe(true);
        });
        it('should consider different perspectives', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.perspectives.length).toBeGreaterThan(0);
            expect(result.perspectives.some(p => p.toLowerCase().includes('perspective') ||
                p.toLowerCase().includes('viewpoint') ||
                p.toLowerCase().includes('stakeholder'))).toBe(true);
        });
        it('should identify key concepts', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.concepts.length).toBeGreaterThan(0);
            expect(result.concepts.some(c => c.toLowerCase().includes('concept') ||
                c.toLowerCase().includes('principle') ||
                c.toLowerCase().includes('idea'))).toBe(true);
        });
        it('should extract philosophical insights', async () => {
            const result = await framework.analyze(sampleContent);
            const insights = framework.extractInsights(result);
            expect(insights.length).toBeGreaterThan(0);
            expect(insights.some(insight => insight.toLowerCase().includes('question') ||
                insight.toLowerCase().includes('assumption') ||
                insight.toLowerCase().includes('critical'))).toBe(true);
        });
    });
    describe('5W2H Framework', () => {
        let framework;
        beforeEach(() => {
            framework = new five_w_two_h_1.FiveW2HFramework();
        });
        it('should analyze content using 5W2H structure', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result).toHaveProperty('who');
            expect(result).toHaveProperty('what');
            expect(result).toHaveProperty('when');
            expect(result).toHaveProperty('where');
            expect(result).toHaveProperty('why');
            expect(result).toHaveProperty('how');
            expect(result).toHaveProperty('howMuch');
            expect(typeof result.who).toBe('string');
            expect(typeof result.what).toBe('string');
            expect(typeof result.when).toBe('string');
        });
        it('should identify WHO stakeholders', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.who.length).toBeGreaterThan(0);
            expect(result.who.toLowerCase()).toMatch(/companies|employees|managers|organizations|stakeholders/);
        });
        it('should identify WHAT is happening', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.what.length).toBeGreaterThan(0);
            expect(result.what.toLowerCase()).toMatch(/artificial intelligence|ai|automation|implementation|integration/);
        });
        it('should identify WHEN timing', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.when.length).toBeGreaterThan(0);
            expect(result.when.toLowerCase()).toMatch(/current|emerging|now|implementation|adoption/);
        });
        it('should identify WHERE context', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.where.length).toBeGreaterThan(0);
            expect(result.where.toLowerCase()).toMatch(/business|operations|organizations|workplace|companies/);
        });
        it('should identify WHY reasons', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.why.length).toBeGreaterThan(0);
            expect(result.why.toLowerCase()).toMatch(/automate|improve|insights|competitive|advantage/);
        });
        it('should identify HOW methods', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.how.length).toBeGreaterThan(0);
            expect(result.how.toLowerCase()).toMatch(/implementation|integration|training|strategy|management/);
        });
        it('should identify HOW MUCH resources', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.howMuch.length).toBeGreaterThan(0);
            expect(result.howMuch.toLowerCase()).toMatch(/investment|cost|resources|significant|training/);
        });
        it('should extract comprehensive insights', async () => {
            const result = await framework.analyze(sampleContent);
            const insights = framework.extractInsights(result);
            expect(insights.length).toBeGreaterThan(0);
            expect(insights.some(insight => insight.toLowerCase().includes('comprehensive') ||
                insight.toLowerCase().includes('complete') ||
                insight.toLowerCase().includes('thorough'))).toBe(true);
        });
    });
    describe('Pyramid Framework', () => {
        let framework;
        beforeEach(() => {
            framework = new pyramid_1.PyramidFramework();
        });
        it('should analyze content using Pyramid structure', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result).toHaveProperty('conclusion');
            expect(result).toHaveProperty('keyArguments');
            expect(result).toHaveProperty('supportingData');
            expect(result).toHaveProperty('context');
            expect(typeof result.conclusion).toBe('string');
            expect(Array.isArray(result.keyArguments)).toBe(true);
            expect(Array.isArray(result.supportingData)).toBe(true);
        });
        it('should identify main conclusion', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.conclusion.length).toBeGreaterThan(0);
            expect(result.conclusion.toLowerCase()).toMatch(/ai|artificial intelligence|transformation|implementation|success/);
        });
        it('should identify key arguments', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.keyArguments.length).toBeGreaterThan(0);
            expect(result.keyArguments.some(arg => arg.toLowerCase().includes('opportunities') ||
                arg.toLowerCase().includes('challenges') ||
                arg.toLowerCase().includes('benefits'))).toBe(true);
        });
        it('should identify supporting data', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.supportingData.length).toBeGreaterThan(0);
            expect(result.supportingData.some(data => data.toLowerCase().includes('automate') ||
                data.toLowerCase().includes('decision-making') ||
                data.toLowerCase().includes('investment'))).toBe(true);
        });
        it('should provide context', async () => {
            const result = await framework.analyze(sampleContent);
            expect(result.context.length).toBeGreaterThan(0);
            expect(result.context.toLowerCase()).toMatch(/business|competitive|landscape|industry|market/);
        });
        it('should extract structured insights', async () => {
            const result = await framework.analyze(sampleContent);
            const insights = framework.extractInsights(result);
            expect(insights.length).toBeGreaterThan(0);
            expect(insights.some(insight => insight.toLowerCase().includes('structured') ||
                insight.toLowerCase().includes('logical') ||
                insight.toLowerCase().includes('hierarchy'))).toBe(true);
        });
    });
    describe('Framework Performance and Integration', () => {
        it('should complete analysis within reasonable time', async () => {
            const frameworks = [
                new swot_used_1.SWOTUSEDFramework(),
                new scamper_1.SCAMPERFramework(),
                new socratic_1.SocraticFramework(),
                new five_w_two_h_1.FiveW2HFramework(),
                new pyramid_1.PyramidFramework(),
            ];
            for (const framework of frameworks) {
                const startTime = Date.now();
                await framework.analyze(sampleContent);
                const duration = Date.now() - startTime;
                expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
            }
        });
        it('should handle varying content lengths', async () => {
            const frameworks = [
                new swot_used_1.SWOTUSEDFramework(),
                new scamper_1.SCAMPERFramework(),
                new socratic_1.SocraticFramework(),
                new five_w_two_h_1.FiveW2HFramework(),
                new pyramid_1.PyramidFramework(),
            ];
            const shortContent = 'AI is transforming business.';
            const longContent = sampleContent.repeat(5);
            for (const framework of frameworks) {
                const shortResult = await framework.analyze(shortContent);
                const longResult = await framework.analyze(longContent);
                expect(shortResult).toBeDefined();
                expect(longResult).toBeDefined();
                // Long content should generally produce more insights
                const shortInsights = framework.extractInsights(shortResult);
                const longInsights = framework.extractInsights(longResult);
                expect(longInsights.length).toBeGreaterThanOrEqual(shortInsights.length);
            }
        });
        it('should maintain consistent insight quality', async () => {
            const frameworks = [
                new swot_used_1.SWOTUSEDFramework(),
                new scamper_1.SCAMPERFramework(),
                new socratic_1.SocraticFramework(),
                new five_w_two_h_1.FiveW2HFramework(),
                new pyramid_1.PyramidFramework(),
            ];
            for (const framework of frameworks) {
                const result = await framework.analyze(sampleContent);
                const insights = framework.extractInsights(result);
                // All insights should be meaningful strings
                expect(insights.every(insight => typeof insight === 'string' && insight.length > 5)).toBe(true);
                // Should have reasonable number of insights
                expect(insights.length).toBeGreaterThan(0);
                expect(insights.length).toBeLessThan(20);
            }
        });
        it('should handle multilingual content gracefully', async () => {
            const multilingualContent = `
        The emergence of AI in business. 
        L'émergence de l'IA dans les entreprises.
        La aparición de la IA en los negocios.
      `;
            const framework = new swot_used_1.SWOTUSEDFramework();
            const result = await framework.analyze(multilingualContent);
            expect(result).toBeDefined();
            expect(result.strengths).toBeDefined();
            expect(result.weaknesses).toBeDefined();
        });
        it('should handle technical content appropriately', async () => {
            const technicalContent = `
        Machine learning algorithms utilize neural networks with backpropagation
        to optimize loss functions through gradient descent. The implementation
        requires tensor operations, batch normalization, and regularization
        techniques to prevent overfitting in high-dimensional feature spaces.
      `;
            const framework = new pyramid_1.PyramidFramework();
            const result = await framework.analyze(technicalContent);
            const insights = framework.extractInsights(result);
            expect(insights.some(insight => insight.toLowerCase().includes('technical') ||
                insight.toLowerCase().includes('algorithm') ||
                insight.toLowerCase().includes('complex'))).toBe(true);
        });
    });
});
//# sourceMappingURL=analysis-frameworks.test.js.map