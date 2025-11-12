"""
JSON 파일을 JavaScript 변수로 변환
"""

import json
from datetime import datetime
from pathlib import Path

def convert_json_to_js(json_path, js_output_path, variable_name='weeklyData'):
    """JSON 파일을 JavaScript 변수로 변환"""
    
    json_path = Path(json_path)
    js_output_path = Path(js_output_path)
    
    print(f"변환 중: {json_path.name} -> {js_output_path.name}")
    
    # JSON 로드
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # JavaScript 형식으로 변환
    js_content = f"""// 자동 생성된 데이터 파일
// 원본: {json_path.name}
// 생성일: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

const {variable_name} = {json.dumps(data, ensure_ascii=False, indent=2)};

// Dashboard.html에서 사용
if (typeof D !== 'undefined') {{
    D.{variable_name} = {variable_name};
    
    // 브랜드별 주차 데이터 접근 예시:
    // D.weeklyData.brands.MLB.weekly[1].sales
    // D.weeklyData.brands.MLB.channels['CH001'].sales
}}
"""
    
    # 출력 폴더 생성
    js_output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # JavaScript 파일 저장
    with open(js_output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    file_size = js_output_path.stat().st_size / 1024  # KB
    print(f"✅ 변환 완료: {js_output_path} ({file_size:.2f} KB)")

def convert_all_weekly_files():
    """processed_data/weekly 폴더의 모든 JSON 파일을 JS로 변환"""
    weekly_path = Path('../processed_data/weekly')
    output_path = Path('../dashboard/data')
    
    if not weekly_path.exists():
        print(f"❌ 폴더를 찾을 수 없습니다: {weekly_path}")
        return
    
    json_files = list(weekly_path.glob('*.json'))
    
    if not json_files:
        print("❌ 변환할 JSON 파일이 없습니다.")
        return
    
    for json_file in json_files:
        js_file = output_path / f"{json_file.stem}.js"
        convert_json_to_js(json_file, js_file)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # 직접 파일 경로 지정
        json_path = sys.argv[1]
        js_path = sys.argv[2] if len(sys.argv) > 2 else f"{json_path}.js"
        convert_json_to_js(json_path, js_path)
    else:
        # 모든 파일 변환
        convert_all_weekly_files()


















