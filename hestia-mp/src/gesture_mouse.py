import cv2
import mediapipe as mp
import pyautogui
import time
import subprocess
import os
import numpy as np
# Nuevas importaciones para estadísticas y peticiones HTTP
import requests
import threading
from datetime import datetime, timezone

# Importamos la variable de estado desde el nuevo archivo compartido
import shared_state

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

pyautogui.FAILSAFE = True
MARGIN = 10
SENSITIVITY = 4
SMOOTHING = 0.5

screen_width, screen_height = pyautogui.size()
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

smooth_x, smooth_y = screen_width // 2, screen_height // 2

app_last_opened = 0
app_gesture_start = None

# --- NUEVA SECCIÓN DE ESTADÍSTICAS ---

# 1. Mapeo de gestos a IDs (basado en el JSON que generamos antes)
GESTURE_ID_MAP = {
    "click": 5,
    "volume_up": 6,
    "volume_down": 7,
    "copy": 8,
    "paste": 9,
    "open_app_firefox": 10,
}

# 2. Diccionario para almacenar las estadísticas en memoria
gesture_stats = {
    gesture_name: {
        "times_detected": 0,
        "confidence_sum": 0.0,
    } for gesture_name in GESTURE_ID_MAP.keys()
}

# 3. Endpoint del backend para las estadísticas
STATS_ENDPOINT = "http://localhost:3000/stats"

# 4. Función para enviar datos en un hilo separado (para no bloquear el video)
def send_stats(payload):
    print("--- DEBUG: Intentando enviar el siguiente payload ---")
    # Imprimimos el tipo de dato para depuración
    print(f"Tipo de avg_confidence: {type(payload['avg_confidence'])}")
    print(payload)
    print("-------------------------------------------------")
    try:
        # Usamos un timeout para no quedarnos esperando indefinidamente
        response = requests.post(STATS_ENDPOINT, json=payload, timeout=2)
        
        # Esta línea es CLAVE: Lanza un error si el código de respuesta es 4xx o 5xx
        response.raise_for_status() 
        
        print(f"✅ Stats sent successfully! Status: {response.status_code}")

    except requests.exceptions.HTTPError as http_err:
        # Captura errores específicos de HTTP (4xx, 5xx)
        print(f"❌ HTTP error occurred: {http_err}")
        print(f"   Status Code: {http_err.response.status_code}")
        print(f"   Response Body: {http_err.response.text}")
    except requests.exceptions.RequestException as e:
        # Captura otros errores de red (conexión, timeout, etc.)
        print(f"❌ Failed to send stats due to a network error: {e}")

