from flask import Flask, Response, jsonify
# Importamos el estado compartido
import shared_state
from gesture_mouse import generate_frames, cap, cv2

app = Flask(__name__)

@app.route("/")
def video_feed():
    """Sirve el stream de video, que ahora se autogestiona."""
    return Response(generate_frames(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/start", methods=['POST'])
def start_streaming():
    """Activa el streaming de gestos."""
    if not shared_state.streaming_active:
        shared_state.streaming_active = True
        print("Streaming started")
    return jsonify({"status": "streaming started"})

@app.route("/stop", methods=['POST'])
def stop_streaming():
    """Desactiva el streaming de gestos."""
    if shared_state.streaming_active:
        shared_state.streaming_active = False
        print("Streaming stopped")
    return jsonify({"status": "streaming stopped"})

if __name__ == '__main__':
    try:
        # threaded=True es importante para manejar las peticiones de start/stop
        # mientras se sirve el video.
        app.run(host='0.0.0.0', port=5000, debug=True, threaded=True, use_reloader=False)
    finally:
        cap.release()
        cv2.destroyAllWindows()