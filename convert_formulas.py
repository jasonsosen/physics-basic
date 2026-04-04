#!/usr/bin/env python3
"""
批量替换 Unicode 上标为 KaTeX 组件
"""
import re
import os
from pathlib import Path

# Unicode 上标映射
SUPERSCRIPT_MAP = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
}

# Unicode 下标映射
SUBSCRIPT_MAP = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
}

def convert_superscripts(text):
    """转换 Unicode 上标"""
    # 匹配数字/字母后跟上标
    pattern = r'(\d+|[a-zA-Z])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾]+)'
    
    def replace_super(m):
        base = m.group(1)
        sups = m.group(2)
        exp = ''.join(SUPERSCRIPT_MAP.get(c, c) for c in sups)
        # 如果指数是负数或多位数，用大括号包裹
        if len(exp) > 1 or exp.startswith('-') or exp.startswith('+'):
            return f'{base}^{{{exp}}}'
        return f'{base}^{exp}'
    
    return re.sub(pattern, replace_super, text)

def convert_units(text):
    """转换单位表达式为 LaTeX"""
    # 常见单位模式
    patterns = [
        # kg/m³ → \mathrm{kg/m^3}
        (r'kg/m³', r'\\mathrm{kg/m^3}'),
        (r'g/cm³', r'\\mathrm{g/cm^3}'),
        (r'kg·m/s²', r'\\mathrm{kg \\cdot m/s^2}'),
        (r'g·cm/s²', r'\\mathrm{g \\cdot cm/s^2}'),
        (r'm/s²', r'\\mathrm{m/s^2}'),
        (r'm/s', r'\\mathrm{m/s}'),
        (r'km/h', r'\\mathrm{km/h}'),
        (r'cm²', r'\\mathrm{cm^2}'),
        (r'mm²', r'\\mathrm{mm^2}'),
        (r'cm³', r'\\mathrm{cm^3}'),
        (r'mm³', r'\\mathrm{mm^3}'),
    ]
    
    for pattern, replacement in patterns:
        text = text.replace(pattern, replacement)
    
    return text

def convert_formulas_in_file(filepath):
    """处理单个文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. 转换上标
    content = convert_superscripts(content)
    
    # 2. 替换乘号
    content = content.replace('×', r'\\times ')
    
    # 3. 替换希腊字母（在公式上下文中）
    # ρ → \rho 等（这个要小心，只在公式中替换）
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    weeks_dir = Path('/home/jason/Dropbox/Projects/physics-basic/src/pages/weeks')
    
    changed_files = []
    for astro_file in weeks_dir.glob('*.astro'):
        print(f"Processing: {astro_file.name}")
        if convert_formulas_in_file(astro_file):
            changed_files.append(astro_file.name)
    
    print(f"\n✅ Modified {len(changed_files)} files:")
    for f in changed_files:
        print(f"  - {f}")

if __name__ == '__main__':
    main()
