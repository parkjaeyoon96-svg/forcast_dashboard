/**
 * AI 인사이트 에이전트
 * 대시보드에서 사용할 AI 기반 인사이트 생성
 */

class InsightsAgent {
  constructor(options = {}) {
    this.apiKey = options.apiKey || '';
    this.apiURL = options.apiURL || 'https://api.openai.com/v1/chat/completions';
    this.model = options.model || 'gpt-4';
    this.useLocal = options.useLocal || false;
    this.localURL = options.localURL || 'http://localhost:11434/api/generate';
  }

  /**
   * 데이터 분석 및 인사이트 생성
   */
  async analyze(data, context = {}) {
    if (this.useLocal) {
      return await this.analyzeLocal(data, context);
    } else {
      return await this.analyzeWithAPI(data, context);
    }
  }

  /**
   * OpenAI API를 사용한 분석
   */
  async analyzeWithAPI(data, context) {
    const prompt = this.buildPrompt(data, context);

    try {
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `당신은 매출 데이터 분석 전문가입니다. 
              다음 데이터를 분석하여 실용적이고 실행 가능한 인사이트를 제공해주세요.
              한국어로 응답해주세요.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        insight: result.choices[0].message.content,
        model: this.model
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 로컬 AI 모델 사용 (Ollama 등)
   */
  async analyzeLocal(data, context) {
    const prompt = this.buildPrompt(data, context);

    try {
      const response = await fetch(this.localURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: prompt,
          stream: false
        })
      });

      const result = await response.json();
      return {
        success: true,
        insight: result.response,
        model: 'local'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 분석 프롬프트 생성
   */
  buildPrompt(data, context) {
    const brand = context.brand || '전체';
    const period = context.period || '현재 기간';
    const currentWeek = context.currentWeek || 0;

    return `
다음 매출 데이터를 분석하여 인사이트를 도출해주세요:

📊 분석 대상: ${brand} 브랜드
📅 분석 기간: ${period}
📈 현재 주차: ${currentWeek}주차

데이터:
${JSON.stringify(data, null, 2)}

다음 관점에서 분석해주세요:

1. 📈 **매출 트렌드 분석**
   - 주차별 매출 추세
   - 전년 대비 성장률
   - 월말 예상 달성률

2. 🎯 **목표 대비 달성률 평가**
   - 목표 대비 현재 달성률
   - 부족한 부분 및 원인 분석
   - 달성 가능성 평가

3. 📊 **전년 대비 성장률 분석**
   - 전년 대비 증감률
   - 성장 요인 분석
   - 우려사항 식별

4. ⚠️ **리스크 요소 식별**
   - 목표 미달 가능 브랜드/채널
   - 급격한 하락 추세
   - 비정상적 패턴

5. 💡 **개선 제안**
   - 구체적인 액션 아이템
   - 우선순위별 개선방안
   - 예상 효과

답변 형식:
- 각 항목별로 명확하게 구분
- 구체적인 수치와 근거 제시
- 실행 가능한 제안 포함
- 이모지를 활용하여 가독성 향상
`;
  }

  /**
   * 브랜드별 인사이트 생성
   */
  async generateBrandInsights(brandData, brandKey) {
    const brandDataFiltered = brandData.brands?.[brandKey];
    
    if (!brandDataFiltered) {
      return {
        success: false,
        error: `브랜드 데이터를 찾을 수 없습니다: ${brandKey}`
      };
    }

    const context = {
      brand: brandKey,
      period: `${brandData.year}년 ${brandData.month}월`,
      currentWeek: Object.keys(brandDataFiltered.weekly || {}).length
    };

    return await this.analyze(brandDataFiltered, context);
  }

  /**
   * 전체 인사이트 생성
   */
  async generateOverallInsights(weeklyData) {
    const context = {
      brand: '전체',
      period: `${weeklyData.year}년 ${weeklyData.month}월`,
      currentWeek: 0
    };

    // 전체 요약 데이터 생성
    const summary = {
      totalSales: 0,
      totalForecast: 0,
      brands: {}
    };

    for (const [brand, data] of Object.entries(weeklyData.brands || {})) {
      let brandSales = 0;
      let brandForecast = 0;

      for (const weekData of Object.values(data.weekly || {})) {
        brandSales += weekData.sales || 0;
        brandForecast += weekData.forecast || 0;
      }

      summary.brands[brand] = { sales: brandSales, forecast: brandForecast };
      summary.totalSales += brandSales;
      summary.totalForecast += brandForecast;
    }

    return await this.analyze(summary, context);
  }
}

// 대시보드에서 사용
if (typeof window !== 'undefined') {
  window.InsightsAgent = InsightsAgent;
}


















