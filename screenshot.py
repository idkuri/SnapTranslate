from PIL import ImageTk, Image, ImageEnhance, ImageFilter
import mss.tools
import tkinter as tk
from tkinter import messagebox
import traceback


selection_start = None
selection_end = None
rect_start = None
rect_end = None

def cropImage(image):
    global selection_start, selection_end
    if selection_start is None or selection_end is None:
        return  # No selection made, exit the function

    # Swap coordinates if needed to ensure proper cropping
    x1, y1 = min(selection_start[0], selection_end[0]), min(selection_start[1], selection_end[1])
    x2, y2 = max(selection_start[0], selection_end[0]), max(selection_start[1], selection_end[1])
    desired_width = abs(x2 - x1)
    desired_height = abs(y2 - y1)

    # Crop the image based on the selection
    cropped_image = image.crop((x1, y1, x2, y2)).resize((desired_width, desired_height))

    # Display the cropped image or perform further operations
    cropped_image.save('tmp2211567.png', dpi=(1000, 1000))


def displayImage(image):
    def closeWindow(event=None):
        window.destroy()
    
    def onClick(event):
        global selection_start, rect_start
        rect_start = (event.x, event.y) 
        selection_start = (event.x, event.y)
    
    def onRelease(event):
        global selection_end 
        selection_end = (event.x, event.y)
        canvas.delete('selection_rect')
        cropImage(image)
        window.destroy()
        exit(0)
    
    def updateSelectionRect(event):
        global rect_start, rect_end
        if rect_start is not None:
            rect_end = (event.x, event.y)
            canvas.delete('selection_rect')
            if rect_start != rect_end:
                try:
                    if rect_end[0] > rect_start[0] and rect_end[1] > rect_start[1]:
                        canvas.create_rectangle(rect_start[0], rect_start[1], rect_end[0], rect_end[1], outline='red', tags='selection_rect')
                        temp = image.crop((rect_start[0], rect_start[1], rect_end[0]-1, rect_end[1]-1))
                        tk_temp = ImageTk.PhotoImage(temp)
                        canvas.create_image(rect_start[0]+1, rect_start[1]+1, anchor='nw', image=tk_temp)
                        canvas.image = tk_temp
                    elif rect_end[0] < rect_start[0] and rect_end[1] > rect_start[1]:
                        canvas.create_rectangle(rect_end[0], rect_start[1], rect_start[0], rect_end[1], outline='red', tags='selection_rect')
                        temp = image.crop((rect_end[0], rect_start[1], rect_start[0]-1, rect_end[1]-1))
                        tk_temp = ImageTk.PhotoImage(temp)
                        canvas.create_image(rect_end[0]+1, rect_start[1]+1, anchor='nw', image=tk_temp)
                        canvas.image = tk_temp
                    elif rect_start[0] < rect_end[0] and rect_end[1] < rect_start[1]:
                        canvas.create_rectangle(rect_start[0], rect_end[1], rect_end[0], rect_start[1], outline='red', tags='selection_rect')
                        temp = image.crop((rect_start[0], rect_end[1], rect_end[0]-1, rect_start[1]-1))
                        tk_temp = ImageTk.PhotoImage(temp)
                        canvas.create_image(rect_start[0]+1, rect_end[1]+1, anchor='nw', image=tk_temp)
                        canvas.image = tk_temp
                    elif rect_start[0] > rect_end[0] and rect_end[1] < rect_start[1]:
                        canvas.create_rectangle(rect_end[0], rect_end[1], rect_start[0], rect_start[1], outline='red', tags='selection_rect')
                        temp = image.crop((rect_end[0], rect_end[1], rect_start[0]-1, rect_start[1]-1))
                        tk_temp = ImageTk.PhotoImage(temp)
                        canvas.create_image(rect_end[0]+1, rect_end[1]+1, anchor='nw', image=tk_temp)
                        canvas.image = tk_temp
                except Exception as e:
                    traceback.print_exc()
                    exit(1)


    # Create a Tkinter window
    window = tk.Tk()
    window.overrideredirect(True)
    window.attributes('-topmost', True)

    # Create a transparent cover image
    width, height = image.size
    cover = Image.new('RGBA', (width, height), (0, 0, 0, 128))

    # Composite the original image and the cover
    covered_image = Image.alpha_composite(image.convert('RGBA'), cover)

    # Convert the composite image to a Tkinter-compatible format
    tk_image = ImageTk.PhotoImage(covered_image)

    # Create a Tkinter canvas and display the image
    canvas = tk.Canvas(window, width=width, height=height, highlightthickness=0)
    canvas.pack()

    # Add the image to the canvas
    canvas.create_image(0, 0, anchor='nw', image=tk_image)

    canvas.bind("<Button-1>", onClick)
    canvas.bind('<B1-Motion>', updateSelectionRect)
    canvas.bind("<B1-ButtonRelease>", onRelease)
    window.bind('<Control-c>', closeWindow)

    # Start the Tkinter event loop
    window.mainloop()


def captureScreen():
    # Get information about each monitor
    try:
        with mss.mss() as sct:
            monitors = sct.monitors

        # Calculate the dimensions of the entire desktop
        left = min(monitor["left"] for monitor in monitors)
        top = min(monitor["top"] for monitor in monitors)
        right = max(monitor["left"] + monitor["width"] for monitor in monitors)
        bottom = max(monitor["top"] + monitor["height"] for monitor in monitors)
        width = right - left
        height = bottom - top

        # Capture the entire desktop
        with mss.mss() as sct:
            # Adjust the pixel format and quality
            capture_settings = {
                "left": left,
                "top": top,
                "width": width,
                "height": height,
                "pixel_format": "RGB",  # Change pixel format if needed
                "quality": 100,  # Increase quality to maximum
            }
            screenshot = sct.grab(capture_settings)

        # Convert the captured image to PIL Image object
        image = Image.frombytes("RGB", screenshot.size, screenshot.rgb)

        # Perform any additional operations with the captured image if needed
        displayImage(image)
    except Exception as e:
        traceback.print_exc()
        exit(1)

    


if __name__ == '__main__':
    captureScreen()  # Call the captureScreen() function to run its code
