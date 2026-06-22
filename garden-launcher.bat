@echo off
chcp 65001 >nul
title 桌面小花园 - 启动器

cd /d "%~dp0"

echo ========================================
echo          桌面小花园 - 启动器
echo ========================================
echo.
echo 检测本地服务器环境...

where python >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Python 已安装
    echo.
    echo 启动本地服务器...
    start /MIN python -m http.server 8080
    timeout /t 2 /nobreak >nul
    echo ✓ 服务器已启动在 http://localhost:8080
    echo.
    echo 打开浏览器...
    start http://localhost:8080/desktop-garden.html
    echo ✓ 浏览器已打开
    echo.
    echo ========================================
    echo          启动成功！
    echo ========================================
    echo.
    echo 提示：关闭此窗口将停止服务器
    pause
) else (
    echo ✗ Python 未安装，尝试直接打开HTML...
    echo.
    echo 注意：直接打开HTML文件可能无法正常保存数据
    echo 建议安装 Python 以获得更好的体验
    echo.
    start desktop-garden.html
    echo ✓ 已尝试打开页面
    echo.
    pause
)