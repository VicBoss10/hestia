import cv2
import mediapipe as mp
import pyautogui
import time

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

pyautogui.FAILSAFE = True
MARGIN = 10
SENSITIVITY = 4   # Antes: 10. Menos sensibilidad = más precisión
SMOOTHING = 0.5  # Antes: 0.2. Más suavizado = menos saltos

screen_width, screen_height = pyautogui.size()
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

smooth_x, smooth_y = screen_width // 2, screen_height // 2  # posición inicial suavizada

def finger_up(hand_landmarks, tip_id, pip_id):
    tip = hand_landmarks.landmark[tip_id]
    pip = hand_landmarks.landmark[pip_id]
    return tip.y < pip.y

def all_fingers_up(hand_landmarks):
    # Índice, medio, anular, meñique
    return (
        finger_up(hand_landmarks, 8, 6) and  # Índice
        finger_up(hand_landmarks, 12, 10) and  # Medio
        finger_up(hand_landmarks, 16, 14) and  # Anular
        finger_up(hand_landmarks, 20, 18)      # Meñique
    )

def palm_center(hand_landmarks, frame_shape):
    # Landmarks: muñeca (0), base índice (5), base medio (9), base anular (13), base meñique (17)
    points = [hand_landmarks.landmark[i] for i in [0, 5, 9, 13, 17]]
    avg_x = sum([p.x for p in points]) / len(points)
    avg_y = sum([p.y for p in points]) / len(points)
    center_x = int(avg_x * frame_shape[1])
    center_y = int(avg_y * frame_shape[0])
    return center_x, center_y, avg_x, avg_y

def index_up(hand_landmarks):
    # Índice levantado: la punta del índice está por encima de su articulación PIP
    return finger_up(hand_landmarks, 8, 6)

# Opcional: limitar el área de movimiento para mayor control
def clamp(val, minval, maxval):
    return max(minval, min(val, maxval))

prev_time = time.time()
fps = 0
index_was_up = False  # Estado previo del índice

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Calcula FPS
    curr_time = time.time()
    fps = 1 / (curr_time - prev_time)
    prev_time = curr_time

    frame = cv2.flip(frame, 1)

    # Reduce la imagen antes de procesar (por ejemplo, a 640x360)
    small_frame = cv2.resize(frame, (640, 360))
    rgb = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Para dibujar y calcular, escala los puntos a la imagen original
            def scale_landmark(lm, orig_shape, small_shape):
                return int(lm.x * small_shape[1] * orig_shape[1] / small_shape[1]), int(lm.y * small_shape[0] * orig_shape[0] / small_shape[0])
            # ...usa scale_landmark para palm_center y dibujo...

            palm_x, palm_y, palm_norm_x, palm_norm_y = palm_center(hand_landmarks, frame.shape)
            cv2.circle(frame, (palm_x, palm_y), 10, (0, 255, 255), -1)

            rel_x = palm_norm_x - 0.5
            rel_y = palm_norm_y - 0.5
            screen_x = int((0.5 + rel_x * SENSITIVITY) * screen_width)
            screen_y = int((0.5 + rel_y * SENSITIVITY) * screen_height)

            # Limita el área de movimiento para evitar que el mouse salga de la pantalla
            screen_x = clamp(screen_x, MARGIN, screen_width - MARGIN)
            screen_y = clamp(screen_y, MARGIN, screen_height - MARGIN)

            smooth_x = int(smooth_x + (screen_x - smooth_x) * SMOOTHING)
            smooth_y = int(smooth_y + (screen_y - smooth_y) * SMOOTHING)
            pyautogui.moveTo(smooth_x, smooth_y)

            # Click solo si el índice está levantado y antes estaba abajo
            if index_up(hand_landmarks):
                if not index_was_up:
                    pyautogui.click()
                    cv2.putText(frame, "CLICK", (palm_x, palm_y-20), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
                index_was_up = True
            else:
                index_was_up = False

    # Dibuja el FPS en la ventana
    cv2.putText(frame, f"FPS: {int(fps)}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)

    cv2.imshow("Gesture Mouse", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()