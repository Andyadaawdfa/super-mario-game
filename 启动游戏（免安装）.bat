@echo off
cd /d "%~dp0"
echo ============================================
echo   超级玛丽 - HTTP 服务器启动中...
echo ============================================
echo.
echo 游戏加载后请按 ENTER 或 SPACE 开始
echo 操作: ← → 移动  ↑ 跳跃  SHIFT 奔跑  Z 射击
echo.
echo 正在启动服务器...

:: 尝试多种 Python 命令
python -m http.server 8080 -d dist 2>nul
if %ERRORLEVEL% NEQ 0 (
    python3 -m http.server 8080 -d dist 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    py -3 -m http.server 8080 -d dist 2>nul
)
if %ERRORLEVEL% NEQ 0 (
    echo 没有找到 Python，请安装 Node.js 后运行另一个文件
    pause
    exit /b 1
)

pause
