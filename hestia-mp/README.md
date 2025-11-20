1. Desactiva cualquier entorno virtual activo
deactivate || true
deactivate || true

2. Crea el entorno virtual en hestia-mp (si no existe)
cd ~/Documentos/Desarrollo\ Web/hestia/hestia-mp

python3 -m venv .venv

source .venv/bin/activate

3. Instala los requisitos
python -m pip install --upgrade pip
python -m pip install -r requirements.txt