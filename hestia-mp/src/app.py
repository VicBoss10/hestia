from flask import Flask, Response
from gesture_mouse import generate_frames, cap, cv2

app = Flask(__name__)

@app.route("/")
def video_feed():
    """Ruta que sirve el stream de video."""
    return Response(generate_frames(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

if __name__ == '__main__':
    try:
        # Inicia el servidor de Flask
        app.run(host='0.0.0.0', port=5000, debug=True, threaded=True, use_reloader=False)
    finally:
        # Asegura que la cámara se libere al cerrar el servidor
        cap.release()
        cv2.destroyAllWindows()