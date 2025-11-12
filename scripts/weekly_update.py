"""
매주 자동 실행 스크립트
로데이터를 처리하여 대시보드용 JS 파일 생성
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from data_processor import DataProcessor
from convert_to_js import convert_json_to_js

def get_current_week_file(year, month, week):
    """현재 주차 파일 경로 생성"""
    month_dir = f"{year:04d}_{month:02d}"
    filename = f"sales_raw_{year:04d}{month:02d}_week{week}.xlsx"
    return Path(f"../raw_data/{year:04d}/{month_dir}/{filename}")

def calculate_current_week():
    """현재 주차 계산"""
    today = datetime.now()
    day = today.day
    week = (day - 1) // 7 + 1
    return today.year, today.month, min(week, 5)  # 최대 5주차

def main():
    """메인 실행 함수"""
    print("="*60)
    print("주간 데이터 업데이트 시작")
    print("="*60)
    
    # 현재 주차 계산
    year, month, week = calculate_current_week()
    print(f"\n📅 처리 대상: {year}년 {month}월 {week}주차\n")
    
    # 파일 경로 생성
    input_file = get_current_week_file(year, month, week)
    
    if not input_file.exists():
        print(f"❌ 오류: 파일을 찾을 수 없습니다")
        print(f"   예상 경로: {input_file}")
        print(f"\n💡 해결 방법:")
        print(f"   1. 로데이터를 다음 경로에 저장하세요:")
        print(f"      {input_file.parent}")
        print(f"   2. 파일명을 다음 형식으로 지정하세요:")
        print(f"      sales_raw_{year:04d}{month:02d}_week{week}.xlsx")
        sys.exit(1)
    
    try:
        # 1. 데이터 처리 초기화
        processor = DataProcessor(
            raw_data_path='../raw_data',
            master_data_path='../master_data'
        )
        
        # 2. JSON 파일 경로
        output_json = Path(f"../processed_data/weekly/{year:04d}{month:02d}_week{week}.json")
        
        # 3. 데이터 처리 실행
        processed_data = processor.process_file(input_file, output_json)
        
        # 4. JavaScript 변환
        js_output = Path(f"../dashboard/data_weekly.js")
        convert_json_to_js(output_json, js_output)
        
        # 5. 요약 출력
        print("\n" + "="*60)
        print("✅ 주간 데이터 업데이트 완료!")
        print("="*60)
        print(f"📁 처리된 파일:")
        print(f"   입력: {input_file}")
        print(f"   JSON: {output_json}")
        print(f"   JS:   {js_output}")
        print(f"\n📊 처리된 브랜드:")
        for brand in processed_data.get('brands', {}).keys():
            print(f"   - {brand}")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()


















