#!/usr/bin/env python3
"""
批量转换 big-formula 为 KaTeX Math 组件
"""
import re
from pathlib import Path

# 转换规则
REPLACEMENTS = {
    # 希腊字母
    'ρ': r'\\rho',
    'θ': r'\\theta',
    'μ': r'\\mu',
    'Σ': r'\\Sigma',
    'Δ': r'\\Delta',
    
    # 下标
    '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3',
    '₄': '_4', '₅': '_5', '₆': '_6', '₇': '_7',
    '₈': '_8', '₉': '_9',
    'ₓ': '_x', 'ₐ': '_a', 'ₘ': '_m',
    
    # 上标
    '²': '^2', '³': '^3',
    
    # 特殊符号
    '√': r'\\sqrt',
    '½': r'\\frac{1}{2}',
    '×': r'\\times',
}

def convert_formula(formula):
    """转换单个公式为 LaTeX"""
    result = formula
    
    # 基本替换
    for old, new in REPLACEMENTS.items():
        result = result.replace(old, new)
    
    # 处理下标组合 (如 F_x)
    result = re.sub(r'([A-Za-z])_([0-9xyz])', r'\1_{\2}', result)
    result = re.sub(r'([A-Za-z])_([A-Za-z]{2,})', r'\1_{\2}', result)
    
    # 处理分数 a/b → \frac{a}{b} (简单情况)
    # 跳过复杂的分数，保留原样
    
    return result

def process_file(filepath):
    """处理单个文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 检查是否已经有 Math import
    if 'import Math from' not in content:
        # 在 import 区域添加 Math
        content = re.sub(
            r"(import QuizCard from '../../components/QuizCard.astro';)",
            r"\1\nimport Math from '../../components/Math.astro';",
            content
        )
    
    # 替换 big-formula spans
    def replace_formula(match):
        formula = match.group(1)
        latex = convert_formula(formula)
        # 转义反斜杠用于 Astro 组件
        return f'<Math f="{latex}" block />'
    
    content = re.sub(
        r'<span class="big-formula">([^<]+)</span>',
        replace_formula,
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    weeks_dir = Path('/home/jason/Dropbox/Projects/physics-basic/src/pages/weeks')
    
    changed = []
    for f in sorted(weeks_dir.glob('week*.astro')):
        print(f"Processing {f.name}...")
        if process_file(f):
            changed.append(f.name)
    
    print(f"\n✅ Modified {len(changed)} files:")
    for name in changed:
        print(f"  - {name}")

if __name__ == '__main__':
    main()