# --- NUEVA FUNCIÓN PARA AUTOMATIZAR EL ENVÍO ---
def record_and_send_stats(gesture_name, confidence):
    """
    Actualiza las estadísticas de un gesto, crea el payload y lo envía al backend.
    """
    stats = gesture_stats[gesture_name]
    stats["times_detected"] += 1
    stats["confidence_sum"] += confidence
    
    # Redondeamos a 3 decimales para que coincida con la BBDD (scale: 3)
    avg_conf = round(float(stats["confidence_sum"] / stats["times_detected"]), 3)

    payload = {
        "gesture_id": GESTURE_ID_MAP[gesture_name],
        "times_detected": stats["times_detected"],
        "avg_confidence": avg_conf,
        "last_detected": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    
    # Inicia el envío en un hilo separado para no bloquear el stream de video
    threading.Thread(target=send_stats, args=(payload,)).start()

# --- FIN DE LA NUEVA SECCIÓN ---

def finger_up(hand_landmarks, tip_id, mcp_id, finger="other", handedness="Right"):
    tip = hand_landmarks.landmark[tip_id]
    mcp = hand_landmarks.landmark[mcp_id]
    palm = hand_landmarks.landmark[0]
    if finger == "thumb":
        # Detecta pulgar extendido (horizontal respecto a la palma)
        # Si la distancia en X entre la punta y la palma es grande, está extendido
        return abs(tip.x - palm.x) > 0.18 and abs(tip.y - palm.y) < 0.15
    elif finger == "pinky":
        # Detecta meñique extendido (horizontal respecto a la palma)
        return abs(tip.x - palm.x) > 0.18 and abs(tip.y - palm.y) < 0.15
    else:
        # Dedos centrales: arriba si la punta está por encima de la base
        return tip.y < mcp.y

def palm_center(hand_landmarks, frame_shape):
    points = [hand_landmarks.landmark[i] for i in [0, 5, 9, 13, 17]]
    avg_x = sum([p.x for p in points]) / len(points)
    avg_y = sum([p.y for p in points]) / len(points)
    center_x = int(avg_x * frame_shape[1])
    center_y = int(avg_y * frame_shape[0])
    return center_x, center_y, avg_x, avg_y

def index_up(hand_landmarks, handedness="Right"):
    return finger_up(hand_landmarks, 8, 5, "other", handedness)

def clamp(val, minval, maxval):
    return max(minval, min(val, maxval))

gesture_state = {
    "thumb_pinky": False,
    "thumb": False,
    "pinky": False,
    "index_middle": False,
    "index_middle_ring": False,
}

prev_time = time.time()
fps = 0
index_was_up = False

def draw_finger_markers(frame, hand_landmarks, frame_shape, handedness="Right"):
    finger_names = ["Thumb", "Index", "Middle", "Ring", "Pinky"]
    tip_ids = [4, 8, 12, 16, 20]
    mcp_ids = [2, 5, 9, 13, 17]
    for i, (tip_id, mcp_id) in enumerate(zip(tip_ids, mcp_ids)):
        tip = hand_landmarks.landmark[tip_id]
        mcp = hand_landmarks.landmark[mcp_id]
        tip_x = int(tip.x * frame_shape[1])
        tip_y = int(tip.y * frame_shape[0])
        mcp_x = int(mcp.x * frame_shape[1])
        mcp_y = int(mcp.y * frame_shape[0])
        if i == 0:
            up = finger_up(hand_landmarks, tip_id, mcp_id, "thumb", handedness)
        elif i == 4:
            up = finger_up(hand_landmarks, tip_id, mcp_id, "pinky", handedness)
        else:
            up = finger_up(hand_landmarks, tip_id, mcp_id, "other", handedness)
        color = (0, 255, 0) if up else (0, 0, 255)
        cv2.circle(frame, (tip_x, tip_y), 12, color, -1)
        cv2.putText(frame, f"{finger_names[i]} {'UP' if up else 'DOWN'}", (tip_x-30, tip_y-15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        cv2.line(frame, (mcp_x, mcp_y), (tip_x, tip_y), color, 2)

def generate_frames():
    global prev_time, fps, index_was_up, smooth_x, smooth_y, app_gesture_start, app_last_opened, gesture_state
    while True:
        # Comprueba el estado del streaming en cada iteración
        if not shared_state.streaming_active:
            # Si está inactivo, envía un frame negro y espera
            black_frame = np.zeros((int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)), int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), 3), dtype=np.uint8)
            (flag, encodedImage) = cv2.imencode(".jpg", black_frame)
            if flag:
                yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
                      bytearray(encodedImage) + b'\r\n')
            cv2.waitKey(100) # Espera para no consumir CPU
            continue # Salta al siguiente ciclo del bucle

        # Si el streaming está activo, procesa la cámara
        ret, frame = cap.read()
        if not ret:
            break

        curr_time = time.time()
        if (curr_time - prev_time) > 0:
            fps = 1 / (curr_time - prev_time)
        prev_time = curr_time

        frame = cv2.flip(frame, 1)
        small_frame = cv2.resize(frame, (640, 360))
        rgb = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        handedness = "Right"
        if results.multi_handedness:
            handedness = results.multi_handedness[0].classification[0].label

        if results.multi_hand_landmarks:
            # Obtenemos la confianza de la detección de la MANO
            hand_confidence = results.multi_handedness[0].classification[0].score

            for hand_landmarks in results.multi_hand_landmarks:
                palm_x, palm_y, palm_norm_x, palm_norm_y = palm_center(hand_landmarks, frame.shape)
                cv2.circle(frame, (palm_x, palm_y), 10, (0, 255, 255), -1)

                rel_x = palm_norm_x - 0.5
                rel_y = palm_norm_y - 0.5
                screen_x = int((0.5 + rel_x * SENSITIVITY) * screen_width)
                screen_y = int((0.5 + rel_y * SENSITIVITY) * screen_height)
                screen_x = clamp(screen_x, MARGIN, screen_width - MARGIN)
                screen_y = clamp(screen_y, MARGIN, screen_height - MARGIN)
                smooth_x = int(smooth_x + (screen_x - smooth_x) * SMOOTHING)
                smooth_y = int(smooth_y + (screen_y - smooth_y) * SMOOTHING)
                pyautogui.moveTo(smooth_x, smooth_y)

                # Click con índice arriba
                if index_up(hand_landmarks):
                    if not index_was_up:
                        pyautogui.click()
                        cv2.putText(frame, "CLICK", (palm_x, palm_y-20), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
                        
                        # --- Llama a la nueva función centralizada ---
                        record_and_send_stats("click", hand_confidence)

                    index_was_up = True
                else:
                    index_was_up = False

                thumb_up = finger_up(hand_landmarks, 4, 2, "thumb", handedness)
                pinky_up = finger_up(hand_landmarks, 20, 17, "pinky", handedness)
                index_up_g = index_up(hand_landmarks, handedness)
                middle_up_g = finger_up(hand_landmarks, 12, 9, "other", handedness)
                ring_up_g = finger_up(hand_landmarks, 16, 13, "other", handedness)

                # Pulgar y meñique extendidos: abrir aplicación (solo una vez cada 2 segundos)
                if thumb_up and pinky_up and not any([index_up_g, middle_up_g, ring_up_g]):
                    now = time.time()
                    if app_gesture_start is None:
                        app_gesture_start = now
                    elif now - app_gesture_start >= 2 and not gesture_state["thumb_pinky"]:
                        subprocess.Popen(['firefox'])
                        app_last_opened = now
                        cv2.putText(frame, "APP!", (palm_x, palm_y+40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
                        gesture_state["thumb_pinky"] = True
                        
                        # --- Llama a la nueva función centralizada ---
                        record_and_send_stats("open_app_firefox", hand_confidence)
                else:
                    app_gesture_start = None
                    gesture_state["thumb_pinky"] = False

                # Solo pulgar extendido: volumen arriba
                if thumb_up and not any([index_up_g, middle_up_g, ring_up_g, pinky_up]):
                    if not gesture_state["thumb"]:
                        os.system('amixer set Master 5%+')
                        cv2.putText(frame, "VOL+", (palm_x, palm_y+60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
                        gesture_state["thumb"] = True
                        
                        # --- Llama a la nueva función centralizada ---
                        record_and_send_stats("volume_up", hand_confidence)
                else:
                    gesture_state["thumb"] = False

                # Solo meñique extendido: volumen abajo
                if pinky_up and not any([thumb_up, index_up_g, middle_up_g, ring_up_g]):
                    if not gesture_state["pinky"]:
                        os.system('amixer set Master 5%-')
                        cv2.putText(frame, "VOL-", (palm_x, palm_y+80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
                        gesture_state["pinky"] = True

                        # --- Llama a la nueva función centralizada ---
                        record_and_send_stats("volume_down", hand_confidence)
                else:
                    gesture_state["pinky"] = False

                # Índice y medio arriba: copiar
                if index_up_g and middle_up_g and not any([thumb_up, ring_up_g, pinky_up]):
                    if not gesture_state["index_middle"]:
                        pyautogui.hotkey('ctrl', 'c')
                        cv2.putText(frame, "COPY", (palm_x, palm_y+100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,0), 2)
                        gesture_state["index_middle"] = True

                        # --- Llama a la nueva función centralizada ---
                        record_and_send_stats("copy", hand_confidence)
                else:
                    gesture_state["index_middle"] = False

                # Índice, medio y anular arriba: pegar
                if index_up_g and middle_up_g and ring_up_g and not any([thumb_up, pinky_up]):
                    if not gesture_state["index_middle_ring"]:
                        pyautogui.hotkey('ctrl', 'v')
                        cv2.putText(frame, "PASTE", (palm_x, palm_y+120), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,255), 2)
                        gesture_state["index_middle_ring"] = True

                        # --- Llama a la nueva función centralizada ---
                        record_and_send_stats("paste", hand_confidence)
                else:
                    gesture_state["index_middle_ring"] = False

                draw_finger_markers(frame, hand_landmarks, frame.shape, handedness)

        # Convertimos el frame a JPEG para el streaming
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
        frame = buffer.tobytes()

        # Enviamos el frame como parte del stream
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')