import sys
import mss
from PyQt5.QtWidgets import QApplication, QWidget
from PyQt5.QtGui import QPainter, QPen, QPixmap, QColor, QImage
from PyQt5.QtCore import Qt, QRect, QPoint
from PIL import Image
import traceback

global isDev
isDev = False

class ScreenOverlay(QWidget):
    def __init__(self, image, virtual_geometry):
        super().__init__()
        self.image = image
        self.start_point = QPoint()
        self.end_point = QPoint()
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint)
        # self.setWindowState(Qt.WindowFullScreen)
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setGeometry(virtual_geometry)
        self.show()

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setOpacity(1)
        painter.drawPixmap(0, 0, self.image)

        painter.setOpacity(0.5)
        painter.fillRect(self.rect(), QColor(0, 0, 0))

        if not self.start_point.isNull() and not self.end_point.isNull():
            rect = QRect(self.start_point, self.end_point).normalized()

            if rect.width() > 1 and rect.height() > 1:
                subimage = self.image.copy(rect)
                painter.setOpacity(1.0)
                painter.drawPixmap(rect.topLeft(), subimage)

                pen = QPen(QColor(255, 255, 255), 3, Qt.SolidLine)
                painter.setPen(pen)
                painter.drawRect(rect)

    def mousePressEvent(self, event):
        self.start_point = event.pos()
        self.end_point = event.pos()
        self.update()

    def mouseMoveEvent(self, event):
        self.end_point = event.pos()
        self.update()

    def mouseReleaseEvent(self, event):
        self.end_point = event.pos()
        x1, y1 = self.start_point.x(), self.start_point.y()
        x2, y2 = self.end_point.x(), self.end_point.y()
        left, right = min(x1, x2), max(x1, x2)
        top, bottom = min(y1, y2), max(y1, y2)
        if right - left <= 0 or bottom - top <= 0:
            return
        self.captureCrop()
        self.close()

    def captureCrop(self):
        x1, y1 = self.start_point.x(), self.start_point.y()
        x2, y2 = self.end_point.x(), self.end_point.y()
        left, right = min(x1, x2), max(x1, x2)
        top, bottom = min(y1, y2), max(y1, y2)

        cropped = self.image.copy(left, top, right - left, bottom - top)
        if isDev:
            cropped.save("tmp2211567.png", "PNG")
        else:
            cropped.save("resources/screenshot/tmp2211567.png", "PNG")

def pil2pixmap(pil_img):
    """Convert PIL Image to QPixmap."""
    rgb_img = pil_img.convert("RGB")
    data = rgb_img.tobytes("raw", "RGB")
    qimage = QImage(data, rgb_img.size[0], rgb_img.size[1], QImage.Format_RGB888)
    return QPixmap.fromImage(qimage)

def captureScreen(capture_settings):
    try:
        with mss.mss() as sct:
            screenshot = sct.grab(capture_settings)
            image = Image.frombytes("RGB", screenshot.size, screenshot.rgb)

            app = QApplication(sys.argv)
            virtual_geometry = app.screens()[0].virtualGeometry()
            qt_pixmap = pil2pixmap(image)
            overlay = ScreenOverlay(qt_pixmap, virtual_geometry)
            app.exec_()

    except Exception:
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    print("Waiting for start signal...", flush=True)

    with mss.mss() as sct:
        monitors = sct.monitors
        left = min(m["left"] for m in monitors)
        top = min(m["top"] for m in monitors)
        right = max(m["left"] + m["width"] for m in monitors)
        bottom = max(m["top"] + m["height"] for m in monitors)
        width = right - left
        height = bottom - top

        capture_settings = {
            "left": left,
            "top": top,
            "width": width,
            "height": height,
            "pixel_format": "RGB",
            "quality": 100,
        }

        while True:
            try:
                for line in sys.stdin:
                    if line.strip() == 'start':
                        print("Starting screenshot logic...", flush=True)
                        captureScreen(capture_settings)
                        print("end", flush=True)
                    elif line.strip() == 'dev':
                        isDev = True
                        print("Proceeding in dev mode...", flush=True)
                    elif line.strip() == 'exit':
                        print("Exiting...")
                        sys.exit(0)
            except:
                traceback.print_exc()
                sys.exit(1)
