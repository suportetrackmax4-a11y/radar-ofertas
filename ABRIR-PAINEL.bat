@echo off
title Painel Radar de Ofertas - NAO FECHE ESTA JANELA
cd /d "%~dp0"
echo.
echo  Abrindo o painel do Radar de Ofertas...
echo  Aguarde alguns segundos. O navegador vai abrir sozinho.
echo.
echo  IMPORTANTE: deixe esta janela aberta enquanto usa o painel.
echo  Quando terminar, e so fechar esta janela.
echo.
start "" cmd /c "timeout /t 8 /nobreak >nul && start http://localhost:3000/admin"
call npm run dev
pause
