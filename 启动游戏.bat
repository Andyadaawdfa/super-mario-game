@echo off
cd /d "%~dp0"
echo ============================================
echo   超级玛丽 - 开发服务器启动中...
echo ============================================
echo.
echo 游戏加载后请按 ENTER 或 SPACE 开始
echo 操作: ← → 移动  ↑ 跳跃  SHIFT 奔跑  Z 射击
echo.
echo 正在启动服务器...
npx vite --host 127.0.0.1 --port 5173
pause
