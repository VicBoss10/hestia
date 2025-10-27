import cv2
import mediapipe as mp
import pyautogui

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

pyautogui.FAILSAFE = True
MARGIN = 10
SENSITIVITY = 2.5

screen_width, screen_height = pyautogui.size()
cap = cv2.VideoCapture(0)

def finger_up(hand_landmarks, tip_id, pip_id):
    tip = hand_landmarks.landmark[tip_id]
    pip = hand_landmarks.landmark[pip_id]
    return tip.y < pip.y

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Índice
            index_tip = hand_landmarks.landmark[8]
            index_x = int(index_tip.x * frame.shape[1])
            index_y = int(index_tip.y * frame.shape[0])
            cv2.circle(frame, (index_x, index_y), 10, (0, 255, 0), -1)

            # Mapeo a pantalla usando el índice
            rel_x = index_tip.x - 0.5
            rel_y = index_tip.y - 0.5
            screen_x = int((0.5 + rel_x * SENSITIVITY) * screen_width)
            screen_y = int((0.5 + rel_y * SENSITIVITY) * screen_height)
            screen_x = max(MARGIN, min(screen_x, screen_width - MARGIN))
            screen_y = max(MARGIN, min(screen_y, screen_height - MARGIN))
            pyautogui.moveTo(screen_x, screen_y)

            # Corazón
            middle_tip = hand_landmarks.landmark[12]
            middle_pip = hand_landmarks.landmark[10]
            mx = int(middle_tip.x * frame.shape[1])
            my = int(middle_tip.y * frame.shape[0])
            cv2.circle(frame, (mx, my), 10, (255, 0, 0), -1)

            # Click al subir el corazón
            if finger_up(hand_landmarks, 12, 10):
                pyautogui.click()
                cv2.putText(frame, "CLICK", (mx, my-20), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)

    cv2.imshow("Gesture Mouse", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()