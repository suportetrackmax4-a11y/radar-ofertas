@echo off
title Painel Radar de Ofertas - NAO FECHE ESTA JANELA
cd /d "%~dp0"
echo.
echo  Abrindo o painel do Radar de Ofertas...
echo  Aguarde. O navegador vai abrir sozinho quando o painel estiver pronto
echo  (na primeira vez pode levar ate 1 minuto).
echo.
echo  IMPORTANTE: deixe esta janela aberta enquanto usa o painel.
echo  Quando terminar, e so fechar esta janela.
echo.

rem Se o painel ja estiver aberto (de outra vez), so abre o navegador.
curl -s -o nul http://localhost:3000/admin && (
  echo  O painel ja estava rodando. Abrindo o navegador...
  start http://localhost:3000/admin
  timeout /t 5 >nul
  exit /b
)

rem Espera o painel responder e entao abre o navegador.
start "" /min cmd /c "for /l %%i in (1,1,120) do (curl -s -o nul http://localhost:3000/admin && (start http://localhost:3000/admin & exit) || timeout /t 2 /nobreak >nul)"

call npm run dev
pause
